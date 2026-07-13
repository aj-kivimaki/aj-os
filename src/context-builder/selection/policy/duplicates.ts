/**
 * Selection Policy — exact-duplicate elimination.
 *
 * Two {@link KnowledgeItem}s are exact duplicates if and only if their `content`
 * values are identical and their entire `source` objects (`id`, `type`, `title`,
 * `locator`) are structurally identical. `KnowledgeItem.id` is excluded from
 * duplicate identity — it exists solely as the ordering tie-breaker
 * ({@link compareById}). "Exact" means literal structural equality with no
 * normalization; the first occurrence in canonical order is retained and every
 * subsequent duplicate is moved to `excludedItems`.
 *
 * The comparison is deliberately field-by-field (never a serialized/hashed key), so
 * no delimiter or encoding choice can merge two distinct items. Elimination removes
 * a redundant copy; it never rewrites a survivor.
 */

import type { KnowledgeItem } from "../../providers/index.js";

/**
 * A deterministic equivalence predicate over two immutable {@link KnowledgeItem}s.
 * Returns `true` when the two items are considered the same under the relation. A
 * predicate never mutates its arguments and never depends on runtime state.
 */
export type KnowledgeItemEquivalence = (a: KnowledgeItem, b: KnowledgeItem) => boolean;

/**
 * The immutable partition produced by {@link partitionExactDuplicates}: the items
 * retained (first occurrence of each identity, in the input order) and the exact
 * duplicates removed (every subsequent occurrence, in the input order). Both arrays
 * hold the original KnowledgeItems unchanged.
 */
export interface ExactDuplicatePartition {
  /** First occurrence of each duplicate identity, preserved in input order. */
  readonly retained: readonly KnowledgeItem[];
  /** Subsequent exact duplicates, destined for `excludedItems`, in input order. */
  readonly duplicates: readonly KnowledgeItem[];
}

/**
 * Exact-duplicate identity: `true` iff `a` and `b` have identical `content` and
 * structurally identical `source` (`id`, `type`, `title`, `locator`).
 * `KnowledgeItem.id` is excluded; optional `locator` compares equal when both are
 * `undefined`.
 */
export const isExactDuplicate: KnowledgeItemEquivalence = (a, b) =>
  a.content === b.content &&
  a.source.id === b.source.id &&
  a.source.type === b.source.type &&
  a.source.title === b.source.title &&
  a.source.locator === b.source.locator;

/**
 * Partition an ordered sequence of KnowledgeItems into retained items and exact
 * duplicates. Walks `items` in canonical order, retaining the first occurrence of
 * each identity and collecting every subsequent exact duplicate. Pure and
 * deterministic; every item is returned unchanged.
 *
 * @param items - KnowledgeItems in canonical order (never modified)
 * @returns the `{ retained, duplicates }` partition
 */
export function partitionExactDuplicates(
  items: readonly KnowledgeItem[],
): ExactDuplicatePartition {
  const retained: KnowledgeItem[] = [];
  const duplicates: KnowledgeItem[] = [];

  for (const item of items) {
    if (retained.some((kept) => isExactDuplicate(kept, item))) {
      duplicates.push(item);
    } else {
      retained.push(item);
    }
  }

  return { retained, duplicates };
}
