/**
 * CandidateKnowledge contract types, inferred from the Zod schemas and wrapped in
 * `DeepReadonly` so the runtime and compile-time contracts can never drift and the
 * candidate is immutable at every level.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../immutable.js";

import type {
  candidateKindSchema,
  candidateKnowledgeSchema,
  candidateProvenanceSchema,
} from "./schema.js";

/** The canonical SPEC-003 → SPEC-004 unit of proposed knowledge (EOS-D1, EOS-D4). */
export type CandidateKnowledge = DeepReadonly<z.infer<typeof candidateKnowledgeSchema>>;

/** Complete provenance for a candidate — traceable back to its session and sources. */
export type CandidateProvenance = DeepReadonly<z.infer<typeof candidateProvenanceSchema>>;

/** The kind of proposed knowledge — the declared SPEC-003 §8 taxonomy. */
export type CandidateKind = z.infer<typeof candidateKindSchema>;
