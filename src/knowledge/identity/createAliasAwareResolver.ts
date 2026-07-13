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
