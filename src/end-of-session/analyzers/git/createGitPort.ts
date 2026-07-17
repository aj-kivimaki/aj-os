/**
 * The real, git-backed {@link GitPort} adapter (EOS-103).
 *
 * Deliberately **minimal**: its only responsibility is to *invoke git*, *parse
 * git's output*, and *produce {@link GitFileChange} values*. It performs no domain
 * translation (that is the analyzer's job), no filtering, no retries, no
 * orchestration, and no policy decisions — those live in the analyzer and in later
 * orchestration, never here. It is **read-only**: it runs only `git diff`, never a
 * command that stages, commits, or mutates the repository (ADR-002).
 *
 * The repository directory is injected at construction (configuration supplied by
 * composition), not discovered here — repository discovery is orchestration. The
 * resolved `range` is supplied verbatim by the caller.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { GitFileChange, GitPort } from "./GitPort.js";

const execFileAsync = promisify(execFile);

/**
 * Parse the output of `git diff --name-status -M` into {@link GitFileChange}s.
 *
 * Each non-empty line is tab-separated: a status code followed by one path, or —
 * for renames/copies — an old path and a new path. The similarity score is stripped
 * from the code (`R100` → `R`, `C75` → `C`) so the analyzer receives git's plain
 * letter. This is output parsing only — no change is reclassified, filtered, or
 * dropped on a domain basis.
 */
function parseNameStatus(stdout: string): GitFileChange[] {
  const changes: GitFileChange[] = [];

  for (const line of stdout.split("\n")) {
    if (line.length === 0) {
      continue;
    }

    const [code, first, second] = line.split("\t");
    if (code === undefined || code.length === 0) {
      continue;
    }
    // git status codes are a single letter; only R/C carry a trailing similarity
    // score ("R100"), so the leading letter is the status the analyzer maps.
    const status = code.charAt(0);

    if (status === "R" || status === "C") {
      // Rename/copy lines carry two paths: <code>\t<oldPath>\t<newPath>.
      if (first === undefined || second === undefined) {
        continue;
      }
      changes.push({ path: second, status, oldPath: first });
    } else {
      if (first === undefined) {
        continue;
      }
      changes.push({ path: first, status });
    }
  }

  return changes;
}

/**
 * Whether `range` compares against the **working tree** rather than two commits.
 *
 * Git's own vocabulary decides it: `main..HEAD` diffs commit to commit and carries no
 * working-tree state, while `HEAD` (or a bare `main`) compares the tree as it stands. This
 * is a fact about git, not about sessions — which is why the adapter, the component that
 * speaks git, is the one that knows it.
 */
function comparesWorkingTree(range: string): boolean {
  return !range.includes("..");
}

/**
 * Untracked files in the working tree, as {@link GitFileChange}s (EOS-D11).
 *
 * `git diff` reports only *tracked* paths, so without this a session that creates a file and
 * ends before `git add` would capture nothing about it — while `Session.gitState.dirty`
 * simultaneously reported the tree as dirty. This closes that contradiction and restores
 * EOS-402's ratified range semantics: the default range is the complete *uncommitted*
 * working state, and an untracked file is uncommitted.
 *
 * `--exclude-standard` applies the repository's ignore rules, so build output, logs, and
 * `node_modules` never enter the change stream. Each path is reported as an addition (`A`) —
 * a shape the contract already defines and the analyzer already translates, which is why
 * nothing above this function changes.
 *
 * Untracked paths are **disjoint** from `git diff`'s tracked ones, so the two reads never
 * duplicate a file and no deduplication is needed.
 */
function parseUntracked(stdout: string): GitFileChange[] {
  return stdout
    .split("\n")
    .filter((path) => path.length > 0)
    .map((path) => ({ path, status: "A" }));
}

/**
 * Create the real git-backed {@link GitPort} over an injected repository directory.
 *
 * Every operation is a **read-only** invocation in that directory: `git diff` for
 * `changes` (`-M` lets git report renames, which the contract already models) plus
 * `git ls-files --others --exclude-standard` for the untracked files a working-tree
 * range covers (EOS-D11), `git rev-parse` for `head`, `git status --porcelain` for
 * `dirty`, and `git branch --show-current` for `branch`. None of them stage, commit,
 * or mutate the repository (ADR-002).
 *
 * A non-zero git exit rejects — the adapter surfaces the failure rather than
 * swallowing or retrying it, and each caller decides what it means: a `changes`
 * failure becomes one `AnalyzerError` under partial collection (the EOS-101
 * execution stage), while a state-read failure is fatal to session creation
 * (SPEC-003 §15). An empty/absent repository path throws at construction.
 *
 * @example
 * const port = createGitPort("/path/to/repo");
 * await port.changes("main..HEAD");
 * await port.head();   // "a1b2c3…"
 * await port.dirty();  // false
 * await port.branch(); // "main" | null when HEAD is detached
 */
export function createGitPort(repositoryPath: string): GitPort {
  if (typeof repositoryPath !== "string" || repositoryPath.length === 0) {
    throw new Error("createGitPort: a repository path is required.");
  }

  /** Run a read-only git command in the repository and return its stdout. */
  async function git(...args: readonly string[]): Promise<string> {
    const { stdout } = await execFileAsync("git", [...args], {
      cwd: repositoryPath,
    });
    return stdout;
  }

  return Object.freeze({
    async changes(range: string): Promise<readonly GitFileChange[]> {
      const tracked = parseNameStatus(
        await git("diff", "--name-status", "-M", range),
      );

      // A commit range carries no working-tree state, so untracked files belong only to a
      // working-tree comparison — including them for `main..HEAD` would report brand-new
      // files beside none of the unstaged edits that sit with them (EOS-D11).
      if (!comparesWorkingTree(range)) {
        return tracked;
      }

      const untracked = parseUntracked(
        await git("ls-files", "--others", "--exclude-standard"),
      );

      // Concatenated, not merged: the two reads are disjoint, and the analyzer sorts by
      // path — so ordering stays deterministic without this adapter arranging anything.
      return [...tracked, ...untracked];
    },

    async head(): Promise<string> {
      // Trimmed: git terminates the hash with a newline, and the contract
      // requires a non-empty hash, not a line.
      return (await git("rev-parse", "HEAD")).trim();
    },

    async dirty(): Promise<boolean> {
      // `--porcelain` prints one line per changed path (staged or unstaged) and
      // nothing at all for a clean tree, so presence of output *is* the answer —
      // no parsing, and no judgement about which changes count.
      return (await git("status", "--porcelain")).trim().length > 0;
    },

    async branch(): Promise<string | null> {
      // `--show-current` prints the branch name, or nothing at all when HEAD is
      // detached. Preferred over `rev-parse --abbrev-ref HEAD`, which reports the
      // literal "HEAD" while detached — a value indistinguishable from a branch
      // actually named `HEAD`, and one the contract would happily accept.
      const current = (await git("branch", "--show-current")).trim();
      return current.length > 0 ? current : null;
    },
  });
}
