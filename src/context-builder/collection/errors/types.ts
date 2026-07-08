/**
 * Collection Error contract — types (CB-008).
 *
 * Types are inferred from the Zod schema and wrapped in `DeepReadonly` so the
 * runtime contract and the compile-time contract can never drift, and so the
 * contract is immutable at every level (mirroring the runtime deep-freeze).
 *
 * `CollectionError` is a plain immutable **data** type, not a JS `Error`
 * subclass — the platform represents failures as contracts, not exceptions.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type { collectionErrorSchema } from "./schema.js";

/** The immutable CollectionError contract (a single collection failure). */
export type CollectionError = DeepReadonly<z.infer<typeof collectionErrorSchema>>;

/** Deterministic, provider-agnostic failure category (CB-008). */
export type FailureCategory = z.infer<typeof collectionErrorSchema>["category"];
