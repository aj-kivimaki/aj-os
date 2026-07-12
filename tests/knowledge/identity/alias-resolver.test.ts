/**
 * Tests the alias-aware resolver — Stage 0 (ADR-006). A human-approved alias
 * (or the canonical title) resolves deterministically to `existing` before
 * the inner resolver runs; otherwise it delegates.
 */
import { describe, expect, it, vi } from "vitest";

import type {
  Candidate,
  ExistingPage,
  IdentityResolver,
  Resolution,
} from "../../../src/knowledge/identity/index.js";
import { createAliasAwareResolver } from "../../../src/knowledge/identity/index.js";

const EXISTING: ExistingPage[] = [
  {
    path: "entities/fantasy-audio-demo.md",
    kind: "entity",
    title: "Fantasy Audio Demo",
    description: "The flagship demo.",
    aliases: ["Fantasy Demo", "The Demo"],
  },
  {
    path: "concepts/game-audio.md",
    kind: "concept",
    title: "Game audio",
    description: "Scoring for games.",
    aliases: [],
  },
];

function inner(): IdentityResolver & { calls: () => number } {
  const fn = vi.fn(
    async (): Promise<Resolution> => ({ kind: "new", confidence: 0.1, explanation: "inner" }),
  );
  return { resolve: fn, calls: () => fn.mock.calls.length };
}

const cand = (name: string, kind: Candidate["kind"] = "entity"): Candidate => ({
  name,
  kind,
  description: "x",
});

describe("createAliasAwareResolver", () => {
  it("matches a learned alias deterministically, without the inner resolver", async () => {
    const base = inner();
    const result = await createAliasAwareResolver(base).resolve(cand("Fantasy Demo"), EXISTING);

    expect(result.kind).toBe("existing");
    if (result.kind === "existing") {
      expect(result.targetPath).toBe("entities/fantasy-audio-demo.md");
      expect(result.confidence).toBe(1);
    }
    expect(base.calls()).toBe(0);
  });

  it("matches the canonical title too (normalized)", async () => {
    const result = await createAliasAwareResolver(inner()).resolve(
      cand("fantasy audio demo"),
      EXISTING,
    );
    expect(result.kind).toBe("existing");
  });

  it("delegates to the inner resolver when nothing is known", async () => {
    const base = inner();
    const result = await createAliasAwareResolver(base).resolve(cand("Wwise"), EXISTING);

    expect(result.kind).toBe("new");
    expect(base.calls()).toBe(1);
  });

  it("does not match an alias of a different kind", async () => {
    const base = inner();
    // "Fantasy Demo" is an entity alias; a concept candidate must not match it.
    await createAliasAwareResolver(base).resolve(cand("Fantasy Demo", "concept"), EXISTING);
    expect(base.calls()).toBe(1);
  });
});
