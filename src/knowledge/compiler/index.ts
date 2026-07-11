/**
 * Knowledge Compiler — the LLM synthesis seam (SPEC-005 INGEST).
 */
export type {
  KnowledgeCompiler,
  CompiledKnowledge,
  CompiledPage,
  CompiledPageKind,
  TextGenerator,
} from "./KnowledgeCompiler.js";
export { CompilerError } from "./KnowledgeCompiler.js";
export {
  createAnthropicKnowledgeCompiler,
  type AnthropicKnowledgeCompilerConfig,
} from "./AnthropicKnowledgeCompiler.js";
export {
  sourceExtractionSchema,
  parseExtraction,
  type SourceExtraction,
  type EntityType,
} from "./extraction.js";
export { renderPages, slugify } from "./render.js";
export { buildCompilePrompt } from "./prompt.js";
