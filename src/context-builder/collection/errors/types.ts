/**
 * Collection Error contract — types.
 *
 * Inferred from the Zod schema and wrapped in `DeepReadonly` so the runtime and
 * compile-time contracts can never drift. `CollectionError` is a plain immutable
 * data type, not a JS `Error` subclass — the platform represents failures as
 * contracts, not exceptions.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type { collectionErrorSchema } from "./schema.js";

/** The immutable CollectionError contract (a single collection failure). */
export type CollectionError = DeepReadonly<z.infer<typeof collectionErrorSchema>>;

/** Provider-agnostic failure category. */
export type FailureCategory = z.infer<typeof collectionErrorSchema>["category"];
