/**
 * Collection Error contract — runtime schema (CB-008).
 *
 * Defines the runtime-validated, public **CollectionError contract**: the
 * deterministic, provider-agnostic description of a single knowledge-collection
 * failure. Under the Context Builder's **partial-collection** model a provider
 * contributes *either* KnowledgeItems *or* a `CollectionError`; a single failure
 * never aborts collection (SPEC-002 §15; CB-008 Failure Model).
 *
 * A `CollectionError` is a **data contract, not a thrown exception**. It carries
 * only stable platform concepts (an identifier, the failing provider, a failure
 * category and a human-readable message) — never provider-specific exceptions,
 * stack traces, timestamps or runtime objects. Error *representation* lives here;
 * error *handling* (retry, recovery, logging) does not.
 *
 * This task defines *what a collection failure is*, not *how it is produced or
 * handled*. No provider execution, `CollectionResult` (CB-009) or collection
 * behaviour lives here. The contract is deterministic and immutable:
 * `parseCollectionError()` validates then deep-freezes.
 */

import { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type { CollectionError } from "./types.js";

/**
 * The closed set of deterministic, provider-agnostic failure categories.
 *
 * A category classifies *why* a provider failed to contribute knowledge, without
 * exposing provider implementation details. The set is intentionally small and
 * closed (a `z.enum`, mirroring the CB-003 `SECTION_KINDS`/`REFERENCE_TYPES`
 * convention) so providers cannot leak implementation-specific error codes into
 * the platform contract. It is grounded in SPEC-002 §15 (Error Handling) and
 * AJS-004 (Failure Handling):
 *
 * - `invalid-request`      — the `KnowledgeRequest` was not valid for the
 *                            provider (a validation failure; cf. SPEC-002 §15
 *                            "Invalid task").
 * - `provider-unavailable` — the provider's knowledge source could not be
 *                            reached or read (cf. SPEC-002 §15 recoverable
 *                            "Missing …" sources).
 * - `provider-error`       — the provider failed unexpectedly while producing
 *                            knowledge (a provider-agnostic catch-all).
 *
 * A provider that simply finds nothing is **not** an error — it contributes an
 * empty set of KnowledgeItems. A `CollectionError` represents an actual failure.
 *
 * Note: this is a *failure classification*, not a recovery policy. Retry and
 * recoverability semantics are deliberately out of scope for this contract.
 */
export const FAILURE_CATEGORIES = [
  "invalid-request",
  "provider-unavailable",
  "provider-error",
] as const;

/**
 * The CollectionError contract.
 *
 * Represents a single, deterministic collection failure. Carries only stable
 * platform concepts; the schema is `.strict()` so no provider-specific fields
 * (exceptions, stack traces, transport details) can enter the contract.
 */
export const collectionErrorSchema = z
  .object({
    /** Stable identifier for this collection failure. */
    id: z.string().min(1),
    /**
     * Identifier of the provider that failed to contribute (CB-008 Inputs: a
     * provider `id` identifies the failing source). Provider-agnostic — the
     * platform knows only the provider's `id`, never its implementation.
     */
    providerId: z.string().min(1),
    /** Deterministic, provider-agnostic failure category. */
    category: z.enum(FAILURE_CATEGORIES),
    /** Human-readable description of the failure (not a stack trace). */
    message: z.string().min(1),
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
 * Validate an unknown value against the `CollectionError` contract and return a
 * deeply-immutable error. Throws a `ZodError` if validation fails (invalid
 * shape, unknown keys, an unknown `category`, or an empty required field).
 */
export function parseCollectionError(input: unknown): CollectionError {
  return deepFreeze(collectionErrorSchema.parse(input));
}
