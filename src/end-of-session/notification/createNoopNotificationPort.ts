/**
 * NoopNotificationPort — the v1 notifier: it accepts a completed `SessionReport` and
 * does nothing.
 *
 * This is a real, useful default, not a placeholder stub: v1 deliberately announces
 * nothing, keeping the workflow free of external side channels. Real notifiers
 * (Slack, email, desktop) are later implementations of the {@link NotificationPort}
 * seam, added without changing orchestration.
 */

import type { SessionReport } from "../contracts/session-report/index.js";

import type { NotificationPort } from "./NotificationPort.js";

/**
 * Create the no-op notification port. `notify` accepts the report and resolves
 * immediately with no observable side effect. The returned handle is frozen.
 *
 * @example
 * const notifier = createNoopNotificationPort();
 * await notifier.notify(report); // resolves; announces nothing
 */
export function createNoopNotificationPort(): NotificationPort {
  return Object.freeze({
    notify(_report: SessionReport): Promise<void> {
      // Intentionally does nothing — the v1 default announces nothing.
      return Promise.resolve();
    },
  });
}
