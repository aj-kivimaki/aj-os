/**
 * SelectionResult contract — public surface: the schema, the
 * `parseSelectionResult()` validator, and the inferred immutable types. Defines
 * *what a completed selection is* (ordered selected items and excluded items, plus
 * request provenance), not how selection is performed.
 */

export {
  selectionResultSchema,
  selectionResultMetadataSchema,
  parseSelectionResult,
} from "./schema.js";

export type {
  SelectionResult,
  SelectionResultMetadata,
} from "./types.js";
