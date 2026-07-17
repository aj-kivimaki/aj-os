/**
 * Filesystem Review Store — the concrete {@link ReviewStore} (EOS-302, EOS-D6).
 *
 * A persistence-only adapter scoped to a configured destination directory. It writes the
 * per-session review layout and nothing else — no git, no interpretation of the artifacts:
 *
 *   <destination>/pending/<session-id>/
 *       candidates/<candidate-id>.json    one canonical CandidateKnowledge per file
 *       report.json                       the SessionReport for the run
 *       review-package.md                 the rendered ReviewPackage (EOS-D8)
 *       log.md                            append-only session log
 *
 * Guarantees (mirroring FilesystemWikiStore, specialized to the review layout):
 * - Persistence only: no version control, ever.
 * - Every write is path-guarded to the destination — lexically (no `..` / absolute paths /
 *   NUL), by requiring `sessionId` and each candidate `id` to be a single safe path
 *   segment, and against symlink escape.
 * - Construction (`locate`) validates the destination exists, is a directory, and is
 *   **non-canonical** (not, and not inside, `foundation/`, `library/`, or `wiki/`) — so a
 *   mis-set review path can never point the store at canonical knowledge (SPEC-003 §17).
 * - `saveCandidates` creates parent directories as needed; an empty list writes nothing.
 */
import { appendFile, mkdir, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { ReviewPackage } from "../contracts/review-package/index.js";
import type { SessionReport } from "../contracts/session-report/index.js";

import type { ReviewLocation, ReviewStore } from "./ReviewStore.js";

const PENDING_DIR = "pending";
const CANDIDATES_DIR = "candidates";
const REPORT_FILE = "report.json";
const REVIEW_PACKAGE_FILE = "review-package.md";
const LOG_FILE = "log.md";

/**
 * Canonical vault directories the review store must never write into. A defense-in-depth
 * guard against a mis-set review path (the real safeguard is the `knowledge-review`
 * default, EOS-D2/EOS-303); checked as exact path segments so a substring like `my-wiki`
 * does not trip it.
 */
const CANONICAL_DIRS = new Set(["foundation", "library", "wiki"]);

/** Raised on misconfiguration or a guarded-path violation. */
export class ReviewStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewStoreError";
  }
}

