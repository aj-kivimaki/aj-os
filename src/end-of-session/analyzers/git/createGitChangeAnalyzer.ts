/**
 * The Git change analyzer — the workflow's first concrete {@link Analyzer}.
 *
 * It is a **pure translator**: given a `Session`, it reads the injected read-only
 * {@link GitPort} over `Session.gitState.range` and maps each observed
 * {@link GitFileChange} onto a normalized {@link SessionChange}. It owns no git
 * orchestration or policy — no repository discovery, range construction, retries,
 * or invocation strategy (those live behind the port and in later orchestration).
 * It does not aggregate a `ChangeSet` or report errors either; it returns
 * `readonly SessionChange[]`, and the EOS-101 execution stage owns aggregation and
 * partial-collection error handling.
 *
 * Its output is **deterministic**: the same git observations always yield the same
 * `SessionChange[]`, path-sorted, regardless of the order the port returns them.
 */

import type {
  Analyzer,
  ChangeKind,
  ChangeType,
  SessionChange,
} from "../../contracts/change/index.js";
import type { Session } from "../../contracts/session/index.js";

import type { GitFileChange, GitPort } from "./GitPort.js";

/** This analyzer's stable identifier — the namespace for every change id it emits. */
const ANALYZER_ID = "git";

/**
 * Map a git short status code onto the contract's closed `changeType` enum.
 *
 * `A`/`M`/`D`/`R` map directly; the finer-grained codes map onto the nearest
 * contract type: a copy (`C`) creates a new file → `added`; a type change (`T`,
 * e.g. file ↔ symlink) is a content/type modification → `modified`. `changeType`
 * is a *definite* classification (not a soft hint), so an unrecognized status is a
 * mapping bug and is surfaced by throwing rather than silently coerced — the
 * EOS-101 execution stage turns the throw into one `AnalyzerError` (partial
 * collection), so it never aborts the workflow.
 */
function toChangeType(status: string): ChangeType {
  switch (status) {
    case "A":
      return "added";
    case "M":
      return "modified";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "C":
      return "added";
    case "T":
      return "modified";
    default:
      throw new Error(`GitChangeAnalyzer: unrecognized git status "${status}".`);
  }
}

/**
 * Classify a change's `kind` from its path alone — a **soft hint**, best-effort.
 *
 * `kind` is a lenient hint downstream must not depend on, so imperfect
 * classification is acceptable by contract. Test detection wins over `src/`
 * (a test under `src/` is a test), and documentation/config win over `src/` too.
 */
function toChangeKind(path: string): ChangeKind {
  const fileName = path.slice(path.lastIndexOf("/") + 1);

  if (/\.(test|spec)\./.test(fileName) || /(^|\/)(tests?|__tests__)\//.test(path)) {
    return "test";
  }
  if (/\.mdx?$/.test(fileName) || /(^|\/)docs\//.test(path)) {
    return "documentation";
  }
  if (
    fileName.startsWith(".") ||
    /\.(json|ya?ml|toml|ini|env|config\.[cm]?[jt]s)$/.test(fileName)
  ) {
    return "config";
  }
  if (/(^|\/)src\//.test(path)) {
    return "source";
  }
  return "other";
}

/**
 * Build a deterministic, human-readable summary. A rename with a known former path
 * reads `renamed <old> → <new>`; everything else reads `<changeType> <path>`.
 */
function toSummary(changeType: ChangeType, change: GitFileChange): string {
  if (changeType === "renamed" && change.oldPath !== undefined) {
    return `renamed ${change.oldPath} → ${change.path}`;
  }
  return `${changeType} ${change.path}`;
}

/**
 * Translate one git observation into a normalized `SessionChange`. The id is
 * namespaced `git:<path>` (keyed on the new path for renames); the former path,
 * when present, is preserved in `metadata.oldPath`.
 */
function toSessionChange(change: GitFileChange): SessionChange {
  const changeType = toChangeType(change.status);
  return {
    id: `${ANALYZER_ID}:${change.path}`,
    kind: toChangeKind(change.path),
    path: change.path,
    changeType,
    summary: toSummary(changeType, change),
    metadata: change.oldPath !== undefined ? { oldPath: change.oldPath } : {},
  };
}

/**
 * Deterministic, locale-independent path ordering (code-unit comparison), so the
 * same set of observations always produces the same change order regardless of the
 * order the port returned them.
 */
function byPath(a: SessionChange, b: SessionChange): number {
  if (a.path < b.path) return -1;
  if (a.path > b.path) return 1;
  return 0;
}

/**
 * Create the Git change analyzer over an injected read-only {@link GitPort}.
 *
 * The returned {@link Analyzer} reads the port over `session.gitState.range` and
 * returns the translated, path-sorted `SessionChange[]`. A `null`/`undefined` port
 * throws — the analyzer is rejected rather than constructed in a broken state. The
 * returned handle is frozen (the module's factory convention).
 *
 * @example
 * const analyzer = createGitChangeAnalyzer(gitPort);
 * const changes = await analyzer.analyze(session);
 */
export function createGitChangeAnalyzer(gitPort: GitPort): Analyzer {
  if (gitPort === null || gitPort === undefined) {
    throw new Error("createGitChangeAnalyzer: a GitPort is required.");
  }

  return Object.freeze({
    id: ANALYZER_ID,
    name: "Git change analyzer",
    description:
      "Translates the session's git file changes into normalized SessionChanges.",
    async analyze(session: Session): Promise<readonly SessionChange[]> {
      const observed = await gitPort.changes(session.gitState.range);
      return observed.map(toSessionChange).sort(byPath);
    },
  });
}
