/**
 * Selection execution — deterministic knowledge selection (CB-016).
 *
 * This is the first *runtime behaviour* of the Selection Engine (CB-013). It
 * applies the deterministic Selection Policy (CB-015) to a single immutable
 * {@link CollectionResult} (CB-009) and assembles the outcome into an immutable
 * {@link SelectionResult} (CB-014):
 *
 *   CollectionResult → selectKnowledge → SelectionResult
 *
 * Execution is pure **application of policy**: it embeds no evaluation, filtering,
 * ordering or duplicate rule of its own. The Selection Policy owns every decision;
 * this function only *sequences* those decisions and constructs the contract:
 *
 *   1. filter   — partition items with `isRetainedKnowledgeItem` (retain vs exclude)
 *   2. order    — sort the retained items into canonical order with
 *                 `compareKnowledgeItems` (over a copy — the input is never mutated)
 *   3. dedupe   — eliminate exact duplicates in canonical order with
 *                 `partitionExactDuplicates` (retain the first occurrence; route
 *                 every subsequent duplicate to `excludedItems`)
 *   4. assemble — construct the SelectionResult via `parseSelectionResult` (CB-014)
 *
 * Execution is **deterministic**: identical CollectionResults always produce
 * identical SelectionResults, including the canonical order of `selectedItems`. The
 * Selection Policy's comparator chain terminates in an immutable identifier, so
 * ordering never depends on collection order, timing, randomness or external state.
 *
 * Execution is **stateless** and **identity-preserving**: it holds no runtime
 * state, never communicates with providers or external services, and never
 * modifies, merges, summarizes or rewrites a KnowledgeItem. Filtered-out items and
 * eliminated duplicates are carried into `excludedItems` **unchanged**. The
 * function reads only the public CB-009 contract of its adjacent upstream stage and
 * produces only the public CB-014 contract of its adjacent downstream stage — it
 * does not construct Context Packages or expose any priority/score/ranking value.
 *
 * The function is `async` to mirror the Collection Engine's `collect` stage
 * operation (CB-010) and the frozen anticipated usage `await engine.select(...)`
 * (CB-013), keeping both pipeline stage operations uniform for the CB-017
 * `build(request)` composition. Selection performs no I/O; the returned promise
 * resolves synchronously with the computed SelectionResult.
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
 * Apply the deterministic Selection Policy to a CollectionResult and assemble an
 * immutable, deterministic SelectionResult.
 *
 * Items are partitioned by the policy's retention predicate; the retained items are
 * ordered by the policy's canonical comparator chain (over a **copy** — the frozen
 * CollectionResult array is never mutated); exact duplicates are then eliminated in
 * that canonical order, the first occurrence surviving and every subsequent
 * duplicate joining the excluded set. `selectedItems` is the deduplicated canonical
 * sequence — the ordering *is* the public contract Assembly (M4) consumes as given.
 *
 * `excludedItems` carries every KnowledgeItem selection did not forward — those
 * removed by filtering and those removed as exact duplicates — each preserved
 * unchanged so a later stage (explainability, M5) can describe the decision without
 * re-running selection. The excluded set has no contractual ordering guarantee, so
 * the engine orders it with the same policy comparator purely to keep the output
 * fully deterministic; it reuses `compareKnowledgeItems` and introduces no new
 * comparator.
 *
 * The result is built through `parseSelectionResult` (CB-014), so it is validated
 * and deeply frozen — immutability and contract-conformance come for free and the
 * output cannot drift from the contract. `metadata` is the collection's provenance
 * carried forward unchanged (the request the selection answered).
 *
 * @param collectionResult - the immutable upstream CollectionResult (never modified)
 * @returns the immutable, deterministic SelectionResult
 */
export async function selectKnowledge(
  collectionResult: CollectionResult,
): Promise<SelectionResult> {
  // 1. Filter: partition items with the policy's retention predicate. Retained
  //    items keep their collection order here; excluded-by-filtering items are held
  //    aside. (At M3 every well-formed item is eligible, so nothing is filtered out;
  //    the seam exists for the policy, not for this engine to decide.)
  const retained: KnowledgeItem[] = [];
  const filteredOut: KnowledgeItem[] = [];
  for (const item of collectionResult.items) {
    if (isRetainedKnowledgeItem(item)) {
      retained.push(item);
    } else {
      filteredOut.push(item);
    }
  }

  // 2. Order the retained items into canonical order. Copy first — the
  //    CollectionResult's `items` array is frozen and must never be mutated, and
  //    `Array.prototype.sort` orders in place.
  const ordered = [...retained].sort(compareKnowledgeItems);

  // 3. Eliminate exact duplicates in canonical order: the first occurrence of each
  //    identity survives; every subsequent duplicate is routed to `excludedItems`.
  const { retained: selectedItems, duplicates } =
    partitionExactDuplicates(ordered);

  // 4. Assemble the excluded set — filtered-out items plus eliminated duplicates —
  //    in canonical order so the output is fully deterministic. `excludedItems` has
  //    no contractual ordering guarantee; ordering it with the policy's own
  //    comparator reuses existing policy rather than introducing new logic.
  const excludedItems = [...filteredOut, ...duplicates].sort(
    compareKnowledgeItems,
  );

  return parseSelectionResult({
    metadata: collectionResult.metadata,
    selectedItems,
    excludedItems,
  });
}
