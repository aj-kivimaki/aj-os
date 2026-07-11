/**
 * Source Connector contract — SPEC-006.
 *
 * A Source Connector enumerates and reads documents from a backend and
 * normalizes each into a {@link SourceRecord}, so the Wiki Generator
 * (SPEC-005) never depends on any specific source technology.
 *
 * Invariants (ARCH-002 §5, SPEC-006 §15):
 * - Records are uniform across backends; the generator never branches on
 *   source type.
 * - Connectors are read-only; they never mutate their backend.
 * - `id` is stable across content edits and globally namespaced by
 *   connector; `hash` is a separate change signal.
 */

/**
 * The normalized unit of source knowledge. Backend-agnostic.
 */
export interface SourceRecord {
  /**
   * Stable, globally-namespaced identity: `<connector>:<local-id>`.
   * Unchanged across content edits (an edit is detected via {@link hash},
   * not via a new id). Handbook connector: `handbook:<relative-path>`.
   */
  readonly id: string;

  /** Where the record came from (path / URL / backend reference). */
  readonly uri: string;

  /** Normalized plain-text / Markdown body. */
  readonly content: string;

  /**
   * Content hash — the change signal. Distinct from {@link id}: the same
   * document yields the same id always, and the same hash while unchanged.
   */
  readonly hash: string;

  /** Backend-neutral attributes (title, tags, timestamps, source kind). */
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Enumerates and normalizes the documents of one source backend.
 *
 * Connectors are stateless producers: they hold no memory of prior runs.
 * Change detection (comparing hashes across runs) is the Wiki Generator's
 * responsibility, not the connector's.
 */
export interface SourceConnector {
  /**
   * Connector kind, used to namespace record ids (e.g. `"handbook"`).
   * Must be unique per connector type in a configuration.
   */
  readonly kind: string;

  /**
   * Enumerate the backend and return one normalized record per document.
   *
   * For the filesystem/Handbook connector, one Markdown file maps to
   * exactly one record (SPEC-006 §2). Returned eagerly with content;
   * streaming enumeration for large backends is a future enhancement.
   */
  list(): Promise<SourceRecord[]>;
}
