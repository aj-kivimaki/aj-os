/**
 * Knowledge Provider contracts — types.
 *
 * Data types are inferred from the Zod schemas and wrapped in `DeepReadonly` so the
 * runtime and compile-time contracts can never drift. `KnowledgeProvider` is a
 * behavioural contract (it has a method), so it is a TypeScript interface rather
 * than a schema — the sole abstraction every knowledge source implements.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../package/types.js";

import type {
  knowledgeItemSchema,
  knowledgeRequestSchema,
  providerMetadataSchema,
} from "./schema.js";

/** Immutable public request supplied to every provider. */
export type KnowledgeRequest = DeepReadonly<z.infer<typeof knowledgeRequestSchema>>;

/** Immutable canonical unit of knowledge returned by a provider. */
export type KnowledgeItem = DeepReadonly<z.infer<typeof knowledgeItemSchema>>;

/** Immutable static identity a provider advertises. */
export type ProviderMetadata = DeepReadonly<z.infer<typeof providerMetadataSchema>>;

/**
 * A source capable of contributing knowledge to the Context Builder.
 *
 * A provider identifies and describes itself (via {@link ProviderMetadata}),
 * receives a single immutable {@link KnowledgeRequest}, and contributes
 * {@link KnowledgeItem}s. Providers do **not** build Context Packages, rank or
 * format information, estimate tokens, or know about Context Builder
 * configuration.
 *
 * `provide` takes one immutable request object (never an expanding list of
 * primitive parameters) and is asynchronous so future file- or API-backed
 * providers satisfy the same contract without a signature change. The returned
 * array is `readonly`; the Context Builder owns collection, ordering and ranking.
 */
export interface KnowledgeProvider extends ProviderMetadata {
  /** Contribute the knowledge this provider can supply for the request. */
  provide(request: KnowledgeRequest): Promise<readonly KnowledgeItem[]>;
}
