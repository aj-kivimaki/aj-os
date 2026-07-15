/**
 * Knowledge Extractor behaviour & determinism tests (EOS-202).
 *
 * Drives the extractor through a **stub `TextGenerator`** — no network, no provider —
 * so the stage stays independent of any AI client. Covers: deterministic prompt
 * construction, prompt hand-off + token budget, verbatim pass-through (no reorder /
 * dedupe / reclassify — the Extractor Invariant), empty and partial `ChangeSet`s,
 * structure determinism under a fixed generator, `ExtractionError` on malformed
 * output, transport-error propagation, and a frozen handle. Everything is asserted
 * through the module's public surface.
 */

import { describe, it, expect } from "vitest";

import {
  createKnowledgeExtractor,
  buildExtractionPrompt,
  parseChangeSet,
  ExtractionError,
  type ChangeSet,
  type KnowledgeExtractor,
  type TextGenerator,
} from "../../src/end-of-session/index.js";

const sessionId = "01J8Z3K7Q9WV0FB2XN4MABCDEF";

const changeSet: ChangeSet = parseChangeSet({
  sessionId,
  changes: [
    {
      id: "git:src/end-of-session/extraction/createKnowledgeExtractor.ts",
      kind: "source",
      path: "src/end-of-session/extraction/createKnowledgeExtractor.ts",
      changeType: "added",
      summary: "Add the Knowledge Extractor stage.",
      metadata: {},
    },
    {
      id: "git:docs/architecture/CONTRACTS.md",
      kind: "documentation",
      path: "docs/architecture/CONTRACTS.md",
      changeType: "modified",
      summary: "Note the internal KnowledgeExtraction contract.",
      metadata: {},
    },
  ],
  errors: [],
});

/** A valid model response for `changeSet`, echoing its sessionId. */
const validResponse = JSON.stringify({
  sessionId,
  summary: {
    title: "Wire the Knowledge Extractor behind the TextGenerator port",
    keyPoints: ["Isolate model non-determinism behind an injected port."],
  },
  findings: [
    {
      kind: "lesson-learned",
      title: "Isolate model non-determinism behind a port",
      body: "Depend on a `TextGenerator` port so the stage is stub-testable.",
      rationale: "Keeps every surrounding stage deterministic.",
      relatedChangeIds: [
        "git:src/end-of-session/extraction/createKnowledgeExtractor.ts",
      ],
      relatedPaths: ["src/end-of-session/extraction/createKnowledgeExtractor.ts"],
      tags: ["architecture"],
      confidence: 0.9,
    },
  ],
});

interface GeneratorCall {
  readonly prompt: { readonly system: string; readonly user: string };
  readonly options?: { readonly maxTokens?: number };
}

/**
 * A stub `TextGenerator` that records its calls and returns a canned text (or throws
 * a canned rejection). No network, no provider — the extractor's only dependency.
 */
function stubGenerator(
  text: string | (() => never),
): { generator: TextGenerator; calls: GeneratorCall[] } {
  const calls: GeneratorCall[] = [];
  const generator: TextGenerator = {
    async complete(prompt, options) {
      calls.push({ prompt, options });
      const resolved = typeof text === "function" ? text() : text;
      return { text: resolved, model: "stub-model" };
    },
  };
  return { generator, calls };
}

describe("createKnowledgeExtractor — construction", () => {
  it("throws when no generator is provided", () => {
    expect(() =>
      createKnowledgeExtractor(undefined as unknown as { generator: TextGenerator }),
    ).toThrow(/TextGenerator is required/);
    expect(() =>
      createKnowledgeExtractor({ generator: undefined as unknown as TextGenerator }),
    ).toThrow(/TextGenerator is required/);
  });

  it("returns a frozen handle (module factory convention)", () => {
    const { generator } = stubGenerator(validResponse);
    const extractor = createKnowledgeExtractor({ generator });
    expect(Object.isFrozen(extractor)).toBe(true);
  });
});

