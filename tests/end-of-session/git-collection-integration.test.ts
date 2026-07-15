/**
 * M2 end-to-end integration & behaviour tests (EOS-103).
 *
 * This is the milestone's proof that the Collection stage works end to end against
 * a *real* repository: the real git-backed `createGitPort` adapter → the
 * `GitChangeAnalyzer` (EOS-102) → the `AnalyzerRegistry` → the `collectChanges`
 * execution stage (EOS-101) → an immutable `ChangeSet`.
 *
 * Real git is confined to these tests and runs only against **disposable temp
 * fixture repositories** built and torn down per test — never the host repo, and
 * never in the EOS-101/EOS-102 unit tests. The suite verifies: correct git
 * translation, deterministic collection, registry wiring, end-to-end `ChangeSet`
 * production, and partial-collection behaviour. Everything is reached through the
 * module's public surface only.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

import { afterEach, describe, it, expect } from "vitest";

import {
  collectChanges,
  createAnalyzerRegistry,
  createGitChangeAnalyzer,
  createGitPort,
  type Analyzer,
  type Session,
  type SessionChange,
} from "../../src/end-of-session/index.js";

/** Temp repos created during the run, cleaned up after each test. */
const createdRepos: string[] = [];

afterEach(() => {
  while (createdRepos.length > 0) {
    const dir = createdRepos.pop();
    if (dir !== undefined) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

/** Run a git command in `cwd` (setup only — the adapter under test is read-only). */
function git(cwd: string, ...args: string[]): void {
  execFileSync("git", args, { cwd, stdio: "pipe" });
}

/** Write a file (creating parent dirs) inside a repo. */
function write(cwd: string, path: string, content: string): void {
  const full = join(cwd, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

/**
 * Build a disposable repo with two commits and return its path. The second commit
 * adds a doc, modifies a file, deletes a file, and renames a source file — so the
 * `HEAD~1..HEAD` range exercises added/modified/deleted/renamed translation.
 */
function buildFixtureRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "eos103-"));
  createdRepos.push(dir);

  git(dir, "init", "-q");
  git(dir, "config", "user.email", "test@example.com");
  git(dir, "config", "user.name", "EOS-103 Test");
  git(dir, "config", "commit.gpgsign", "false");

  // Commit 1 — the baseline.
  write(dir, "keep.ts", "export const keep = 1;\n");
  write(dir, "remove.ts", "export const remove = 1;\n");
  write(
    dir,
    "src/renamed-old.ts",
    // Stable, sizeable content so git's rename detection (-M) fires.
    "export function stable() {\n  return 'unchanged body for rename detection';\n}\n",
  );
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "baseline");

  // Commit 2 — the session's work.
  write(dir, "keep.ts", "export const keep = 2;\n"); // modified
  rmSync(join(dir, "remove.ts")); // deleted
  write(dir, "docs/new.md", "# New doc\n"); // added
  git(dir, "mv", "src/renamed-old.ts", "src/renamed-new.ts"); // renamed
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "session work");

  return dir;
}

function sessionFor(range: string): Session {
  return {
    id: "session-eos-103",
    startedAt: "2026-07-16T09:00:00.000Z",
    endedAt: "2026-07-16T10:00:00.000Z",
    trigger: "manual",
    gitState: { head: "HEAD", dirty: false, range },
    branch: "feat/spec-003-m2-change-collection",
  } as Session;
}

function gitRegistry(dir: string) {
  return createAnalyzerRegistry([createGitChangeAnalyzer(createGitPort(dir))]);
}

describe("EOS-103 — end-to-end ChangeSet production (real git)", () => {
  it("produces a correct, path-sorted ChangeSet from a fixture repo", async () => {
    const dir = buildFixtureRepo();
    const result = await collectChanges(gitRegistry(dir), sessionFor("HEAD~1..HEAD"));

    expect(result.sessionId).toBe("session-eos-103");
    expect(result.errors).toEqual([]);
    expect(result.changes.map((c: SessionChange) => [c.path, c.changeType])).toEqual([
      ["docs/new.md", "added"],
      ["keep.ts", "modified"],
      ["remove.ts", "deleted"],
      ["src/renamed-new.ts", "renamed"],
    ]);
  });

  it("translates git observations faithfully (ids, kind, rename metadata)", async () => {
    const dir = buildFixtureRepo();
    const result = await collectChanges(gitRegistry(dir), sessionFor("HEAD~1..HEAD"));

    const byPath = Object.fromEntries(
      result.changes.map((c: SessionChange) => [c.path, c]),
    );

    expect(byPath["docs/new.md"].id).toBe("git:docs/new.md");
    expect(byPath["docs/new.md"].kind).toBe("documentation");

    const renamed = byPath["src/renamed-new.ts"];
    expect(renamed.kind).toBe("source");
    expect(renamed.metadata).toEqual({ oldPath: "src/renamed-old.ts" });
    expect(renamed.summary).toBe(
      "renamed src/renamed-old.ts → src/renamed-new.ts",
    );
  });

  it("returns an empty ChangeSet for a range with no changes", async () => {
    const dir = buildFixtureRepo();
    const result = await collectChanges(gitRegistry(dir), sessionFor("HEAD..HEAD"));

    expect(result.changes).toEqual([]);
    expect(result.errors).toEqual([]);
  });
});

describe("EOS-103 — deterministic collection", () => {
  it("produces a deep-equal ChangeSet across repeated runs over the same repo state", async () => {
    const dir = buildFixtureRepo();
    const registry = gitRegistry(dir);
    const session = sessionFor("HEAD~1..HEAD");

    const first = await collectChanges(registry, session);
    const second = await collectChanges(registry, session);

    expect(second).toEqual(first);
  });
});

describe("EOS-103 — registry wiring", () => {
  it("registers the git analyzer under its id and runs it via collectChanges", async () => {
    const dir = buildFixtureRepo();
    const registry = gitRegistry(dir);

    // Wiring: the analyzer is retrievable by its stable id …
    expect(registry.get("git")?.id).toBe("git");
    // … and executing the registry actually produces its changes.
    const result = await collectChanges(registry, sessionFor("HEAD~1..HEAD"));
    expect(result.changes.length).toBeGreaterThan(0);
  });
});

describe("EOS-103 — partial collection behaviour", () => {
  it("collects git changes and surfaces a failing analyzer as one AnalyzerError", async () => {
    const dir = buildFixtureRepo();
    const failing: Analyzer = {
      id: "boom",
      name: "boom analyzer",
      description: "Always fails.",
      async analyze(): Promise<readonly SessionChange[]> {
        throw new Error("analyzer exploded");
      },
    };
    const registry = createAnalyzerRegistry([
      createGitChangeAnalyzer(createGitPort(dir)),
      failing,
    ]);

    const result = await collectChanges(registry, sessionFor("HEAD~1..HEAD"));

    // Git's changes are still present — the failure did not abort collection.
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.errors).toEqual([
      { analyzer: "boom", message: "analyzer exploded", recoverable: true },
    ]);
  });

  it("surfaces a git failure (bad range) as a recoverable AnalyzerError, not a throw", async () => {
    const dir = buildFixtureRepo();
    const registry = gitRegistry(dir);

    const result = await collectChanges(
      registry,
      sessionFor("no-such-ref..another-missing-ref"),
    );

    expect(result.changes).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].analyzer).toBe("git");
    expect(result.errors[0].recoverable).toBe(true);
  });
});
