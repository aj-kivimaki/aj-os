/**
 * Selection Policy — deterministic filtering (CB-015).
 *
 * Filtering is the Selection Policy's **retention rule**: the deterministic
 * predicate the Selection Engine (CB-016) will apply to partition a
 * CollectionResult's KnowledgeItems into those that continue through the pipeline
 * (`selectedItems`) and those that do not (`excludedItems`). Where evaluation
 * judges a single item's eligibility, filtering is the policy statement of *what
 * retention means*: an item is retained iff it is eligible under
 * {@link evaluateKnowledgeItem}.
 *
 * Keeping filtering distinct from evaluation mirrors the responsibilities the
 * frozen Milestone M3 plan enumerates separately (evaluation vs filtering) and
 * gives the Selection Engine a single, named retention predicate to apply. At M3
 * evaluation admits every well-formed KnowledgeItem, so filtering excludes nothing
 * on eligibility grounds — the honest M3 state (Selection is profile-agnostic and
 * introduces no business-specific heuristic). Future Context Profiles (M5) refine
 * retention through this same predicate seam.
 *
 * Filtering is **deterministic** and **stateless** — a pure function of the item —
 * and **preserves knowledge identity**: it reads a KnowledgeItem and never
 * modifies it. It does not execute the Selection Engine, construct a
 * SelectionResult, eliminate duplicates (that policy is not yet defined by the
 * frozen plan and is deferred), communicate with providers, or expose any
 * priority/score/ranking value.
 */

import { evaluateKnowledgeItem } from "./evaluation.js";
import type { KnowledgeItemPredicate } from "./evaluation.js";

/**
 * The deterministic retention predicate of the Selection Policy: a KnowledgeItem
 * is retained iff it is eligible under {@link evaluateKnowledgeItem}. The
 * Selection Engine (CB-016) applies this predicate to partition collected
 * knowledge into selected and excluded items; an item that is **not** retained is
 * carried into `excludedItems` unchanged (never dropped, rewritten or merged).
 *
 * @param item - the immutable KnowledgeItem to test (never modified)
 * @returns `true` when the item is retained (selected), `false` when excluded
 */
export const isRetainedKnowledgeItem: KnowledgeItemPredicate = (item) =>
  evaluateKnowledgeItem(item);
