/**
 * Provider execution — deterministic partial collection (CB-010).
 *
 * This is the first *runtime behaviour* of the Collection Engine (CB-007). It
 * executes every registered {@link KnowledgeProvider} against a single
 * {@link KnowledgeRequest} and assembles the outcome into an immutable
 * {@link CollectionResult} (CB-009):
 *
 *   ProviderRegistry + KnowledgeRequest → collectKnowledge → CollectionResult
 *
 * Collection is **partial**: a single provider failure never aborts collection.
 * A provider that resolves contributes its {@link KnowledgeItem}s; a provider
 * that rejects contributes exactly one {@link CollectionError} (CB-008). Both
 * travel together in the returned result.
 *
 * Collection is **deterministic**: the Provider Registry order is authoritative.
 * Providers are executed concurrently, but provider *completion* order never
 * influences the result — settled outcomes are walked back in registry index
 * order, so the same registry and request always yield the same result shape.
 *
 * This function is **stateless** and **provider-agnostic**: it knows only the
 * `KnowledgeProvider` contract and creates no persistent runtime state. It does
 * not retry, recover, log, apply any error policy, rank, filter, deduplicate or
 * assemble a Context Package — those belong to later milestones. Failures are
 * represented **exclusively** as `CollectionError` data (never re-thrown once
 * collection has begun).
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
 * message or string reason is used verbatim; anything else falls back to a
 * stable generic message so the CB-008 `message` (min length 1) is always
 * satisfied deterministically.
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
 * The engine sees only an opaque promise rejection, so it cannot deterministically
 * distinguish `invalid-request` or `provider-unavailable`; every rejection is
 * mapped to the provider-agnostic catch-all `provider-error` (CB-008). The `id`
 * is derived from the provider's `id`, which the registry guarantees is unique,
 * so failure ids are unique and stable across runs. Built via
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
 * Providers run concurrently via `Promise.allSettled`, which preserves the input
 * (registry) order in its results regardless of completion timing. Results are
 * then walked in registry index order so ordering is authoritative and completion
 * order is irrelevant. Fulfilled providers contribute their items in provider
 * order; rejected providers contribute one `CollectionError`. The assembled
 * result is constructed through `parseCollectionResult` (CB-009), which validates
 * and deep-freezes it, guaranteeing immutable output.
 */
export async function collectKnowledge(
  registry: ProviderRegistry,
  request: KnowledgeRequest,
): Promise<CollectionResult> {
  // Execute every provider concurrently, keeping each outcome paired with its
  // provider. `Promise.all` preserves the registry (input) order in its resolved
  // array regardless of completion timing, so ordering stays authoritative. Each
  // provider's rejection is captured as a CollectionError here — never re-thrown —
  // so a single failure cannot abort collection.
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

  // Aggregate in registry order — completion order is irrelevant.
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
