/** A single Markdown page read from the handbook wiki. */
export interface HandbookPage {
  /** Path relative to the wiki root, e.g. "entities/aj-os.md". */
  readonly path: string;
  readonly content: string;
}

/** Listing of Markdown pages under the wiki (or a subdirectory of it). */
export interface HandbookListing {
  /** Subdirectory listed, relative to the wiki root ("" = whole wiki). */
  readonly subdir: string;
  /** Wiki-relative paths of every `.md` file found, sorted. */
  readonly pages: readonly string[];
}

/** One search hit: a matching line within a wiki page. */
export interface SearchHit {
  /** Path relative to the wiki root. */
  readonly path: string;
  /** 1-indexed line number of the match. */
  readonly line: number;
  /** The full matching line, trimmed. */
  readonly text: string;
}

export interface SearchOptions {
  /** Maximum number of hits to return. Defaults to 30. */
  readonly limit?: number;
}

/** Input for creating a Markdown note in the inbox. */
export interface InboxNoteInput {
  readonly title: string;
  readonly body: string;
  readonly tags?: readonly string[] | undefined;
  /** Optional filename (sanitized; `.md` enforced). Defaults from the title. */
  readonly filename?: string | undefined;
}

/** Input for saving an arbitrary file to the inbox. */
export interface InboxFileInput {
  readonly filename: string;
  readonly content: string;
  /** Encoding of `content`. Defaults to "utf8". */
  readonly encoding?: "utf8" | "base64" | undefined;
}

/** Result of a successful inbox write. */
export interface InboxWriteResult {
  /** Path relative to the vault root, e.g. "workspace/inbox/idea.md". */
  readonly path: string;
  readonly bytesWritten: number;
}
