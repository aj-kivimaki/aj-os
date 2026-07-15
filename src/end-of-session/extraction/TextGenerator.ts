/**
 * The Knowledge Extraction seam — the pipeline's single non-deterministic boundary.
 *
 * `TextGenerator` is the narrow text-generation capability the extractor depends on;
 * `KnowledgeExtractor` is the stage itself. All model non-determinism lives behind
 * the port (the platform `AIClient` implements it structurally; a stub satisfies it
 * in tests), so the extractor's prompt-building and parsing — and every surrounding
 * pipeline stage — stay deterministic and testable without the network or any
 * specific AI provider.
 *
 * The port is defined **locally** to the End-of-Session module rather than imported
 * from `src/knowledge/compiler`, consistent with the module's ratified "parallel,
 * not shared" precedent (EOS-005): the two ports are structurally identical but kept
 * independent to avoid premature cross-module coupling. Referencing the platform
 * `RenderedPrompt` / `AIResponse` shapes is depending on shared *infrastructure*,
 * not on another specification's module.
 */

import type { AIResponse } from "../../platform/ai/index.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";
import type { ChangeSet } from "../contracts/change/index.js";
import type { KnowledgeExtraction } from "../contracts/knowledge-extraction/index.js";

/**
 * The narrow text-generation capability the extractor needs. Structurally satisfied
 * by the platform `AIClient`; a stub satisfies it in tests. Mirrors the compiler's
 * `TextGenerator`, kept local per the module's parallel-not-shared convention.
 */
export interface TextGenerator {
  complete(
    prompt: RenderedPrompt,
    options?: { maxTokens?: number },
  ): Promise<AIResponse>;
}

/**
 * The Knowledge Extractor stage: given a session's `ChangeSet`, identify the reusable
 * knowledge in it and return a validated, immutable {@link KnowledgeExtraction}.
 *
 * Its responsibility is **orchestration and structural validation only** — build the
 * prompt, invoke the injected {@link TextGenerator}, parse and validate the response.
 * It does not classify, deduplicate, merge, score, retry, fall back, or otherwise
 * interpret the findings beyond validating the contract (the frozen Extractor
 * Invariant); those responsibilities are downstream (M4 / SPEC-004).
 */
export interface KnowledgeExtractor {
  extract(changeSet: ChangeSet): Promise<KnowledgeExtraction>;
}
