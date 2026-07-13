/**
 * Selection stage: apply the Selection Policy to a CollectionResult.
 *
 *   CollectionResult → selectKnowledge → SelectionResult
 *
 * Execution is pure application of policy — it embeds no evaluation, filtering,
 * ordering, or duplicate rule of its own. The policy owns every decision; this
 * function only sequences them:
 *
 *   1. filter   — partition items with `isRetainedKnowledgeItem`
 *   2. order    — sort retained items with `compareKnowledgeItems` (over a copy)
 *   3. dedupe   — remove exact duplicates with `partitionExactDuplicates`
 *   4. assemble — build the SelectionResult via `parseSelectionResult`
 *
 * Because the comparator chain terminates in an immutable identifier, ordering
 * never depends on collection order, timing, or randomness — identical inputs
 * always produce identical results. Selection is identity-preserving: it never
 * modifies, merges, or rewrites a KnowledgeItem, and filtered-out items and
 * eliminated duplicates are carried into `excludedItems` unchanged. `async` only to
 * keep both pipeline stages' signatures uniform; it performs no I/O.
 */

import type { KnowledgeItem } from "../providers/index.js";

import type { CollectionResult } from "../collection/result/index.js";

import {
  compareKnowledgeItems,
  isRetainedKnowledgeItem,
  partitionExactDuplicates,
} from "./policy/index.js";
import { parseSelectionResult } from "./result/index.js";
import type { SelectionResult } from "./result/index.js";

/**
 * Apply the Selection Policy to a CollectionResult and assemble a deterministic
 * SelectionResult.
 *
 * `selectedItems` is the retained, canonically ordered, deduplicated sequence —
 * this ordering *is* the public contract Assembly consumes as given.
 * `excludedItems` carries everything selection did not forward (filtered-out items
 * and eliminated duplicates), each preserved unchanged so a later explainability
 * stage can describe the decision without re-running selection. The excluded set
 * has no contractual ordering, but is sorted with the same comparator to keep the
 * output fully deterministic. `metadata` is the collection's provenance carried
 * forward unchanged.
 *
 * @param collectionResult - the immutable upstream CollectionResult (never modified)
 * @returns the immutable, deterministic SelectionResult
 */
export async function selectKnowledge(
  collectionResult: CollectionResult,
): Promise<SelectionResult> {
  // Filter: partition items with the policy's retention predicate. Today every
  // well-formed item is retained; the seam exists for the policy to decide, not
  // this engine.
  const retained: KnowledgeItem[] = [];
  const filteredOut: KnowledgeItem[] = [];
  for (const item of collectionResult.items) {
    if (isRetainedKnowledgeItem(item)) {
      retained.push(item);
    } else {
      filteredOut.push(item);
    }
  }

  // Copy before sorting: the CollectionResult's `items` array is frozen and
  // `Array.prototype.sort` orders in place.
  const ordered = [...retained].sort(compareKnowledgeItems);

  const { retained: selectedItems, duplicates } =
    partitionExactDuplicates(ordered);

  // Order the excluded set with the same comparator so the output is fully
  // deterministic, even though `excludedItems` has no contractual ordering.
  const excludedItems = [...filteredOut, ...duplicates].sort(
    compareKnowledgeItems,
  );

  return parseSelectionResult({
    metadata: collectionResult.metadata,
    selectedItems,
    excludedItems,
  });
}
