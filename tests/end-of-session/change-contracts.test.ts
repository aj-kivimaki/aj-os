/**
 * Session change contract tests (EOS-005).
 *
 * Covers `SessionChange`, `AnalyzerError`, and `ChangeSet`: runtime validation,
 * strictness, the lenient `kind` soft hint vs. the closed `changeType`, array/record
 * defaults, and deep immutability. This is a *contract* task — no analyzer behavior,
 * git access, or registry execution is exercised (those are the registry seam and
 * M2). Everything is asserted through the module's public surface.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseSessionChange,
  parseAnalyzerError,
  parseChangeSet,
  changeSetSchema,
  CHANGE_KINDS,
  CHANGE_TYPES,
  type AnalyzerError,
  type ChangeSet,
  type SessionChange,
} from "../../src/end-of-session/index.js";

const validChange = {
  id: "git:src/end-of-session/contracts/change/schema.ts",
  kind: "source",
  path: "src/end-of-session/contracts/change/schema.ts",
  changeType: "added",
  summary: "Add the SessionChange/ChangeSet contracts.",
  metadata: { additions: "120", deletions: "0" },
} as const satisfies SessionChange;

const validError = {
  analyzer: "git",
  message: "A file could not be diffed.",
  recoverable: true,
} as const satisfies AnalyzerError;

const validChangeSet = {
  sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
  changes: [validChange],
  errors: [validError],
  metadata: { analyzer: "git" },
} as const satisfies ChangeSet;

describe("SessionChange contract", () => {
  it("accepts a valid change and preserves its values", () => {
    expect(parseSessionChange(validChange)).toEqual(validChange);
  });

  it("defaults metadata to an empty object when omitted", () => {
    const { metadata: _metadata, ...withoutMetadata } = validChange;
    expect(parseSessionChange(withoutMetadata).metadata).toEqual({});
  });

  it("accepts every declared change kind", () => {
    for (const kind of CHANGE_KINDS) {
      expect(() => parseSessionChange({ ...validChange, kind })).not.toThrow();
    }
  });

  it("falls back to 'other' for an unrecognized kind — kind is a soft hint", () => {
    expect(parseSessionChange({ ...validChange, kind: "binary-asset" }).kind).toBe(
      "other",
    );
    const { kind: _kind, ...withoutKind } = validChange;
    expect(parseSessionChange(withoutKind).kind).toBe("other");
  });

  it("accepts every declared change type", () => {
    for (const changeType of CHANGE_TYPES) {
      expect(() =>
        parseSessionChange({ ...validChange, changeType }),
      ).not.toThrow();
    }
  });

  it("rejects an unrecognized changeType — the enum is closed", () => {
    expect(() =>
      parseSessionChange({ ...validChange, changeType: "copied" }),
    ).toThrow(ZodError);
  });

  it("rejects a missing required field and non-string metadata values", () => {
    const { path: _path, ...withoutPath } = validChange;
    expect(() => parseSessionChange(withoutPath)).toThrow(ZodError);
    expect(() =>
      parseSessionChange({ ...validChange, metadata: { lines: 120 } }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseSessionChange({ ...validChange, blame: "someone" }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen change, including metadata", () => {
    const change = parseSessionChange(validChange);
    expect(Object.isFrozen(change)).toBe(true);
    expect(Object.isFrozen(change.metadata)).toBe(true);
    expect(() => {
      (change as { path: string }).path = "changed";
    }).toThrow();
  });
});

describe("AnalyzerError contract", () => {
  it("accepts a valid error and preserves its values", () => {
    expect(parseAnalyzerError(validError)).toEqual(validError);
  });

  it("rejects a missing recoverable flag and unknown keys", () => {
    expect(() =>
      parseAnalyzerError({ analyzer: "git", message: "boom" }),
    ).toThrow(ZodError);
    expect(() =>
      parseAnalyzerError({ ...validError, stack: "at foo" }),
    ).toThrow(ZodError);
  });

  it("returns a frozen error", () => {
    expect(Object.isFrozen(parseAnalyzerError(validError))).toBe(true);
  });
});

describe("ChangeSet contract", () => {
  it("accepts a valid change set and preserves its values", () => {
    expect(parseChangeSet(validChangeSet)).toEqual(validChangeSet);
  });

  it("defaults changes/errors/metadata when omitted", () => {
    const changeSet = parseChangeSet({ sessionId: validChangeSet.sessionId });
    expect(changeSet.changes).toEqual([]);
    expect(changeSet.errors).toEqual([]);
    expect(changeSet.metadata).toEqual({});
  });

  it("carries both changes and errors — partial collection", () => {
    const changeSet = parseChangeSet(validChangeSet);
    expect(changeSet.changes).toHaveLength(1);
    expect(changeSet.errors).toHaveLength(1);
  });

  it("rejects a missing sessionId and an invalid embedded change", () => {
    expect(() => parseChangeSet({ changes: [] })).toThrow(ZodError);
    expect(() =>
      parseChangeSet({
        sessionId: validChangeSet.sessionId,
        changes: [{ ...validChange, changeType: "copied" }],
      }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen change set, including nested changes and errors", () => {
    const changeSet = parseChangeSet(validChangeSet);
    expect(Object.isFrozen(changeSet)).toBe(true);
    expect(Object.isFrozen(changeSet.changes)).toBe(true);
    expect(Object.isFrozen(changeSet.changes[0])).toBe(true);
    expect(Object.isFrozen(changeSet.errors[0])).toBe(true);
  });

  it("exposes the schema for composition (registry execution, M2)", () => {
    expect(changeSetSchema.safeParse(validChangeSet).success).toBe(true);
  });
});
