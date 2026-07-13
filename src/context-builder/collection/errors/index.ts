/**
 * Collection Error contract — public surface: the schema, the closed
 * failure-category set, the `parseCollectionError()` validator, and the inferred
 * immutable types. Defines *what a collection failure is*, not how failures are
 * produced or handled.
 */

export {
  collectionErrorSchema,
  parseCollectionError,
  FAILURE_CATEGORIES,
} from "./schema.js";

export type { CollectionError, FailureCategory } from "./types.js";
