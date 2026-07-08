/**
 * Provider Registry — public surface (CB-005).
 *
 * Exposes the immutable Provider Registry: the `createProviderRegistry()`
 * factory and the `ProviderRegistry` contract. Internal construction details
 * remain private — consumers never instantiate implementation classes.
 */

export { createProviderRegistry } from "./createProviderRegistry.js";
export type { ProviderRegistry } from "./createProviderRegistry.js";
