/**
 * Selection Policy — exact-duplicate elimination (CB-015).
 *
 * This module defines *when* two {@link KnowledgeItem}s are **exact duplicates** and
 * the deterministic rule for removing the redundant ones. It is pure decision
 * policy: the Selection Engine (CB-016) *applies* it to an already-ordered sequence
 * and routes the removed items into a SelectionResult's `excludedItems`.
 *
 * ## Exact Duplicate Definition (approved 2026-07-09)
 *
 * Two KnowledgeItems are exact duplicates **if and only if**:
 *
 *   - their `content` values are identical, **and**
 *   - their entire `source` objects (`id`, `type`, `title`, `locator`) are
 *     structurally identical.
 *
 * `KnowledgeItem.id` is **explicitly excluded** from duplicate identity — it exists
 * solely as the immutable deterministic ordering tie-breaker
 * ({@link compareById}) and must never participate in duplicate identity. **No
 * normalization or transformation is applied**: "exact" means literal structural
 * equality. When duplicates are eliminated, the **first occurrence in canonical
 * Selection Policy order is retained** and every subsequent duplicate is moved to
 * `excludedItems`.
 *
 * The comparison is deliberately field-by-field structural equality (never a
 * serialized/hashed key), so no delimiter or encoding choice can merge two distinct
 * items. This module is **stateless** and **preserves knowledge identity**: it reads
 * KnowledgeItems and never modifies, merges or summarizes them (elimination removes
 * a redundant copy; it never rewrites a survivor). It does not execute the Selection
 * Engine, construct a SelectionResult, or expose any priority/score/ranking value.
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
 * Exact-duplicate identity: `true` iff `a` and `b` are exact duplicates under the
 * approved definition — identical `content` and structurally identical `source`
 * (`id`, `type`, `title`, `locator`). `KnowledgeItem.id` is **excluded**. Equality
 * is literal, with no normalization; optional `locator` compares equal when both
 * are `undefined`.
 *
 * @param a - the first immutable KnowledgeItem (never modified)
 * @param b - the second immutable KnowledgeItem (never modified)
 * @returns `true` when `a` and `b` are exact duplicates
 */
export const isExactDuplicate: KnowledgeItemEquivalence = (a, b) =>
  a.content === b.content &&
  a.source.id === b.source.id &&
  a.source.type === b.source.type &&
  a.source.title === b.source.title &&
  a.source.locator === b.source.locator;

/**
 * Partition an ordered sequence of KnowledgeItems into retained items and exact
 * duplicates, applying the approved exact-duplicate policy.
 *
 * Walks `items` in the given order (expected to be the canonical Selection Policy
 * order) and retains the **first** occurrence of each exact-duplicate identity;
 * every subsequent exact duplicate is collected into `duplicates` (destined for
 * `excludedItems`). Comparison uses {@link isExactDuplicate}, so `KnowledgeItem.id`
 * never participates in duplicate identity. The function is pure and deterministic:
 * the same ordered input always yields the same partition, and every item is
 * returned unchanged.
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
