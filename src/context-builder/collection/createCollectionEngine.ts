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
 * which it **holds**. CB-010 adds the first collection *behaviour* to this same
 * service boundary: `collect(request)` executes the held registry's providers and
 * assembles an immutable CollectionResult (items + errors) under the
 * partial-collection model. This extends — but does not change — the boundary
 * established by CB-007. The engine still does not rank, filter, deduplicate or
 * assemble a Context Package (later milestones). It follows the same
 * factory-created service pattern as `createContextBuilder()` and
 * `createProviderRegistry()`.
 */

import type { KnowledgeRequest } from "../providers/index.js";
import type { ProviderRegistry } from "../registry/index.js";

import { collectKnowledge } from "./collectKnowledge.js";
import type { CollectionResult } from "./result/index.js";

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
   * The Provider Registry injected at construction. It is the immutable catalogue
   * returned by `createProviderRegistry()` and is the authoritative source of
   * provider execution order for {@link CollectionEngine.collect}.
   */
  readonly registry: ProviderRegistry;
  /**
   * Execute the held registry's providers for a single {@link KnowledgeRequest}
   * and return an immutable {@link CollectionResult} (CB-010).
   *
   * Collection is **partial**: successful providers contribute KnowledgeItems and
   * a failing provider contributes a CollectionError — a single failure never
   * aborts collection. Ordering is **deterministic**: registry order is
   * authoritative and provider completion order is irrelevant. The engine holds
   * no mutable state, so `collect` is a pure function of the registry and request.
   */
  collect(request: KnowledgeRequest): Promise<CollectionResult>;
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
 * engine.registry;                 // the injected registry
 * await engine.collect(request);   // deterministic partial CollectionResult
 */
export function createCollectionEngine(
  registry: ProviderRegistry,
): CollectionEngine {
  if (registry === null || registry === undefined) {
    throw new Error(
      "createCollectionEngine: a Provider Registry is required.",
    );
  }

  return Object.freeze({
    registry,
    collect(request: KnowledgeRequest): Promise<CollectionResult> {
      return collectKnowledge(registry, request);
    },
  });
}
