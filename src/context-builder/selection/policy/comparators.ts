/**
 * Selection Policy — deterministic ordering via an ordered comparator chain.
 *
 * Ordering is the policy's public guarantee: Selection produces a canonical
 * sequence of selected KnowledgeItems that Assembly consumes exactly as given. The
 * chain applies each comparator in turn, taking the first non-zero result, and
 * terminates with an immutable-identifier comparator ({@link compareById}) so the
 * composed comparator is a stable total order. The policy introduces no scoring,
 * priority, or ranking heuristic.
 *
 * The chain currently holds only its terminal comparator. It is structured so
 * future comparators (e.g. profile-driven ordering) are prepended ahead of
 * `compareById` without changing the ordering guarantee or the SelectionResult
 * contract.
 */

import type { KnowledgeItem } from "../../providers/index.js";

/**
 * A deterministic comparator over two immutable {@link KnowledgeItem}s, following
 * the standard `Array.prototype.sort` contract: a negative number orders `a`
 * before `b`, a positive number orders `b` before `a`, and `0` leaves them
 * unordered relative to each other (to be resolved by a later comparator in the
 * chain).
 *
 * A comparator never mutates its arguments and never depends on runtime state, so
 * the same pair always yields the same result.
 */
export type KnowledgeItemComparator = (a: KnowledgeItem, b: KnowledgeItem) => number;

/**
 * Terminal comparator: orders by the immutable platform identifier
 * `KnowledgeItem.id`.
 *
 * `id` is compared by UTF-16 code unit (via `<` / `>`), **not** `localeCompare`,
 * because locale-aware collation is environment-dependent and would break
 * determinism. This is the stable tie-breaker that terminates the chain and
 * guarantees a total ordering — the identifier's role here is as tie-breaker, not
 * as duplicate identity.
 */
export const compareById: KnowledgeItemComparator = (a, b) => {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

/**
 * The ordered Selection Policy comparator chain. Frozen so it cannot be mutated at
 * runtime; future comparators are prepended ahead of the terminal {@link compareById}.
 */
export const selectionComparatorChain: readonly KnowledgeItemComparator[] =
  Object.freeze([compareById]);

/**
 * Compose {@link selectionComparatorChain} into a single comparator: apply each in
 * order and return the first non-zero result, or `0` if all tie. The result is a
 * stable total order — the canonical ordering used to produce `selectedItems`.
 *
 * @returns negative to order `a` first, positive to order `b` first, `0` if equal
 */
export const compareKnowledgeItems: KnowledgeItemComparator = (a, b) => {
  for (const comparator of selectionComparatorChain) {
    const result = comparator(a, b);
    if (result !== 0) return result;
  }
  return 0;
};
