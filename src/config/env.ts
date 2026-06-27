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
    };
  })
  .pipe(
    z.object({
      NODE_ENV: z.enum(["development", "test", "production"]),
      NOTION_API_KEY: z.string().min(1),
      NOTION_PARENT_PAGE_ID: z.string().min(1),
    }),
  );

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = parsedEnv.data;
