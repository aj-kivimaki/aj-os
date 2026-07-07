/**
 * Context Builder configuration schema (CB-002).
 *
 * Defines the runtime-validated, public configuration contract. The schema is
 * `.strict()` and every field is required: the contract is explicit with no
 * hidden defaults (CB-002 design principles). Fields model stable platform
 * capabilities only — provider configuration, filesystem paths, token budgets
 * and environment settings are intentionally excluded from this task.
 */

import { z } from "zod";

import type { ContextBuilderConfig } from "./types.js";

/**
 * Context profiles defined by SPEC-002 §6. A profile influences ranking
 * weights but never changes the Context Package schema.
 */
export const CONTEXT_PROFILES = [
  "implementation",
  "debugging",
  "documentation",
  "review",
  "planning",
] as const;

/** Primary Context Package renderings defined by SPEC-002 §8. */
export const OUTPUT_FORMATS = ["markdown", "json"] as const;

/**
 * Runtime schema for the Context Builder public configuration contract.
 *
 * `.strict()` rejects unknown keys so the contract stays explicit.
 */
export const contextBuilderConfigSchema = z
  .object({
    /** Ranking profile applied when assembling context (SPEC-002 §6). */
    profile: z.enum(CONTEXT_PROFILES),
    /** Whether an explainability report is produced (SPEC-002 §8). */
    explainability: z.boolean(),
    /** Primary Context Package rendering (SPEC-002 §8). */
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
