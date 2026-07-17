import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

/**
 * Runtime environment for the active v2 stack — the Knowledge Assistant's
 * Handbook Agent and API server.
 *
 * Fields are optional so any process can import this module without every
 * variable set; the API server asserts the ones it needs via
 * {@link requireAgentEnv} (see `agentEnv.ts`), failing fast with a clear message
 * when one is missing.
 */
const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY must not be empty").optional(),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-5"),
  HANDBOOK_PATH: z.string().min(1, "HANDBOOK_PATH must not be empty").optional(),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_AUTH_TOKEN: z
    .string()
    .min(16, "API_AUTH_TOKEN must be at least 16 characters")
    .optional(),
});

const parsedEnv = appEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export type AppEnv = z.infer<typeof appEnvSchema>;
export const env: AppEnv = parsedEnv.data;
