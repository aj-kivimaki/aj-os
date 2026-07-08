/**
 * CollectionResult contract — public surface (CB-009).
 *
 * Exposes the platform's canonical collection-outcome contract: the schema, the
 * `parseCollectionResult()` validator and the inferred immutable types. It
 * defines *what a completed collection is* — items and errors together, plus the
 * request provenance — not how collection is performed. CB-010 constructs a
 * `CollectionResult` during provider execution; no collection behaviour is
 * introduced here.
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
