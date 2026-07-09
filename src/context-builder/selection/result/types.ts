/**
 * SelectionResult contract — types (CB-014).
 *
 * Types are inferred from the Zod schema and wrapped in `DeepReadonly` so the
 * runtime contract and the compile-time contract can never drift, and so the
 * contract is immutable at every level (mirroring the runtime deep-freeze).
 *
 * `SelectionResult` is a plain immutable **data** type: the complete outcome of
 * selection (ordered selected items + excluded items) plus the request provenance
 * it answered. It carries no behaviour, no execution detail and no priority field.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type {
  selectionResultMetadataSchema,
  selectionResultSchema,
} from "./schema.js";

/**
 * Immutable provenance of a selection result — the `KnowledgeRequest` (CB-004)
 * the selection answered, carried forward from the CollectionResult. Reused, not
 * redefined.
 */
export type SelectionResultMetadata = DeepReadonly<
  z.infer<typeof selectionResultMetadataSchema>
>;

/**
 * The immutable SelectionResult contract — the complete deterministic outcome of
 * knowledge selection (metadata + ordered selectedItems + excludedItems). The
 * order of `selectedItems` is the public platform guarantee; the contract exposes
 * no explicit priority field.
 */
export type SelectionResult = DeepReadonly<z.infer<typeof selectionResultSchema>>;
