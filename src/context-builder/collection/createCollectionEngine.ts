/**
 * Collection Engine public factory (CB-007).
 *
 * The Collection Engine is the platform **service** responsible for coordinating
 * deterministic knowledge collection. CB-007 establishes only its public service
 * boundary:
 *
 *   ProviderRegistry → createCollectionEngine → immutable service handle
 *
 * The engine is **constructed with** the immutable Provider Registry (CB-005),
 * which it **holds** but does **not** execute. It does not run providers, collect
 * KnowledgeItems, produce a CollectionResult/CollectionError, rank, or assemble a
 * Context Package. Collection *behaviour* is introduced by later Milestone M2
 * tasks (provider execution in CB-010) and must extend this service without
 * changing its public contract. It follows the same factory-created service
 * pattern as `createContextBuilder()` and `createProviderRegistry()`.
 */

import type { ProviderRegistry } from "../registry/index.js";

/**
 * Immutable platform service that coordinates deterministic knowledge collection.
 *
 * The engine is created through {@link createCollectionEngine} and holds the
 * injected {@link ProviderRegistry} immutably. In CB-007 the engine exposes only
 * the held registry; it does not execute providers or collect knowledge. The
 * engine is not itself a provider — it coordinates collection across the
 * registry's providers (from CB-010 onward).
 */
export interface CollectionEngine {
  /**
   * The Provider Registry injected at construction. It is **held, not executed**
   * by this task; provider execution against it is introduced in CB-010. The
   * registry is the immutable catalogue returned by `createProviderRegistry()`.
   */
  readonly registry: ProviderRegistry;
}

/**
 * Create an immutable Collection Engine from a Provider Registry.
 *
 * The registry is injected at construction and held on the returned handle; it is
 * **not** executed here (provider execution arrives in CB-010). A missing registry
 * throws an `Error` — the service is rejected rather than constructed in a broken
 * state, mirroring the fail-fast construction of `createProviderRegistry()`.
 *
 * Construction is deterministic (the same registry always yields the same public
 * service) and the returned handle is frozen. The registry object itself is
 * already immutable — the engine holds the same reference without copying or
 * re-validating it.
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * const engine = createCollectionEngine(registry);
 * engine.registry; // the injected registry (held, not executed)
 */
export function createCollectionEngine(
  registry: ProviderRegistry,
): CollectionEngine {
  if (registry === null || registry === undefined) {
    throw new Error(
      "createCollectionEngine: a Provider Registry is required.",
    );
  }

  return Object.freeze({ registry });
}
