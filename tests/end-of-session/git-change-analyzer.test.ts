/**
 * Git change analyzer — pure-translator unit tests (EOS-102).
 *
 * The GitChangeAnalyzer is the workflow's first concrete `Analyzer`: given a
 * `Session`, it reads the injected read-only `GitPort` over
 * `Session.gitState.range` and translates each `GitFileChange` into a normalized
 * `SessionChange`. These tests drive it entirely through a **stub `GitPort`** — no
 * real git — and exercise: status→changeType mapping (incl. copy/type-change and
 * the unknown-status guard), path→kind heuristics, namespaced ids, rename metadata
 * + summary, deterministic path-sorted output, and the range hand-off. Everything
 * is reached through the module's public surface only.
 */

import { describe, it, expect } from "vitest";

import {
  createGitChangeAnalyzer,
  type GitFileChange,
  type GitPort,
  type Session,
  type SessionChange,
} from "../../src/end-of-session/index.js";

const SESSION: Session = Object.freeze({
  id: "session-eos-102",
  startedAt: "2026-07-15T09:00:00.000Z",
  endedAt: "2026-07-15T10:00:00.000Z",
  trigger: "manual",
  gitState: Object.freeze({ head: "abc123", dirty: true, range: "main..HEAD" }),
  branch: "feat/spec-003-m2-change-collection",
}) as Session;

/**
 * The session-state reads of the `GitPort` seam (EOS-401/EOS-D7), stubbed to throw.
 *
 * The analyzer shares one read-only git seam with the Session factory but consumes
 * only `changes` — the interface-segregation cost EOS-D7 accepted deliberately.
 * Making these throw turns that cost into a *guarantee*: if the analyzer ever
 * reaches for the session's git state, these tests fail loudly instead of silently
 * passing on a plausible dummy value.
 */
function stateReadsMustNotBeUsed(): Pick<GitPort, "head" | "dirty" | "branch"> {
  const refuse = (read: string) => async (): Promise<never> => {
    throw new Error(
      `GitChangeAnalyzer must not read git state — it called ${read}().`,
    );
  };
  return { head: refuse("head"), dirty: refuse("dirty"), branch: refuse("branch") };
}

/** A stub GitPort returning fixed observations; records the range it was asked for. */
function stubGitPort(
  observed: readonly GitFileChange[],
): GitPort & { askedFor: string[] } {
  const askedFor: string[] = [];
  return {
    ...stateReadsMustNotBeUsed(),
    askedFor,
    async changes(range: string): Promise<readonly GitFileChange[]> {
      askedFor.push(range);
      return observed;
    },
  };
}

async function analyze(
  observed: readonly GitFileChange[],
): Promise<readonly SessionChange[]> {
  return createGitChangeAnalyzer(stubGitPort(observed)).analyze(SESSION);
}

describe("GitChangeAnalyzer — construction & port contract", () => {
  it("advertises stable analyzer metadata", () => {
    const analyzer = createGitChangeAnalyzer(stubGitPort([]));

    expect(analyzer.id).toBe("git");
    expect(analyzer.name.length).toBeGreaterThan(0);
    expect(analyzer.description.length).toBeGreaterThan(0);
  });

  it("throws when no GitPort is provided", () => {
    expect(() =>
      createGitChangeAnalyzer(undefined as unknown as GitPort),
    ).toThrow(/GitPort is required/);
  });

  it("returns a frozen handle (the module's factory convention)", () => {
    expect(Object.isFrozen(createGitChangeAnalyzer(stubGitPort([])))).toBe(true);
  });

  it("reads the port over the session's resolved range verbatim", async () => {
    const port = stubGitPort([]);
    await createGitChangeAnalyzer(port).analyze(SESSION);

    expect(port.askedFor).toEqual(["main..HEAD"]);
  });

  it("returns an empty array when git observed nothing", async () => {
    expect(await analyze([])).toEqual([]);
  });
});

