/**
 * Assembly Engine public factory.
 *
 * The Assembly Engine constructs an immutable {@link ContextPackage} from an
 * ordered {@link SelectionResult} via its `assemble` stage operation.
 *
 * Like the Selection Engine — and unlike the Collection Engine, which is
 * constructed with the Provider Registry it later executes — the Assembly Engine
 * holds nothing at construction. Its inputs arrive as `assemble` arguments, so the
 * engine stays stateless and never reads a clock. It communicates only through
 * immutable platform contracts and follows the same factory-created service pattern
 * as the other engines.
 */

import { assembleContext } from "./assembleContext.js";
import type { ContextPackage } from "../package/index.js";
import type { SelectionResult } from "../selection/result/index.js";

/**
 * Immutable platform service that constructs a Context Package from selection.
 *
 * Holds no runtime state and no construction-time dependency: both inputs arrive
 * at `assemble`-time. The engine never executes providers, renders, or validates
 * semantically — it transforms a selected result into an assembled Context Package
 * by structural composition only.
 */
export interface AssemblyEngine {
  /**
   * Deterministically construct an immutable {@link ContextPackage} from an ordered
   * {@link SelectionResult} and an injected `generatedAt` timestamp.
   *
   * A pure function of its two explicit inputs: it reads no clock, randomness, or
   * external state, never mutates the input, and consumes KnowledgeItems unchanged.
   * See {@link assembleContext} for the composition details.
   *
   * @param selectionResult - the immutable upstream SelectionResult (never modified)
   * @param generatedAt - the injected ISO-8601 timestamp
   */
  assemble(
    selectionResult: SelectionResult,
    generatedAt: string,
  ): Promise<ContextPackage>;
}

/**
 * Create an immutable, stateless Assembly Engine. The factory takes no arguments;
 * `assemble` delegates to {@link assembleContext}.
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
