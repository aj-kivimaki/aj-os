/**
 * Assembly module — public surface.
 *
 * Exposes the Assembly Engine service boundary — the `createAssemblyEngine()`
 * factory and the `AssemblyEngine` contract (CB-019, extended by CB-022). CB-019
 * established the boundary; CB-022 adds the `assemble(selectionResult, generatedAt)`
 * stage operation to the same interface, realizing the frozen CB-020
 * section-composition strategy and CB-021 metadata composition as deterministic
 * behaviour. The `assemble` behaviour itself (`assembleContext`) and its
 * composition helpers remain private — only the factory and interface are public,
 * mirroring how the Selection Engine keeps `selectKnowledge` internal. Consumers
 * never instantiate implementation classes.
 *
 * No `schema.ts`: the Assembly Engine introduces no new data contract — its future
 * output is the frozen CB-003 `ContextPackage` — so its interface is co-located
 * with its factory, mirroring the Selection Engine boundary.
 */

export { createAssemblyEngine } from "./createAssemblyEngine.js";
export type { AssemblyEngine } from "./createAssemblyEngine.js";
