/**
 * AI Client types.
 *
 * The AI Client's only outward contract: the shape of a generated answer. The
 * response is deliberately minimal — the model's text plus which model produced it.
 * Streaming, token usage, tool-calls, and conversation history are intentionally
 * out of scope.
 */

/**
 * An answer generated from a `RenderedPrompt`.
 *
 * Provider-neutral by construction: it carries the final text and the model
 * identifier, never a provider request/response object, transport detail, or SDK
 * type. Callers depend on this shape, not on the underlying SDK.
 */
export interface AIResponse {
  /** The model's answer text. */
  readonly text: string;
  /** The model that produced the answer (e.g. `claude-sonnet-5`). */
  readonly model: string;
}
