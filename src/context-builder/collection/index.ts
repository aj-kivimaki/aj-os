/**
 * Collection Engine — public surface (CB-007).
 *
 * Exposes the Collection Engine service boundary: the `createCollectionEngine()`
 * factory and the `CollectionEngine` contract. Internal construction details
 * remain private — consumers never instantiate implementation classes. Collection
 * behaviour (provider execution, CollectionResult, CollectionError) is introduced
 * by later Milestone M2 tasks through this same interface.
 */

export { createCollectionEngine } from "./createCollectionEngine.js";
export type { CollectionEngine } from "./createCollectionEngine.js";
