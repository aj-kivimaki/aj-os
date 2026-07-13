/**
 * Context Builder configuration schema — the public configuration contract.
 * `.strict()` with every field required: explicit, with no hidden defaults.
 * Provider configuration, filesystem paths, token budgets, and environment
 * settings are intentionally excluded.
 */

import { z } from "zod";

import type { ContextBuilderConfig } from "./types.js";

/**
 * Context profiles. A profile influences ranking weights but never changes the
 * Context Package schema.
 */
export const CONTEXT_PROFILES = [
  "implementation",
  "debugging",
  "documentation",
  "review",
  "planning",
] as const;

/** Primary Context Package renderings. */
export const OUTPUT_FORMATS = ["markdown", "json"] as const;

/** Runtime schema for the Context Builder public configuration contract. */
export const contextBuilderConfigSchema = z
  .object({
    /** Ranking profile applied when assembling context. */
    profile: z.enum(CONTEXT_PROFILES),
    /** Whether an explainability report is produced. */
    explainability: z.boolean(),
    outputFormat: z.enum(OUTPUT_FORMATS),
  })
  .strict();

/**
 * Validate an unknown value against the configuration contract and return an
 * immutable configuration.
 *
 * Throws a `ZodError` if validation fails.
 */
export function parseContextBuilderConfig(input: unknown): ContextBuilderConfig {
  return Object.freeze(contextBuilderConfigSchema.parse(input));
}
