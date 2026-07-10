/**
 * The resolved locations within a validated handbook.
 *
 * Intentionally minimal: it records only what AJ-OS needs to know right
 * now — where the handbook is and where its generated wiki lives. Anything
 * about the wiki's contents belongs to a later Retrieval capability.
 */
export interface HandbookInfo {
  /** Absolute path to the handbook root directory. */
  readonly handbookPath: string;
  /** Absolute path to the generated `wiki/` directory. */
  readonly wikiPath: string;
}
