/**
 * SelectionResult contract — public surface (CB-014).
 *
 * Exposes the platform's canonical selection-outcome contract: the schema, the
 * `parseSelectionResult()` validator and the inferred immutable types. It defines
 * *what a completed selection is* — ordered selected items and excluded items
 * together, plus the request provenance — not how selection is performed. Later
 * Milestone M3 tasks construct a `SelectionResult` (CB-015 Selection Policy,
 * CB-016 selection execution); no selection behaviour is introduced here.
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
