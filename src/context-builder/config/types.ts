/**
 * Context Builder configuration types, inferred from the Zod schema so the runtime
 * and compile-time contracts can never drift.
 */

import type { z } from "zod";

import type { contextBuilderConfigSchema } from "./schema.js";

/** Immutable public configuration for the Context Builder. */
export type ContextBuilderConfig = Readonly<
  z.infer<typeof contextBuilderConfigSchema>
>;

/** Ranking profile applied when assembling context. */
export type ContextProfile = ContextBuilderConfig["profile"];

/** Primary Context Package rendering. */
export type OutputFormat = ContextBuilderConfig["outputFormat"];
