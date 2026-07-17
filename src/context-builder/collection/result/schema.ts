/**
 * CollectionResult contract — the complete outcome of knowledge collection.
 *
 * Under the partial-collection model a single provider failure never aborts
 * collection: a provider contributes *either* KnowledgeItems *or* a
 * CollectionError, and the result aggregates both, alongside the provenance of the
 * request it answers:
 *
 *   metadata · items · errors
 *
 * This defines *what a completed collection is*, not *how it is produced* — no
 * provider execution, ranking, selection, or retry logic lives here. The contract
 * is immutable: `parseCollectionResult()` validates then deep-freezes. Any
 * combination of empty/non-empty items and errors is valid.
 */

import { z } from "zod";

import { deepFreeze } from "../../package/deepFreeze.js";
import { knowledgeItemSchema, knowledgeRequestSchema } from "../../providers/schema.js";
import { collectionErrorSchema } from "../errors/schema.js";

import type { CollectionResult } from "./types.js";

/**
 * Provenance metadata for a collection result: exactly the
 * {@link knowledgeRequestSchema} it answered, reused rather than redefined so the
 * metadata can never drift from the request the collection ran for. Provenance
 * only — no timestamps, durations, or diagnostics, which would break determinism
 * and leak implementation detail.
 */
export const collectionResultMetadataSchema = knowledgeRequestSchema;

/**
 * The CollectionResult contract. `.strict()` so no execution-, ranking-, or
 * selection-specific fields can enter; `items` and `errors` compose the existing
 * KnowledgeItem and CollectionError contracts unchanged. Both arrays may be empty.
 */
export const collectionResultSchema = z
  .object({
    /** Provenance: the request this collection answered. */
    metadata: collectionResultMetadataSchema,
    /** Knowledge collected from providers (may be empty). */
    items: z.array(knowledgeItemSchema),
    /**
     * Per-provider failures under partial collection (may be empty). Empty means
     * every provider that ran contributed items or found nothing — none failed.
     */
    errors: z.array(collectionErrorSchema),
  })
  .strict();

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a
 * parsed contract is immutable at runtime as well as in the types.
 */
/**
 * Validate an unknown value against the `CollectionResult` contract and return a
 * deeply-immutable result. Throws a `ZodError` if validation fails (invalid
 * shape, unknown keys, a malformed metadata request, or a malformed item/error).
 */
export function parseCollectionResult(input: unknown): CollectionResult {
  return deepFreeze(collectionResultSchema.parse(input));
}
