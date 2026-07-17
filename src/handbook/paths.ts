import { realpathSync, statSync } from "node:fs";
import path from "node:path";

import { env } from "../config/appEnv.js";

/** Thrown when a requested path would escape its allowed subtree. */
export class PathEscapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathEscapeError";
  }
}

/** Thrown when a handbook file or directory does not exist. */
export class HandbookNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HandbookNotFoundError";
  }
}

/** The two subtrees the agent is allowed to touch, relative to the vault root. */
const WIKI_SUBDIR = "wiki";
const INBOX_SUBDIR = path.join("workspace", "inbox");

let cachedVaultRoot: string | undefined;

/**
 * Resolve, validate, and cache the handbook vault root.
 * Realpath'd so downstream symlink checks compare against a canonical base.
 */
export function getVaultRoot(): string {
  if (cachedVaultRoot) {
    return cachedVaultRoot;
  }

  if (!env.HANDBOOK_PATH) {
    throw new Error("HANDBOOK_PATH is not configured");
  }

  let resolved: string;
  try {
    resolved = realpathSync(env.HANDBOOK_PATH);
  } catch {
    throw new HandbookNotFoundError(
      `Handbook vault not found at HANDBOOK_PATH: ${env.HANDBOOK_PATH}`,
    );
  }

  if (!statSync(resolved).isDirectory()) {
    throw new Error(`HANDBOOK_PATH is not a directory: ${resolved}`);
  }

  cachedVaultRoot = resolved;
  return resolved;
}

/**
 * Resolve a relative path under `base`, rejecting anything that escapes it.
 *
 * Rejects absolute paths, `..` segments, and NUL bytes up front, then confirms
 * the resolved path stays within `base` using `path.sep` (so a sibling like
 * `<base>-evil` cannot masquerade as being inside `<base>`).
 */
function resolveInside(base: string, relativePath: string): string {
  if (relativePath.includes("\0")) {
    throw new PathEscapeError("Path must not contain NUL bytes");
  }
  if (path.isAbsolute(relativePath)) {
    throw new PathEscapeError(`Path must be relative: ${relativePath}`);
  }

  const normalized = path.normalize(relativePath);
  if (normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw new PathEscapeError(`Path escapes the allowed directory: ${relativePath}`);
  }

  const resolved = path.resolve(base, normalized);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new PathEscapeError(`Path escapes the allowed directory: ${relativePath}`);
  }

  return resolved;
}

/** Absolute path to the wiki root (`<vault>/wiki`). */
export function getWikiRoot(): string {
  return path.join(getVaultRoot(), WIKI_SUBDIR);
}

/** Absolute path to the inbox root (`<vault>/workspace/inbox`). */
export function getInboxRoot(): string {
  return path.join(getVaultRoot(), INBOX_SUBDIR);
}

/**
 * Resolve a wiki-relative path for reading, scoped to `<vault>/wiki`.
 * Re-checks the realpath to defeat symlink escapes; missing files are allowed
 * through so callers can surface a clean {@link HandbookNotFoundError}.
 */
export function resolveInWiki(relativePath: string): string {
  const wikiRoot = getWikiRoot();
  const resolved = resolveInside(wikiRoot, relativePath);

  let real: string;
  try {
    real = realpathSync(resolved);
  } catch {
    return resolved; // does not exist yet; reader will report not-found
  }

  if (real !== wikiRoot && !real.startsWith(wikiRoot + path.sep)) {
    throw new PathEscapeError(
      `Path resolves outside the wiki via symlink: ${relativePath}`,
    );
  }

  return real;
}

/** Resolve an inbox-relative path for writing, scoped to `<vault>/workspace/inbox`. */
export function resolveInInbox(relativePath: string): string {
  return resolveInside(getInboxRoot(), relativePath);
}

/** Format an absolute vault path as a vault-relative path for API responses. */
export function toVaultRelative(absolutePath: string): string {
  return path.relative(getVaultRoot(), absolutePath);
}

/** Format an absolute wiki path as a wiki-relative path. */
export function toWikiRelative(absolutePath: string): string {
  return path.relative(getWikiRoot(), absolutePath);
}
