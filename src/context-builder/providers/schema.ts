/**
 * Knowledge Provider contracts — runtime schemas (CB-004).
 *
 * Defines the runtime-validated, public **input contracts** of the Context
 * Builder: how a request for knowledge is expressed (`KnowledgeRequest`), and
 * the canonical unit of knowledge a provider returns (`KnowledgeItem`), plus the
 * static identity a provider advertises (`ProviderMetadata`).
 *
 * This task defines *how knowledge enters the platform* — not how it is
 * collected, ranked, deduplicated or assembled. No provider implementations,
 * registry, collection engine or Context Package generation live here.
 *
 * The contracts are intentionally minimal, provider-agnostic and immutable:
 * every schema is `.strict()` (no hidden fields), and the parse helpers freeze
 * their result. A `KnowledgeItem`'s `source` reuses the CB-003
 * `sourceReferenceSchema` so the same citable-source contract flows unchanged
 * from provider output into the Context Package's references.
 */

import { z } from "zod";

import { sourceReferenceSchema } from "../package/schema.js";
import type { DeepReadonly } from "../package/types.js";

import type {
  KnowledgeItem,
  KnowledgeRequest,
  ProviderMetadata,
} from "./types.js";

/**
 * The public input to every `KnowledgeProvider`.
 *
 * Carries only stable, provider-agnostic platform concepts that help a provider
 * *locate* knowledge relevant to a single task (SPEC-002 §7 Inputs). `project`
 * and `task` are required; `branch`, `commit` and `issue` are optional locators
 * used by source-aware providers (e.g. future Git/GitHub/Jira providers) and
 * mirror the provenance already carried by the Context Package (CB-003).
 *
 * Deliberately excluded: the Context Profile and workflow type. Those are
 * Context Builder *configuration* and drive ranking/assembly — concerns a
 * provider must not know about. Future milestones may extend this contract
 * without changing the `KnowledgeProvider` interface.
 */
export const knowledgeRequestSchema = z
  .object({
    /** Project the knowledge is requested for (SPEC-002 §7, required). */
    project: z.string().min(1),
    /** Task the knowledge is requested for (SPEC-002 §7, required). */
    task: z.string().min(1),
    /** Optional source branch locator (SPEC-002 §7). */
    branch: z.string().min(1).optional(),
    /** Optional source commit locator (SPEC-002 §7). */
    commit: z.string().min(1).optional(),
    /** Optional issue/ticket locator (SPEC-002 §7). */
    issue: z.string().min(1).optional(),
  })
  .strict();

/**
 * The canonical unit of knowledge returned by a provider.
 *
 * A `KnowledgeItem` pairs an opaque body of knowledge with a citable source.
 * `id` uniquely identifies the item (one source may yield many items); `source`
 * reuses the CB-003 source-reference contract (`{ id, type, title, locator? }`),
 * keeping the item free of filesystem paths, provider identities and transport
 * details. `content` is opaque body text — providers contribute knowledge, not
 * formatted context.
 */
export const knowledgeItemSchema = z
  .object({
    /** Stable unique identifier for this knowledge item. */
    id: z.string().min(1),
    /** Citable knowledge source (reused CB-003 contract; provider-agnostic). */
    source: sourceReferenceSchema,
    /** Opaque knowledge body. A knowledge item must carry knowledge. */
    content: z.string().min(1),
  })
  .strict();

/**
 * The static identity a provider advertises so the platform can identify and
 * describe it. Exposed as a schema (not just a type) so a future provider
 * registry (CB-005) can validate providers at registration without this task
 * implementing any registry behaviour.
 */
export const providerMetadataSchema = z
  .object({
    /** Stable provider identifier (identifies the provider). */
    id: z.string().min(1),
    /** Human-readable provider name (describes the provider). */
    name: z.string().min(1),
    /** Human-readable description of what the provider contributes. */
    description: z.string().min(1),
  })
  .strict();

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a
 * parsed contract is immutable at runtime as well as in the types.
 */
function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}

/**
 * Validate an unknown value against the `KnowledgeRequest` contract and return
 * an immutable request. Throws a `ZodError` if validation fails (invalid shape
 * or unknown keys).
 */
export function parseKnowledgeRequest(input: unknown): KnowledgeRequest {
  return deepFreeze(knowledgeRequestSchema.parse(input));
}

/**
 * Validate an unknown value against the `KnowledgeItem` contract and return a
 * deeply-immutable item. Throws a `ZodError` if validation fails (invalid shape,
 * unknown keys, or empty `content`).
 */
export function parseKnowledgeItem(input: unknown): KnowledgeItem {
  return deepFreeze(knowledgeItemSchema.parse(input));
}
