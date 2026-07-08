/**
 * CollectionResult contract — runtime schema (CB-009).
 *
 * Defines the runtime-validated, public **CollectionResult contract**: the
 * canonical, complete, deterministic outcome of knowledge collection. Under the
 * Context Builder's **partial-collection** model a single provider failure never
 * aborts collection — a provider contributes *either* KnowledgeItems *or* a
 * CollectionError, and the result aggregates **both** (SPEC-002 §15; CB-009).
 *
 * A `CollectionResult` therefore carries three stable platform concepts:
 *
 *   metadata · items · errors
 *
 * - `metadata` is the **provenance** of the collection — the `KnowledgeRequest`
 *   (CB-004) this result answers. It is reused wholesale (composition, not
 *   duplication), mirroring how the CB-003 Context Package metadata records
 *   `project`/`task`/`branch`/`commit`. It is deterministic and provider-agnostic.
 * - `items` compose the CB-004 `knowledgeItemSchema`.
 * - `errors` compose the CB-008 `collectionErrorSchema`.
 *
 * This task defines *what a completed collection is*, not *how it is produced*.
 * No provider execution, collection engine behaviour, ranking, selection,
 * duplicate detection, Context Package generation, retry, recovery, logging or
 * timing lives here. The contract is deterministic and immutable:
 * `parseCollectionResult()` validates then deep-freezes. An empty `errors`
 * collection is a valid result; a result carrying both items and errors is a
 * valid *partial* outcome; an empty result (no items, no errors) is also valid.
 */

import { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";
import {
  knowledgeItemSchema,
  knowledgeRequestSchema,
} from "../../providers/schema.js";
import { collectionErrorSchema } from "../errors/schema.js";

import type { CollectionResult } from "./types.js";

/**
 * Provenance metadata for a collection result.
 *
 * A `CollectionResult` records *which request it answered*. That provenance is
 * exactly a {@link knowledgeRequestSchema} (`{ project, task, branch?, commit?,
 * issue? }`), so the request contract is **reused** rather than redefined —
 * composition mirroring how a `KnowledgeItem`'s `source` reuses the CB-003
 * source-reference contract. Reusing the schema also guarantees the metadata can
 * never drift from the request the collection was run for.
 *
 * The metadata is deliberately provenance only. Execution-specific information —
 * timestamps, durations, retry counts, token estimates, diagnostics or provider
 * internals — is **not** part of this contract (it would break determinism and
 * leak implementation detail).
 */
export const collectionResultMetadataSchema = knowledgeRequestSchema;

/**
 * The CollectionResult contract.
 *
 * The complete, deterministic outcome of knowledge collection: the request that
 * was collected for (`metadata`), the collected {@link knowledgeItemSchema}s, and
 * the {@link collectionErrorSchema}s for providers that failed. The schema is
 * `.strict()` so no execution-, ranking- or selection-specific fields can enter
 * the contract; `items` and `errors` compose the existing CB-004 and CB-008
 * contracts unchanged. Both arrays may be empty.
 */
export const collectionResultSchema = z
  .object({
    /** Provenance: the request this collection answered (CB-004, reused). */
    metadata: collectionResultMetadataSchema,
    /** Knowledge collected from providers (CB-004; may be empty). */
    items: z.array(knowledgeItemSchema),
    /**
     * Per-provider failures collected under partial collection (CB-008; may be
     * empty). An empty collection means every provider that ran either
     * contributed items or found nothing — no provider failed.
     */
    errors: z.array(collectionErrorSchema),
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
 * Validate an unknown value against the `CollectionResult` contract and return a
 * deeply-immutable result. Throws a `ZodError` if validation fails (invalid
 * shape, unknown keys, a malformed metadata request, or a malformed item/error).
 */
export function parseCollectionResult(input: unknown): CollectionResult {
  return deepFreeze(collectionResultSchema.parse(input));
}
