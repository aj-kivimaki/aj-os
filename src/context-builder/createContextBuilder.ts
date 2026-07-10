/**
 * Context Builder public factory (CB-002, extended by CB-011, evolved by CB-017,
 * completed as the full pipeline by CB-023).
 *
 * Exposes the modern functional service pattern: consumers call
 * `createContextBuilder(config, registry)` and never instantiate internal
 * classes.
 *
 * CB-011 made the Context Builder the platform's single public orchestration
 * service: it composes a Collection Engine from an injected Provider Registry at
 * construction and owns it. CB-017 extended that pipeline with the Selection stage
 * and reconciled the public entry point: the Context Builder composes the
 * Collection Engine (CB-007/CB-010) and the Selection Engine (CB-013/CB-016) once
 * at construction and exposes a single public entry point — `build(request)`. This
 * supersedes the Milestone 2 era `collect(request)` public method — an approved
 * public API evolution recorded in MILESTONES.md and CB-017.
 *
 * CB-023 completes the Milestone 4 pipeline: the Context Builder now also composes
 * the Assembly Engine (CB-019/CB-022) once at construction, and `build(request)`
 * executes the full **Collection → Selection → Assembly** pipeline, returning the
 * resulting {@link ContextPackage} (CB-003) unchanged. The `build` **input**
 * signature is unchanged; only its **return type advances** `SelectionResult` →
 * `ContextPackage` — the pre-anticipated CB-017 evolution, not a redesign. The
 * stage operations `CollectionEngine.collect`, `SelectionEngine.select` and
 * `AssemblyEngine.assemble`, and the intermediate `CollectionResult` /
 * `SelectionResult`, remain internal to the pipeline.
 *
 * Assembly's `generatedAt` timestamp (CB-021 / Reviewer Decision B) is supplied by
 * a **construction-time injected timestamp source** — the optional `now` factory
 * argument — never an ambient clock read inside a stage. `build` invokes `now()`
 * exactly once per invocation and passes the resulting ISO-8601 string unchanged to
 * `assemble`, so Assembly stays a pure function of its two explicit inputs (RC-3).
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
 * CB-002 defines the stable configuration surface; CB-017 exposed the pipeline
 * entry point — `build`; CB-023 advances it to the full Milestone 4 pipeline. The
 * Context Builder is a **thin orchestrator**: it composes and owns a Collection
 * Engine, a Selection Engine and an Assembly Engine and sequences them, delegating
 * every decision to those stages. It does not implement collection, selection or
 * assembly behaviour; it does not inspect, modify, filter, reorder, deduplicate,
 * enrich or re-timestamp the returned `ContextPackage`. All business logic remains
 * inside the individual pipeline stages. Explainability and profiles arrive in later
 * milestones through this same `build` interface without changing it.
 */
export interface ContextBuilder {
  /** The validated, frozen configuration supplied at construction. */
  readonly config: ContextBuilderConfig;
  /**
   * Execute the deterministic Context Builder pipeline for a single
   * {@link KnowledgeRequest} and return the resulting {@link ContextPackage}
   * (CB-003) **unchanged**.
   *
   * `build` is the Context Builder's single public entry point. It always runs the
   * highest-level implemented pipeline — at Milestone 4, Collection → Selection →
   * Assembly: internally it invokes `CollectionEngine.collect(request)`, then
   * `SelectionEngine.select(collectionResult)`, then
   * `AssemblyEngine.assemble(selectionResult, generatedAt)`, and returns the
   * Assembly Engine's result verbatim. Those stage operations and the intermediate
   * `CollectionResult` / `SelectionResult` stay internal to the pipeline. The
   * `generatedAt` supplied to Assembly is produced by the construction-time injected
   * timestamp source (`now`), invoked exactly once per call — no stage reads an
   * ambient clock. The Context Builder adds no behaviour of its own — determinism
   * and immutability are inherited from the engines (CB-010/CB-016/CB-022), so the
   * same request, registry and injected timestamp always produce the same package.
   */
  build(request: KnowledgeRequest): Promise<ContextPackage>;
}

/**
 * Create a Context Builder from a configuration object, a Provider Registry, and an
 * optional construction-time timestamp source.
 *
 * The configuration is validated at runtime (Zod) and frozen; the registry is
 * injected and used to compose the owned Collection Engine
 * (`createCollectionEngine(registry)`). The Selection Engine
 * (`createSelectionEngine()`) and the Assembly Engine (`createAssemblyEngine()`) are
 * composed alongside it; neither holds a construction-time dependency. All three
 * engines are composed **exactly once** here. The returned handle is immutable.
 * Invalid configuration throws a `ZodError`; a missing registry is rejected by
 * `createCollectionEngine` (fail-fast construction).
 *
 * `now` is the injected timestamp source for Assembly's `generatedAt` input (CB-021
 * / Reviewer Decision B). It defaults to the real wall clock
 * (`() => new Date().toISOString()`); `build` invokes it exactly once per call and
 * passes the ISO-8601 string unchanged to `assemble`. Keeping the clock at the
 * construction boundary — rather than inside a stage — preserves determinism by
 * construction: injecting a fixed source makes `build` fully deterministic (RC-3).
 * This optional third parameter is a backward-compatible extension; existing
 * two-argument call sites are unchanged.
 *
 * @example
 * const registry = createProviderRegistry([handbookProvider, wikiProvider]);
 * const builder = createContextBuilder(
 *   { profile: "implementation", explainability: true, outputFormat: "markdown" },
 *   registry,
 * );
 * const pkg = await builder.build({ project: "aj-os", task: "CB-023" });
 * pkg.sections;   // ContextSections in canonical Appendix B order
 * pkg.references; // de-duplicated selected sources
 * pkg.metadata;   // provenance + injected generatedAt + single-sourced versions
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
