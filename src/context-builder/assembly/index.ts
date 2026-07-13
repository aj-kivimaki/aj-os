/**
 * Assembly module — public surface.
 *
 * Exposes the `createAssemblyEngine()` factory and the `AssemblyEngine` contract.
 * The `assemble` behaviour (`assembleContext`) and its composition helpers stay
 * private. There is no `schema.ts`: Assembly introduces no new data contract — its
 * output is the `ContextPackage` — so its interface lives with its factory.
 */

export { createAssemblyEngine } from "./createAssemblyEngine.js";
export type { AssemblyEngine } from "./createAssemblyEngine.js";
