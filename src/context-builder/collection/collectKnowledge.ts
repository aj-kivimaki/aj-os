/**
 * Provider execution — deterministic partial collection.
 *
 *   ProviderRegistry + KnowledgeRequest → collectKnowledge → CollectionResult
 *
 * Collection is partial: a single provider failure never aborts collection. A
 * provider that resolves contributes its {@link KnowledgeItem}s; a provider that
 * rejects contributes exactly one {@link CollectionError}. Both travel together in
 * the returned result.
 *
 * Collection is deterministic: registry order is authoritative. Providers run
 * concurrently, but completion order never influences the result — settled
 * outcomes are walked back in registry index order. Failures are represented
 * exclusively as `CollectionError` data, never re-thrown once collection begins.
 */

import type { KnowledgeProvider, KnowledgeRequest } from "../providers/index.js";
import type { ProviderRegistry } from "../registry/index.js";

import { parseCollectionError } from "./errors/index.js";
import type { CollectionError } from "./errors/index.js";
import { parseCollectionResult } from "./result/index.js";
import type { CollectionResult } from "./result/index.js";

/**
 * Derive a human-readable failure message from an opaque rejection reason.
 *
 * The engine never inspects provider internals; it takes only the rejection's
 * message text (never a stack trace or runtime object). A non-empty `Error`
 * message or string reason is used verbatim; anything else falls back to a stable
 * generic message so the error's `message` is always non-empty and deterministic.
 */
function describeFailure(reason: unknown): string {
  if (reason instanceof Error && reason.message.length > 0) {
    return reason.message;
  }
  if (typeof reason === "string" && reason.length > 0) {
    return reason;
  }
  return "The provider failed to contribute knowledge.";
}

/**
 * Represent a single provider rejection as a deterministic `CollectionError`.
 *
 * The engine sees only an opaque promise rejection, so it cannot distinguish
 * `invalid-request` from `provider-unavailable`; every rejection maps to the
 * catch-all `provider-error`. The `id` derives from the provider's registry-unique
 * `id`, so failure ids are unique and stable across runs. Built via
 * `parseCollectionError`, so the error is validated and deep-frozen.
 */
function toCollectionError(
  provider: KnowledgeProvider,
  reason: unknown,
): CollectionError {
  return parseCollectionError({
    id: `collection-error:${provider.id}`,
    providerId: provider.id,
    category: "provider-error",
    message: describeFailure(reason),
  });
}

/**
 * Execute every registered provider and assemble a deterministic, immutable
 * `CollectionResult` under the partial-collection model.
 *
 * Providers run concurrently via `Promise.all`, each wrapped in its own try/catch
 * so it can never reject the batch. `Promise.all` preserves registry order
 * regardless of completion timing; fulfilled providers contribute their items,
 * rejected ones contribute one `CollectionError`. The result is built through
 * `parseCollectionResult`, which validates and deep-freezes it.
 */
export async function collectKnowledge(
  registry: ProviderRegistry,
  request: KnowledgeRequest,
): Promise<CollectionResult> {
  // Each provider's rejection is captured as a CollectionError rather than
  // re-thrown, so a single failure cannot abort the batch.
  const outcomes = await Promise.all(
    registry.providers.map(async (provider) => {
      try {
        const contributed = await provider.provide(request);
        return { items: contributed } as const;
      } catch (reason) {
        return { error: toCollectionError(provider, reason) } as const;
      }
    }),
  );

  const items: unknown[] = [];
  const errors: CollectionError[] = [];

  for (const outcome of outcomes) {
    if ("error" in outcome) {
      errors.push(outcome.error);
    } else {
      for (const item of outcome.items) {
        items.push(item);
      }
    }
  }

  return parseCollectionResult({ metadata: request, items, errors });
}
