import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  getWikiRoot,
  HandbookNotFoundError,
  resolveInWiki,
  toWikiRelative,
} from "./paths.js";
import type {
  HandbookListing,
  HandbookPage,
  SearchHit,
  SearchOptions,
} from "./types.js";

const DEFAULT_SEARCH_LIMIT = 30;

async function isNotFound(error: unknown): Promise<boolean> {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

/** Recursively collect wiki-relative paths of every `.md` file under `absDir`. */
async function collectMarkdown(absDir: string): Promise<string[]> {
  const entries = await readdir(absDir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const absChild = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectMarkdown(absChild)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(toWikiRelative(absChild));
    }
  }

  return results;
}

/** Read the wiki content catalog (`wiki/index.md`) — the designed entry point. */
export async function readIndex(): Promise<string> {
  const page = await readPage("index.md");
  return page.content;
}

/** List every `.md` page under the wiki, or under a wiki subdirectory. */
export async function listPages(subdir = ""): Promise<HandbookListing> {
  const absDir = subdir ? resolveInWiki(subdir) : getWikiRoot();

  let pages: string[];
  try {
    pages = await collectMarkdown(absDir);
  } catch (error) {
    if (await isNotFound(error)) {
      throw new HandbookNotFoundError(
        `Wiki subdirectory not found: ${subdir || "."}`,
      );
    }
    throw error;
  }

  pages.sort((a, b) => a.localeCompare(b));
  return { subdir, pages };
}

/** Read a single wiki page by its wiki-relative path. */
export async function readPage(relativePath: string): Promise<HandbookPage> {
  const normalized = relativePath.endsWith(".md")
    ? relativePath
    : `${relativePath}.md`;
  const absPath = resolveInWiki(normalized);

  let content: string;
  try {
    content = await readFile(absPath, "utf8");
  } catch (error) {
    if (await isNotFound(error)) {
      throw new HandbookNotFoundError(`Wiki page not found: ${normalized}`);
    }
    throw error;
  }

  return { path: toWikiRelative(absPath), content };
}

/**
 * Case-insensitive substring line scan across every wiki `.md` page.
 * Adequate for the ~115-file vault; returns at most `limit` hits.
 */
export async function searchHandbook(
  query: string,
  options: SearchOptions = {},
): Promise<readonly SearchHit[]> {
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT;
  const needle = query.toLowerCase().trim();
  if (!needle) {
    return [];
  }

  const { pages } = await listPages();
  const hits: SearchHit[] = [];

  for (const pagePath of pages) {
    const { content } = await readPage(pagePath);
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      if (line.toLowerCase().includes(needle)) {
        hits.push({ path: pagePath, line: i + 1, text: line.trim() });
        if (hits.length >= limit) {
          return hits;
        }
      }
    }
  }

  return hits;
}
