/**
 * Context Builder public factory.
 *
 * Consumers call `createContextBuilder(config, registry)` and never instantiate
 * internal classes. The Context Builder is the platform's single public
 * orchestration service: it composes and owns the Collection, Selection, and
 * Assembly engines and sequences them behind one `build(request)` entry point.
 *
 * Assembly's `generatedAt` timestamp comes from an injected timestamp source (the
 * optional `now` argument), never an ambient clock read inside a stage. `build`
 * invokes `now()` once per call and passes the ISO-8601 string to `assemble`, so
 * every stage stays a pure function of its explicit inputs.
 */

import { createAssemblyEngine } from "./assembly/index.js";
import { createCollectionEngine } from "./collection/index.js";
import { parseContextBuilderConfig } from "./config/index.js";
import { createSelectionEngine } from "./selection/index.js";

import type { ContextBuilderConfig } from "./config/index.js";
import type { ContextPackage } from "./package/index.js";
import type { KnowledgeRequest } from "./providers/index.js";
import type { ProviderRegistry } from "./registry/index.js";

/**
 * Public Context Builder handle.
 *
 * A thin orchestrator: it composes and owns the Collection, Selection, and
 * Assembly engines and sequences them, delegating every decision to those stages.
 * It never inspects, modifies, filters, reorders, deduplicates, enriches, or
 * re-timestamps the returned `ContextPackage` — all business logic lives inside
 * the individual stages.
 */
export interface ContextBuilder {
  /** The validated, frozen configuration supplied at construction. */
  readonly config: ContextBuilderConfig;
  /**
   * Run the pipeline for a single {@link KnowledgeRequest} and return the
   * resulting {@link ContextPackage} unchanged.
   *
   * Internally: `collect(request)` → `select(collectionResult)` →
   * `assemble(selectionResult, generatedAt)`. The stage operations and the
   * intermediate `CollectionResult`/`SelectionResult` stay internal. Determinism
   * and immutability are inherited from the engines, so the same request, registry,
   * and injected timestamp always produce the same package.
   */
  build(request: KnowledgeRequest): Promise<ContextPackage>;
}

/**
 * Create a Context Builder from a configuration object, a Provider Registry, and an
 * optional timestamp source.
 *
 * The configuration is validated (Zod) and frozen; the registry is injected into
 * the owned Collection Engine. All three engines are composed exactly once and the
 * returned handle is immutable. Invalid configuration throws a `ZodError`; a
 * missing registry is rejected by `createCollectionEngine`.
 *
 * `now` supplies Assembly's `generatedAt` and defaults to the wall clock. Injecting
 * a fixed source makes `build` fully deterministic.
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * const builder = createContextBuilder(
 *   { profile: "implementation", explainability: true, outputFormat: "markdown" },
 *   registry,
 * );
 * const pkg = await builder.build({ project: "aj-os", task: "answer a question" });
 */
export function createContextBuilder(
  config: ContextBuilderConfig,
  registry: ProviderRegistry,
  now: () => string = () => new Date().toISOString(),
): ContextBuilder {
  const validated = parseContextBuilderConfig(config);
  const collectionEngine = createCollectionEngine(registry);
  const selectionEngine = createSelectionEngine();
  const assemblyEngine = createAssemblyEngine();

  return Object.freeze({
    config: validated,
    async build(request: KnowledgeRequest): Promise<ContextPackage> {
      const collectionResult = await collectionEngine.collect(request);
      const selectionResult = await selectionEngine.select(collectionResult);
      return assemblyEngine.assemble(selectionResult, now());
    },
  });
}
