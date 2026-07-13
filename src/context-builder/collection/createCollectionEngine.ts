/**
 * Collection Engine public factory.
 *
 *   ProviderRegistry → createCollectionEngine → immutable service handle
 *
 * The engine is constructed with the immutable Provider Registry, which it holds.
 * `collect(request)` executes the held registry's providers and assembles an
 * immutable CollectionResult (items + errors) under the partial-collection model.
 * It follows the same factory-created service pattern as the other engines.
 */

import type { KnowledgeRequest } from "../providers/index.js";
import type { ProviderRegistry } from "../registry/index.js";

import { collectKnowledge } from "./collectKnowledge.js";
import type { CollectionResult } from "./result/index.js";

/**
 * Immutable platform service that coordinates deterministic knowledge collection.
 * It holds the injected {@link ProviderRegistry} but is not itself a provider.
 */
export interface CollectionEngine {
  /**
   * The Provider Registry injected at construction — the authoritative source of
   * provider execution order for {@link CollectionEngine.collect}.
   */
  readonly registry: ProviderRegistry;
  /**
   * Execute the held registry's providers for a single {@link KnowledgeRequest}
   * and return an immutable {@link CollectionResult}.
   *
   * Collection is partial (a single failure never aborts it) and deterministic
   * (registry order is authoritative). The engine holds no mutable state, so
   * `collect` is a pure function of the registry and request.
   */
  collect(request: KnowledgeRequest): Promise<CollectionResult>;
}

/**
 * Create an immutable Collection Engine from a Provider Registry.
 *
 * The registry is injected and held on the frozen handle without copying or
 * re-validating (it is already immutable). A missing registry throws — the service
 * is rejected rather than constructed in a broken state.
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * const engine = createCollectionEngine(registry);
 * await engine.collect(request);
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
