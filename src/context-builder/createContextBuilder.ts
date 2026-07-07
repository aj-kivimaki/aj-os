/**
 * Context Builder public factory (CB-002).
 *
 * Exposes the modern functional service pattern: consumers call
 * `createContextBuilder(config)` and never instantiate internal classes.
 */

import { parseContextBuilderConfig } from "./config/index.js";

import type { ContextBuilderConfig } from "./config/index.js";

/**
 * Public Context Builder handle.
 *
 * CB-002 defines the stable interface only. The validated, immutable
 * configuration is exposed; behaviour (collection, ranking, assembly,
 * explainability) is added by later Milestone M1+ tasks through this interface.
 */
export interface ContextBuilder {
  /** The validated, frozen configuration supplied at construction. */
  readonly config: ContextBuilderConfig;
}

/**
 * Create a Context Builder from a configuration object.
 *
 * The configuration is validated at runtime (Zod) and frozen; the returned
 * handle is immutable. Invalid configuration throws a `ZodError`.
 *
 * @example
 * const builder = createContextBuilder({
 *   profile: "implementation",
 *   explainability: true,
 *   outputFormat: "markdown",
 * });
 */
export function createContextBuilder(
  config: ContextBuilderConfig,
): ContextBuilder {
  const validated = parseContextBuilderConfig(config);
  return Object.freeze({ config: validated });
}
