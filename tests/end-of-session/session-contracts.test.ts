/**
 * Session contract tests (EOS-002).
 *
 * Covers the `SessionContext` (input request) and `Session` (identified run)
 * contracts: runtime validation, strictness, the lenient trigger enum, and deep
 * immutability. This is a *contract* task — no session creation, id generation, or
 * git access is exercised (those are M5 / M2). Everything is asserted through the
 * module's public surface (EOS-D1), never through internal files.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseSessionContext,
  parseSession,
  sessionContextSchema,
  sessionSchema,
  TRIGGER_KINDS,
  type Session,
  type SessionContext,
} from "../../src/end-of-session/index.js";

const validContext = {
  project: "aj-os",
  repository: "systems/aj-os",
  branch: "feat/spec-003-m1-foundation",
} as const satisfies SessionContext;

const validSession = {
  id: "01J8Z3K7Q9WV0FB2XN4MABCDEF", // opaque, non-derived identity (shape only)
  startedAt: "2026-07-15T09:00:00.000Z",
  endedAt: "2026-07-15T10:30:00.000Z",
  trigger: "manual",
  gitState: {
    head: "a1b2c3d4",
    dirty: false,
    range: "main..HEAD",
  },
  branch: "feat/spec-003-m1-foundation",
} as const satisfies Session;

describe("SessionContext contract", () => {
  it("accepts a valid request with only the required fields", () => {
    expect(parseSessionContext(validContext)).toEqual(validContext);
  });

  it("accepts every optional field", () => {
    const full = {
      ...validContext,
      commitHash: "a1b2c3d4",
      commitMessage: "feat: wire the session contract",
      sessionNotes: "Investigated the analyzer seam.",
      taskId: "EOS-002",
      contextPackageRef: "context/aj-os/EOS-002",
    } as const satisfies SessionContext;
    expect(parseSessionContext(full)).toEqual(full);
  });

  it("rejects a missing required field", () => {
    expect(() =>
      parseSessionContext({ project: "aj-os", repository: "systems/aj-os" }),
    ).toThrow(ZodError);
  });

  it("rejects an empty required field", () => {
    expect(() =>
      parseSessionContext({ ...validContext, branch: "" }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseSessionContext({ ...validContext, trigger: "manual" }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen request (immutable after creation)", () => {
    const context = parseSessionContext(validContext);
    expect(Object.isFrozen(context)).toBe(true);
    expect(() => {
      (context as { project: string }).project = "changed";
    }).toThrow();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseSessionContext(validContext)).toEqual(
      parseSessionContext(validContext),
    );
  });

  it("exposes the schema for composition", () => {
    expect(sessionContextSchema.safeParse(validContext).success).toBe(true);
  });
});

describe("Session contract", () => {
  it("accepts a valid identified run and preserves its values", () => {
    expect(parseSession(validSession)).toEqual(validSession);
  });

  it("accepts every declared trigger kind", () => {
    for (const trigger of TRIGGER_KINDS) {
      expect(() => parseSession({ ...validSession, trigger })).not.toThrow();
    }
  });

  it("falls back to 'manual' for a not-yet-implemented trigger — the enum is lenient", () => {
    // `git-hook` is an anticipated future kind, deliberately not yet in the domain;
    // it parses (forward-compat) rather than throwing, collapsing to the v1 value.
    const session = parseSession({ ...validSession, trigger: "git-hook" });
    expect(session.trigger).toBe("manual");
  });

  it("rejects a non-opaque empty id", () => {
    expect(() => parseSession({ ...validSession, id: "" })).toThrow(ZodError);
  });

  it("rejects a malformed timestamp", () => {
    expect(() =>
      parseSession({ ...validSession, startedAt: "2026-07-15 09:00" }),
    ).toThrow(ZodError);
  });

  it("rejects a missing or malformed gitState", () => {
    const { gitState: _gitState, ...withoutGitState } = validSession;
    expect(() => parseSession(withoutGitState)).toThrow(ZodError);
    expect(() =>
      parseSession({
        ...validSession,
        gitState: { head: "a1b2c3d4", dirty: false },
      }),
    ).toThrow(ZodError);
    expect(() =>
      parseSession({
        ...validSession,
        gitState: { ...validSession.gitState, dirty: "nope" },
      }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseSession({ ...validSession, endedAtTz: "UTC" }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen session, including nested gitState", () => {
    const session = parseSession(validSession);
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.gitState)).toBe(true);
    expect(() => {
      (session.gitState as { dirty: boolean }).dirty = true;
    }).toThrow();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseSession(validSession)).toEqual(parseSession(validSession));
  });

  it("exposes the schema for composition", () => {
    expect(sessionSchema.safeParse(validSession).success).toBe(true);
  });
});
