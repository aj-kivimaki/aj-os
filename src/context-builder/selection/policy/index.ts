/**
 * Selection Policy — internal module surface.
 *
 * The decision-making model of knowledge selection, expressed as pure, stateless,
 * identity-preserving functions:
 *
 *   evaluation  — per-item eligibility predicate
 *   filtering   — retention predicate that partitions items
 *   ordering    — an ordered comparator chain terminating in an immutable identifier
 *   duplicates  — exact-duplicate identity + retain-first-in-order elimination
 *
 * This barrel is the aggregation point the Selection Engine imports to execute the
 * policy. It is deliberately not re-exported from `selection/index.ts` or the
 * top-level `context-builder/index.ts` — the comparators and predicates are
 * internal platform behaviour.
 */

export { evaluateKnowledgeItem } from "./evaluation.js";
export type { KnowledgeItemPredicate } from "./evaluation.js";

export { isRetainedKnowledgeItem } from "./filtering.js";

// Ordering — the comparator chain and its composed total-order comparator.
export {
  compareById,
  selectionComparatorChain,
  compareKnowledgeItems,
} from "./comparators.js";
export type { KnowledgeItemComparator } from "./comparators.js";

export { isExactDuplicate, partitionExactDuplicates } from "./duplicates.js";
export type {
  KnowledgeItemEquivalence,
  ExactDuplicatePartition,
} from "./duplicates.js";
