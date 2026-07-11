/**
 * Anthropic-backed Knowledge Compiler (SPEC-005 INGEST, first slice).
 *
 * Wires the three deterministic pieces around the one non-deterministic step:
 * build the compilation prompt → generate (LLM) → parse+validate the JSON →
 * render pages. The LLM is reached through a {@link TextGenerator} (the
 * platform `AIClient`), so this composes without knowing any provider detail.
 */
import type { SourceRecord } from "../../ingestion/index.js";

import type {
  CompiledKnowledge,
  KnowledgeCompiler,
  TextGenerator,
} from "./KnowledgeCompiler.js";
import { parseExtraction } from "./extraction.js";
import { buildCompilePrompt } from "./prompt.js";
import { renderPages } from "./render.js";

/**
 * Token budget for a compilation. Larger than the concise-answer default: one
 * source compiles into a summary plus several entity/concept descriptions.
 */
const COMPILE_MAX_TOKENS = 4096;

export interface AnthropicKnowledgeCompilerConfig {
  /** The text-generation capability (e.g. the platform `AIClient`). */
  readonly generator: TextGenerator;
}

export function createAnthropicKnowledgeCompiler(
  config: AnthropicKnowledgeCompilerConfig,
  now: () => Date = () => new Date(),
): KnowledgeCompiler {
  async function compile(source: SourceRecord): Promise<CompiledKnowledge> {
    const prompt = buildCompilePrompt(source);
    const response = await config.generator.complete(prompt, {
      maxTokens: COMPILE_MAX_TOKENS,
    });
    const extraction = parseExtraction(response.text);
    const pages = renderPages(source, extraction, now().toISOString());
    return { sourceId: source.id, pages };
  }

  return { compile };
}
