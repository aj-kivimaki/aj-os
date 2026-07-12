/**
 * Identity Resolution contract — ADR-005.
 *
 * The stage between extraction and rendering: it maps each candidate
 * entity/concept to a **canonical identity** — an existing page or a
 * genuinely new one — so rendering can use canonical paths and links by
 * construction (no post-hoc repair).
 *
 * Policy (ADR-004 §9, ADR-005): a false split is acceptable (a benign
 * duplicate LINT can flag); a false merge corrupts accumulated knowledge.
 * So uncertain resolutions bias to **new**.
 */

export type PageKind = "entity" | "concept";

/** A newly-extracted item awaiting identity resolution. */
export interface Candidate {
  readonly name: string;
  readonly kind: PageKind;
  readonly description: string;
}

/** An existing wiki page the resolver may match a candidate to. */
export interface ExistingPage {
  /** Canonical wiki path, e.g. `entities/game-audio.md`. */
  readonly path: string;
  readonly kind: PageKind;
  readonly title: string;
  readonly description: string;
}

/**
 * The resolver's decision for one candidate. `confidence` is in [0, 1]; an
 * `existing` result below the resolver's threshold is never returned (it
 * degrades to `new`).
 */
export type Resolution =
  | { readonly kind: "existing"; readonly targetPath: string; readonly confidence: number }
  | { readonly kind: "new"; readonly confidence: number };

/**
 * Resolves a candidate against the current wiki. Implementations range from
 * a deterministic slug matcher to an LLM-backed semantic matcher (behind
 * this port); both obey the false-split-over-false-merge bias.
 */
export interface IdentityResolver {
  resolve(
    candidate: Candidate,
    existing: readonly ExistingPage[],
  ): Promise<Resolution>;
}
