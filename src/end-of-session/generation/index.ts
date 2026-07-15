/**
 * Candidate Generation stage — public surface: the `CandidateGenerator` interface and
 * the `createCandidateGenerator` factory that deterministically maps a
 * `KnowledgeExtraction` into the canonical `CandidateKnowledge[]` (EOS-D1/D4). The
 * `CandidateKnowledge` contract it produces lives in `contracts/` (EOS-003).
 */

export { createCandidateGenerator } from "./createCandidateGenerator.js";
export type { CandidateGeneratorConfig } from "./createCandidateGenerator.js";
export type { CandidateGenerator } from "./CandidateGenerator.js";
