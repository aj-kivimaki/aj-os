/**
 * Knowledge Compiler contract — the LLM synthesis seam (INGEST).
 *
 * This is where the wiki stops being a document mirror and becomes an LLM Wiki: a
 * compiler turns one source into a small graph of pages — a source summary plus the
 * entities and concepts it introduces — cross-linked so future queries read
 * compiled knowledge instead of the raw document.
 *
 * All model non-determinism lives behind this port. The compiler depends on a
 * {@link TextGenerator} (the platform AI Client implements it), so the pipeline and
 * the deterministic rendering can be tested without the network.
 */
import type { SourceRecord } from "../../ingestion/index.js";
import type { AIResponse } from "../../platform/ai/index.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";

import type { SourceExtraction } from "./extraction.js";

/**
 * The renderer-agnostic output of compiling one source: structured knowledge, no
 * Markdown. The IdentityResolver and WikiRenderer (and future renderers — graph,
 * search index) consume this; the extraction stage never depends on any output
 * format.
 */
export interface ExtractedKnowledge {
  readonly source: SourceRecord;
  readonly extraction: SourceExtraction;
}

/** Raised when the model output cannot be parsed or validated. */
export class CompilerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompilerError";
  }
}

export type CompiledPageKind = "source" | "entity" | "concept";

/** A fully-rendered wiki page produced by compiling a source. */
export interface CompiledPage {
  /** Wiki-relative path, e.g. `entities/aj-kivimaki.md`. */
  readonly path: string;
  readonly kind: CompiledPageKind;
  readonly title: string;
  /** Full page markdown, including frontmatter. */
  readonly content: string;
  /** Contributing source ids (one per source; several after a MERGE). */
  readonly sources: readonly string[];
}

/**
 * The narrow text-generation capability the compiler needs. Structurally
 * satisfied by the platform `AIClient`; a stub satisfies it in tests.
 */
export interface TextGenerator {
  complete(prompt: RenderedPrompt, options?: { maxTokens?: number }): Promise<AIResponse>;
}

/**
 * Extracts renderer-agnostic structured knowledge from a source. It does not render
 * Markdown — that is the WikiRenderer's job.
 */
export interface KnowledgeCompiler {
  compile(source: SourceRecord): Promise<ExtractedKnowledge>;
}
