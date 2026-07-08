/**
 * Collection Error contract — public surface (CB-008).
 *
 * Exposes the platform's failure *representation* contract: the schema, the
 * closed failure-category set, the `parseCollectionError()` validator and the
 * inferred immutable types. It defines *what a collection failure is* — not how
 * failures are produced or handled. CB-009 embeds this contract in the
 * `CollectionResult`; CB-010 constructs it during provider execution. No
 * collection behaviour is introduced here.
 */

export {
  collectionErrorSchema,
  parseCollectionError,
  FAILURE_CATEGORIES,
} from "./schema.js";

export type { CollectionError, FailureCategory } from "./types.js";
