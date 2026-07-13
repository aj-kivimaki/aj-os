/**
 * Prompt Renderer — public surface of the platform capability.
 *
 * Transforms a Context Package into an AI-ready prompt and nothing more. It is a
 * platform capability the Knowledge Assistant composes; it calls no AI and knows no
 * provider, API, or transport.
 */

export { PromptRenderer } from "./PromptRenderer.js";
export type { RenderedPrompt } from "./types.js";
