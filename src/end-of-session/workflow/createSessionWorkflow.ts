/**
 * The End-of-Session orchestrator — the one place the pipeline is sequenced.
 *
 * Every stage arrives injected; this module constructs none of them and imports no concrete
 * implementation (that is EOS-407's job). What it owns is the order:
 *
 *   Session → Change Collection → Knowledge Extraction → Candidate Generation
 *           → Review Package Projection → Session Report → Persistence → Notification
 *
 * **The Orchestrator Invariant (frozen, EOS-406): it owns sequencing only.** It may invoke
 * stages, propagate their results *unmodified*, and coordinate execution. It must not
 * perform transformations, duplicate stage logic, introduce business rules, or bypass the
 * adapters. Every decision belongs to a stage: collection decides what changed, extraction
 * what is reusable, generation what a candidate is, the projector how it reads, the report
 * builder what the outcome was, the store where it lands. If a rule wants to live here, a
 * stage is missing — raise it rather than absorb it.
 */

import { collectChanges } from "../collection/index.js";
import { buildSessionReport } from "../report/index.js";
import type { CandidateGenerator } from "../generation/index.js";
import type { ChangeSet } from "../contracts/change/index.js";
import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { AnalyzerRegistry } from "../registry/index.js";
import type { KnowledgeExtractor } from "../extraction/index.js";
import type { NotificationPort } from "../notification/index.js";
import type { ReviewPackageProjector } from "../projection/index.js";
import type { ReviewStore } from "../store/index.js";
import type { FatalStageError } from "../report/index.js";
import type { SessionFactory } from "../session/index.js";
import type { SessionContext, TriggerKind } from "../contracts/session/index.js";
import type { SessionReport } from "../contracts/session-report/index.js";

import type { EndOfSessionWorkflow } from "./EndOfSessionWorkflow.js";

export interface SessionWorkflowDeps {
  /** Turns the request into the identified run (EOS-402). */
  readonly sessionFactory: SessionFactory;
  /** The analyzers collection will run (EOS-005/EOS-101). */
  readonly registry: AnalyzerRegistry;
  /** The pipeline's one non-deterministic stage (EOS-202/EOS-410). */
  readonly extractor: KnowledgeExtractor;
  /** Maps the extraction to canonical candidates (EOS-301). */
  readonly candidateGenerator: CandidateGenerator;
  /** Persists every artifact of the run (EOS-302/EOS-404). */
  readonly store: ReviewStore;
  /** Renders the human-readable package (EOS-403). */
  readonly projector: ReviewPackageProjector;
  /** Announces completion (EOS-006). */
  readonly notifier: NotificationPort;
  /**
   * The kind of trigger that ended the session, stamped onto the `Session` (EOS-D3). The
   * workflow owns the trigger's *kind* but never invokes a trigger: producing the
   * `SessionContext` is upstream (EOS-D9).
   */
  readonly trigger: TriggerKind;
  /** Optional git ref the session is measured from (the CLI's `--since`). */
  readonly since?: string;
  /** Clock for the run window and the projection instant. Defaults to the wall clock. */
  readonly now?: () => Date;
}

/**
 * A stage failure, tagged with the stage that produced it.
 *
 * Attribution only — it adds no behaviour. The `SessionReport` records *which* stage failed
 * (`SessionReportError.source`), and the orchestrator is the only component that knows the
 * stage names, because it is the only one that knows the sequence.
 */
class StageFailure extends Error {
  constructor(
    readonly source: string,
    message: string,
  ) {
    super(message);
    this.name = "StageFailure";
  }
}

/**
 * Derive a human-readable message from an opaque rejection — never a stack trace or a
 * runtime object (the `SessionReportError` contract is `.strict()`). The same idiom
 * `collectChanges` applies to analyzer rejections; kept local rather than shared, since
 * that one is private to its stage.
 */
function describeFailure(reason: unknown): string {
  if (reason instanceof Error && reason.message.length > 0) {
    return reason.message;
  }
  if (typeof reason === "string" && reason.length > 0) {
    return reason;
  }
  return "The stage failed.";
}

