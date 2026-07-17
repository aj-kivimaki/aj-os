/**
 * The read-only git access seam for the End-of-Session Workflow.
 *
 * `GitPort` is the injectable boundary between the workflow and *how* git
 * observations are obtained. It exposes **reads only** — there is no
 * stage/commit/mutate operation (ADR-002: version control is orchestration, never
 * an engine concern). The concrete git-backed adapter (`createGitPort`) that shells
 * out to git, and all git orchestration/policy (repository discovery, range
 * construction, retries, invocation strategy) live behind this port — in the
 * adapter and in composition — never in a consumer.
 *
 * Two consumers, one seam (EOS-D7):
 *   - {@link createGitChangeAnalyzer} reads `changes(range)` — *what changed*;
 *   - the Session factory reads `head`/`dirty`/`branch` — *the session's git state*,
 *     which `Session` requires as observed fact rather than caller-supplied claim.
 *
 * The seam's identity is **read-only git access to one repository**, not any one
 * consumer's reads — so state observations belong here rather than in a second git
 * abstraction (EOS-D7). Keeping the interface tiny keeps the real adapter and the
 * unit-test stub trivially interchangeable, mirroring how knowledge extraction
 * depends on the injected `TextGenerator` port rather than on a concrete model.
 *
 * Failures propagate; what a failure *means* is the caller's to decide. A `changes`
 * rejection is recoverable — the collection stage turns it into one `AnalyzerError`
 * under partial collection. A `head`/`dirty`/`branch` rejection is fatal (SPEC-003
 * §15, "repository unavailable"): a session whose head or branch cannot be read
 * cannot be identified at all.
 */

/**
 * A single file change as observed from git, in git's own vocabulary. `status` is
 * git's short status code (`A`/`M`/`D`/`R`/`C`/`T`); the adapter is responsible for
 * parsing git's output into these codes (e.g. stripping the similarity score so
 * `R100` becomes `R`) — the analyzer translates the *code*, it does not parse git.
 * `oldPath` carries the former path for a rename (or the source for a copy); it is
 * absent otherwise.
 */
export interface GitFileChange {
  /** Repo-relative path the change concerns (the new path for a rename). */
  readonly path: string;
  /** git short status code: `A` | `M` | `D` | `R` | `C` | `T`. */
  readonly status: string;
  /** Former path for a rename, or the source path for a copy. */
  readonly oldPath?: string;
}

/**
 * The read-only git access the End-of-Session Workflow depends on.
 *
 * Four reads, no writes. `changes` answers *what changed* over an already-resolved
 * range; `head`, `dirty`, and `branch` answer *where the repository stood* when the
 * session ended. Callers supply the range verbatim from `Session.gitState.range`;
 * none of them construct the range, discover the repository, or decide how git is
 * invoked — those are the adapter's and composition's responsibilities.
 */
export interface GitPort {
  /**
   * Return the file changes for an already-resolved git `range` (e.g.
   * `"main..HEAD"`). Read-only; performs no repository mutation.
   */
  changes(range: string): Promise<readonly GitFileChange[]>;

  /**
   * Return the HEAD commit hash. Recorded as `Session.gitState.head` and carried
   * onto every candidate's provenance, so it is **observed**, never taken from the
   * caller's optional `SessionContext.commitHash` — provenance records facts, not
   * claims (EOS-D7).
   */
  head(): Promise<string>;

  /**
   * Whether the working tree has uncommitted changes — staged or unstaged.
   * Recorded as `Session.gitState.dirty`; it cannot be derived from anything the
   * caller supplies.
   */
  dirty(): Promise<boolean>;

  /**
   * Return the current branch name, or **`null` when HEAD is detached** — during a
   * rebase or bisect, or on a checked-out tag/commit, the repository is genuinely
   * on no branch. Feeds `Session.branch` (EOS-D9), observed here so no entry point
   * needs git of its own.
   *
   * `null` rather than a sentinel string: `git rev-parse --abbrev-ref HEAD` reports
   * the literal `"HEAD"` when detached, which is indistinguishable from a branch
   * actually named `HEAD` and would satisfy the contract's non-empty `branch` while
   * recording a branch that does not exist. The port reports the fact; what a
   * detached session's `branch` should say is the Session factory's decision.
   */
  branch(): Promise<string | null>;
}
