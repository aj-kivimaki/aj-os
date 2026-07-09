/**
 * Selection Engine public factory (CB-013, extended by CB-016).
 *
 * The Selection Engine is the platform **service** responsible for deterministic
 * knowledge selection. CB-013 established only its public service boundary:
 *
 *   createSelectionEngine → immutable service handle
 *
 * CB-016 adds the first selection *behaviour* to this same boundary: the
 * `select(collectionResult)` stage operation transforms a {@link CollectionResult}
 * (CB-009) into an immutable {@link SelectionResult} (CB-014) by applying the
 * deterministic Selection Policy (CB-015). This extends — but does not change — the
 * boundary established by CB-013, mirroring how the Collection Engine boundary
 * (CB-007) gained `collect` (CB-010).
 *
 * Unlike the Collection Engine — which is **constructed with** the Provider
 * Registry it holds and later executes — the Selection Engine holds **nothing** at
 * construction. Its only input, the `CollectionResult`, arrives as the `select`
 * argument, and its Selection Policy is fixed platform behaviour it imports. The
 * engine does not own the Collection Engine, the Provider Registry or any Knowledge
 * Provider; it communicates only through immutable platform contracts. It follows
 * the same factory-created service pattern as `createContextBuilder()`,
 * `createProviderRegistry()` and `createCollectionEngine()`.
 */

import type { CollectionResult } from "../collection/result/index.js";

import { selectKnowledge } from "./selectKnowledge.js";
import type { SelectionResult } from "./result/index.js";

/**
 * Immutable platform service that performs deterministic knowledge selection.
 *
 * The engine is created through {@link createSelectionEngine}. It holds no runtime
 * state and no construction-time dependency: its `CollectionResult` input arrives
 * at `select`-time and its Selection Policy is fixed platform behaviour. The engine
 * is not itself a provider and never executes providers — it transforms an already
 * collected result into a selected one.
 */
export interface SelectionEngine {
  /**
   * Apply the deterministic Selection Policy (CB-015) to a single immutable
   * {@link CollectionResult} and return an immutable {@link SelectionResult}
   * (CB-016).
   *
   * The policy filters the collected items, orders the retained ones into the
   * canonical deterministic sequence, and eliminates exact duplicates (first
   * occurrence retained; subsequent duplicates excluded). Ordering of
   * `selectedItems` is the public guarantee; the engine embeds no decision rule of
   * its own, exposes no priority/score/ranking value, and never modifies a
   * KnowledgeItem. The engine holds no mutable state, so `select` is a pure
   * function of its input — identical CollectionResults always yield identical
   * SelectionResults.
   */
  select(collectionResult: CollectionResult): Promise<SelectionResult>;
}

/**
 * Create an immutable Selection Engine.
 *
 * The factory accepts no arguments: the Selection Engine has no construction-time
 * dependency (its `CollectionResult` input is supplied to `select`, not injected
 * here). Construction is deterministic — every call yields the same public service —
 * and the returned handle is frozen. The engine is stateless: `select` closes over
 * nothing mutable and delegates to the stateless {@link selectKnowledge} behaviour.
 *
 * @example
 * const engine = createSelectionEngine();
 * const selection = await engine.select(collectionResult);
 * selection.selectedItems; // KnowledgeItems in canonical deterministic order
 * selection.excludedItems; // filtered-out items and eliminated exact duplicates
 */
export function createSelectionEngine(): SelectionEngine {
  return Object.freeze({
    select(collectionResult: CollectionResult): Promise<SelectionResult> {
      return selectKnowledge(collectionResult);
    },
  });
}
