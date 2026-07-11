/**
 * The compiler's LLM boundary: the JSON contract the model must return, and
 * a validating parser. The model does knowledge *extraction* (entities,
 * concepts, a faithful summary); deterministic rendering (SPEC-005 §21.5
 * frontmatter, slugs, `[[wiki-links]]`) happens in `render.ts`.
 */
import { z } from "zod";

import { CompilerError } from "./KnowledgeCompiler.js";

// Lenient: the model occasionally invents a type (e.g. "framework",
// "methodology"). Type is a soft hint, so an unknown value falls back to
// "other" rather than failing the whole extraction.
export const entityTypeSchema = z
  .enum(["person", "organization", "place", "product", "tool", "other"])
  .catch("other");

export const sourceExtractionSchema = z.object({
  summary: z.object({
    title: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).min(1),
  }),
  entities: z.array(
    z.object({
      name: z.string().min(1),
      type: entityTypeSchema,
      description: z.string().min(1),
    }),
  ),
  concepts: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
});

export type EntityType = z.infer<typeof entityTypeSchema>;
export type SourceExtraction = z.infer<typeof sourceExtractionSchema>;

/** Strip a ```json … ``` (or bare ```) fence the model may wrap JSON in. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  return fenced ? (fenced[1] ?? "").trim() : trimmed;
}

/** Parse and validate a model response into a {@link SourceExtraction}. */
export function parseExtraction(raw: string): SourceExtraction {
  let data: unknown;
  try {
    data = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new CompilerError("The model did not return valid JSON.");
  }
  const result = sourceExtractionSchema.safeParse(data);
  if (!result.success) {
    throw new CompilerError(
      `The model output did not match the extraction schema: ${result.error.message}`,
    );
  }
  return result.data;
}
