/**
 * CandidateKnowledge — public surface of the canonical SPEC-003 → SPEC-004 boundary
 * contract (EOS-D1, EOS-D4). Exposes the schema, validator, the declared kind
 * taxonomy, and inferred immutable types. This is the narrow surface SPEC-004
 * imports; it pulls in no End-of-Session services or analyzers.
 */

export {
  candidateKnowledgeSchema,
  candidateProvenanceSchema,
  candidateKindSchema,
  parseCandidateKnowledge,
  CANDIDATE_KINDS,
} from "./schema.js";

export type {
  CandidateKnowledge,
  CandidateProvenance,
  CandidateKind,
} from "./types.js";
