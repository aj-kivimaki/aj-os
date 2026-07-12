/**
 * Identity Resolution contracts — ADR-005.
 */
export type {
  IdentityResolver,
  Candidate,
  ExistingPage,
  Resolution,
  PageKind,
} from "./IdentityResolver.js";
export { createSlugIdentityResolver } from "./createSlugIdentityResolver.js";
export {
  createSemanticIdentityResolver,
  type SemanticIdentityResolverConfig,
} from "./createSemanticIdentityResolver.js";
