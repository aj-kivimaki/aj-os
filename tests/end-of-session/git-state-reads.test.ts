/**
 * Git state seam behaviour tests (EOS-401 / EOS-D7).
 *
 * The `GitPort`'s three state observations — `head`, `dirty`, `branch` — are what
 * make a `Session` constructible (EOS-402): `Session.gitState.head`/`dirty` and
 * `Session.branch` are required, and provenance must record **observed facts**, not
 * caller-supplied claims. These reads are therefore verified against **real git**,
 * because a stub would prove only that the stub agrees with itself.
 *
 * Real git is confined to **disposable temp fixture repositories** built and torn
 * down per test — never the host repo (the EOS-103 precedent). Everything is
 * reached through the module's public surface only.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, it, expect } from "vitest";

import { createGitPort } from "../../src/end-of-session/index.js";

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
function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, stdio: "pipe" }).toString();
}

/** Build a disposable repo with one commit on a known branch. */
function buildFixtureRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "eos401-"));
  createdRepos.push(dir);

  git(dir, "init", "-q");
  git(dir, "config", "user.email", "test@example.com");
  git(dir, "config", "user.name", "EOS-401 Test");
  git(dir, "config", "commit.gpgsign", "false");
  // Pin the branch name: the default varies by git version/config, and these
  // tests assert on it.
  git(dir, "checkout", "-q", "-b", "main");

  writeFileSync(join(dir, "keep.ts"), "export const keep = 1;\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "baseline");

  return dir;
}

describe("EOS-401 — head()", () => {
  it("returns the repository's real HEAD commit hash", async () => {
    const dir = buildFixtureRepo();

    // The proof that matters: the port agrees with git itself, not with a
    // hard-coded expectation.
    expect(await createGitPort(dir).head()).toBe(git(dir, "rev-parse", "HEAD").trim());
  });

  it("returns a bare hash — trimmed, with no trailing newline", async () => {
    const head = await createGitPort(buildFixtureRepo()).head();

    // `Session.gitState.head` is `.min(1)` and is embedded in provenance, so a
    // trailing newline would silently corrupt every candidate's audit trail.
    // Length is left open: a repo may use SHA-1 (40) or SHA-256 (64) object ids.
    expect(head).toMatch(/^[0-9a-f]+$/);
  });

  it("tracks a new commit", async () => {
    const dir = buildFixtureRepo();
    const before = await createGitPort(dir).head();

    writeFileSync(join(dir, "keep.ts"), "export const keep = 2;\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "second");

    const after = await createGitPort(dir).head();
    expect(after).not.toBe(before);
    expect(after).toBe(git(dir, "rev-parse", "HEAD").trim());
  });
});

describe("EOS-401 — dirty()", () => {
  it("is false on a clean working tree", async () => {
    expect(await createGitPort(buildFixtureRepo()).dirty()).toBe(false);
  });

  it("is true with an unstaged modification", async () => {
    const dir = buildFixtureRepo();
    writeFileSync(join(dir, "keep.ts"), "export const keep = 99;\n");

    expect(await createGitPort(dir).dirty()).toBe(true);
  });

  it("is true with a staged but uncommitted change", async () => {
    const dir = buildFixtureRepo();
    writeFileSync(join(dir, "staged.ts"), "export const staged = 1;\n");
    git(dir, "add", "-A");

    // Staged-but-uncommitted is exactly the state `aj session end` runs in most
    // often, so it must read as dirty rather than clean.
    expect(await createGitPort(dir).dirty()).toBe(true);
  });

  it("is true for an untracked file", async () => {
    const dir = buildFixtureRepo();
    writeFileSync(join(dir, "untracked.ts"), "export const untracked = 1;\n");

    expect(await createGitPort(dir).dirty()).toBe(true);
  });

  it("returns to false once changes are committed", async () => {
    const dir = buildFixtureRepo();
    writeFileSync(join(dir, "keep.ts"), "export const keep = 3;\n");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "third");

    expect(await createGitPort(dir).dirty()).toBe(false);
  });
});

describe("EOS-401 — branch()", () => {
  it("returns the checked-out branch", async () => {
    expect(await createGitPort(buildFixtureRepo()).branch()).toBe("main");
  });

  it("tracks a checkout", async () => {
    const dir = buildFixtureRepo();
    git(dir, "checkout", "-q", "-b", "feat/spec-003-m5-composition");

    expect(await createGitPort(dir).branch()).toBe(
      "feat/spec-003-m5-composition",
    );
  });

  it("returns null when HEAD is detached rather than the literal \"HEAD\"", async () => {
    const dir = buildFixtureRepo();
    // Detached HEAD is ordinary, not exotic: an interactive rebase, a bisect, or a
    // tag checkout all land here, and `aj session end` may well be run mid-rebase.
    git(dir, "checkout", "-q", "--detach");

    // `git rev-parse --abbrev-ref HEAD` would answer "HEAD" here — a non-empty
    // string that satisfies `Session.branch`'s `.min(1)` while naming a branch that
    // does not exist. The port must report the absence, not launder it.
    expect(await createGitPort(dir).branch()).toBeNull();
  });
});

describe("EOS-401 — failure propagation", () => {
  it("rejects each state read when the repository is unavailable", async () => {
    // A directory that is not a git repository: the SPEC-003 §15 "repository
    // unavailable" fatal case. The adapter surfaces it rather than substituting a
    // default — a session with an invented head would poison provenance.
    const notARepo = mkdtempSync(join(tmpdir(), "eos401-bare-"));
    createdRepos.push(notARepo);
    const port = createGitPort(notARepo);

    await expect(port.head()).rejects.toThrow();
    await expect(port.dirty()).rejects.toThrow();
    await expect(port.branch()).rejects.toThrow();
  });

  it("requires a repository path at construction", () => {
    expect(() => createGitPort("")).toThrow(/repository path is required/);
  });
});

