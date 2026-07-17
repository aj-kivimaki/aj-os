/**
 * Projection stage barrel — the human-readable view of the canonical candidates
 * (EOS-403).
 *
 * The `ReviewPackage` *contract* lives in `contracts/review-package/`; this module is
 * the stage that *renders* one from the canonical `CandidateKnowledge[]` + `Session`.
 */

export { createReviewPackageProjector } from "./createReviewPackageProjector.js";
export type { ReviewPackageProjector } from "./ReviewPackageProjector.js";
