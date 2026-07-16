/**
 * Workflow barrel — the orchestrator and the module's public entry point (EOS-406).
 *
 * `createSessionWorkflow` sequences the injected stages; `EndOfSessionWorkflow.run` is the
 * single public operation the whole module exists to expose.
 */

export { createSessionWorkflow } from "./createSessionWorkflow.js";
export type { SessionWorkflowDeps } from "./createSessionWorkflow.js";
export type { EndOfSessionWorkflow } from "./EndOfSessionWorkflow.js";
