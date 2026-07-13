/**
 * Provider Registry public factory.
 *
 * The Provider Registry is an immutable catalogue of {@link KnowledgeProvider}s:
 *
 *   KnowledgeProviders → validation → immutable registry → lookup
 *
 * It never executes, discovers, loads, configures, or ranks providers, and builds
 * no Context Packages. It is created once through a factory and never mutated,
 * mirroring the other service factories.
 */

import type { KnowledgeProvider } from "../providers/index.js";

/**
 * Immutable catalogue of the {@link KnowledgeProvider}s available to the Context
 * Builder.
 *
 * The registry exposes the registered providers and retrieves a provider by its
 * identifier. It is provider-agnostic: it knows nothing about how a provider
 * contributes knowledge, only its stable `id`. The registry is frozen at
 * construction — there is no way to add, remove or reorder providers afterwards.
 */
export interface ProviderRegistry {
  /**
   * The registered providers, in the caller's insertion order (deterministic:
   * the same input always yields the same order). The array is immutable.
   */
  readonly providers: readonly KnowledgeProvider[];
  /**
   * Retrieve a provider by its identifier, or `undefined` if no provider with
   * that `id` is registered.
   */
  get(id: string): KnowledgeProvider | undefined;
}

/**
 * Create an immutable Provider Registry from a collection of providers.
 *
 * Providers are validated during construction: every provider must carry a
 * non-empty string `id` (the identifier the registry keys on), and provider
 * `id`s must be unique. A missing/empty or duplicate `id` throws an `Error` —
 * the catalogue is rejected rather than silently built in a broken state.
 *
 * Ordering is deterministic: `providers` preserves the caller's insertion order.
 * The returned handle and its `providers` array are frozen; the provider objects
 * themselves are caller-owned and are not frozen.
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * registry.get("handbook"); // handbookProvider | undefined
 * registry.providers;       // readonly [handbookProvider, wikiProvider]
 */
export function createProviderRegistry(
  providers: readonly KnowledgeProvider[],
): ProviderRegistry {
  const byId = new Map<string, KnowledgeProvider>();

  for (const provider of providers) {
    const id = provider.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new Error(
        "createProviderRegistry: every provider must have a non-empty string id.",
      );
    }
    if (byId.has(id)) {
      throw new Error(
        `createProviderRegistry: duplicate provider id "${id}".`,
      );
    }
    byId.set(id, provider);
  }

  const ordered: readonly KnowledgeProvider[] = Object.freeze([...providers]);

  return Object.freeze({
    providers: ordered,
    get(id: string): KnowledgeProvider | undefined {
      return byId.get(id);
    },
  });
}
