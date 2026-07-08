/**
 * Context Builder public factory (CB-002, extended by CB-011).
 *
 * Exposes the modern functional service pattern: consumers call
 * `createContextBuilder(config, registry)` and never instantiate internal
 * classes.
 *
 * CB-011 evolves this frozen CB-002 factory (an approved architectural
 * evolution): the Context Builder is the platform's single public orchestration
 * service. It **composes** a Collection Engine from an injected Provider Registry
 * at construction, **owns** that engine, and exposes a `collect(request)` entry
 * point that delegates to it. The registry is injected here — the smallest change
 * that lets a single immutable handle own the engine and expose an unconditional,
 * request-only `collect`.
 */

import { createCollectionEngine } from "./collection/index.js";
import { parseContextBuilderConfig } from "./config/index.js";

import type { CollectionResult } from "./collection/index.js";
import type { ContextBuilderConfig } from "./config/index.js";
import type { KnowledgeRequest } from "./providers/index.js";
import type { ProviderRegistry } from "./registry/index.js";

/**
 * Public Context Builder handle.
 *
 * CB-002 defines the stable configuration surface; CB-011 adds the first
 * operational behaviour — `collect`. The Context Builder is a **thin orchestration
 * layer**: it composes and owns a Collection Engine and delegates collection to
 * it. It does not inspect, modify, filter, rank, deduplicate or enrich the
 * returned `CollectionResult`; all collection business logic remains inside the
 * Collection Engine (CB-007/CB-010). Ranking, selection, assembly and
 * explainability arrive in later milestones through this same interface.
 */
export interface ContextBuilder {
  /** The validated, frozen configuration supplied at construction. */
  readonly config: ContextBuilderConfig;
  /**
   * Collect knowledge for a single {@link KnowledgeRequest} and return the
   * resulting {@link CollectionResult} (items + errors) **unchanged**.
   *
   * This delegates directly to the internally composed Collection Engine
   * (CB-010): collection is partial (a single provider failure never aborts
   * collection) and deterministic (the Provider Registry order is authoritative).
   * The Context Builder adds no behaviour of its own — the same request and
   * registry always produce the same result.
   */
  collect(request: KnowledgeRequest): Promise<CollectionResult>;
}

/**
 * Create a Context Builder from a configuration object and a Provider Registry.
 *
 * The configuration is validated at runtime (Zod) and frozen; the registry is
 * injected and used to compose the owned Collection Engine
 * (`createCollectionEngine(registry)`). The returned handle is immutable. Invalid
 * configuration throws a `ZodError`; a missing registry is rejected by
 * `createCollectionEngine` (fail-fast construction).
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * const builder = createContextBuilder(
 *   { profile: "implementation", explainability: true, outputFormat: "markdown" },
 *   registry,
 * );
 * const result = await builder.collect({ project: "aj-os", task: "CB-011" });
 */
export function createContextBuilder(
  config: ContextBuilderConfig,
  registry: ProviderRegistry,
): ContextBuilder {
  const validated = parseContextBuilderConfig(config);
  const engine = createCollectionEngine(registry);

  return Object.freeze({
    config: validated,
    collect(request: KnowledgeRequest): Promise<CollectionResult> {
      return engine.collect(request);
    },
  });
}
