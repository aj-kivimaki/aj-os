/**
 * The compilation prompt. Encodes the LLM Wiki philosophy from the Wiki
 * Maintainer Schema: compile a source into a summary plus the entities
 * (proper nouns) and concepts (abstractions) it introduces, faithfully and
 * without invention. Output is strict JSON (see `extraction.ts`); rendering
 * to pages is deterministic and happens elsewhere.
 */
import type { SourceRecord } from "../../ingestion/index.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";

const SYSTEM = `You are the Wiki Compiler for an "LLM Wiki" — a persistent, \
interlinked knowledge base compiled from source documents so future questions \
are answered from the compiled wiki rather than by rereading the sources.

Compile ONE source document into structured knowledge:

- summary: a faithful, concise title and the key points a reader needs. Do not \
copy the document verbatim; distill it.
- entities: the proper nouns the document introduces — people, organizations, \
places, products, tools. Each with a short factual description grounded in the \
document.
- concepts: the abstractions the document introduces — ideas, topics, themes, \
methods. Each with a short factual description grounded in the document.

Rules:
- Extract only what the document actually supports. Never invent facts, \
entities, or concepts.
- Prefer a few well-chosen entities/concepts over an exhaustive list.
- Keep descriptions tight and factual.
- Return ONLY a JSON object, no prose, no code fence, matching exactly:

{
  "summary": { "title": string, "keyPoints": string[] },
  "entities": [ { "name": string, "type": "person"|"organization"|"place"|"product"|"tool"|"other", "description": string } ],
  "concepts": [ { "name": string, "description": string } ]
}`;

/** Build the compilation prompt for a single source. */
export function buildCompilePrompt(source: SourceRecord): RenderedPrompt {
  const user = `Compile the following source document (id: ${source.id}).

--- BEGIN SOURCE ---
${source.content}
--- END SOURCE ---

Return only the JSON object described in the system instructions.`;
  return { system: SYSTEM, user };
}
