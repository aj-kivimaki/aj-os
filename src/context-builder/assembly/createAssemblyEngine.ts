/**
 * Assembly Engine public factory (CB-019, extended by CB-022).
 *
 * The Assembly Engine is the platform **service** responsible for constructing an
 * immutable {@link ContextPackage} (CB-003) from an ordered {@link SelectionResult}
 * (CB-014). CB-019 established only its public service boundary:
 *
 *   createAssemblyEngine → immutable service handle
 *
 * CB-022 adds the first assembly *behaviour* to this same boundary: the
 * `assemble(selectionResult, generatedAt)` stage operation transforms a
 * `SelectionResult` and an injected `generatedAt` timestamp into an immutable
 * `ContextPackage`, realizing the frozen CB-020 section-composition strategy and
 * the frozen CB-021 metadata composition. This extends — but does not change — the
 * boundary established by CB-019, mirroring how the Selection Engine boundary
 * (CB-013) gained `select` (CB-016) and the Collection Engine boundary (CB-007)
 * gained `collect` (CB-010).
 *
 * Like the Selection Engine — and unlike the Collection Engine, which is
 * **constructed with** the Provider Registry it holds and later executes — the
 * Assembly Engine holds **nothing** at construction. Its inputs — the
 * `SelectionResult` and the injected `generatedAt` — arrive as `assemble`
 * arguments (CB-021 keeps the engine construction-dependency-free and stateless;
 * the engine never reads a clock). The engine does not own the Collection Engine,
 * the Selection Engine, the Provider Registry or any Knowledge Provider; it
 * communicates only through immutable platform contracts (AD-002, Stage
 * Independence). It follows the same factory-created service pattern as
 * `createContextBuilder()`, `createProviderRegistry()`, `createCollectionEngine()`
 * and `createSelectionEngine()`.
 */

import { assembleContext } from "./assembleContext.js";
import type { ContextPackage } from "../package/index.js";
import type { SelectionResult } from "../selection/result/index.js";

/**
 * Immutable platform service that constructs a Context Package from selection.
 *
 * The engine is created through {@link createAssemblyEngine}. It holds no runtime
 * state and no construction-time dependency: its `SelectionResult` and injected
 * `generatedAt` inputs both arrive at `assemble`-time. The engine is not itself a
 * provider and never executes providers, renders, or validates semantically — it
 * transforms a selected result into an assembled Context Package by structural
 * composition only.
 */
export interface AssemblyEngine {
  /**
   * Deterministically construct an immutable {@link ContextPackage} (CB-003) from
   * an ordered {@link SelectionResult} (CB-014) and an injected `generatedAt`
   * timestamp (CB-022).
   *
   * Assembly realizes the frozen CB-020 section-composition strategy (a total,
   * purely structural `source.type → kind` partition, order-preserving, with the
   * four Reviewer Decision A sections always present and empty) and the frozen
   * CB-021 metadata composition (provenance reused from `SelectionResult.metadata`,
   * the injected `generatedAt`, and the two single-sourced versions). The package
   * is built **through** `parseContextPackage()`, so structural invariants and the
   * deep-freeze hold by construction (RC-1).
   *
   * `assemble` is a pure function of its two explicit inputs — it reads no clock,
   * randomness or external state, never mutates the input `SelectionResult`, and
   * consumes KnowledgeItems unchanged. Identical inputs always yield a deep-equal
   * package (AD-007, RC-3).
   *
   * @param selectionResult - the immutable upstream SelectionResult (never modified)
   * @param generatedAt - the injected ISO-8601 timestamp (CB-021 / Decision B)
   */
  assemble(
    selectionResult: SelectionResult,
    generatedAt: string,
  ): Promise<ContextPackage>;
}

/**
 * Create an immutable Assembly Engine.
 *
 * The factory accepts no arguments: the Assembly Engine has no construction-time
 * dependency (its `SelectionResult` and `generatedAt` inputs are supplied to
 * `assemble`, not injected here). Construction is deterministic — every call yields
 * the same public service — and the returned handle is frozen. The engine is
 * stateless: `assemble` closes over nothing mutable and delegates to the stateless
 * {@link assembleContext} behaviour.
 *
 * @example
 * const engine = createAssemblyEngine();
 * const pkg = await engine.assemble(selectionResult, "2026-07-10T00:00:00.000Z");
 * pkg.sections;   // ordered ContextSections (canonical Appendix B order)
 * pkg.references; // de-duplicated selected sources
 * pkg.metadata;   // provenance + injected generatedAt + single-sourced versions
 */
export function createAssemblyEngine(): AssemblyEngine {
  return Object.freeze({
    assemble(
      selectionResult: SelectionResult,
      generatedAt: string,
    ): Promise<ContextPackage> {
      return assembleContext(selectionResult, generatedAt);
    },
  });
}
