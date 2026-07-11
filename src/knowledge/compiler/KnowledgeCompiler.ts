/**
 * Knowledge Compiler contract — the LLM synthesis seam (SPEC-005 INGEST).
 *
 * This is where the wiki stops being a document mirror and becomes an LLM
 * Wiki: a compiler turns one source into a small graph of pages — a source
 * summary plus the entities and concepts it introduces — cross-linked so
 * future queries read compiled knowledge instead of the raw document.
 *
 * All model non-determinism lives behind this port. The compiler depends on
 * a {@link TextGenerator} (the platform AI Client implements it), so the
 * pipeline and the deterministic rendering can be tested without the network.
 *
 * First slice (real LLM, single source): no cross-source MERGE, no
 * `overview.md`/`index.md`, no contradiction callouts yet — those are the
 * next slices. The page shape is designed so merge can layer on later.
 */
import type { SourceRecord } from "../../ingestion/index.js";
import type { AIResponse } from "../../platform/ai/index.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";

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
  /** Contributing source ids (one, this slice; many once MERGE exists). */
  readonly sources: readonly string[];
}

/** The graph of pages compiled from a single source. */
export interface CompiledKnowledge {
  readonly sourceId: string;
  /** The source summary page plus its entity and concept pages. */
  readonly pages: readonly CompiledPage[];
}

/**
 * The narrow text-generation capability the compiler needs. Structurally
 * satisfied by the platform `AIClient`; a stub satisfies it in tests.
 */
export interface TextGenerator {
  complete(
    prompt: RenderedPrompt,
    options?: { maxTokens?: number },
  ): Promise<AIResponse>;
}

/** Compiles a source into a small graph of interlinked wiki pages. */
export interface KnowledgeCompiler {
  compile(source: SourceRecord): Promise<CompiledKnowledge>;
}
