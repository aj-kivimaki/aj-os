import { env } from "./appEnv.js";

/**
 * Configuration required by the agent + API server.
 *
 * The base {@link env} keeps these fields optional so the Notion sync CLI can
 * boot without them. The server calls {@link requireAgentEnv} at startup to
 * assert their presence and fail fast with a clear message.
 */
export interface AgentEnv {
  readonly anthropicApiKey: string;
  readonly model: string;
  readonly handbookPath: string;
  readonly apiPort: number;
  readonly apiHost: string;
  readonly apiAuthToken: string;
}

export function requireAgentEnv(): AgentEnv {
  const missing: string[] = [];

  if (!env.ANTHROPIC_API_KEY) {
    missing.push("ANTHROPIC_API_KEY");
  }
  if (!env.HANDBOOK_PATH) {
    missing.push("HANDBOOK_PATH");
  }
  if (!env.API_AUTH_TOKEN) {
    missing.push("API_AUTH_TOKEN");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required agent/API environment variables:\n${missing
        .map((name) => `  - ${name}`)
        .join("\n")}\n` +
        "Set these in your .env before starting the API server (see .env.example).",
    );
  }

  return {
    anthropicApiKey: env.ANTHROPIC_API_KEY as string,
    model: env.ANTHROPIC_MODEL,
    handbookPath: env.HANDBOOK_PATH as string,
    apiPort: env.API_PORT,
    apiHost: env.API_HOST,
    apiAuthToken: env.API_AUTH_TOKEN as string,
  };
}
