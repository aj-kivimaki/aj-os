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

/**
 * Runtime schema for the Context Builder public configuration contract.
 *
 * All three fields are **reserved surface (CB-002): accepted and validated, but
 * not yet consumed** by the current assembly implementation. Assembly emits
 * fixed, structurally valid placeholders regardless of their values
 * (`assembleContext.ts` — empty explainability, empty summary), so today
 * `outputFormat: "json"` produces output identical to `"markdown"`, and
 * `explainability` and `profile` do not alter the result. This is documented,
 * not removed: they are an intentional forward contract, and implementing them
 * (profile-weighted ranking, an explainability report, format dispatch) is
 * platform evolution deferred to a specification, not Repository Excellence work
 * (REX-D5, F-041).
 */
export const contextBuilderConfigSchema = z
  .object({
    /** Reserved: intended ranking profile; not yet applied during assembly. */
    profile: z.enum(CONTEXT_PROFILES),
    /** Reserved: intended explainability toggle; no report is produced yet. */
    explainability: z.boolean(),
    /** Reserved: intended output rendering; assembly emits one format today. */
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
