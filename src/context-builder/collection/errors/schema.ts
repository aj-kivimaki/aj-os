/**
 * CollectionError contract — the provider-agnostic description of a single
 * knowledge-collection failure.
 *
 * A `CollectionError` is a data contract, not a thrown exception. It carries only
 * stable platform concepts (an identifier, the failing provider, a failure
 * category, and a human-readable message) — never provider exceptions, stack
 * traces, or runtime objects. Error representation lives here; error handling
 * (retry, recovery, logging) does not. The contract is immutable:
 * `parseCollectionError()` validates then deep-freezes.
 */

import { z } from "zod";

import { deepFreeze } from "../../package/deepFreeze.js";

import type { CollectionError } from "./types.js";

/**
 * The closed set of provider-agnostic failure categories. Classifies *why* a
 * provider failed without exposing implementation details; a closed `z.enum` so
 * providers cannot leak their own error codes into the platform contract.
 *
 * - `invalid-request`      — the `KnowledgeRequest` was not valid for the provider.
 * - `provider-unavailable` — the provider's knowledge source could not be reached.
 * - `provider-error`       — the provider failed unexpectedly (catch-all).
 *
 * A provider that simply finds nothing is not an error — it contributes an empty
 * set of items. This is a failure classification, not a recovery policy.
 */
export const FAILURE_CATEGORIES = [
  "invalid-request",
  "provider-unavailable",
  "provider-error",
] as const;

/**
 * The CollectionError contract. `.strict()` so no provider-specific fields
 * (exceptions, stack traces, transport details) can enter.
 */
export const collectionErrorSchema = z
  .object({
    /** Stable identifier for this collection failure. */
    id: z.string().min(1),
    /** Id of the failing provider — the platform knows only this, never its guts. */
    providerId: z.string().min(1),
    category: z.enum(FAILURE_CATEGORIES),
    /** Human-readable description of the failure (not a stack trace). */
    message: z.string().min(1),
  })
  .strict();

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a
 * parsed contract is immutable at runtime as well as in the types.
 */
/**
 * Validate an unknown value against the `CollectionError` contract and return a
 * deeply-immutable error. Throws a `ZodError` if validation fails (invalid
 * shape, unknown keys, an unknown `category`, or an empty required field).
 */
export function parseCollectionError(input: unknown): CollectionError {
  return deepFreeze(collectionErrorSchema.parse(input));
}
