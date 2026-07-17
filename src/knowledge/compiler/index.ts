/** Knowledge Compiler — the LLM synthesis seam (INGEST). */
export type {
  KnowledgeCompiler,
  CompiledPage,
  CompiledPageKind,
  ExtractedKnowledge,
  TextGenerator,
} from "./KnowledgeCompiler.js";
export { CompilerError } from "./KnowledgeCompiler.js";
export {
  createAnthropicKnowledgeCompiler,
  type AnthropicKnowledgeCompilerConfig,
} from "./createAnthropicKnowledgeCompiler.js";
export {
  sourceExtractionSchema,
  parseExtraction,
  type SourceExtraction,
  type EntityType,
} from "./extraction.js";
export { buildCompilePrompt } from "./prompt.js";
export {
  createLlmMergeEngine,
  type MergeEngine,
  type MergeOutcome,
  type MergeMode,
  type MergeProposal,
} from "./merge.js";
export {
  parsePage,
  serializePage,
  readFrontmatter,
  patchFrontmatter,
  carryLearnedMetadata,
  extractLinks,
  extractCallouts,
  type ParsedPage,
  type Frontmatter,
} from "./regions.js";
