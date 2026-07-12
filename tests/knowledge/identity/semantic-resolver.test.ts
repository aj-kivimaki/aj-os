/**
 * Tests the Semantic Identity Resolver (ADR-005) with a stub LLM, so the
 * staged logic (shortlist → adjudicate → thresholds → three-way verdict) is
 * exercised deterministically. Conservative bias: uncertain → unsure/new.
 */
import { describe, expect, it, vi } from "vitest";

import type { AIResponse } from "../../../src/platform/ai/index.js";
import type { TextGenerator } from "../../../src/knowledge/compiler/index.js";
import type {
  Candidate,
  ExistingPage,
} from "../../../src/knowledge/identity/index.js";
import { createSemanticIdentityResolver } from "../../../src/knowledge/identity/index.js";

const EXISTING: ExistingPage[] = [
  { path: "concepts/game-audio.md", kind: "concept", title: "Game audio", description: "Scoring for games.", aliases: [] },
  { path: "concepts/game-audio-career.md", kind: "concept", title: "Game audio career", description: "A career in game audio.", aliases: [] },
  { path: "entities/unity.md", kind: "entity", title: "Unity", description: "A game engine.", aliases: [] },
];

const CONCEPT: Candidate = {
  name: "Game audio implementation",
  kind: "concept",
  description: "Implementing audio in games.",
};

function stub(text: string): TextGenerator {
  return { complete: vi.fn(async (): Promise<AIResponse> => ({ text, model: "stub" })) };
}

function verdict(match: string | null, confidence: number): string {
  return JSON.stringify({ match, confidence, reason: "test reason" });
}

describe("createSemanticIdentityResolver", () => {
  it("returns new without calling the LLM when the shortlist is empty", async () => {
    const generator = stub(verdict(null, 0));
    const resolver = createSemanticIdentityResolver({ generator });

    const result = await resolver.resolve(
      { name: "Wwise", kind: "entity", description: "Audio middleware." },
      EXISTING, // only a concept-kind lexical overlap; entity kind filtered out
    );

    expect(result.kind).toBe("new");
    expect(generator.complete).not.toHaveBeenCalled();
  });

  it("resolves to existing on a high-confidence match", async () => {
    const resolver = createSemanticIdentityResolver({
      generator: stub(verdict("concepts/game-audio.md", 0.9)),
    });

    const result = await resolver.resolve(CONCEPT, EXISTING);

    expect(result.kind).toBe("existing");
    if (result.kind === "existing") {
      expect(result.targetPath).toBe("concepts/game-audio.md");
      expect(result.confidence).toBe(0.9);
      expect(result.explanation).toContain("concepts/game-audio.md");
      expect(result.explanation).toContain("test reason");
    }
  });

  it("resolves to unsure on a mid-confidence match", async () => {
    const resolver = createSemanticIdentityResolver({
      generator: stub(verdict("concepts/game-audio.md", 0.7)),
    });

    const result = await resolver.resolve(CONCEPT, EXISTING);
    expect(result.kind).toBe("unsure");
  });

  it("resolves to new on a low-confidence match", async () => {
    const resolver = createSemanticIdentityResolver({
      generator: stub(verdict("concepts/game-audio.md", 0.3)),
    });

    expect((await resolver.resolve(CONCEPT, EXISTING)).kind).toBe("new");
  });

  it("resolves to new when the LLM declines a match", async () => {
    const resolver = createSemanticIdentityResolver({
      generator: stub(verdict(null, 0.2)),
    });

    expect((await resolver.resolve(CONCEPT, EXISTING)).kind).toBe("new");
  });

  it("never merges into a hallucinated (out-of-shortlist) path", async () => {
    const resolver = createSemanticIdentityResolver({
      generator: stub(verdict("concepts/does-not-exist.md", 0.99)),
    });

    expect((await resolver.resolve(CONCEPT, EXISTING)).kind).toBe("new");
  });

  it("falls back to new when the adjudication is unparseable", async () => {
    const resolver = createSemanticIdentityResolver({
      generator: stub("not json"),
    });

    const result = await resolver.resolve(CONCEPT, EXISTING);
    expect(result.kind).toBe("new");
    expect(result.explanation).toContain("adjudication failed");
  });

  it("only shortlists pages of the same kind", async () => {
    const generator = stub(verdict("entities/unity.md", 0.95));
    const resolver = createSemanticIdentityResolver({ generator });

    // A concept candidate must never match an entity page: unity is filtered
    // out, and there is no concept overlap for this name → new, no LLM call.
    const result = await resolver.resolve(
      { name: "Rendering engine", kind: "concept", description: "x" },
      [EXISTING[2]!], // only the Unity entity
    );

    expect(result.kind).toBe("new");
    expect(generator.complete).not.toHaveBeenCalled();
  });
});
