/**
 * The Projection stage — the human-readable view of the canonical candidates.
 *
 * `CandidateKnowledge[]` is the canonical output of SPEC-003; the `ReviewPackage` is a
 * **deterministic rendering of it** (EOS-D4), produced for the human at the review
 * gate. The projector is the workflow's one markdown-aware stage, exactly as
 * `createWikiRenderer` is the Knowledge Platform's.
 *
 * "Projection" is a claim with teeth: the package is derived, regenerable from the
 * review store at any time, and **never read back as data**. Nothing in AJ-OS parses
 * it, and nothing may come to depend on its layout as a format.
 */

import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { ReviewPackage } from "../contracts/review-package/index.js";
import type { Session } from "../contracts/session/index.js";

export interface ReviewPackageProjector {
  /**
   * Render the review package for a session's canonical candidates.
   *
   * A **pure function**: the same candidates, session, and `generatedAt` always yield
   * a deep-equal package. `generatedAt` is a parameter rather than an injected clock
   * because the stage must be a pure function of its explicit inputs — orchestration
   * reads the clock once per run and passes the instant in (the Context Builder
   * `generated_at` precedent).
   *
   * Renders **every** candidate, in canonical order, and invents nothing: it does not
   * filter, rank, deduplicate, merge, or summarize a candidate away. Presentation, not
   * editorial. An empty candidate list is a valid review — the package says so plainly
   * rather than failing.
   *
   * Everything it shows derives from `candidates` and `session` alone. In particular
   * it never reads the internal `KnowledgeExtraction`: that contract is not persisted,
   * so any field sourced from it could not be reproduced from the review store,
   * breaking the regenerability EOS-D4 depends on.
   */
  project(
    candidates: readonly CandidateKnowledge[],
    session: Session,
    generatedAt: string,
  ): ReviewPackage;
}
