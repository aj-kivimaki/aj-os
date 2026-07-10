/**
 * A single wiki article matched against a question.
 *
 * Intentionally minimal: it identifies the article and how well it matched.
 * Article *contents* are deliberately excluded for now — reading text into
 * prompts is the Context Builder's concern, not Retrieval's.
 */
export interface RetrievalResult {
  /** Absolute path to the matched Markdown file. */
  readonly path: string;
  /** Human-readable title (first `# heading`, else the file name). */
  readonly title: string;
  /** Keyword-match score; higher means more relevant. Always > 0. */
  readonly score: number;
}
