/**
 * The End-of-Session Workflow — the module's single public entry point.
 *
 * `run(context)` executes the whole capture pipeline and returns the `SessionReport`. It is
 * the only public operation: the stages behind it are internal, and adding a stage, an
 * analyzer, a trigger, or a notifier never changes this signature.
 */

import type { SessionContext } from "../contracts/session/index.js";
import type { SessionReport } from "../contracts/session-report/index.js";

export interface EndOfSessionWorkflow {
  /**
   * Run one End-of-Session capture for a finished session.
   *
   * Sequences: session → change collection → knowledge extraction → candidate generation →
   * review-package projection → session report → persistence → notification. Returns the
   * run's `SessionReport`.
   *
   * **Reading `result` matters.** A stage failure after the session is identified does not
   * reject — it produces, persists, and returns a `failed` report, because a run that fails
   * is exactly when a record earns its keep (SPEC-003 §19 "Logs recorded"). Callers should
   * therefore inspect `report.result` rather than assume that resolving means success.
   *
   * Rejects only when there is nowhere to record the outcome: the session cannot be
   * identified (no id ⇒ no report and no place to persist one), or the review store cannot
   * be written.
   */
  run(context: SessionContext): Promise<SessionReport>;
}
