/**
 * Context Builder public factory (CB-002, extended by CB-011, evolved by CB-017).
 *
 * Exposes the modern functional service pattern: consumers call
 * `createContextBuilder(config, registry)` and never instantiate internal
 * classes.
 *
 * CB-011 made the Context Builder the platform's single public orchestration
 * service: it composes a Collection Engine from an injected Provider Registry at
 * construction and owns it. CB-017 extends that pipeline with the Selection stage
 * and reconciles the public entry point: the Context Builder now composes **both**
 * the Collection Engine (CB-007/CB-010) and the Selection Engine (CB-013/CB-016)
 * once at construction, and exposes a single public entry point — `build(request)`
 * — that executes the highest-level implemented pipeline (Collection → Selection at
 * Milestone 3) and returns the resulting {@link SelectionResult} unchanged. This
 * supersedes the Milestone 2 era `collect(request)` public method — an approved
 * public API evolution recorded in MILESTONES.md and CB-017. The stage operations
 * `CollectionEngine.collect` and `SelectionEngine.select`, and the intermediate
 * `CollectionResult`, remain internal to the pipeline.
 */

import { createCollectionEngine } from "./collection/index.js";
import { parseContextBuilderConfig } from "./config/index.js";
import { createSelectionEngine } from "./selection/index.js";

import type { ContextBuilderConfig } from "./config/index.js";
import type { KnowledgeRequest } from "./providers/index.js";
import type { ProviderRegistry } from "./registry/index.js";
import type { SelectionResult } from "./selection/index.js";

/**
 * Public Context Builder handle.
 *
 * CB-002 defines the stable configuration surface; CB-017 exposes the pipeline
 * entry point — `build`. The Context Builder is a **thin orchestrator**: it composes
 * and owns a Collection Engine and a Selection Engine and sequences them, delegating
 * every decision to those stages. It does not implement selection policy or
 * collection behaviour; it does not inspect, modify, filter, reorder, deduplicate or
 * enrich the returned `SelectionResult`. All business logic remains inside the
 * individual pipeline stages. Assembly and explainability arrive in later milestones
 * through this same `build` interface without changing it.
 */
export interface ContextBuilder {
  /** The validated, frozen configuration supplied at construction. */
  readonly config: ContextBuilderConfig;
  /**
   * Execute the deterministic Context Builder pipeline for a single
   * {@link KnowledgeRequest} and return the resulting {@link SelectionResult}
   * (ordered `selectedItems` + `excludedItems`) **unchanged**.
   *
   * `build` is the Context Builder's single public entry point. It always runs the
   * highest-level implemented pipeline — at Milestone 3, Collection → Selection:
   * internally it invokes `CollectionEngine.collect(request)` then
   * `SelectionEngine.select(collectionResult)`, and returns the Selection Engine's
   * result verbatim. Those stage operations and the intermediate `CollectionResult`
   * stay internal to the pipeline. The Context Builder adds no behaviour of its own —
   * determinism and immutability are inherited from the engines (CB-010/CB-016), so
   * the same request and registry always produce the same result.
   */
  build(request: KnowledgeRequest): Promise<SelectionResult>;
}

/**
 * Create a Context Builder from a configuration object and a Provider Registry.
 *
 * The configuration is validated at runtime (Zod) and frozen; the registry is
 * injected and used to compose the owned Collection Engine
 * (`createCollectionEngine(registry)`). The Selection Engine is composed alongside
 * it (`createSelectionEngine()`); it holds no construction-time dependency. Both
 * engines are composed **exactly once** here. The returned handle is immutable.
 * Invalid configuration throws a `ZodError`; a missing registry is rejected by
 * `createCollectionEngine` (fail-fast construction).
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * const builder = createContextBuilder(
 *   { profile: "implementation", explainability: true, outputFormat: "markdown" },
 *   registry,
 * );
 * const selection = await builder.build({ project: "aj-os", task: "CB-017" });
 * selection.selectedItems; // KnowledgeItems in canonical deterministic order
 */
export function createContextBuilder(
  config: ContextBuilderConfig,
  registry: ProviderRegistry,
): ContextBuilder {
  const validated = parseContextBuilderConfig(config);
  const collectionEngine = createCollectionEngine(registry);
  const selectionEngine = createSelectionEngine();

  return Object.freeze({
    config: validated,
    async build(request: KnowledgeRequest): Promise<SelectionResult> {
      const collectionResult = await collectionEngine.collect(request);
      return selectionEngine.select(collectionResult);
    },
  });
}
