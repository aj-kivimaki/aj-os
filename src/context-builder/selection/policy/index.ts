/**
 * Selection Policy — internal module surface (CB-015).
 *
 * The Selection Policy is the deterministic decision-making model of knowledge
 * selection, expressed as pure, stateless, identity-preserving functions:
 *
 *   evaluation  — per-item eligibility predicate (evaluateKnowledgeItem)
 *   filtering   — retention predicate that partitions items (isRetainedKnowledgeItem)
 *   ordering    — an ordered comparator chain terminating in an immutable
 *                 identifier (selectionComparatorChain / compareKnowledgeItems)
 *   duplicates  — exact-duplicate identity + retain-first-in-order elimination
 *                 (isExactDuplicate / partitionExactDuplicates)
 *
 * Ordering is the **public guarantee** (exposed later through the ordered
 * `SelectionResult.selectedItems`); the comparators and predicates themselves are
 * **internal platform behaviour**. This barrel is therefore the aggregation point
 * the Selection Engine (CB-016) imports to *execute* the policy — it is
 * deliberately **not** re-exported from `selection/index.ts` or the top-level
 * `context-builder/index.ts` (mirroring how the CB-010 `collectKnowledge` behaviour
 * stays internal to the module).
 *
 * The policy does not execute the Selection Engine, construct a SelectionResult,
 * communicate with providers, modify KnowledgeItems, or expose any priority/score/
 * ranking value. Exact-duplicate elimination uses the platform definition approved
 * on 2026-07-09 (identical `content` + structurally identical `source`;
 * `KnowledgeItem.id` excluded; first occurrence in canonical order retained) — see
 * the CB-015 task's **Exact Duplicate Definition**.
 */

// Evaluation — deterministic per-item eligibility predicate.
export { evaluateKnowledgeItem } from "./evaluation.js";
export type { KnowledgeItemPredicate } from "./evaluation.js";

// Filtering — deterministic retention predicate used to partition items.
export { isRetainedKnowledgeItem } from "./filtering.js";

// Ordering — the ordered comparator chain and its composed total-order comparator.
export {
  compareById,
  selectionComparatorChain,
  compareKnowledgeItems,
} from "./comparators.js";
export type { KnowledgeItemComparator } from "./comparators.js";

// Duplicates — exact-duplicate identity and retain-first-in-order elimination.
export { isExactDuplicate, partitionExactDuplicates } from "./duplicates.js";
export type {
  KnowledgeItemEquivalence,
  ExactDuplicatePartition,
} from "./duplicates.js";
