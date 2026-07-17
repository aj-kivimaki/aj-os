/**
 * KnowledgeExtraction contract tests (EOS-201).
 *
 * Covers the `KnowledgeExtraction` schema and `parseExtractionResponse`: fenced and
 * unfenced JSON, the lenient `kind` soft hint, array defaults, `.strict()` rejection,
 * empty `findings`, invalid-JSON / schema-mismatch → `ExtractionError`, and deep
 * immutability. This is a *contract* task — no extractor behavior, prompt, or
 * `TextGenerator` call is exercised (that is EOS-202). The parser never classifies,
 * merges, scores, or reorders; it validates and freezes verbatim. Everything is
 * asserted through the module's public surface.
 */

import { describe, it, expect } from "vitest";

import {
  parseExtractionResponse,
  ExtractionError,
  knowledgeExtractionSchema,
  EXTRACTION_KINDS,
  type KnowledgeExtraction,
} from "../../src/end-of-session/index.js";

import { firstUnfrozenPath } from "./support.js";

const validExtraction = {
  sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
  summary: {
    title: "Wire the knowledge extractor behind the TextGenerator port",
    keyPoints: [
      "Extraction is the pipeline's only non-deterministic stage.",
      "Structure is validated; content is not trusted.",
    ],
  },
  findings: [
    {
      kind: "lesson-learned",
      title: "Isolate model non-determinism behind a port",
      body: "Depend on a `TextGenerator` port so the stage stays unit-testable.",
      rationale: "Keeps every surrounding stage deterministic and stubbable.",
      relatedChangeIds: ["git:src/end-of-session/extraction/createKnowledgeExtractor.ts"],
      relatedPaths: ["src/end-of-session/extraction/createKnowledgeExtractor.ts"],
      tags: ["architecture", "testing"],
      confidence: 0.8,
    },
  ],
} as const satisfies KnowledgeExtraction;

/** Serialize a value the way a model would return it (bare JSON). */
const asJson = (value: unknown): string => JSON.stringify(value);

/** Wrap JSON in a ```json … ``` fence, as a model often does. */
const asFencedJson = (value: unknown): string =>
  `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;

describe("parseExtractionResponse — valid responses", () => {
  it("parses a bare-JSON response and preserves its values verbatim", () => {
    expect(parseExtractionResponse(asJson(validExtraction))).toEqual(validExtraction);
  });

  it("strips a ```json fence before parsing", () => {
    expect(parseExtractionResponse(asFencedJson(validExtraction))).toEqual(
      validExtraction,
    );
  });

  it("strips a bare ``` fence and tolerates surrounding whitespace", () => {
    const raw = `\n\n\`\`\`\n${asJson(validExtraction)}\n\`\`\`\n\n`;
    expect(parseExtractionResponse(raw)).toEqual(validExtraction);
  });

  it("accepts an empty findings array — a session may yield no reusable knowledge", () => {
    const raw = asJson({ ...validExtraction, findings: [] });
    expect(parseExtractionResponse(raw).findings).toEqual([]);
  });

  it("defaults findings to an empty array when omitted", () => {
    const { findings: _findings, ...withoutFindings } = validExtraction;
    expect(parseExtractionResponse(asJson(withoutFindings)).findings).toEqual([]);
  });

  it("defaults a finding's list fields to empty arrays when omitted", () => {
    const raw = asJson({
      ...validExtraction,
      findings: [
        {
          kind: "handbook-entry",
          title: "A finding with only its required fields",
          body: "Body.",
          rationale: "Reusable.",
        },
      ],
    });
    const [finding] = parseExtractionResponse(raw).findings;
    expect(finding?.relatedChangeIds).toEqual([]);
    expect(finding?.relatedPaths).toEqual([]);
    expect(finding?.tags).toEqual([]);
    expect(finding?.confidence).toBeUndefined();
  });

  it("preserves finding order verbatim — the extractor does not reorder", () => {
    const findings = EXTRACTION_KINDS.map((kind, index) => ({
      kind,
      title: `Finding ${index}`,
      body: "Body.",
      rationale: "Reusable.",
    }));
    const parsed = parseExtractionResponse(asJson({ ...validExtraction, findings }));
    expect(parsed.findings.map((f) => f.title)).toEqual(findings.map((f) => f.title));
  });
});

describe("parseExtractionResponse — kind soft hint", () => {
  it("accepts every declared extraction kind", () => {
    for (const kind of EXTRACTION_KINDS) {
      const raw = asJson({
        ...validExtraction,
        findings: [{ ...validExtraction.findings[0], kind }],
      });
      expect(() => parseExtractionResponse(raw)).not.toThrow();
    }
  });

  it("falls back to 'handbook-entry' for an unrecognized or absent kind", () => {
    const unknown = asJson({
      ...validExtraction,
      findings: [{ ...validExtraction.findings[0], kind: "refactor" }],
    });
    expect(parseExtractionResponse(unknown).findings[0]?.kind).toBe("handbook-entry");

    const { kind: _kind, ...withoutKind } = validExtraction.findings[0];
    const missing = asJson({ ...validExtraction, findings: [withoutKind] });
    expect(parseExtractionResponse(missing).findings[0]?.kind).toBe("handbook-entry");
  });
});

describe("parseExtractionResponse — rejection", () => {
  it("throws ExtractionError on a non-JSON body", () => {
    expect(() => parseExtractionResponse("not json at all")).toThrow(ExtractionError);
  });

  it("throws ExtractionError when a required field is missing", () => {
    const { summary: _summary, ...withoutSummary } = validExtraction;
    expect(() => parseExtractionResponse(asJson(withoutSummary))).toThrow(
      ExtractionError,
    );
  });

  it("throws ExtractionError when the summary has no key points", () => {
    const raw = asJson({
      ...validExtraction,
      summary: { title: "Empty", keyPoints: [] },
    });
    expect(() => parseExtractionResponse(raw)).toThrow(ExtractionError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    const topLevel = asJson({ ...validExtraction, model: "claude-sonnet-5" });
    expect(() => parseExtractionResponse(topLevel)).toThrow(ExtractionError);

    const nested = asJson({
      ...validExtraction,
      findings: [{ ...validExtraction.findings[0], severity: "high" }],
    });
    expect(() => parseExtractionResponse(nested)).toThrow(ExtractionError);
  });

  it("rejects an out-of-range confidence", () => {
    const raw = asJson({
      ...validExtraction,
      findings: [{ ...validExtraction.findings[0], confidence: 1.5 }],
    });
    expect(() => parseExtractionResponse(raw)).toThrow(ExtractionError);
  });

  it("carries a readable message and never a stack trace", () => {
    try {
      parseExtractionResponse("{");
      expect.unreachable("expected ExtractionError");
    } catch (error) {
      expect(error).toBeInstanceOf(ExtractionError);
      expect((error as ExtractionError).message).toContain("valid JSON");
      expect((error as ExtractionError).name).toBe("ExtractionError");
    }
  });
});

describe("parseExtractionResponse — immutability & determinism", () => {
  it("returns a deeply-frozen extraction, including nested findings", () => {
    expect(
      firstUnfrozenPath(parseExtractionResponse(asJson(validExtraction))),
    ).toBeNull();
  });

  it("yields a deep-equal extraction for the same response across runs", () => {
    const raw = asFencedJson(validExtraction);
    expect(parseExtractionResponse(raw)).toEqual(parseExtractionResponse(raw));
  });

  it("exposes the schema for composition (extractor stage, EOS-202)", () => {
    expect(knowledgeExtractionSchema.safeParse(validExtraction).success).toBe(true);
  });
});
