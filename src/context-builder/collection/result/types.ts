/**
 * CollectionResult contract — types.
 *
 * Inferred from the Zod schema and wrapped in `DeepReadonly` so the runtime and
 * compile-time contracts can never drift and the contract is immutable at every
 * level. `CollectionResult` is a plain immutable data type — no behaviour, no
 * execution detail.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type {
  collectionResultMetadataSchema,
  collectionResultSchema,
} from "./schema.js";

/**
 * Immutable provenance of a collection result — the `KnowledgeRequest` the
 * collection answered. Reused, not redefined.
 */
export type CollectionResultMetadata = DeepReadonly<
  z.infer<typeof collectionResultMetadataSchema>
>;

/**
 * The immutable CollectionResult contract — the complete deterministic outcome of
 * knowledge collection (metadata + collected items + collected errors).
 */
export type CollectionResult = DeepReadonly<
  z.infer<typeof collectionResultSchema>
>;