describe("createKnowledgeExtractor — extraction", () => {
  it("parses a valid response into the expected immutable extraction", async () => {
    const { generator } = stubGenerator(validResponse);
    const extraction = await createKnowledgeExtractor({ generator }).extract(
      changeSet,
    );
    expect(extraction).toEqual(JSON.parse(validResponse));
    expect(Object.isFrozen(extraction)).toBe(true);
    expect(Object.isFrozen(extraction.findings[0])).toBe(true);
  });

  it("passes sessionId straight through from the model response", async () => {
    const { generator } = stubGenerator(validResponse);
    const extraction = await createKnowledgeExtractor({ generator }).extract(
      changeSet,
    );
    expect(extraction.sessionId).toBe(sessionId);
  });

  it("hands the generator exactly the built prompt and a token budget", async () => {
    const { generator, calls } = stubGenerator(validResponse);
    await createKnowledgeExtractor({ generator }).extract(changeSet);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.prompt).toEqual(buildExtractionPrompt(changeSet));
    expect(calls[0]?.options?.maxTokens).toBeGreaterThan(0);
  });

  it("extracts from an empty ChangeSet (no changes)", async () => {
    const empty = parseChangeSet({ sessionId, changes: [], errors: [] });
    const response = JSON.stringify({
      sessionId,
      summary: { title: "Quiet session", keyPoints: ["No reusable knowledge."] },
      findings: [],
    });
    const { generator } = stubGenerator(response);
    const extraction = await createKnowledgeExtractor({ generator }).extract(empty);
    expect(extraction.findings).toEqual([]);
  });

  it("extracts from a partial ChangeSet (changes and analyzer errors)", async () => {
    const partial = parseChangeSet({
      sessionId,
      changes: changeSet.changes,
      errors: [{ analyzer: "git", message: "one file failed", recoverable: true }],
    });
    const { generator } = stubGenerator(validResponse);
    const extraction = await createKnowledgeExtractor({ generator }).extract(
      partial,
    );
    expect(extraction.findings).toHaveLength(1);
  });
});

describe("createKnowledgeExtractor — Extractor Invariant (no interpretation)", () => {
  it("returns findings verbatim — no reordering, deduplication, or reclassification", async () => {
    // Two identical-titled findings, an unsorted order, and an unknown kind: a stage
    // that classified/deduped/sorted would change this; the extractor must not.
    const response = JSON.stringify({
      sessionId,
      summary: { title: "S", keyPoints: ["k"] },
      findings: [
        { kind: "playbook", title: "Zeta", body: "b", rationale: "r" },
        { kind: "not-a-real-kind", title: "Alpha", body: "b", rationale: "r" },
        { kind: "playbook", title: "Zeta", body: "b", rationale: "r" },
      ],
    });
    const { generator } = stubGenerator(response);
    const extraction = await createKnowledgeExtractor({ generator }).extract(
      changeSet,
    );
    // Order preserved, duplicates kept, kinds untouched save the schema's soft-hint
    // fallback (validation, not interpretation by the extractor).
    expect(extraction.findings.map((f) => f.title)).toEqual([
      "Zeta",
      "Alpha",
      "Zeta",
    ]);
    expect(extraction.findings.map((f) => f.kind)).toEqual([
      "playbook",
      "handbook-entry",
      "playbook",
    ]);
  });
});

describe("createKnowledgeExtractor — determinism", () => {
  it("yields a deep-equal extraction across runs with a fixed generator", async () => {
    const first = await createKnowledgeExtractor({
      generator: stubGenerator(validResponse).generator,
    }).extract(changeSet);
    const second = await createKnowledgeExtractor({
      generator: stubGenerator(validResponse).generator,
    }).extract(changeSet);
    expect(first).toEqual(second);
  });

  it("builds an identical prompt for the same ChangeSet, including each change", () => {
    expect(buildExtractionPrompt(changeSet)).toEqual(
      buildExtractionPrompt(changeSet),
    );
    const { user } = buildExtractionPrompt(changeSet);
    expect(user).toContain(sessionId);
    for (const change of changeSet.changes) {
      expect(user).toContain(change.path);
      expect(user).toContain(change.changeType);
      expect(user).toContain(change.summary);
    }
  });
});

describe("createKnowledgeExtractor — error handling", () => {
  it("surfaces malformed JSON as ExtractionError (not swallowed)", async () => {
    const { generator } = stubGenerator("not json");
    await expect(
      createKnowledgeExtractor({ generator }).extract(changeSet),
    ).rejects.toThrow(ExtractionError);
  });

  it("surfaces a schema-violating response as ExtractionError", async () => {
    const { generator } = stubGenerator(
      JSON.stringify({ sessionId, summary: { title: "no key points", keyPoints: [] } }),
    );
    await expect(
      createKnowledgeExtractor({ generator }).extract(changeSet),
    ).rejects.toThrow(ExtractionError);
  });

  it("propagates a transport rejection from the generator", async () => {
    const { generator } = stubGenerator(() => {
      throw new Error("network down");
    });
    await expect(
      createKnowledgeExtractor({ generator }).extract(changeSet),
    ).rejects.toThrow(/network down/);
  });
});
