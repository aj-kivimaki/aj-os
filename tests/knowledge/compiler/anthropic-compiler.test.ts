/**
 * Tests the AnthropicKnowledgeCompiler wiring (prompt → generate → parse →
 * render) with a stub TextGenerator, so the whole flow is exercised without
 * the network or model non-determinism.
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

const AT = () => new Date("2026-07-12T09:00:00.000Z");

describe("createAnthropicKnowledgeCompiler", () => {
  it("compiles a source into summary + entity + concept pages", async () => {
    const compiler = createAnthropicKnowledgeCompiler(
      { generator: stubGenerator(MODEL_JSON) },
      AT,
    );

    const compiled = await compiler.compile(SOURCE);

    expect(compiled.sourceId).toBe("handbook:library/note.md");
    expect(compiled.pages.map((p) => p.path).sort()).toEqual([
      "concepts/code-first.md",
      "entities/aj-os.md",
      "sources/library/note.md",
    ]);
    const summary = compiled.pages.find((p) => p.kind === "source")!;
    expect(summary.content).toContain("- [[entities/aj-os|AJ-OS]]");
    expect(summary.content).toContain("generated_at: 2026-07-12T09:00:00.000Z");
  });

  it("passes an enlarged token budget to the generator", async () => {
    const generator = stubGenerator(MODEL_JSON);
    const compiler = createAnthropicKnowledgeCompiler({ generator }, AT);

    await compiler.compile(SOURCE);

    const call = (generator.complete as ReturnType<typeof vi.fn>).mock.calls[0];
    const [prompt, options] = call as [RenderedPrompt, { maxTokens?: number }];
    expect(prompt.user).toContain("AJ-OS is a code-first");
    expect(options.maxTokens).toBeGreaterThan(1024);
  });

  it("surfaces a CompilerError when the model returns junk", async () => {
    const compiler = createAnthropicKnowledgeCompiler(
      { generator: stubGenerator("not json at all") },
      AT,
    );

    await expect(compiler.compile(SOURCE)).rejects.toBeInstanceOf(CompilerError);
  });
});
