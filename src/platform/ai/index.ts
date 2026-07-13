/**
 * AI Client — public surface of the platform capability.
 *
 * Turns a Rendered Prompt into a generated answer and nothing more. It owns the
 * provider, model selection, SDK, and transport — the only module in the pipeline
 * that does. Upstream capabilities (Retrieval, Context Builder, Prompt Renderer)
 * know nothing of it; the Knowledge Assistant composes it last.
 */

export { AIClient, AIError, DEFAULT_MODEL } from "./AIClient.js";
export type { AIResponse } from "./types.js";
