/**
 * Context Builder configuration types (CB-002).
 *
 * Types are inferred from the Zod schema so the runtime contract and the
 * compile-time contract can never drift.
 */

import type { z } from "zod";

import type { contextBuilderConfigSchema } from "./schema.js";

/** Immutable public configuration for the Context Builder. */
export type ContextBuilderConfig = Readonly<
  z.infer<typeof contextBuilderConfigSchema>
>;

/** Ranking profile applied when assembling context (SPEC-002 §6). */
export type ContextProfile = ContextBuilderConfig["profile"];

/** Primary Context Package rendering (SPEC-002 §8). */
export type OutputFormat = ContextBuilderConfig["outputFormat"];
