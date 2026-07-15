/**
 * Knowledge Extraction stage — public surface: the `TextGenerator` seam, the
 * `KnowledgeExtractor` interface, the deterministic `buildExtractionPrompt`, and the
 * `createKnowledgeExtractor` factory that wires prompt → generate → parse. The
 * validated `KnowledgeExtraction` contract it produces lives in `contracts/` (EOS-201).
 */

export { createKnowledgeExtractor } from "./createKnowledgeExtractor.js";
export type { KnowledgeExtractorConfig } from "./createKnowledgeExtractor.js";
export { buildExtractionPrompt } from "./prompt.js";
export type { KnowledgeExtractor, TextGenerator } from "./TextGenerator.js";
