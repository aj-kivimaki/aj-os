/**
 * Alias-aware resolver — a composable decorator around any
 * {@link IdentityResolver}.
 *
 * Before the inner resolver's lexical and LLM stages, it checks whether the
 * candidate's name matches a same-kind page's canonical title or a learned `alias`
 * (normalized). A match resolves deterministically to `existing` — no LLM, no
 * false-merge risk, because aliases are human-approved. This is how reviewed
 * decisions "teach" the resolver without changing the underlying policy or
 * thresholds.
 *
 * **Staging status (ADR-006 Phase 1, Accepted):** this decorator is the
 * "alias-aware resolver decorator" ADR-006 §Rollout names as Phase 1. It is
 * implemented and tested but **not yet wired into the composition root** — the
 * only pipeline (`createKnowledgePipeline`) currently uses
 * `createSlugIdentityResolver`. It is deliberate staging ahead of its phase, not
 * dead code; wiring it is ADR-006 Phase 1 delivery, not Repository Excellence
 * work (REX-D5, F-042).
 */
import { slugify } from "../naming.js";

import type {
  Candidate,
  ExistingPage,
  IdentityResolver,
  Resolution,
} from "./IdentityResolver.js";

export function createAliasAwareResolver(inner: IdentityResolver): IdentityResolver {
  return {
    resolve: async (
      candidate: Candidate,
      existing: readonly ExistingPage[],
    ): Promise<Resolution> => {
      const key = slugify(candidate.name);
      for (const page of existing) {
        if (page.kind !== candidate.kind) {
          continue;
        }
        const known =
          slugify(page.title) === key ||
          page.aliases.some((alias) => slugify(alias) === key);
        if (known) {
          return {
            kind: "existing",
            targetPath: page.path,
            confidence: 1,
            explanation: `known identity: matches title/alias of ${page.path}`,
          };
        }
      }
      return inner.resolve(candidate, existing);
    },
  };
}
