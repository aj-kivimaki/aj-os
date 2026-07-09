/**
 * Selection module — public surface.
 *
 * Exposes the Selection Engine service boundary — the `createSelectionEngine()`
 * factory and the `SelectionEngine` contract (CB-013), which now carries the
 * `select(collectionResult)` stage operation (CB-016) — and the SelectionResult
 * contract (CB-014): the complete deterministic outcome of selection (ordered
 * selected items + excluded items). Internal construction details remain private —
 * consumers never instantiate implementation classes, and the Selection Policy
 * (CB-015) and selection-execution behaviour (CB-016) stay internal to the module
 * (they are applied through `select`, never re-exported). `select` is a method on
 * the existing `SelectionEngine` handle, so the public export surface is unchanged.
 */

export { createSelectionEngine } from "./createSelectionEngine.js";
export type { SelectionEngine } from "./createSelectionEngine.js";

// SelectionResult contract — the complete deterministic outcome of selection,
// composing the CB-004 KnowledgeItem into ordered selected and excluded items
// plus the answered-request provenance (CB-014).
export {
  selectionResultSchema,
  selectionResultMetadataSchema,
  parseSelectionResult,
} from "./result/index.js";
export type {
  SelectionResult,
  SelectionResultMetadata,
} from "./result/index.js";
