/**
 * Tests the AnthropicKnowledgeCompiler wiring (prompt → generate → parse)
 * with a stub TextGenerator. The compiler is renderer-agnostic (ADR-005): it
 * returns an extraction, not pages.
 */
import { describe, expect, it, vi } from "vitest";

import type { SourceRecord } from "../../../src/ingestion/index.js";
import type { AIResponse } from "../../../src/platform/ai/index.js";
import type { RenderedPrompt } from "../../../src/platform/prompt/index.js";
import {
  CompilerError,
  createAnthropicKnowledgeCompiler,
  type TextGenerator,
} from "../../../src/knowledge/compiler/index.js";

const SOURCE: SourceRecord = {
  id: "handbook:library/note.md",
  uri: "file:///note.md",
  content: "AJ-OS is a code-first developer operating system built by AJ.",
  hash: "h1",
  metadata: { relativePath: "library/note.md", bytes: 60 },
};

const MODEL_JSON = JSON.stringify({
  summary: { title: "AJ-OS Note", keyPoints: ["Code-first OS"] },
  entities: [{ name: "AJ-OS", type: "product", description: "A developer OS." }],
  concepts: [{ name: "Code-first", description: "Business logic as code." }],
});

function stubGenerator(text: string): TextGenerator {
  return { complete: vi.fn(async (): Promise<AIResponse> => ({ text, model: "stub" })) };
}

describe("createAnthropicKnowledgeCompiler", () => {
  it("extracts renderer-agnostic knowledge from a source (no pages)", async () => {
    const compiler = createAnthropicKnowledgeCompiler({
      generator: stubGenerator(MODEL_JSON),
    });

    const compiled = await compiler.compile(SOURCE);

    expect(compiled.source.id).toBe("handbook:library/note.md");
    expect(compiled.extraction.summary.title).toBe("AJ-OS Note");
    expect(compiled.extraction.entities.map((e) => e.name)).toEqual(["AJ-OS"]);
    expect(compiled.extraction.concepts.map((c) => c.name)).toEqual(["Code-first"]);
  });

  it("passes an enlarged token budget to the generator", async () => {
    const generator = stubGenerator(MODEL_JSON);
    const compiler = createAnthropicKnowledgeCompiler({ generator });

    await compiler.compile(SOURCE);

    const call = (generator.complete as ReturnType<typeof vi.fn>).mock.calls[0];
    const [prompt, options] = call as [RenderedPrompt, { maxTokens?: number }];
    expect(prompt.user).toContain("AJ-OS is a code-first");
    expect(options.maxTokens).toBeGreaterThan(1024);
  });

  it("surfaces a CompilerError when the model returns junk", async () => {
    const compiler = createAnthropicKnowledgeCompiler({
      generator: stubGenerator("not json at all"),
    });

    await expect(compiler.compile(SOURCE)).rejects.toBeInstanceOf(CompilerError);
  });
});
