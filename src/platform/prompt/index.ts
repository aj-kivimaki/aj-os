/**
 * Prompt Renderer — public surface of the platform capability (PRODUCT-001).
 *
 * Transforms a Context Package into an AI-ready prompt and nothing more. It is a
 * platform capability the Knowledge Assistant composes; it calls no AI and knows
 * no provider, API or transport. The next milestone connects an AI client to the
 * rendered prompt without touching the renderer or the rest of the pipeline.
 */

export { PromptRenderer } from "./PromptRenderer.js";
export type { RenderedPrompt } from "./types.js";