describe("EOS-401 — the seam stays read-only (ADR-002)", () => {
  it("leaves HEAD, the index, and the working tree untouched", async () => {
    const dir = buildFixtureRepo();
    writeFileSync(join(dir, "keep.ts"), "export const keep = 42;\n");
    git(dir, "add", "-A");

    const headBefore = git(dir, "rev-parse", "HEAD");
    const statusBefore = git(dir, "status", "--porcelain");

    const port = createGitPort(dir);
    await port.head();
    await port.dirty();
    await port.branch();
    await port.changes("HEAD");

    // The workflow never commits (ADR-002 §4, AJS-005 §7). Proven, not asserted:
    // reading the session's state must not stage, commit, or stash anything.
    expect(git(dir, "rev-parse", "HEAD")).toBe(headBefore);
    expect(git(dir, "status", "--porcelain")).toBe(statusBefore);
  });

  it("exposes exactly the four documented reads and no mutator", () => {
    const port = createGitPort(buildFixtureRepo());

    expect(Object.keys(port).sort()).toEqual([
      "branch",
      "changes",
      "dirty",
      "head",
    ]);
    expect(Object.isFrozen(port)).toBe(true);
  });
});

/**
 * EOS-411 / EOS-D11 — untracked files reach the change stream.
 *
 * The adapter's second read. These live beside the other real-git tests because the
 * behaviour is only meaningful against a real repository: no stub can tell you what
 * `git ls-files --others --exclude-standard` actually returns.
 */
describe("EOS-411 — untracked files (EOS-D11)", () => {
  /** A repo whose session modified a tracked file, staged a new one, and created two more. */
  function buildMixedRepo(): string {
    const dir = buildFixtureRepo();
    writeFileSync(join(dir, "keep.ts"), "export const keep = 99;\n"); // modified
    writeFileSync(join(dir, "staged.ts"), "export const staged = 1;\n");
    git(dir, "add", "staged.ts"); // staged-new
    writeFileSync(join(dir, "untracked.md"), "# notes\n"); // untracked
    mkdirSync(join(dir, "newdir"), { recursive: true });
    writeFileSync(join(dir, "newdir", "nested.ts"), "export const n = 1;\n"); // untracked, nested
    return dir;
  }

  it("reports untracked files as additions for a working-tree range", async () => {
    const dir = buildMixedRepo();
    const changes = await createGitPort(dir).changes("HEAD");

    // The gap EOS-D11 closed: before this, a brand-new file was invisible while
    // `dirty` reported the tree as changed.
    const untracked = changes.filter((change) => change.path === "untracked.md");
    expect(untracked).toEqual([{ path: "untracked.md", status: "A" }]);
    expect(changes.map((change) => change.path)).toContain("newdir/nested.ts");
  });

  it("reports tracked and untracked changes together", async () => {
    const dir = buildMixedRepo();
    const paths = (await createGitPort(dir).changes("HEAD"))
      .map((change) => change.path)
      .sort();

    expect(paths).toEqual([
      "keep.ts", // modified, tracked
      "newdir/nested.ts", // untracked
      "staged.ts", // staged-new, tracked
      "untracked.md", // untracked
    ]);
  });

  it("does not duplicate a staged-new file", async () => {
    const dir = buildMixedRepo();
    const changes = await createGitPort(dir).changes("HEAD");

    // `git diff` reports tracked paths and `ls-files --others` untracked ones — disjoint
    // sets, which is why the adapter needs no deduplication.
    expect(changes.filter((change) => change.path === "staged.ts")).toHaveLength(1);
  });

  it("never reports a .gitignore'd file", async () => {
    const dir = buildMixedRepo();
    writeFileSync(join(dir, ".gitignore"), "*.log\n");
    writeFileSync(join(dir, "debug.log"), "noise\n");

    const paths = (await createGitPort(dir).changes("HEAD")).map((c) => c.path);

    // `--exclude-standard` keeps build output, logs, and node_modules out of the session's
    // knowledge for free.
    expect(paths).not.toContain("debug.log");
    expect(paths).toContain(".gitignore"); // itself untracked, and not ignored
  });

  it("excludes untracked files from a commit range", async () => {
    const dir = buildMixedRepo();
    git(dir, "commit", "-q", "-am", "session work");
    writeFileSync(join(dir, "still-untracked.md"), "# later\n");

    const paths = (await createGitPort(dir).changes("HEAD~1..HEAD")).map((c) => c.path);

    // A commit range carries no working-tree state: reporting new files there but not the
    // unstaged edits beside them would be incoherent.
    expect(paths).not.toContain("still-untracked.md");
    expect(paths).toContain("keep.ts");
  });

  it("includes untracked files for a bare ref, which also compares the working tree", async () => {
    const dir = buildMixedRepo();

    // `git diff main` compares the tree against a commit — no `..`, so working-tree state
    // is in scope.
    const paths = (await createGitPort(dir).changes("main")).map((c) => c.path);

    expect(paths).toContain("untracked.md");
  });

  it("is deterministic across reads", async () => {
    const port = createGitPort(buildMixedRepo());

    expect(await port.changes("HEAD")).toEqual(await port.changes("HEAD"));
  });

  it("adds no git write", async () => {
    const dir = buildMixedRepo();
    const head = git(dir, "rev-parse", "HEAD");
    const status = git(dir, "status", "--porcelain");

    await createGitPort(dir).changes("HEAD");

    expect(git(dir, "rev-parse", "HEAD")).toBe(head);
    expect(git(dir, "status", "--porcelain")).toBe(status);
  });
});
