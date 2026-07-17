/**
 * Knowledge Provider contracts — the Context Builder's public input contracts: how
 * a request for knowledge is expressed (`KnowledgeRequest`), the canonical unit of
 * knowledge a provider returns (`KnowledgeItem`), and the static identity a
 * provider advertises (`ProviderMetadata`).
 *
 * These define *how knowledge enters the platform*, not how it is collected,
 * ranked, or assembled. The contracts are minimal, provider-agnostic, and
 * immutable: every schema is `.strict()` and the parse helpers freeze their result.
 * A `KnowledgeItem`'s `source` reuses the `sourceReferenceSchema` so the same
 * citable-source contract flows unchanged into the Context Package's references.
 */

import { z } from "zod";

import { sourceReferenceSchema } from "../package/schema.js";
import { deepFreeze } from "../package/deepFreeze.js";

import type { KnowledgeItem, KnowledgeRequest } from "./types.js";

/**
 * The public input to every `KnowledgeProvider`. Carries only provider-agnostic
 * concepts that help a provider *locate* knowledge for a single task. `project`
 * and `task` are required; `branch`, `commit`, and `issue` are optional locators
 * for source-aware providers.
 *
 * The Context Profile and workflow type are deliberately excluded: those are
 * Context Builder configuration that drives ranking/assembly — a concern a provider
 * must not know about.
 */
export const knowledgeRequestSchema = z
  .object({
    project: z.string().min(1),
    task: z.string().min(1),
    branch: z.string().min(1).optional(),
    commit: z.string().min(1).optional(),
    issue: z.string().min(1).optional(),
  })
  .strict();

/**
 * The canonical unit of knowledge returned by a provider: an opaque body of
 * knowledge paired with a citable source. One source may yield many items;
 * `source` reuses the source-reference contract, keeping the item free of
 * filesystem paths, provider identities, and transport details. `content` is
 * opaque body text — providers contribute knowledge, not formatted context.
 */
export const knowledgeItemSchema = z
  .object({
    id: z.string().min(1),
    /** Citable knowledge source (reused, provider-agnostic contract). */
    source: sourceReferenceSchema,
    /** Opaque knowledge body. A knowledge item must carry knowledge. */
    content: z.string().min(1),
  })
  .strict();

/**
 * The static identity a provider advertises so the platform can identify and
 * describe it. Exposed as a schema (not just a type) so the provider registry can
 * validate providers at registration.
 */
export const providerMetadataSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    /** Human-readable description of what the provider contributes. */
    description: z.string().min(1),
  })
  .strict();

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a
 * parsed contract is immutable at runtime as well as in the types.
 */
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
