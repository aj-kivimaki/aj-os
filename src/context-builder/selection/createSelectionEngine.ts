/**
 * Selection Engine public factory (CB-013).
 *
 * The Selection Engine is the platform **service** responsible for deterministic
 * knowledge selection. CB-013 establishes only its public service boundary:
 *
 *   createSelectionEngine → immutable service handle
 *
 * The engine will transform a {@link CollectionResult} (CB-009) into a future
 * SelectionResult (CB-014). That transformation — the `select(collectionResult)`
 * stage operation — is introduced with its behaviour in CB-016, mirroring how the
 * Collection Engine boundary (CB-007) preceded `collect` (CB-010). CB-013 names
 * the boundary only: it adds no `select` method, no Selection Policy (CB-015), and
 * no selection behaviour of any kind.
 *
 * Unlike the Collection Engine — which is **constructed with** the Provider
 * Registry it holds and later executes — the Selection Engine holds **nothing** at
 * construction. Its only input, the `CollectionResult`, arrives as the future
 * `select` argument, and its Selection Policy arrives in CB-015. The engine does
 * not own the Collection Engine, the Provider Registry or any Knowledge Provider;
 * it communicates only through immutable platform contracts. It follows the same
 * factory-created service pattern as `createContextBuilder()`,
 * `createProviderRegistry()` and `createCollectionEngine()`.
 */

/**
 * Immutable platform service that performs deterministic knowledge selection.
 *
 * The engine is created through {@link createSelectionEngine}. In CB-013 it is a
 * pure service boundary: it exposes no members and stores no runtime state. The
 * stage operation the engine will expose is `select(collectionResult)`, added with
 * its behaviour in CB-016; this task establishes the seam that later Milestone M3
 * tasks extend without changing it.
 *
 * The interface is intentionally empty. Unlike {@link CollectionEngine}, which
 * holds an injected Provider Registry, the Selection Engine has no construction-time
 * dependency to hold: its `CollectionResult` input arrives at `select`-time and its
 * Selection Policy arrives in CB-015. Adding any member now would be a placeholder
 * for behaviour owned by a later task.
 */
export interface SelectionEngine {}

/**
 * Create an immutable Selection Engine.
 *
 * The factory accepts no arguments: the Selection Engine has no construction-time
 * dependency (its `CollectionResult` input is supplied to the future `select`
 * operation, not injected here). Construction is deterministic — every call yields
 * the same public service — and the returned handle is frozen. The engine is
 * stateless: it keeps no mutable runtime state.
 *
 * @example
 * const engine = createSelectionEngine();
 * // In CB-016 the engine gains: await engine.select(collectionResult);
 */
export function createSelectionEngine(): SelectionEngine {
  return Object.freeze({});
}
