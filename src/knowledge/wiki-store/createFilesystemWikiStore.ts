/**
 * Filesystem Wiki Store.
 *
 * A persistence-only, generic path-keyed Markdown blob store scoped to a configured
 * destination directory. It knows nothing about wiki semantics (pages, frontmatter,
 * the index) and nothing about version control — it only reads and writes entries
 * by wiki-relative path.
 *
 * Contract guarantees:
 * - Persistence only: no git, no `commit`.
 * - Every operation is path-guarded to the destination — both lexically (no `..` /
 *   absolute paths) and against symlink escape.
 * - `write` creates parent directories as needed; `delete` is idempotent.
 * - `locate` resolves the destination to its canonical (realpath) root and requires
 *   it to exist and be a directory.
 */
import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { WikiLocation, WikiStore } from "./WikiStore.js";

const LOG_FILE = "log.md";

/** Raised on misconfiguration or a guarded-path violation. */
export class WikiStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WikiStoreError";
  }
}

export interface FilesystemWikiStoreOptions {
  /** Directory the wiki is persisted to (e.g. `handbook/wiki`). Must exist. */
  readonly destination: string;
}

function isErrno(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

/** Realpath `p`, returning `null` when it does not exist (any other error propagates). */
async function realpathIfExists(p: string): Promise<string | null> {
  try {
    return await realpath(p);
  } catch (error) {
    if (isErrno(error, "ENOENT")) {
      return null;
    }
    throw error;
  }
}

/** True when `real` is `root` itself or nested within it. */
function isInside(root: string, real: string): boolean {
  const rel = path.relative(root, real);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/** Recursively collect absolute file paths, skipping dotfiles and symlinks. */
async function collectFiles(absDir: string): Promise<string[]> {
  const entries = await readdir(absDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const abs = path.join(absDir, entry.name);
    // Only real dirs/files: symlinks are neither isDirectory() nor isFile()
    // here, so they are skipped — list never follows a link out of root.
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(abs)));
    } else if (entry.isFile()) {
      files.push(abs);
    }
  }

  return files;
}

export function createFilesystemWikiStore(
  options: FilesystemWikiStoreOptions,
): WikiStore {
  const { destination } = options;
  let cachedRoot: string | undefined;

  /** Resolve, validate, and cache the canonical destination root. */
  async function getRoot(): Promise<string> {
    if (cachedRoot !== undefined) {
      return cachedRoot;
    }
    const abs = path.resolve(destination);
    let real: string;
    try {
      real = await realpath(abs);
    } catch {
      throw new WikiStoreError(
        `Wiki destination does not exist: ${destination} (${abs}).`,
      );
    }
    const info = await stat(real);
    if (!info.isDirectory()) {
      throw new WikiStoreError(
        `Wiki destination is not a directory: ${destination} (${real}).`,
      );
    }
    cachedRoot = real;
    return real;
  }

  /**
   * Assert the nearest existing ancestor of `candidate` resolves inside `root`, defeating a
   * symlink that points out of the destination. Walks up until a path exists, then checks
   * containment; if it reaches the filesystem root without finding one, the lexical guard has
   * already done its job. Uses `realpathIfExists` so the escape error is thrown outside any
   * catch — the store's own error can never be swallowed by the loop (REX-401, F-050).
   */
  async function assertNoSymlinkEscape(root: string, candidate: string): Promise<void> {
    let current = candidate;
    for (;;) {
      const real = await realpathIfExists(current);
      if (real !== null) {
        if (!isInside(root, real)) {
          throw new WikiStoreError(
            `Path escapes the wiki destination via a symlink: ${path.relative(root, candidate)}`,
          );
        }
        return;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        return; // reached filesystem root; lexical guard already applied
      }
      current = parent;
    }
  }

  /** Guard a wiki-relative path and return its absolute location within root. */
  async function resolveInRoot(relPath: string): Promise<string> {
    if (typeof relPath !== "string" || relPath.length === 0) {
      throw new WikiStoreError("Path must be a non-empty string.");
    }
    if (relPath.includes("\0")) {
      throw new WikiStoreError("Path must not contain null bytes.");
    }
    const root = await getRoot();
    const candidate = path.resolve(root, relPath);
    const rel = path.relative(root, candidate);
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new WikiStoreError(`Path escapes the wiki destination: ${relPath}`);
    }
    await assertNoSymlinkEscape(root, candidate);
    return candidate;
  }

  function toPosixRelative(root: string, abs: string): string {
    return path.relative(root, abs).split(path.sep).join("/");
  }

  async function locate(): Promise<WikiLocation> {
    return { root: await getRoot() };
  }

  async function read(relPath: string): Promise<string | null> {
    const abs = await resolveInRoot(relPath);
    try {
      return await readFile(abs, "utf8");
    } catch (error) {
      if (isErrno(error, "ENOENT")) {
        return null;
      }
      throw error;
    }
  }

  async function list(prefix?: string): Promise<string[]> {
    const root = await getRoot();
    const files = await collectFiles(root);
    let relative = files.map((abs) => toPosixRelative(root, abs));

    if (prefix !== undefined && prefix !== "") {
      if (prefix.includes("..")) {
        throw new WikiStoreError(`Invalid list prefix: ${prefix}`);
      }
      const normalized = prefix.replace(/\/+$/, "");
      relative = relative.filter(
        (entry) => entry === normalized || entry.startsWith(`${normalized}/`),
      );
    }

    return relative.sort((a, b) => a.localeCompare(b));
  }

  async function write(relPath: string, content: string): Promise<void> {
    const abs = await resolveInRoot(relPath);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf8");
  }

  async function remove(relPath: string): Promise<void> {
    const abs = await resolveInRoot(relPath);
    try {
      await unlink(abs);
    } catch (error) {
      if (isErrno(error, "ENOENT")) {
        return; // idempotent: deleting a missing entry is a no-op
      }
      throw error;
    }
  }

  async function removeTree(relPath: string): Promise<void> {
    // resolveInRoot rejects the root itself, `..` escapes and symlink escapes,
    // so recursion can never reach outside the destination.
    const abs = await resolveInRoot(relPath);
    await rm(abs, { recursive: true, force: true }); // idempotent on missing
  }

  async function appendLog(entry: string): Promise<void> {
    const abs = await resolveInRoot(LOG_FILE);
    const line = entry.endsWith("\n") ? entry : `${entry}\n`;
    await appendFile(abs, line, "utf8");
  }

  return { locate, read, list, write, delete: remove, removeTree, appendLog };
}