describe("GitChangeAnalyzer — status → changeType mapping", () => {
  it("maps the direct statuses A/M/D/R", async () => {
    const changes = await analyze([
      { path: "a.ts", status: "A" },
      { path: "b.ts", status: "M" },
      { path: "c.ts", status: "D" },
      { path: "d.ts", status: "R", oldPath: "old-d.ts" },
    ]);

    expect(changes.map((c) => [c.path, c.changeType])).toEqual([
      ["a.ts", "added"],
      ["b.ts", "modified"],
      ["c.ts", "deleted"],
      ["d.ts", "renamed"],
    ]);
  });

  it("maps a copy (C) to added and a type-change (T) to modified", async () => {
    const changes = await analyze([
      { path: "copy.ts", status: "C", oldPath: "src.ts" },
      { path: "type.ts", status: "T" },
    ]);

    expect(changes.map((c) => [c.path, c.changeType])).toEqual([
      ["copy.ts", "added"],
      ["type.ts", "modified"],
    ]);
  });

  it("throws on an unrecognized git status (a mapping bug, surfaced not coerced)", async () => {
    await expect(analyze([{ path: "x.ts", status: "X" }])).rejects.toThrow(
      /unrecognized git status "X"/,
    );
  });
});

describe("GitChangeAnalyzer — kind heuristic (soft hint)", () => {
  it("classifies by path best-effort", async () => {
    const changes = await analyze([
      { path: "src/foo.ts", status: "M" },
      { path: "src/foo.test.ts", status: "M" },
      { path: "tests/bar.ts", status: "A" },
      { path: "docs/guide.md", status: "A" },
      { path: "README.md", status: "M" },
      { path: "tsconfig.json", status: "M" },
      { path: ".eslintrc", status: "M" },
      { path: "scripts/run.sh", status: "A" },
    ]);

    const kindByPath = Object.fromEntries(changes.map((c) => [c.path, c.kind]));
    expect(kindByPath).toEqual({
      "src/foo.ts": "source",
      "src/foo.test.ts": "test",
      "tests/bar.ts": "test",
      "docs/guide.md": "documentation",
      "README.md": "documentation",
      "tsconfig.json": "config",
      ".eslintrc": "config",
      "scripts/run.sh": "other",
    });
  });
});

describe("GitChangeAnalyzer — id, summary & rename metadata", () => {
  it("namespaces ids as git:<path> keyed on the new path", async () => {
    const changes = await analyze([
      { path: "src/new.ts", status: "R", oldPath: "src/old.ts" },
    ]);

    expect(changes).toHaveLength(1);
    expect(changes[0]!.id).toBe("git:src/new.ts");
  });

  it("carries a rename's former path in metadata and its summary", async () => {
    const changes = await analyze([
      { path: "src/new.ts", status: "R", oldPath: "src/old.ts" },
    ]);

    expect(changes).toHaveLength(1);
    expect(changes[0]!.metadata).toEqual({ oldPath: "src/old.ts" });
    expect(changes[0]!.summary).toBe("renamed src/old.ts → src/new.ts");
  });

  it("uses an empty metadata map and a plain summary for a non-rename", async () => {
    const changes = await analyze([{ path: "src/foo.ts", status: "M" }]);

    expect(changes).toHaveLength(1);
    expect(changes[0]!.metadata).toEqual({});
    expect(changes[0]!.summary).toBe("modified src/foo.ts");
  });
});

describe("GitChangeAnalyzer — deterministic ordering", () => {
  it("sorts output by path regardless of the port's return order", async () => {
    const changes = await analyze([
      { path: "z.ts", status: "M" },
      { path: "a.ts", status: "A" },
      { path: "m/b.ts", status: "M" },
      { path: "m/a.ts", status: "D" },
    ]);

    expect(changes.map((c) => c.path)).toEqual([
      "a.ts",
      "m/a.ts",
      "m/b.ts",
      "z.ts",
    ]);
  });

  it("produces deep-equal output across repeated runs (same observations)", async () => {
    const observed: readonly GitFileChange[] = [
      { path: "b.ts", status: "M" },
      { path: "a.ts", status: "A" },
    ];
    const first = await analyze(observed);
    const second = await analyze(observed);

    expect(second).toEqual(first);
  });
});

describe("GitChangeAnalyzer — failure propagation (no swallowing)", () => {
  it("lets a rejecting port surface out of analyze (EOS-101 turns it into an error)", async () => {
    const failing: GitPort = {
      ...stateReadsMustNotBeUsed(),
      async changes(): Promise<readonly GitFileChange[]> {
        throw new Error("git unavailable");
      },
    };

    await expect(
      createGitChangeAnalyzer(failing).analyze(SESSION),
    ).rejects.toThrow(/git unavailable/);
  });
});
