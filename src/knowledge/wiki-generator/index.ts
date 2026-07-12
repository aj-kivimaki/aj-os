/**
 * Wiki Generator contract and implementation — SPEC-005.
 */
export {
  createWikiGenerator,
  WikiGeneratorError,
} from "./createWikiGenerator.js";
export type {
  WikiGenerator,
  WikiGeneratorConfig,
  GenerationMode,
  RunOptions,
  PageStatus,
  RemovalProposal,
  LintKind,
  LintFinding,
  LintReport,
  GenerationReport,
} from "./WikiGenerator.js";
