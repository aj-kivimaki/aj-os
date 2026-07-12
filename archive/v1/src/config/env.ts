import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const rawEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NOTION_API_KEY: z
    .string()
    .min(1, "NOTION_API_KEY must not be empty")
    .optional(),
  NOTION_TOKEN: z.string().min(1, "NOTION_TOKEN must not be empty").optional(),
  NOTION_PARENT_PAGE_ID: z
    .string()
    .min(1, "NOTION_PARENT_PAGE_ID must not be empty"),

  // Agent + API configuration.
  // Kept optional so the Notion sync CLI still boots without them; the API
  // server asserts their presence via requireAgentEnv() (see agent-env.ts).
  ANTHROPIC_API_KEY: z
    .string()
    .min(1, "ANTHROPIC_API_KEY must not be empty")
    .optional(),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-5"),
  HANDBOOK_PATH: z
    .string()
    .min(1, "HANDBOOK_PATH must not be empty")
    .optional(),
  API_PORT: z.coerce.number().int().positive().default(3000),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_AUTH_TOKEN: z
    .string()
    .min(16, "API_AUTH_TOKEN must be at least 16 characters")
    .optional(),
});

const envSchema = rawEnvSchema
  .transform((value, context) => {
    const notionApiKey = value.NOTION_API_KEY ?? value.NOTION_TOKEN;

    if (!notionApiKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NOTION_API_KEY"],
        message: "Set NOTION_API_KEY (or NOTION_TOKEN) in your environment",
      });
      return z.NEVER;
    }

    return {
      NODE_ENV: value.NODE_ENV,
      NOTION_API_KEY: notionApiKey,
      NOTION_PARENT_PAGE_ID: value.NOTION_PARENT_PAGE_ID,
      ANTHROPIC_API_KEY: value.ANTHROPIC_API_KEY,
      ANTHROPIC_MODEL: value.ANTHROPIC_MODEL,
      HANDBOOK_PATH: value.HANDBOOK_PATH,
      API_PORT: value.API_PORT,
      API_HOST: value.API_HOST,
      API_AUTH_TOKEN: value.API_AUTH_TOKEN,
    };
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = parsedEnv.data;
