/**
 * NotificationPort — the extensibility seam for *how completion is announced*.
 *
 * When a workflow run finishes, the notifier receives the completed `SessionReport`.
 * v1 ships only a no-op notifier; Slack, email, or desktop notifiers are later
 * implementations of this same port, added behind it without changing orchestration
 * (`run` never changes).
 *
 * The port is intentionally minimal: a single method that receives the report. It
 * owns **no** orchestration, policy, retry, routing, or lifecycle management — a
 * notifier only announces.
 */

import type { SessionReport } from "../contracts/session-report/index.js";

export interface NotificationPort {
  /**
   * Announce a completed session run.
   *
   * Receives the completed `SessionReport` and returns when the announcement has
   * been dispatched. Asynchronous so future I/O-backed notifiers (Slack, email,
   * desktop) satisfy the same contract without a signature change; the no-op
   * notifier does nothing and resolves immediately. A notifier only *reads* the
   * report — it never mutates it, decides on candidates, or drives the workflow.
   */
  notify(report: SessionReport): Promise<void>;
}
