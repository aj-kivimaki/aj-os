/**
 * NotificationPort seam tests (EOS-006).
 *
 * Covers the no-op notifier — that it accepts a completed `SessionReport`, resolves
 * with no observable side effect, and is a small frozen handle — plus a
 * structural-conformance check that an alternate `NotificationPort` satisfies the
 * same port, so future notifiers are *added behind the seam* rather than woven into
 * orchestration. Asserted through the module's public surface.
 */

import { describe, it, expect } from "vitest";

import {
  createNoopNotificationPort,
  parseSessionReport,
  type NotificationPort,
  type SessionReport,
} from "../../src/end-of-session/index.js";

const report: SessionReport = parseSessionReport({
  sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
  trigger: "manual",
  startedAt: "2026-07-15T09:00:00.000Z",
  endedAt: "2026-07-15T09:00:01.000Z",
  durationMs: 1000,
  filesAnalyzed: 0,
  candidatesProduced: { count: 0 },
  result: "completed",
  logEntry: "Run completed; no changes detected.",
});

describe("NoopNotificationPort", () => {
  it("accepts a SessionReport and resolves to undefined", async () => {
    const notifier = createNoopNotificationPort();
    await expect(notifier.notify(report)).resolves.toBeUndefined();
  });

  it("performs no observable side effect (does not mutate the report)", async () => {
    const notifier = createNoopNotificationPort();
    const before = structuredClone(report);
    await notifier.notify(report);
    expect(report).toEqual(before);
  });

  it("returns a frozen handle", () => {
    expect(Object.isFrozen(createNoopNotificationPort())).toBe(true);
  });

  it("is a stable seam — an alternate NotificationPort satisfies the same port", async () => {
    // A hand-rolled notifier conforming to the port, proving a real notifier is
    // added behind the seam without changing anything that consumes a NotificationPort.
    const announced: SessionReport[] = [];
    const alternate: NotificationPort = {
      notify: (r) => {
        announced.push(r);
        return Promise.resolve();
      },
    };

    const announce = (notifier: NotificationPort) => notifier.notify(report);
    await announce(createNoopNotificationPort());
    await announce(alternate);
    expect(announced).toEqual([report]);
  });
});