/**
 * Run one stage, tagging a failure with its name so the report can attribute it.
 *
 * Every step of the sequence goes through here, which is what lets the catch below treat a
 * `StageFailure` as the *only* thing it can receive — there is no unattributed failure path
 * to defend against.
 */
async function inStage<T>(
  source: string,
  operation: () => Promise<T> | T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new StageFailure(source, describeFailure(error));
  }
}

/**
 * Create the End-of-Session workflow over its injected stages.
 *
 * The returned handle is frozen and holds no state between runs — `run` is self-contained,
 * so two runs share nothing.
 *
 * @example
 * const workflow = createSessionWorkflow({ sessionFactory, registry, extractor, … });
 * const report = await workflow.run(context);
 * report.result; // "completed" | "partial" | "failed"
 */
export function createSessionWorkflow(
  deps: SessionWorkflowDeps,
): EndOfSessionWorkflow {
  const now = deps.now ?? (() => new Date());

  async function run(context: SessionContext): Promise<SessionReport> {
    const startedAt = now().toISOString();

    // Identity first, and outside the failure path: without a `Session` there is no id to
    // report under and no `pending/<session-id>/` to write to, so a failure here cannot be
    // *recorded* — only surfaced. It rejects, for the same reason an unwritable store does.
    const session = await deps.sessionFactory.create(context, {
      trigger: deps.trigger,
      ...(deps.since !== undefined ? { since: deps.since } : {}),
    });

    let changeSet: ChangeSet | undefined;
    let candidates: readonly CandidateKnowledge[] | undefined;
    let fatalError: FatalStageError | undefined;

    try {
      // Collection never rejects: an analyzer that fails contributes an `AnalyzerError` to
      // the ChangeSet instead (the partial-collection model), and the report turns those
      // into `partial`.
      const collected = await inStage("collection", () =>
        collectChanges(deps.registry, session),
      );
      changeSet = collected;

      const extraction = await inStage("extraction", () =>
        deps.extractor.extract(collected, context.sessionNotes),
      );

      const generated = await inStage("candidate-generation", () =>
        deps.candidateGenerator.generate(extraction, session),
      );
      candidates = generated;

      // Canonical before derived (EOS-D4): the candidates are the artifact SPEC-004
      // consumes, so they reach the store before anything renders a view of them.
      await inStage("persistence", () =>
        deps.store.saveCandidates(session.id, generated),
      );

      const reviewPackage = await inStage("projection", () =>
        deps.projector.project(generated, session, now().toISOString()),
      );
      await inStage("persistence", () =>
        deps.store.saveReviewPackage(session.id, reviewPackage),
      );
    } catch (error) {
      // A stage failure stops the run but does not erase it: the facts gathered so far
      // still describe what happened, and the report is how that becomes observable.
      // Everything above is wrapped by `inStage`, so this is always an attributed
      // `StageFailure` — the rethrow keeps that true if a future edit adds an unwrapped
      // statement, rather than mislabelling it.
      if (!(error instanceof StageFailure)) {
        throw error;
      }
      fatalError = { source: error.source, message: error.message };
    }

    const report = buildSessionReport({
      session,
      startedAt,
      endedAt: now().toISOString(),
      analyzersRun: deps.registry.analyzers.map((analyzer) => analyzer.id),
      ...(changeSet !== undefined ? { changeSet } : {}),
      ...(candidates !== undefined ? { candidates } : {}),
      ...(fatalError !== undefined ? { fatalError } : {}),
    });

    // Outside the failure path on purpose: if the store cannot take the report, there is
    // nowhere to record the outcome, so the caller is told rather than handed a report that
    // does not exist on disk.
    await deps.store.saveReport(session.id, report);
    await deps.store.appendLog(session.id, report.logEntry);

    // The report is durable by now, so a notifier failure surfaces rather than being
    // swallowed — swallowing it would be a retry/fallback policy, which is a stage's
    // concern and never the orchestrator's.
    await deps.notifier.notify(report);

    return report;
  }

  return Object.freeze({ run });
}
