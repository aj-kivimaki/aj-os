/**
 * SelectionResult contract — types.
 *
 * Inferred from the Zod schema and wrapped in `DeepReadonly` so the runtime and
 * compile-time contracts can never drift. `SelectionResult` is a plain immutable
 * data type — no behaviour, no execution detail, no priority field.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../../package/types.js";

import type {
  selectionResultMetadataSchema,
  selectionResultSchema,
} from "./schema.js";

/**
 * Immutable provenance of a selection result — the `KnowledgeRequest` the selection
 * answered, carried forward from the CollectionResult. Reused, not redefined.
 */
export type SelectionResultMetadata = DeepReadonly<
  z.infer<typeof selectionResultMetadataSchema>
>;

/**
 * The immutable SelectionResult contract (metadata + ordered selectedItems +
 * excludedItems). The order of `selectedItems` is the public guarantee; there is
 * no explicit priority field.
 */
export type SelectionResult = DeepReadonly<z.infer<typeof selectionResultSchema>>;
