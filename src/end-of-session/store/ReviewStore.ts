/**
 * Review Store contract — the SPEC-003 → SPEC-004 **filesystem boundary**.
 *
 * A persistence-only adapter that writes a finished session's canonical
 * `CandidateKnowledge[]`, its `SessionReport`, and its rendered `ReviewPackage` to the
 * non-canonical review area (`<destination>/pending/<session-id>/`), plus an append-only
 * session log. It is **domain-aware** (EOS-D6): its operations are named for the SPEC-003
 * artifacts and it owns the per-session layout and serialization — but "domain-aware" means
 * it knows the *artifacts and layout*, not that it reasons about the knowledge.
 *
 * The store owns **every** file in the session directory (EOS-D8) — or it would own none of
 * them: a writer that composed its own path would duplicate the layout and skip the guards
 * below. Callers name a session and hand over contracts; they never compose paths or
 * serialize.
 *
 * Invariants (the frozen Persistence Invariant):
 * - **Persistence only** — the store never performs version control (ADR-002 §4,
 *   AJS-005 §7); committing the review area, if ever wanted, is orchestration's concern.
 * - **Write-only inside a non-canonical destination** — every path is guarded (lexical +
 *   symlink escape, plus single-segment session/candidate ids), and construction fails if
 *   the destination is, or is inside, canonical space (`foundation/`, `library/`, `wiki/`).
 * - **No interpretation** — it serializes the contracts and appends log lines; it does
 *   not deduplicate, compare against the Handbook, or understand review semantics. It
 *   contains no workflow, review, or SPEC-004 logic.
 * - **Deterministic layout** — the same `sessionId` + artifacts produce the same file tree
 *   (candidate files named by their stable `id`).
 */

import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { ReviewPackage } from "../contracts/review-package/index.js";
import type { SessionReport } from "../contracts/session-report/index.js";

/** A validated handle to the review destination. */
export interface ReviewLocation {
  /** Resolved (realpath) absolute root of the review destination. */
  readonly root: string;
}

/**
 * Persists the review artifacts for a session by session id. All writes are confined to
 * `<destination>/pending/<sessionId>/`; a `sessionId` (or candidate `id`) that is not a
 * single safe path segment, or that would escape the destination, is rejected.
 */
export interface ReviewStore {
  /**
   * Resolve and validate the destination, returning a location handle. Requires the
   * destination to exist, be a directory, and be non-canonical.
   */
  locate(): Promise<ReviewLocation>;

  /**
   * Persist each candidate as canonical JSON at
   * `pending/<sessionId>/candidates/<candidate-id>.json` — one file per candidate. An
   * empty list writes nothing (and creates no `candidates/` directory).
   */
  saveCandidates(
    sessionId: string,
    candidates: readonly CandidateKnowledge[],
  ): Promise<void>;

  /** Persist the session's execution log at `pending/<sessionId>/report.json`. */
  saveReport(sessionId: string, report: SessionReport): Promise<void>;

  /**
   * Persist the session's rendered review package at
   * `pending/<sessionId>/review-package.md` (EOS-D8). Overwrites: the package is
   * single-valued per session and regenerable from the canonical candidates (EOS-D4),
   * unlike the append-only `log.md`.
   *
   * Writes `reviewPackage.markdown` **verbatim**. Markdown rather than JSON because the
   * store knows its *artifacts*, and a `ReviewPackage` **is** a markdown projection by
   * contract — serializing it as JSON would produce a file no human could read, defeating
   * the artifact's only purpose. The store does not render, re-render, validate, or
   * reconcile the package against the candidates: the projector already produced and
   * validated it, and consistency is guaranteed by construction because the package is
   * derived from the candidates each run.
   */
  saveReviewPackage(sessionId: string, reviewPackage: ReviewPackage): Promise<void>;

  /**
   * Append a line to the session's `pending/<sessionId>/log.md`. Intentionally minimal —
   * a convenience over read-modify-write; it carries no version-control semantics.
   */
  appendLog(sessionId: string, entry: string): Promise<void>;
}
