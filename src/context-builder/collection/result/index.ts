/**
 * CollectionResult contract — public surface: the schema, the
 * `parseCollectionResult()` validator, and the inferred immutable types. Defines
 * *what a completed collection is* (items and errors together, plus request
 * provenance), not how collection is performed.
 */

export {
  collectionResultSchema,
  collectionResultMetadataSchema,
  parseCollectionResult,
} from "./schema.js";

export type {
  CollectionResult,
  CollectionResultMetadata,
} from "./types.js";
