import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import type { RetrievalResult } from "./types.js";

/** File extension that identifies a wiki article. */
const MARKDOWN_EXTENSION = ".md";

/** The catalog the handbook generator maintains at the wiki root. */
const INDEX_FILE_NAME = "index.md";

/** Maximum number of articles returned for a single question. */
const MAX_RESULTS = 5;

/**
 * Captures the target slug of an Obsidian-style wiki link, stopping at the
 * first `]`, `|`, `#`, or line break — so `[[about-me]]`, `[[about-me#career]]`,
 * and `[[about-me|About AJ]]` all yield `about-me`. Deliberately does not match
 * the closing `]]`, which keeps the match linear (no backtracking).
 */
const WIKILINK_PATTERN = /\[\[([^\]|#\n]+)/g;

/**
 * Finds the wiki articles most relevant to a question.
 *
 * This is a self-contained platform capability. It knows only two things:
 * a wiki directory and a question. It has no knowledge of the Knowledge
 * Assistant, configuration, handbooks, the Context Builder, prompts, or AI —
 * and it imports no other platform module.
 *
 * The searchable corpus is defined by `wiki/index.md`, the catalog the
 * handbook generator maintains: the service scores only the articles that the
 * index links to. It does not rediscover the corpus by scanning the wiki tree,
 * so maintainer files that the index deliberately omits (`CLAUDE.md`,
 * `README.md`, `log.md`, …) are never searched.
 *
 * Version 0.1 uses a deliberately naive keyword score. The algorithm lives
 * behind {@link search} so it can be replaced (BM25, embeddings, hybrid)
 * without changing the service's contract.
 */
export class RetrievalService {
  /**
   * @param wikiPath Directory containing the generated wiki. The caller (the
   * product) supplies this — typically from `HandbookInfo.wikiPath`. The
   * service does not know where the path came from.
   */
  constructor(private readonly wikiPath: string) {}

  /** Return up to five articles most relevant to `question`, best first. */
  async search(question: string): Promise<RetrievalResult[]> {
    const terms = tokenize(question);
    if (terms.length === 0) {
      return [];
    }

    const articles = await this.indexedArticles(resolve(this.wikiPath));

    const matches: RetrievalResult[] = [];
    for (const path of articles) {
      const content = await readFile(path, "utf8");
      const score = scoreContent(content, terms);
      if (score > 0) {
        matches.push({ path, title: extractTitle(content, path), score });
      }
    }

    return matches
      .toSorted((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, MAX_RESULTS);
  }

  /**
   * The searchable corpus: the article files linked from `wiki/index.md`, in
   * the order the index lists them and de-duplicated.
   *
   * The index authors *what* belongs to the knowledge base; the filesystem is
   * consulted only to answer *where* each linked article lives. If the index
   * is absent the corpus is empty.
   */
  private async indexedArticles(wikiDir: string): Promise<string[]> {
    const slugs = await this.readIndexLinks(wikiDir);
    if (slugs.length === 0) {
      return [];
    }

    const locations = await this.locateArticles(wikiDir);

    const paths: string[] = [];
    const seen = new Set<string>();
    for (const slug of slugs) {
      const path = locations.get(slug);
      if (path && !seen.has(path)) {
        seen.add(path);
        paths.push(path);
      }
    }
    return paths;
  }

  /** Extract the wiki-link target slugs from `index.md`, in document order. */
  private async readIndexLinks(wikiDir: string): Promise<string[]> {
    let content: string;
    try {
      content = await readFile(join(wikiDir, INDEX_FILE_NAME), "utf8");
    } catch (error) {
      if (isErrnoException(error) && error.code === "ENOENT") {
        return [];
      }
      throw error;
    }

    const slugs: string[] = [];
    for (const match of content.matchAll(WIKILINK_PATTERN)) {
      const slug = match[1]?.trim();
      if (slug) {
        slugs.push(slug);
      }
    }
    return slugs;
  }

  /**
   * Map every article slug to its file path.
   *
   * Reads the wiki root and its immediate subdirectories only — never
   * recursively. This locates linked articles wherever the generator files
   * them (root, `concepts/`, `entities/`, `sources/`, …) without hardcoding
   * those folder names. The map may include files the index does not link;
   * they are simply never selected by {@link indexedArticles}.
   */
  private async locateArticles(wikiDir: string): Promise<Map<string, string>> {
    const locations = new Map<string, string>();

    const entries = await readdir(wikiDir, { withFileTypes: true });
    this.indexMarkdown(wikiDir, entries, locations);

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dir = join(wikiDir, entry.name);
        this.indexMarkdown(dir, await readdir(dir, { withFileTypes: true }), locations);
      }
    }

    return locations;
  }

  /** Record `slug -> path` for each Markdown file in `entries`; first wins. */
  private indexMarkdown(
    dir: string,
    entries: Dirent[],
    locations: Map<string, string>,
  ): void {
    for (const entry of entries.toSorted((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isFile() && isMarkdown(entry.name)) {
        const slug = entry.name.slice(0, -MARKDOWN_EXTENSION.length);
        if (!locations.has(slug)) {
          locations.set(slug, join(dir, entry.name));
        }
      }
    }
  }
}

function isMarkdown(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(MARKDOWN_EXTENSION);
}

/** Split text into a de-duplicated set of lowercase alphanumeric terms. */
function tokenize(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
}

/** Sum, over each query term, how often it appears in the article. */
function scoreContent(content: string, terms: string[]): number {
  const counts = new Map<string, number>();
  for (const word of content.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  let score = 0;
  for (const term of terms) {
    score += counts.get(term) ?? 0;
  }
  return score;
}

/** First Markdown `# heading`, falling back to the file name. */
function extractTitle(content: string, path: string): string {
  for (const line of content.split(/\r?\n/)) {
    if (line.startsWith("# ")) {
      const title = line.slice(2).trim();
      if (title) {
        return title;
      }
    }
  }
  return basename(path).replace(/\.md$/i, "");
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
