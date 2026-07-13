/**
 * Selection Policy — deterministic filtering.
 *
 * Filtering is the policy's retention rule: an item is retained iff it is eligible
 * under {@link evaluateKnowledgeItem}. It is kept distinct from evaluation so the
 * Selection Engine has a single named retention predicate to apply, and so future
 * Context Profiles can refine retention through this same seam without touching
 * evaluation.
 */

import { evaluateKnowledgeItem } from "./evaluation.js";
import type { KnowledgeItemPredicate } from "./evaluation.js";

/**
 * The retention predicate: a KnowledgeItem is retained iff it is eligible under
 * {@link evaluateKnowledgeItem}. A non-retained item is carried into `excludedItems`
 * unchanged — never dropped, rewritten, or merged.
 *
 * @param item - the immutable KnowledgeItem to test (never modified)
 * @returns `true` when the item is retained (selected), `false` when excluded
 */
export const isRetainedKnowledgeItem: KnowledgeItemPredicate = (item) =>
  evaluateKnowledgeItem(item);
