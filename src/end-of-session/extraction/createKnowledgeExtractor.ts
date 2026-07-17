/**
 * The Knowledge Extractor — the pipeline's single non-deterministic stage.
 *
 * It wires the deterministic pieces around the one non-deterministic step: build the
 * extraction prompt (deterministic) → generate through the injected `TextGenerator`
 * (the only non-deterministic step) → parse and validate into an immutable
 * `KnowledgeExtraction` (deterministic). The model is reached only through the port,
 * so this composes without knowing any provider detail — the direct End-of-Session
 * analog of `createAnthropicKnowledgeCompiler`.
 *
 * It performs **orchestration and structural validation only**. It does not retry,
 * fall back to a second prompt, classify, deduplicate, merge, score, or otherwise
 * interpret the findings beyond validating the contract (the frozen Extractor
 * Invariant). A malformed response surfaces as `ExtractionError` and a transport
 * failure propagates — neither is swallowed; how a failed extraction maps to the
 * `SessionReport` is orchestration's concern (M5), not this stage's.
 */

import { parseExtractionResponse } from "../contracts/knowledge-extraction/index.js";
import type { ChangeSet } from "../contracts/change/index.js";
import type { KnowledgeExtraction } from "../contracts/knowledge-extraction/index.js";

import { buildExtractionPrompt } from "./prompt.js";
import type { KnowledgeExtractor, TextGenerator } from "./TextGenerator.js";

/**
 * Token budget for one extraction. Matches the compiler's `COMPILE_MAX_TOKENS`: a
 * session yields a summary plus several findings, so a concise-answer default is too
 * small.
 */
const EXTRACT_MAX_TOKENS = 4096;

export interface KnowledgeExtractorConfig {
  /** The text-generation capability (e.g. the platform `AIClient`). */
  readonly generator: TextGenerator;
}

/**
 * Create the Knowledge Extractor over an injected {@link TextGenerator}.
 *
 * A missing generator throws — the extractor is rejected rather than constructed in a
 * broken state. The returned handle is frozen (the module's factory convention).
 *
 * @example
 * const extractor = createKnowledgeExtractor({ generator: aiClient });
 * const extraction = await extractor.extract(changeSet);
 */
export function createKnowledgeExtractor(
  config: KnowledgeExtractorConfig,
): KnowledgeExtractor {
  if (
    config === null ||
    config === undefined ||
    config.generator === null ||
    config.generator === undefined
  ) {
    throw new Error("createKnowledgeExtractor: a TextGenerator is required.");
  }

  async function extract(
    changeSet: ChangeSet,
    sessionNotes?: string,
  ): Promise<KnowledgeExtraction> {
    // `sessionNotes` is carried, never read: it goes straight into the prompt and appears
    // nowhere else — no inspection, no branching, no preprocessing (EOS-D10/EOS-410). The
    // three steps below are still the whole of this stage.
    const prompt = buildExtractionPrompt(changeSet, sessionNotes);
    const response = await config.generator.complete(prompt, {
      maxTokens: EXTRACT_MAX_TOKENS,
    });
    return parseExtractionResponse(response.text);
  }

  return Object.freeze({ extract });
}
