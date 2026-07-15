/**
 * KnowledgeExtraction contract types, inferred from the Zod schemas and wrapped in
 * `DeepReadonly` so the runtime and compile-time contracts can never drift and the
 * extraction is immutable at every level (the module convention).
 */

import type { z } from "zod";

import type { DeepReadonly } from "../immutable.js";

import type {
  extractionKindSchema,
  extractionSummarySchema,
  knowledgeExtractionSchema,
  knowledgeFindingSchema,
} from "./schema.js";

/** The model's validated structured findings for one session (internal pipeline contract). */
export type KnowledgeExtraction = DeepReadonly<
  z.infer<typeof knowledgeExtractionSchema>
>;

/** A single reusable-knowledge finding within an extraction. */
export type KnowledgeFinding = DeepReadonly<
  z.infer<typeof knowledgeFindingSchema>
>;

/** The session summary carried by an extraction. */
export type ExtractionSummary = DeepReadonly<
  z.infer<typeof extractionSummarySchema>
>;

/** A finding's kind — a soft hint (see `extractionKindSchema`). */
export type ExtractionKind = z.infer<typeof extractionKindSchema>;
