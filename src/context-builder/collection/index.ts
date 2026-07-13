/**
 * Collection module — public surface.
 *
 * Exposes the Collection Engine (factory + `CollectionEngine` contract), the
 * CollectionError contract (a provider-agnostic representation of a single
 * collection failure), and the CollectionResult contract (the complete outcome of
 * collection: items + errors). Internal construction details stay private.
 */

export { createCollectionEngine } from "./createCollectionEngine.js";
export type { CollectionEngine } from "./createCollectionEngine.js";

// Collection Error contract — failure representation for partial collection.
export {
  collectionErrorSchema,
  parseCollectionError,
  FAILURE_CATEGORIES,
} from "./errors/index.js";
export type { CollectionError, FailureCategory } from "./errors/index.js";

// CollectionResult contract — collected items and errors together.
export {
  collectionResultSchema,
  collectionResultMetadataSchema,
  parseCollectionResult,
} from "./result/index.js";
export type {
  CollectionResult,
  CollectionResultMetadata,
} from "./result/index.js";
