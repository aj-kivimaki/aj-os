/**
 * Tests for the compiler's LLM boundary: JSON parsing + schema validation.
 */
import { describe, expect, it } from "vitest";

import { CompilerError, parseExtraction } from "../../../src/knowledge/compiler/index.js";

const VALID = JSON.stringify({
  summary: { title: "T", keyPoints: ["a point"] },
  entities: [{ name: "AJ-OS", type: "product", description: "an OS" }],
  concepts: [{ name: "LLM Wiki", description: "compiled knowledge" }],
});

describe("parseExtraction", () => {
  it("parses a valid JSON extraction", () => {
    const result = parseExtraction(VALID);
    expect(result.summary.title).toBe("T");
    expect(result.entities[0]!.type).toBe("product");
  });

  it("tolerates a ```json code fence around the JSON", () => {
    const result = parseExtraction("```json\n" + VALID + "\n```");
    expect(result.concepts[0]!.name).toBe("LLM Wiki");
  });

  it("accepts empty entity and concept arrays", () => {
    const result = parseExtraction(
      JSON.stringify({
        summary: { title: "T", keyPoints: ["p"] },
        entities: [],
        concepts: [],
      }),
    );
    expect(result.entities).toEqual([]);
  });

  it("throws CompilerError on non-JSON output", () => {
    expect(() => parseExtraction("I could not do that.")).toThrow(CompilerError);
  });

  it("throws CompilerError when required fields are missing", () => {
    expect(() =>
      parseExtraction(
        JSON.stringify({ summary: { title: "T" }, entities: [], concepts: [] }),
      ),
    ).toThrow(CompilerError);
  });

  it("coerces an unknown entity type to 'other' rather than failing", () => {
    const result = parseExtraction(
      JSON.stringify({
        summary: { title: "T", keyPoints: ["p"] },
        entities: [{ name: "X", type: "spaceship", description: "d" }],
        concepts: [],
      }),
    );
    expect(result.entities[0]!.type).toBe("other");
  });

  it("throws CompilerError when the summary has no key points", () => {
    expect(() =>
      parseExtraction(
        JSON.stringify({
          summary: { title: "T", keyPoints: [] },
          entities: [],
          concepts: [],
        }),
      ),
    ).toThrow(CompilerError);
  });
});
