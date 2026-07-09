/**
 * Selection Policy — deterministic ordering via an ordered comparator chain (CB-015).
 *
 * Ordering is the Selection Policy's **public guarantee**: Selection produces a
 * canonical deterministic sequence of selected KnowledgeItems, and that order is
 * what Assembly (M4) consumes exactly as given. This module defines *how that order
 * is decided* — an **ordered comparator chain** — while keeping the comparator
 * implementation itself internal platform behaviour (PIPELINE-ARCHITECTURE
 * §Deterministic Ordering).
 *
 * The chain is an ordered list of deterministic comparators. To order two items the
 * chain applies each comparator in turn and takes the first non-zero result; the
 * chain **terminates with an immutable platform identifier** ({@link compareById},
 * over `KnowledgeItem.id`) so the composed comparator is a stable **total** order.
 * The policy introduces **no scoring algorithm, no numeric priority value and no
 * business-specific ranking heuristic** — it specifies a deterministic guarantee,
 * not a ranking heuristic, and exposes no priority/score/ranking value.
 *
 * At Milestone M3 the chain consists **solely of its mandated terminal comparator**.
 * Selection is profile-agnostic here, and no prioritization comparator is defined by
 * the frozen plan — inventing one would introduce a business heuristic the
 * architecture forbids. The chain is structured so future comparators (e.g. Context
 * Profile-driven ordering, M5) are **prepended** ahead of the terminal identifier
 * comparator without changing this structure, the ordering guarantee, or the
 * SelectionResult contract.
 *
 * Every comparator here is **pure, deterministic and identity-preserving**: it reads
 * two immutable KnowledgeItems and never modifies them. This module defines ordering
 * *policy* only — it does not execute the Selection Engine, sort any collection, or
 * construct a SelectionResult (that application is CB-016).
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
 * determinism. This is the stable tie-breaker that terminates the comparator chain
 * and guarantees a total ordering: it is the identifier's role as tie-breaker, not
 * as duplicate identity (see CB-015 note on exact-duplicate identity).
 */
export const compareById: KnowledgeItemComparator = (a, b) => {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

/**
 * The ordered Selection Policy comparator chain.
 *
 * Comparators are applied in array order; the first non-zero result determines the
 * ordering of a pair. The chain **terminates with** the immutable-identifier
 * comparator ({@link compareById}) so the composed order is a stable total order.
 *
 * At M3 the chain holds only its terminal comparator — no prioritization heuristic
 * is defined (and none may be invented). Future comparators are prepended ahead of
 * `compareById`; the array is frozen so the chain cannot be mutated at runtime.
 */
export const selectionComparatorChain: readonly KnowledgeItemComparator[] =
  Object.freeze([compareById]);

/**
 * Compose the ordered {@link selectionComparatorChain} into a single deterministic
 * comparator.
 *
 * Applies each comparator in chain order and returns the first non-zero result;
 * if every comparator ties, returns `0`. Because the chain terminates in the
 * immutable-identifier comparator, the composed comparator is a stable total order
 * over KnowledgeItems — the canonical deterministic ordering the Selection Engine
 * (CB-016) applies to produce `selectedItems`.
 *
 * @param a - the first immutable KnowledgeItem (never modified)
 * @param b - the second immutable KnowledgeItem (never modified)
 * @returns negative to order `a` first, positive to order `b` first, `0` if equal
 */
export const compareKnowledgeItems: KnowledgeItemComparator = (a, b) => {
  for (const comparator of selectionComparatorChain) {
    const result = comparator(a, b);
    if (result !== 0) return result;
  }
  return 0;
};
