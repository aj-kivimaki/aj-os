/**
 * KnowledgeExtraction contract — public surface of the extraction stage's output
 * vocabulary. Exposes the schemas, the raw-response parser, the domain error, the
 * kind hint set, and the inferred immutable types.
 */

export {
  knowledgeExtractionSchema,
  knowledgeFindingSchema,
  extractionSummarySchema,
  extractionKindSchema,
  parseExtractionResponse,
  ExtractionError,
  EXTRACTION_KINDS,
} from "./schema.js";

export type {
  KnowledgeExtraction,
  KnowledgeFinding,
  ExtractionSummary,
  ExtractionKind,
} from "./types.js";
