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
 * Create the real git-backed {@link GitPort} over an injected repository directory.
 *
 * `changes(range)` runs `git diff --name-status -M <range>` in that directory (a
 * read-only invocation; `-M` lets git report renames, which the contract already
 * models) and returns the parsed observations. A non-zero git exit rejects — the
 * adapter surfaces the failure rather than swallowing or retrying it; the analyzer's
 * caller (the EOS-101 execution stage) turns it into one `AnalyzerError` under
 * partial collection. An empty/absent repository path throws at construction.
 *
 * @example
 * const port = createGitPort("/path/to/repo");
 * await port.changes("main..HEAD");
 */
export function createGitPort(repositoryPath: string): GitPort {
  if (typeof repositoryPath !== "string" || repositoryPath.length === 0) {
    throw new Error("createGitPort: a repository path is required.");
  }

  return Object.freeze({
    async changes(range: string): Promise<readonly GitFileChange[]> {
      const { stdout } = await execFileAsync(
        "git",
        ["diff", "--name-status", "-M", range],
        { cwd: repositoryPath },
      );
      return parseNameStatus(stdout);
    },
  });
}
