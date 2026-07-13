/**
 * Slug Identity Resolver — the deterministic default.
 *
 * A candidate's canonical path is its slug path; it resolves to an existing page
 * iff a page already exists at that path, otherwise new. No LLM, always
 * confidence 1. The semantic resolver slots in behind the same interface.
 */
import { pagePathFor } from "../naming.js";

import type {
  Candidate,
  ExistingPage,
  IdentityResolver,
  Resolution,
} from "./IdentityResolver.js";

export function createSlugIdentityResolver(): IdentityResolver {
  return {
    resolve: async (
      candidate: Candidate,
      existing: readonly ExistingPage[],
    ): Promise<Resolution> => {
      const path = pagePathFor(candidate.kind, candidate.name);
      const match = existing.some((page) => page.path === path);
      return match
        ? {
            kind: "existing",
            targetPath: path,
            confidence: 1,
            explanation: `exact slug match (${path})`,
          }
        : { kind: "new", confidence: 1, explanation: "no existing page at slug path" };
    },
  };
}
