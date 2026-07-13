/**
 * SelectionResult contract — the complete outcome of knowledge selection.
 *
 * Selection partitions a {@link CollectionResult}'s knowledge into what continues
 * through the pipeline and what does not, preserving both sides so a later
 * explainability stage can describe the decision without re-running selection:
 *
 *   metadata · selectedItems · excludedItems
 *
 * `selectedItems` is ordered, and that order is the canonical deterministic
 * contract Assembly consumes as given. KnowledgeItems are never modified, merged,
 * or summarized — the result holds references to the original immutable items. The
 * contract is immutable (`parseSelectionResult()` validates then deep-freezes) and
 * both arrays may be empty.
 *
 * Ordering *is* the contract: there is no explicit priority, score, or ranking
 * field. Any priority used to derive the ordering is an internal Selection Policy
 * detail.
 */

import { z } from "zod";

import { collectionResultMetadataSchema } from "../../collection/result/schema.js";
import type { DeepReadonly } from "../../package/types.js";
import { knowledgeItemSchema } from "../../providers/schema.js";

import type { SelectionResult } from "./types.js";

/**
 * Provenance metadata for a selection result: reused from the upstream
 * {@link collectionResultMetadataSchema} rather than redefined, so the selection
 * provenance can never drift from the request that flowed through collection.
 * Provenance only — no timestamps, counters, or diagnostics.
 */
export const selectionResultMetadataSchema = collectionResultMetadataSchema;

/**
 * The SelectionResult contract. `.strict()` so no priority-, score-, ranking-, or
 * execution-specific field can enter; both arrays compose the existing
 * KnowledgeItem contract unchanged and may be empty.
 */
export const selectionResultSchema = z
  .object({
    /** Provenance: the request this selection answered. */
    metadata: selectionResultMetadataSchema,
    /**
     * Knowledge selected to continue through the pipeline (may be empty). Ordered —
     * the order is the canonical contract Assembly consumes as provided.
     */
    selectedItems: z.array(knowledgeItemSchema),
    /**
     * Knowledge selection did not carry forward (may be empty). Preserved unchanged
     * to support future explainability without re-running selection.
     */
    excludedItems: z.array(knowledgeItemSchema),
  })
  .strict();

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a
 * parsed contract is immutable at runtime as well as in the types.
 */
function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}

/**
 * Validate an unknown value against the `SelectionResult` contract and return a
 * deeply-immutable result. Throws a `ZodError` if validation fails (invalid
 * shape, unknown keys, a malformed metadata request, or a malformed selected/
 * excluded item).
 */
export function parseSelectionResult(input: unknown): SelectionResult {
  return deepFreeze(selectionResultSchema.parse(input));
}
