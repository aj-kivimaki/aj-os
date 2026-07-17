import type Anthropic from "@anthropic-ai/sdk";

import { env } from "../config/app-env.js";
import { getAnthropicClient } from "./client.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { AGENT_TOOLS, executeTool } from "./tools.js";
import type { AgentAnswer, RunAgentOptions, ToolCallRecord } from "./types.js";

const DEFAULT_MAX_ITERATIONS = 8;
const MAX_TOKENS = 16000;

function collectText(content: readonly Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Run the handbook agent to completion: a manual tool-use loop that lets the
 * model navigate the wiki (and optionally write to the inbox) until it produces
 * a final answer.
 */
export async function runAgent(options: RunAgentOptions): Promise<AgentAnswer> {
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  const client = getAnthropicClient();
  const toolCalls: ToolCallRecord[] = [];

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: options.question },
  ];

  let stopReason: string | null = null;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const response = await client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      tools: [...AGENT_TOOLS],
      messages,
    });

    stopReason = response.stop_reason;

    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUses) {
        const result = await executeTool(toolUse.name, toolUse.input);
        toolCalls.push({
          name: toolUse.name,
          input: toolUse.input,
          isError: result.isError,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result.content,
          is_error: result.isError,
        });
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // end_turn, max_tokens, refusal, etc. — no more tool calls to service.
    const answer = collectText(response.content);
    if (response.stop_reason === "refusal") {
      return {
        answer: answer || "The request was declined by the model's safety system.",
        toolCalls,
        stopReason,
        iterations: iteration,
      };
    }

    return { answer, toolCalls, stopReason, iterations: iteration };
  }

  return {
    answer:
      "The agent reached its maximum number of steps without finishing. " +
      "Try narrowing the question.",
    toolCalls,
    stopReason,
    iterations: maxIterations,
  };
}