export interface FilesystemReviewStoreOptions {
  /** Directory the review area is persisted to (e.g. `<vault>/knowledge-review`). Must exist. */
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

/**
 * Require `value` to be a single safe path segment — non-empty, no NUL, no path
 * separator, and not `.`/`..` — so a `sessionId` or candidate `id` can never introduce a
 * subdirectory or escape the layout. `path.basename` collapses any separator, so a value
 * that is not equal to its own basename is not a single segment.
 */
function assertSegment(value: string, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ReviewStoreError(`${label} must be a non-empty string.`);
  }
  if (value.includes("\0")) {
    throw new ReviewStoreError(`${label} must not contain NUL bytes.`);
  }
  if (value === "." || value === ".." || path.basename(value) !== value) {
    throw new ReviewStoreError(`${label} must be a single path segment: ${value}`);
  }
  return value;
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

/**
 * Assert the nearest existing ancestor of `candidate` resolves inside `root`, defeating a
 * symlink that points out of the destination. Walks up until a path exists, then checks
 * containment; if it reaches the filesystem root without finding one, the lexical guard in
 * {@link createFilesystemReviewStore}'s `resolveInRoot` has already done its job.
 */
async function assertNoSymlinkEscape(root: string, candidate: string): Promise<void> {
  let current = candidate;
  for (;;) {
    const real = await realpathIfExists(current);
    if (real !== null) {
      if (!isInside(root, real)) {
        throw new ReviewStoreError(
          `Path escapes the review destination via a symlink: ${path.relative(root, candidate)}`,
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

export function createFilesystemReviewStore(
  options: FilesystemReviewStoreOptions,
): ReviewStore {
  const { destination } = options;
  let cachedRoot: string | undefined;

  /** Resolve, validate (exists, directory, non-canonical), and cache the root. */
  async function getRoot(): Promise<string> {
    if (cachedRoot !== undefined) {
      return cachedRoot;
    }
    const abs = path.resolve(destination);
    let real: string;
    try {
      real = await realpath(abs);
    } catch {
      throw new ReviewStoreError(
        `Review destination does not exist: ${destination} (${abs}).`,
      );
    }
    const info = await stat(real);
    if (!info.isDirectory()) {
      throw new ReviewStoreError(
        `Review destination is not a directory: ${destination} (${real}).`,
      );
    }
    // Guard the destination *itself* — its basename — against being a canonical
    // knowledge directory, catching a review path mis-set to `foundation`/`library`/
    // `wiki`. We deliberately do not scan the whole absolute path: an unrelated ancestor
    // named `wiki` (e.g. a vault under `~/wiki/`) is not canonical space and must not be
    // rejected. Nested mis-sets (`reviewPath` = `wiki/x`) are not detectable here without
    // the vault root and are prevented upstream by the `knowledge-review` default (EOS-303).
    if (CANONICAL_DIRS.has(path.basename(real))) {
      throw new ReviewStoreError(
        `Review destination is canonical knowledge space ` +
          `(foundation/, library/, wiki/): ${real}. Refusing to write candidates there.`,
      );
    }
    cachedRoot = real;
    return real;
  }

  /**
   * Resolve an absolute path from pre-validated `segments` under the root, then confirm
   * lexically and against symlink escape that it stays inside the destination.
   */
  async function resolveInRoot(segments: string[]): Promise<string> {
    const root = await getRoot();
    const candidate = path.resolve(root, ...segments);
    const rel = path.relative(root, candidate);
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new ReviewStoreError(
        `Path escapes the review destination: ${segments.join("/")}`,
      );
    }
    await assertNoSymlinkEscape(root, candidate);
    return candidate;
  }

  /** Absolute path to `pending/<sessionId>/<...rest>`, with `sessionId` validated. */
  async function sessionPath(sessionId: string, ...rest: string[]): Promise<string> {
    assertSegment(sessionId, "sessionId");
    return resolveInRoot([PENDING_DIR, sessionId, ...rest]);
  }

  async function locate(): Promise<ReviewLocation> {
    return { root: await getRoot() };
  }

  async function saveCandidates(
    sessionId: string,
    candidates: readonly CandidateKnowledge[],
  ): Promise<void> {
    for (const candidate of candidates) {
      const fileName = `${assertSegment(candidate.id, "candidate id")}.json`;
      const abs = await sessionPath(sessionId, CANDIDATES_DIR, fileName);
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
    }
  }

  async function saveReport(sessionId: string, report: SessionReport): Promise<void> {
    const abs = await sessionPath(sessionId, REPORT_FILE);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  async function saveReviewPackage(
    sessionId: string,
    reviewPackage: ReviewPackage,
  ): Promise<void> {
    const abs = await sessionPath(sessionId, REVIEW_PACKAGE_FILE);
    await mkdir(path.dirname(abs), { recursive: true });
    // Verbatim — and unlike the JSON artifacts, not even a trailing newline is added.
    // `markdown` is already the file's content: the package *is* a markdown projection
    // (EOS-D4), so serializing it is the identity, and anything else would be the store
    // editing what the projector rendered. The projector owns the projection.
    await writeFile(abs, reviewPackage.markdown, "utf8");
  }

  async function appendLog(sessionId: string, entry: string): Promise<void> {
    const abs = await sessionPath(sessionId, LOG_FILE);
    await mkdir(path.dirname(abs), { recursive: true });
    const line = entry.endsWith("\n") ? entry : `${entry}\n`;
    await appendFile(abs, line, "utf8");
  }

  return Object.freeze({
    locate,
    saveCandidates,
    saveReport,
    saveReviewPackage,
    appendLog,
  });
}
