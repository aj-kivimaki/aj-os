/**
 * The Session Report builder — the workflow's execution log (SPEC-003 §16).
 *
 * A **pure projection over existing pipeline outputs** (the frozen Report Builder
 * Invariant): it assembles a `SessionReport` from facts the stages already produced. It
 * performs no observation, consults no git, touches no filesystem, regenerates nothing, and
 * duplicates no logic an earlier stage owns — collection counted the changes, generation
 * produced the candidates, the factory identified the session. This function counts, maps,
 * and states an outcome; that is all.
 *
 * It is a plain function rather than a `create*` factory because it owns **no** injected
 * dependency: the run window is an input, not a clock read. (Contrast the projector, which
 * is a factory because orchestration injects it as a replaceable stage.) The module's only
 * non-type import is `parseSessionReport` — if this file ever needs a port, adapter, or
 * store, it has stopped being a projection.
 *
 * It is also the one thing a failed run leaves behind, so it never throws on a bad run: a
 * builder that failed when the workflow failed would erase the only record of it.
 */

import { parseSessionReport } from "../contracts/session-report/index.js";
import type { AnalyzerError } from "../contracts/change/index.js";
import type { Session } from "../contracts/session/index.js";
import type {
  SessionReport,
  SessionReportError,
  SessionResult,
} from "../contracts/session-report/index.js";

import type { SessionRunFacts } from "./SessionRunFacts.js";

/**
 * Map a collection-stage `AnalyzerError` onto the report's error shape. `source` generalizes
 * `analyzer` — the log aggregates failures from any stage, not only analyzers (EOS-004) —
 * and `recoverable` is carried, not re-decided: the collection stage already judged it.
 */
function fromAnalyzerError(error: AnalyzerError): SessionReportError {
  return {
    source: error.analyzer,
    message: error.message,
    recoverable: error.recoverable,
  };
}

/**
 * Every error the run recorded: the analyzers' recoverable failures (already inside the
 * `ChangeSet`, per the partial-collection model) followed by the fatal one that stopped the
 * run, if any. Order is deterministic — recoverable first, in collection order, then the
 * fatal — so the same run always logs the same sequence.
 */
function errorsFor(facts: SessionRunFacts): SessionReportError[] {
  const errors = (facts.changeSet?.errors ?? []).map(fromAnalyzerError);

  if (facts.fatalError !== undefined) {
    errors.push({
      source: facts.fatalError.source,
      message: facts.fatalError.message,
      // Fatal by definition: the run stopped here. This is the one place the builder
      // *states* recoverability rather than carrying it, and it is a restatement of the
      // fact that a fatal error was reported — not a judgement about it.
      recoverable: false,
    });
  }

  return errors;
}

/**
 * The run's outcome (SPEC-003 §15).
 *
 * - a fatal error ⇒ **`failed`**: the run could not complete;
 * - otherwise any recorded error ⇒ **`partial`**: the run finished, but a stage contributed
 *   an error and the rest continued (the partial-collection model);
 * - otherwise ⇒ **`completed`**.
 *
 * A run with **zero candidates and no errors is `completed`**, not `failed`: a session that
 * taught us nothing is a successful capture of nothing. The discriminator is errors, never
 * candidate count — matching the contract's own definition of `partial` ("the run finished,
 * but one or more analyzers/stages contributed errors").
 */
function resultFor(
  facts: SessionRunFacts,
  errors: readonly SessionReportError[],
): SessionResult {
  if (facts.fatalError !== undefined) {
    return "failed";
  }
  return errors.length > 0 ? "partial" : "completed";
}

/**
 * Wall-clock duration of the run, in milliseconds.
 *
 * Clamped at zero: a wall clock can step backwards (an NTP correction mid-run), which would
 * yield a negative duration, fail the contract's `min(0)`, and destroy the run's only
 * record over a meaningless number. Recording "no measurable time" is the honest degradation;
 * throwing would lose the report.
 */
function durationFor(startedAt: string, endedAt: string): number {
  return Math.max(0, Date.parse(endedAt) - Date.parse(startedAt));
}

/**
 * A deterministic, greppable one-line summary — the `WikiGenerator.logEntry` convention
 * (`<timestamp> key=value …`), which is also what the store appends to the session log.
 *
 * Derived from the **assembled report fields** rather than recomputed from the facts, so the
 * log line and the structured record can never disagree about the same run. `logEntry` is a
 * projection of the report; taking it from anywhere else would make it a second opinion.
 */
function logEntryFor(report: Omit<SessionReport, "logEntry">, session: Session): string {
  return (
    `${report.endedAt} session=${report.sessionId} trigger=${report.trigger} ` +
    `result=${report.result} branch=${session.branch} range=${session.gitState.range} ` +
    `analyzers=${report.analyzersRun.length} files=${report.filesAnalyzed} ` +
    `candidates=${report.candidatesProduced.count} errors=${report.errors.length} ` +
    `duration=${report.durationMs}ms`
  );
}

/**
 * Assemble the `SessionReport` for one run.
 *
 * Pure: the same facts always produce a deep-equal report, `logEntry` included. Validated and
 * deep-frozen by `parseSessionReport` — the single report validator (EOS-004).
 *
 * @example
 * const report = buildSessionReport({
 *   session, startedAt, endedAt, analyzersRun: ["git"], changeSet, candidates,
 * });
 * report.result; // "completed" | "partial" | "failed"
 */
export function buildSessionReport(facts: SessionRunFacts): SessionReport {
  const errors = errorsFor(facts);
  const candidates = facts.candidates ?? [];

  // Every field derived exactly once, then the log line derived from *them* — so the
  // structured record and its human-readable summary describe the same run by
  // construction rather than by two computations happening to agree.
  const fields = {
    sessionId: facts.session.id,
    trigger: facts.session.trigger,
    startedAt: facts.startedAt,
    endedAt: facts.endedAt,
    durationMs: durationFor(facts.startedAt, facts.endedAt),
    analyzersRun: [...facts.analyzersRun],
    // Counting what the stages produced — not re-deriving it. The git analyzer emits one
    // change per file, so the change count *is* the file count; if a future analyzer emits
    // several changes per file the two diverge, and `changes.length` remains the honest
    // count of what was analyzed.
    filesAnalyzed: facts.changeSet?.changes.length ?? 0,
    // `count` and `ids` are denormalized in the contract and consistent by construction
    // here, because the contract deliberately declines to check them.
    candidatesProduced: {
      count: candidates.length,
      ids: candidates.map((candidate) => candidate.id),
    },
    errors,
    result: resultFor(facts, errors),
  };

  return parseSessionReport({
    ...fields,
    logEntry: logEntryFor(fields, facts.session),
  });
}
