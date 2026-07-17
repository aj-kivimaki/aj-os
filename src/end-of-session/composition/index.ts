/**
 * Composition barrel — the End-of-Session Workflow's assembly point (EOS-407).
 *
 * Mirrors `src/knowledge/composition/`: entry points ask this module for a ready-to-run
 * workflow and never construct a stage themselves.
 */

export { createEndOfSessionWorkflow } from "./createEndOfSessionWorkflow.js";
export type {
  EndOfSessionPipeline,
  EndOfSessionWorkflowDeps,
} from "./createEndOfSessionWorkflow.js";
