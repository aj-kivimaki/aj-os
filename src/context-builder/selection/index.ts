/**
 * Selection module — public surface.
 *
 * Exposes the Selection Engine (factory + `SelectionEngine` contract, which carries
 * the `select(collectionResult)` operation) and the SelectionResult contract. The
 * Selection Policy and selection-execution behaviour stay internal — applied
 * through `select`, never re-exported.
 */

export { createSelectionEngine } from "./createSelectionEngine.js";
export type { SelectionEngine } from "./createSelectionEngine.js";

// SelectionResult contract — ordered selected and excluded items plus provenance.
export {
  selectionResultSchema,
  selectionResultMetadataSchema,
  parseSelectionResult,
} from "./result/index.js";
export type {
  SelectionResult,
  SelectionResultMetadata,
} from "./result/index.js";
