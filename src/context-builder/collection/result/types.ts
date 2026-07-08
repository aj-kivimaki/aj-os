/**
 * CollectionResult contract — types (CB-009).
 *
 * Types are inferred from the Zod schema and wrapped in `DeepReadonly` so the
 * runtime contract and the compile-time contract can never drift, and so the
 * contract is immutable at every level (mirroring the runtime deep-freeze).
 *
 * `CollectionResult` is a plain immutable **data** type: the complete outcome of
 * collection (items + errors) plus the request provenance it answered. It carries
 * no behaviour and no execution detail.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type {
  collectionResultMetadataSchema,
  collectionResultSchema,
} from "./schema.js";

/**
 * Immutable provenance of a collection result — the `KnowledgeRequest` (CB-004)
 * the collection answered. Reused, not redefined.
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
