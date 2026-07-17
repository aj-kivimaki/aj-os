/**
 * The facts of one workflow run — the builder's entire input.
 *
 * Everything the `SessionReport` records is here, already produced by the stages that own
 * it: the session the factory identified, the changes collection observed, the candidates
 * generation mapped, and the window orchestration timed. The builder is a **pure projection
 * over these outputs** (the frozen Report Builder Invariant) — it observes nothing itself,
 * so anything absent from this type is, by construction, something the report cannot know.
 *
 * The optional fields are what makes a **failed** run reportable: a run that died in
 * extraction has a `changeSet` but no `candidates`; one that died in session creation has
 * neither. The report is how a failure becomes observable, so the shape has to admit the
 * partial truth rather than demand a complete one.
 */

import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { ChangeSet } from "../contracts/change/index.js";
import type { Session } from "../contracts/session/index.js";

/**
 * A stage failure that stopped the run (SPEC-003 §15 fatal). Recoverable analyzer failures
 * do not appear here — they arrive as `AnalyzerError`s inside the `ChangeSet`, which is the
 * partial-collection model doing its job.
 */
export interface FatalStageError {
  /** The workflow stage that failed (e.g. `"extraction"`). */
  readonly source: string;
  /** Human-readable description of the failure — never a stack trace. */
  readonly message: string;
}

export interface SessionRunFacts {
  /** The identified run (EOS-402). Supplies the report's `sessionId` and `trigger`. */
  readonly session: Session;
  /**
   * When the workflow **run** started (ISO-8601) — orchestration's clock, read once.
   *
   * Deliberately distinct from `Session.startedAt`: this window times the *run*, while the
   * session's timestamps describe the *coding session*. Same field names, different
   * meanings, on purpose (SPEC-003 §16 asks for the run's duration).
   */
  readonly startedAt: string;
  /** When the workflow run ended (ISO-8601). */
  readonly endedAt: string;
  /** Ids of the analyzers the registry held for this run, in registry order. */
  readonly analyzersRun: readonly string[];
  /** The collected changes. Absent when the run failed before collection completed. */
  readonly changeSet?: ChangeSet;
  /** The canonical candidates produced. Absent when the run failed before generation. */
  readonly candidates?: readonly CandidateKnowledge[];
  /** The failure that stopped the run, when one did. Its presence *is* a failed run. */
  readonly fatalError?: FatalStageError;
}
