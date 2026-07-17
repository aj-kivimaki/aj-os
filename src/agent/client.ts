import Anthropic from "@anthropic-ai/sdk";

import { env } from "../config/appEnv.js";

let anthropicClient: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  return anthropicClient;
}
