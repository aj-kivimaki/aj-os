/**
 * Selection module — public surface.
 *
 * Exposes the Selection Engine service boundary — the `createSelectionEngine()`
 * factory and the `SelectionEngine` contract (CB-013) — and the SelectionResult
 * contract (CB-014): the complete deterministic outcome of selection (ordered
 * selected items + excluded items). Internal construction details remain private —
 * consumers never instantiate implementation classes. Remaining selection
 * behaviour (the Selection Policy and the `select(collectionResult)` stage
 * operation) is introduced by later Milestone M3 tasks through this same surface.
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
