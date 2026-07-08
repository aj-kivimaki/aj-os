/**
 * Collection module — public surface.
 *
 * Exposes the Collection Engine service boundary — the `createCollectionEngine()`
 * factory and the `CollectionEngine` contract (CB-007) — the CollectionError
 * contract (CB-008): the deterministic, provider-agnostic representation of a
 * single collection failure, and the CollectionResult contract (CB-009): the
 * complete deterministic outcome of collection (items + errors). Internal
 * construction details remain private — consumers never instantiate
 * implementation classes. Remaining collection behaviour (provider execution) is
 * introduced by later Milestone M2 tasks through this same surface.
 */

export { createCollectionEngine } from "./createCollectionEngine.js";
export type { CollectionEngine } from "./createCollectionEngine.js";

// Collection Error contract — failure representation for partial collection (CB-008).
export {
  collectionErrorSchema,
  parseCollectionError,
  FAILURE_CATEGORIES,
} from "./errors/index.js";
export type { CollectionError, FailureCategory } from "./errors/index.js";

// CollectionResult contract — the complete deterministic outcome of collection,
// aggregating collected items and collected errors (CB-009).
export {
  collectionResultSchema,
  collectionResultMetadataSchema,
  parseCollectionResult,
} from "./result/index.js";
export type {
  CollectionResult,
  CollectionResultMetadata,
} from "./result/index.js";
