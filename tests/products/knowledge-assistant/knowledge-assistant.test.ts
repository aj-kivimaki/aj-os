/**
 * Knowledge Assistant product tests (REX-402, F-053).
 *
 * Before M4, `KnowledgeAssistant` hard-wired every dependency as a field
 * initializer (`new ConfigService()`, `new AIClient()`, …), so it could not be
 * constructed without a real filesystem and API key and had zero tests. It now
 * accepts injected dependencies; these tests construct it with fakes and drive
 * `answer()` end to end — **the direct falsifier of F-053**. No real key, and no
 * real config/handbook/retrieval/AI.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AjConfig, ConfigService } from "../../../src/platform/config/index.js";
import type { HandbookService } from "../../../src/platform/handbook/index.js";
import type {
  RetrievalService,
  RetrievalResult,
} from "../../../src/platform/retrieval/index.js";
import type { AIClient, AIResponse } from "../../../src/platform/ai/index.js";
import {
  KnowledgeAssistant,
  type KnowledgeAssistantDeps,
} from "../../../src/products/knowledge-assistant/index.js";

/** A `ConfigService` fake whose `load()` yields fixed handbook paths. */
function fakeConfig(): ConfigService {
  return {
    load: async () =>
      ({
        handbook: { path: "/fake/vault", generatedWikiPath: "/fake/wiki" },
      }) as AjConfig,
  } as unknown as ConfigService;
}

/** A handbook factory whose `locateWiki()` reports a fixed wiki path. */
function fakeHandbook(wikiPath: string): KnowledgeAssistantDeps["createHandbook"] {
  return () => ({ locateWiki: async () => ({ wikiPath }) }) as unknown as HandbookService;
}

/** A retrieval factory whose `search()` returns the given results. */
function fakeRetrieval(
  results: readonly RetrievalResult[],
): KnowledgeAssistantDeps["createRetrieval"] {
  return () => ({ search: async () => [...results] }) as unknown as RetrievalService;
}

describe("KnowledgeAssistant — constructible with injected dependencies (F-053)", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    logSpy.mockRestore();
  });

  it("constructs with all-fake deps and needs no real filesystem or key", () => {
    // The proof: the constructor runs to completion with injected fakes. Before
    // REX-402 this was impossible — the field initializers reached the real world.
    const assistant = new KnowledgeAssistant({
      config: fakeConfig(),
      createHandbook: fakeHandbook("/fake/wiki"),
      createRetrieval: fakeRetrieval([]),
    });
    expect(assistant).toBeInstanceOf(KnowledgeAssistant);
  });

  it("prints the no-knowledge notice and never calls the AI when retrieval is empty", async () => {
    const answer = vi.fn<(prompt: unknown) => Promise<AIResponse>>();
    const assistant = new KnowledgeAssistant({
      config: fakeConfig(),
      createHandbook: fakeHandbook("/fake/wiki"),
      createRetrieval: fakeRetrieval([]),
      ai: { answer } as unknown as AIClient,
    });

    await assistant.answer("anything");

    expect(answer).not.toHaveBeenCalled();
    expect(logSpy.mock.calls.flat().join("\n")).toMatch(/No relevant handbook articles/);
  });

  it("drives the full pipeline to the AI when retrieval returns a hit", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aj-ka-"));
    try {
      const article = join(dir, "topic.md");
      await writeFile(article, "# Topic\n\nThe answer lives here.\n");

      const answer = vi
        .fn<(prompt: unknown) => Promise<AIResponse>>()
        .mockResolvedValue({ text: "Here is the answer.", model: "fake-model" });

      const assistant = new KnowledgeAssistant({
        config: fakeConfig(),
        createHandbook: fakeHandbook(dir),
        createRetrieval: fakeRetrieval([{ path: article, title: "Topic", score: 1 }]),
        ai: { answer } as unknown as AIClient,
      });

      await assistant.answer("what is the answer?");

      // The real prompt renderer and Context Builder ran on the injected hit,
      // and the injected AI received the rendered prompt exactly once.
      expect(answer).toHaveBeenCalledOnce();
      expect(logSpy.mock.calls.flat().join("\n")).toMatch(/Here is the answer\./);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
