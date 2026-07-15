/**
 * The Candidate Generation seam — the deterministic stage that turns the model's
 * validated findings into the workflow's canonical output.
 *
 * `CandidateGenerator` maps a {@link KnowledgeExtraction} into
 * `CandidateKnowledge[]` — the SPEC-003 → SPEC-004 boundary contract (EOS-D1/D4).
 * Unlike the Knowledge Extractor (the pipeline's one non-deterministic seam), this
 * stage is **fully deterministic**: given the same extraction, session, and clock it
 * returns a deep-equal result. It is where the model's advisory findings acquire
 * authoritative identity, provenance, and kind.
 *
 * The mapping is **one-to-one and structural** (the frozen Candidate Generation
 * Invariant): each finding produces exactly one candidate, in order — the generator
 * never merges, splits, reorders, invents, or removes findings. See
 * {@link createCandidateGenerator} for the field-level mapping.
 */

import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { KnowledgeExtraction } from "../contracts/knowledge-extraction/index.js";
import type { Session } from "../contracts/session/index.js";

/**
 * The Candidate Generation stage: map a session's {@link KnowledgeExtraction} into the
 * canonical `CandidateKnowledge[]`.
 *
 * Its responsibility is **deterministic structural mapping and provenance attachment
 * only**. It does not call the model, deduplicate against the Handbook, merge, score,
 * persist, project, approve, or publish — those live downstream (SPEC-004) or in other
 * stages (persistence is EOS-302; projection/orchestration are M5). The result is a
 * one-to-one, order-preserving image of `extraction.findings`.
 */
export interface CandidateGenerator {
  /**
   * Map every finding in `extraction` to a `CandidateKnowledge`, using `session` for
   * provenance. Returns candidates in finding order; an empty `findings` array yields
   * an empty result. `extraction.sessionId` must equal `session.id` (a mismatch is an
   * orchestration error and throws).
   */
  generate(
    extraction: KnowledgeExtraction,
    session: Session,
  ): CandidateKnowledge[];
}
