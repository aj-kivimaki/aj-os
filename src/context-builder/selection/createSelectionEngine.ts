/**
 * Selection Engine public factory.
 *
 *   createSelectionEngine → immutable service handle
 *
 * The `select(collectionResult)` stage operation transforms a
 * {@link CollectionResult} into an immutable {@link SelectionResult} by applying
 * the deterministic Selection Policy. Unlike the Collection Engine — constructed
 * with the Provider Registry it later executes — the Selection Engine holds nothing
 * at construction: its only input arrives as the `select` argument, and its policy
 * is fixed platform behaviour it imports. It follows the same factory-created
 * service pattern as the other engines.
 */

import type { CollectionResult } from "../collection/result/index.js";

import { selectKnowledge } from "./selectKnowledge.js";
import type { SelectionResult } from "./result/index.js";

/**
 * Immutable platform service that performs deterministic knowledge selection. It
 * holds no state and never executes providers — it transforms an already collected
 * result into a selected one.
 */
export interface SelectionEngine {
  /**
   * Apply the Selection Policy to an immutable {@link CollectionResult} and return
   * an immutable {@link SelectionResult}.
   *
   * The policy filters the collected items, orders the retained ones into the
   * canonical sequence, and eliminates exact duplicates. Ordering of
   * `selectedItems` is the public guarantee; the engine holds no mutable state, so
   * `select` is a pure function of its input.
   */
  select(collectionResult: CollectionResult): Promise<SelectionResult>;
}

/**
 * Create an immutable, stateless Selection Engine. The factory takes no arguments;
 * `select` delegates to {@link selectKnowledge}.
 */
export function createSelectionEngine(): SelectionEngine {
  return Object.freeze({
    select(collectionResult: CollectionResult): Promise<SelectionResult> {
      return selectKnowledge(collectionResult);
    },
  });
}
