/**
 * The read-only git access seam consumed by the {@link createGitChangeAnalyzer}.
 *
 * `GitPort` is the injectable boundary between the analyzer (a pure translator of
 * git observations into `SessionChange`s) and *how* those observations are
 * obtained. It exposes **reads only** — there is no stage/commit/mutate operation
 * (ADR-002: version control is orchestration, never an engine concern). The
 * concrete git-backed adapter (`createGitPort`) that shells out to git, and all
 * git orchestration/policy (repository discovery, range construction, retries,
 * invocation strategy) live behind this port — in the EOS-103 adapter and later
 * orchestration — never in the analyzer.
 *
 * Keeping the interface tiny keeps the real adapter and the unit-test stub
 * trivially interchangeable, mirroring how knowledge extraction depends on the
 * injected `TextGenerator` port rather than on a concrete model.
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
 * The read-only git access the {@link createGitChangeAnalyzer} depends on.
 *
 * A single read: given an already-resolved git range, return the file changes it
 * covers. The analyzer supplies the range verbatim from `Session.gitState.range`;
 * it does not construct the range, discover the repository, or decide how git is
 * invoked — those are the adapter's/orchestration's responsibilities.
 */
export interface GitPort {
  /**
   * Return the file changes for an already-resolved git `range` (e.g.
   * `"main..HEAD"`). Read-only; performs no repository mutation.
   */
  changes(range: string): Promise<readonly GitFileChange[]>;
}
