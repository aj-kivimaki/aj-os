/**
 * Selection Policy — deterministic evaluation.
 *
 * Evaluation is the per-item judgement at the heart of the policy: a pure predicate
 * deciding whether a single {@link KnowledgeItem} is eligible to continue through
 * the pipeline. Eligibility is deliberately narrow — an item is eligible iff it
 * carries knowledge (its `content` is non-empty). The policy states its own rule
 * rather than relying on the upstream schema, and introduces no profile, business
 * heuristic, or scoring. Future Context Profiles modulate eligibility through this
 * same predicate seam without changing the SelectionResult contract.
 */

import type { KnowledgeItem } from "../../providers/index.js";

/**
 * A deterministic, side-effect-free predicate over a single immutable
 * {@link KnowledgeItem}. Returns `true` when the item satisfies the predicate.
 *
 * A predicate never mutates its argument and never depends on runtime state, so
 * the same item always yields the same result.
 */
export type KnowledgeItemPredicate = (item: KnowledgeItem) => boolean;

/**
 * Deterministic eligibility evaluation: an item is eligible iff it carries
 * knowledge (its `content` is non-empty).
 *
 * @param item - the immutable KnowledgeItem to evaluate (never modified)
 * @returns `true` when the item is eligible to continue through the pipeline
 */
export const evaluateKnowledgeItem: KnowledgeItemPredicate = (item) =>
  item.content.length > 0;
