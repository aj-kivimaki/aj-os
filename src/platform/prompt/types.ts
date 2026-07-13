/**
 * Prompt Renderer types.
 *
 * The Prompt Renderer's only contract: the shape of a rendered prompt. A
 * `RenderedPrompt` is transport- and provider-agnostic — it is plain text ready
 * to be handed to *some* AI client, but it carries no knowledge of which client,
 * which model, or how the text will be delivered (HTTP, SDK, streaming, …).
 */

/**
 * A prompt rendered from a Context Package, split into the two roles every
 * chat-style model understands.
 *
 * The split is intentional and provider-neutral: nearly every AI provider maps a
 * "system" instruction and a "user" turn onto its own request shape. Keeping the
 * two apart here lets the future AI client adapt them without the renderer ever
 * learning provider specifics.
 */
export interface RenderedPrompt {
  /**
   * Standing instructions that govern how the model must answer: use only the
   * supplied context, admit uncertainty, and cite sources.
   */
  readonly system: string;
  /**
   * The user turn: the question together with the assembled context and its
   * source references.
   */
  readonly user: string;
}
