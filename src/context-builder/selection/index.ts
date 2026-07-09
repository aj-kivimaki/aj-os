/**
 * Selection module — public surface.
 *
 * Exposes the Selection Engine service boundary — the `createSelectionEngine()`
 * factory and the `SelectionEngine` contract (CB-013). Internal construction
 * details remain private — consumers never instantiate implementation classes.
 * Remaining selection behaviour (the SelectionResult contract, the Selection
 * Policy and the `select(collectionResult)` stage operation) is introduced by
 * later Milestone M3 tasks through this same surface.
 */

export { createSelectionEngine } from "./createSelectionEngine.js";
export type { SelectionEngine } from "./createSelectionEngine.js";
