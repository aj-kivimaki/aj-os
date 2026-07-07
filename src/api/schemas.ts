import { z } from "zod";

export const askBodySchema = z.object({
  message: z.string().min(1, "message must not be empty"),
});

export const inboxNoteBodySchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  tags: z.array(z.string()).optional(),
  filename: z.string().optional(),
});

export const inboxFileBodySchema = z.object({
  filename: z.string().min(1),
  content: z.string(),
  encoding: z.enum(["utf8", "base64"]).optional(),
});

export type AskBody = z.infer<typeof askBodySchema>;
export type InboxNoteBody = z.infer<typeof inboxNoteBodySchema>;
export type InboxFileBody = z.infer<typeof inboxFileBodySchema>;
