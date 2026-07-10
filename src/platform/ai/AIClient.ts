import { config as loadDotenv } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

import type { RenderedPrompt } from "../prompt/index.js";

import type { AIResponse } from "./types.js";

// Load `.env` so `ANTHROPIC_API_KEY` is available when the Knowledge Assistant
// CLI runs. This is the AI capability's own concern: it is idempotent and, unlike
// the Notion-coupled app-wide env loader, pulls in no unrelated required config.
loadDotenv();

/**
 * Default model when `ANTHROPIC_MODEL` is not set. Exported as the *documented
 * default* so tests can assert the fallback behavior without hardcoding a model
 * string of their own; it is the single source of truth for that value.
 */
export const DEFAULT_MODEL = "claude-sonnet-5";

/** Upper bound on generated answer length. Small: PRODUCT-001 wants concise answers. */
const MAX_TOKENS = 1024;

/**
 * A problem generating an answer, with a message safe to show the user.
 *
 * Mirrors {@link ConfigError} / {@link HandbookError}: the product catches this to
 * print a friendly explanation (missing key, API failure) while letting genuinely
 * unexpected errors surface loudly.
 */
export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIError";
  }
}

/**
 * Generates an answer from a rendered prompt using Anthropic's API.
 *
 * This is the platform capability that owns everything provider-specific: the AI
 * provider, model selection, the `@anthropic-ai/sdk`, and the transport. It is
 * the *only* module in the pipeline that knows any of that.
 *
 * Its contract is deliberately narrow: it receives a {@link RenderedPrompt} and
 * returns an {@link AIResponse}. It does not render prompts, assemble context, or
 * retrieve knowledge — those are upstream capabilities it knows nothing about.
 *
 * Scope is intentionally minimal for PRODUCT-001: a single non-streaming request,
 * no conversation memory, and no provider abstraction beyond this class.
 */
export class AIClient {
  /**
   * The SDK client, created lazily on first use. Constructing an `AIClient` never
   * throws — the missing-key error surfaces only when an answer is actually
   * requested, so the product can hold one as a field without a configured key.
   */
  private client: Anthropic | undefined;

  /** The model this client targets, resolved once from the environment. */
  private readonly model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  /**
   * Generate an answer for `prompt`.
   *
   * Maps the provider-neutral `{ system, user }` split onto a single Anthropic
   * Messages request, then extracts the text back out — so the provider's request
   * and response shapes never escape this method.
   *
   * @throws AIError when the API key is missing or the request fails.
   */
  async answer(prompt: RenderedPrompt): Promise<AIResponse> {
    const client = this.anthropic();

    let message: Anthropic.Message;
    try {
      message = await client.messages.create({
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });
    } catch (error) {
      throw new AIError(
        `The AI request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return { text: extractText(message), model: this.model };
  }

  /** Lazily construct (and cache) the SDK client, validating configuration. */
  private anthropic(): Anthropic {
    if (this.client === undefined) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new AIError(
          "ANTHROPIC_API_KEY is not configured. Set it in your environment " +
            "(or .env) to enable AI answers.",
        );
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }
}

/**
 * Concatenate the text blocks of a Messages response into a single answer.
 * PRODUCT-001 prompts produce only text, so non-text blocks (if any) are ignored.
 */
function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
