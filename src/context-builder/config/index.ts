/**
 * Context Builder configuration — public surface of the config contract.
 */

export {
  contextBuilderConfigSchema,
  parseContextBuilderConfig,
  CONTEXT_PROFILES,
  OUTPUT_FORMATS,
} from "./schema.js";

export type {
  ContextBuilderConfig,
  ContextProfile,
  OutputFormat,
} from "./types.js";
