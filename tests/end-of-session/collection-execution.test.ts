/**
 * Collection execution — deterministic partial collection tests (EOS-101).
 *
 * EOS-101 adds the analyzer-agnostic execution stage to the End-of-Session
 * workflow: `collectChanges(registry, session)` runs the held registry's analyzers
 * (EOS-005 `Analyzer` port + registry) and assembles an immutable `ChangeSet`
 * (EOS-005) of `SessionChange`s and `AnalyzerError`s under the partial-collection
 * model — mirroring the SPEC-002 Collection Engine (CB-010).
 *
 * These tests exercise the frozen execution invariant: successful analyzers
 * contribute changes; a failing analyzer yields one `AnalyzerError` without
 * aborting collection; success and failure appear together; aggregation follows
 * registry order regardless of completion timing; analyzer output order is
 * preserved verbatim; and the returned `ChangeSet` is deeply immutable. Everything
 * is exercised through the module's public surface only.
 */

import { describe, it, expect } from "vitest";

import {
  collectChanges,
  createAnalyzerRegistry,
  type Analyzer,
  type Session,
  type SessionChange,
} from "../../src/end-of-session/index.js";

const SESSION: Session = Object.freeze({
  id: "session-eos-101",
  startedAt: "2026-07-15T09:00:00.000Z",
  endedAt: "2026-07-15T10:00:00.000Z",
  trigger: "manual",
  gitState: Object.freeze({ head: "abc123", dirty: true, range: "main..HEAD" }),
  branch: "feat/spec-003-m2-change-collection",
}) as Session;

/** Build a `SessionChange` for a fixture analyzer, namespaced on the analyzer id. */
function changeFor(analyzerId: string, path: string): SessionChange {
  return {
    id: `${analyzerId}:${path}`,
    kind: "source",
    path,
    changeType: "modified",
    summary: `modified ${path}`,
    metadata: {},
  } as SessionChange;
}

/** An analyzer that resolves with one change per given path, in path order. */
function changeAnalyzer(id: string, ...paths: string[]): Analyzer {
  return {
    id,
    name: `${id} analyzer`,
    description: `Fixture analyzer ${id}.`,
    async analyze(): Promise<readonly SessionChange[]> {
      return paths.map((path) => changeFor(id, path));
    },
  };
}

/** An analyzer that rejects — it must contribute an AnalyzerError, not throw. */
function failingAnalyzer(id: string, message: string): Analyzer {
  return {
    id,
    name: `${id} analyzer`,
    description: `Failing fixture analyzer ${id}.`,
    async analyze(): Promise<readonly SessionChange[]> {
      throw new Error(message);
    },
  };
}

/** An analyzer that resolves after `delayMs`, to prove completion order is ignored. */
function delayedChangeAnalyzer(id: string, delayMs: number): Analyzer {
  return {
    id,
    name: `${id} analyzer`,
    description: `Delayed fixture analyzer ${id}.`,
    async analyze(): Promise<readonly SessionChange[]> {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return [changeFor(id, `${id}.ts`)];
    },
  };
}

/** An analyzer that rejects after `delayMs`, to prove failure completion order is ignored. */
function delayedFailingAnalyzer(id: string, delayMs: number): Analyzer {
  return {
    id,
    name: `${id} analyzer`,
    description: `Delayed failing fixture analyzer ${id}.`,
    async analyze(): Promise<readonly SessionChange[]> {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      throw new Error(`${id} failed`);
    },
  };
}

function collectFor(analyzers: readonly Analyzer[]) {
  return collectChanges(createAnalyzerRegistry(analyzers), SESSION);
}

