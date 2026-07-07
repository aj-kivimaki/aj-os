/**
 * Context Builder module — public entry point.
 *
 * The Context Builder assembles the smallest, highest-value Context Package
 * required for a coding agent to complete a single task (see SPEC-002).
 *
 * This is the sole public surface of the module; internal components remain
 * private and are re-exported here as they are implemented.
 *
 * Scope note: CB-001 established the module boundary; CB-002 adds the public
 * configuration contract and the `createContextBuilder()` factory. Knowledge
 * providers, collection, ranking, assembly, profiles and explainability
 * behaviour are delivered by later Milestone M1+ tasks.
 */

/** Identity of the Context Builder agent (see AJS-004 required metadata). */
export const CONTEXT_BUILDER = {
  id: "context-builder",
  name: "Context Builder",
  version: "0.1.0",
  category: "context",
  description:
    "Assembles deterministic, explainable Context Packages from approved AJ-OS knowledge sources.",
} as const;

// Public factory and handle (CB-002).
export { createContextBuilder } from "./createContextBuilder.js";
export type { ContextBuilder } from "./createContextBuilder.js";

// Public configuration contract (CB-002).
export {
  contextBuilderConfigSchema,
  parseContextBuilderConfig,
  CONTEXT_PROFILES,
  OUTPUT_FORMATS,
} from "./config/index.js";
export type {
  ContextBuilderConfig,
  ContextProfile,
  OutputFormat,
} from "./config/index.js";
