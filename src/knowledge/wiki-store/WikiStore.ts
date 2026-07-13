/**
 * Wiki Store contract.
 *
 * A persistence-only, generic path-keyed Markdown blob store scoped to the
 * configured wiki destination. Pages, the index, the reverse (provenance) index,
 * and the log are all just path-keyed *entries*; the store does not parse
 * frontmatter or understand page structure (that lives in the Wiki Generator).
 *
 * Invariants:
 * - Persistence only — the store never performs version control; committing is an
 *   orchestration concern.
 * - All wiki reads/writes go through the store; no caller uses raw paths.
 * - Writes never escape the configured destination (path-guarded).
 */

/** A validated handle to the wiki destination. */
export interface WikiLocation {
  /** Resolved (realpath) absolute root of the wiki destination. */
  readonly root: string;
}

/**
 * Reads and writes wiki entries by wiki-relative path.
 *
 * All `path` arguments are relative to the wiki root and must resolve
 * inside it; attempts to escape the destination are rejected.
 */
export interface WikiStore {
  /**
   * Resolve and validate the destination, returning a location handle.
   * Producer use requires it writable; consumer use requires it readable.
   */
  locate(): Promise<WikiLocation>;

  /** Read an entry's content, or `null` if it does not exist. */
  read(path: string): Promise<string | null>;

  /** List entry paths, optionally restricted to those under `prefix`. */
  list(prefix?: string): Promise<string[]>;

  /** Create or overwrite an entry. Confined to the destination. */
  write(path: string, content: string): Promise<void>;

  /**
   * Delete an entry. Exists for orchestration/maintenance flows; the headless Wiki
   * Generator never calls this (it proposes removals rather than performing them).
   */
  delete(path: string): Promise<void>;

  /**
   * Recursively remove an entry — a file or an entire directory subtree —
   * confined to the destination and idempotent (removing a missing entry is a
   * no-op). Like {@link delete}, this exists for orchestration/maintenance
   * flows (e.g. a `--rebuild` resetting generator-owned outputs); the headless
   * Wiki Generator never calls it. The store stays semantics-free: the caller
   * supplies the paths to remove.
   */
  removeTree(path: string): Promise<void>;

  /**
   * Append a line/entry to the generation log (`log.md`). A convenience
   * over read-modify-write; carries no version-control semantics.
   */
  appendLog(entry: string): Promise<void>;
}