describe("collectChanges — successful analyzers contribute changes", () => {
  it("collects changes from every successful analyzer in registry order", async () => {
    const result = await collectFor([
      changeAnalyzer("git", "a.ts"),
      changeAnalyzer("docs", "README.md"),
    ]);

    expect(result.changes.map((c) => c.id)).toEqual(["git:a.ts", "docs:README.md"]);
    expect(result.errors).toEqual([]);
  });

  it("stamps the ChangeSet with the session id", async () => {
    const result = await collectFor([changeAnalyzer("git", "a.ts")]);

    expect(result.sessionId).toBe("session-eos-101");
  });

  it("returns an empty ChangeSet for an empty registry", async () => {
    const result = await collectFor([]);

    expect(result.sessionId).toBe("session-eos-101");
    expect(result.changes).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("treats an analyzer that finds nothing as success, not failure", async () => {
    const empty: Analyzer = {
      id: "empty",
      name: "empty analyzer",
      description: "Contributes nothing.",
      async analyze() {
        return [];
      },
    };
    const result = await collectFor([empty]);

    expect(result.changes).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("preserves each analyzer's own change order verbatim", async () => {
    // The analyzer returns paths in a deliberately non-sorted order; the execution
    // stage must not reorder within an analyzer's slice (intra-analyzer ordering is
    // the analyzer's responsibility).
    const result = await collectFor([changeAnalyzer("git", "z.ts", "a.ts", "m.ts")]);

    expect(result.changes.map((c) => c.path)).toEqual(["z.ts", "a.ts", "m.ts"]);
  });
});

describe("collectChanges — partial collection (a failure never aborts)", () => {
  it("surfaces a failing analyzer as one recoverable AnalyzerError", async () => {
    const result = await collectFor([failingAnalyzer("git", "repo unreadable")]);

    expect(result.changes).toEqual([]);
    expect(result.errors).toEqual([
      { analyzer: "git", message: "repo unreadable", recoverable: true },
    ]);
  });

  it("collects changes and errors together (partial outcome)", async () => {
    const result = await collectFor([
      changeAnalyzer("git", "a.ts"),
      failingAnalyzer("docs", "docs source missing"),
      changeAnalyzer("config", "tsconfig.json"),
    ]);

    expect(result.changes.map((c) => c.id)).toEqual(["git:a.ts", "config:tsconfig.json"]);
    expect(result.errors.map((e) => e.analyzer)).toEqual(["docs"]);
  });

  it("does not throw when every analyzer fails", async () => {
    const result = await collectFor([
      failingAnalyzer("a", "boom-a"),
      failingAnalyzer("b", "boom-b"),
    ]);

    expect(result.changes).toEqual([]);
    expect(result.errors.map((e) => e.analyzer)).toEqual(["a", "b"]);
  });

  it("falls back to a stable message for a non-Error rejection", async () => {
    const weird: Analyzer = {
      id: "weird",
      name: "weird analyzer",
      description: "Rejects with a non-Error.",
      async analyze(): Promise<readonly SessionChange[]> {
        throw undefined;
      },
    };
    const result = await collectFor([weird]);

    expect(result.errors[0]!.message).toBe("The analyzer failed to contribute changes.");
  });

  it("uses a string rejection reason verbatim", async () => {
    const stringy: Analyzer = {
      id: "stringy",
      name: "stringy analyzer",
      description: "Rejects with a string.",
      async analyze(): Promise<readonly SessionChange[]> {
        throw "plain string failure";
      },
    };
    const result = await collectFor([stringy]);

    expect(result.errors[0]!.message).toBe("plain string failure");
  });
});

describe("collectChanges — determinism (registry order is authoritative)", () => {
  it("orders changes by registry index, not completion order", async () => {
    // "slow" is registered first but resolves last; "fast" resolves first.
    const result = await collectFor([
      delayedChangeAnalyzer("slow", 30),
      delayedChangeAnalyzer("fast", 0),
    ]);

    expect(result.changes.map((c) => c.id)).toEqual(["slow:slow.ts", "fast:fast.ts"]);
  });

  it("orders errors by registry index, not failure completion order", async () => {
    const result = await collectFor([
      delayedFailingAnalyzer("slow", 30),
      delayedFailingAnalyzer("fast", 0),
    ]);

    expect(result.changes).toEqual([]);
    expect(result.errors.map((e) => e.analyzer)).toEqual(["slow", "fast"]);
  });

  it("orders interleaved changes and errors by registry index regardless of timing", async () => {
    // Registry order: change(slow) · fail(fast) · change(fast) · fail(slow).
    const result = await collectFor([
      delayedChangeAnalyzer("c-slow", 30),
      delayedFailingAnalyzer("e-fast", 0),
      delayedChangeAnalyzer("c-fast", 0),
      delayedFailingAnalyzer("e-slow", 30),
    ]);

    expect(result.changes.map((c) => c.id)).toEqual([
      "c-slow:c-slow.ts",
      "c-fast:c-fast.ts",
    ]);
    expect(result.errors.map((e) => e.analyzer)).toEqual(["e-fast", "e-slow"]);
  });

  it("produces a deep-equal ChangeSet for repeated runs (execution invariant)", async () => {
    const analyzers = [
      changeAnalyzer("git", "a.ts"),
      failingAnalyzer("docs", "docs down"),
    ];
    const first = await collectFor(analyzers);
    const second = await collectFor(analyzers);

    expect(second).toEqual(first);
  });
});

describe("collectChanges — immutable output", () => {
  it("returns a deeply frozen ChangeSet", async () => {
    const result = await collectFor([
      changeAnalyzer("git", "a.ts"),
      failingAnalyzer("docs", "docs down"),
    ]);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.changes)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.changes[0])).toBe(true);
    expect(Object.isFrozen(result.errors[0])).toBe(true);
  });

  it("rejects mutation of the returned collections at runtime", async () => {
    const result = await collectFor([changeAnalyzer("git", "a.ts")]);

    expect(() => {
      (result.changes as unknown as SessionChange[]).push(result.changes[0]!);
    }).toThrow();
  });
});
