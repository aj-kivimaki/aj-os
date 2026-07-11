/**
 * Tests for page region parsing (ADR-004 §5) and the mechanical extractors
 * MERGE's guards rely on.
 */
import { describe, expect, it } from "vitest";

import {
  GENERATED_BEGIN,
  GENERATED_END,
  extractCallouts,
  extractLinks,
  parsePage,
  readFrontmatter,
  serializePage,
} from "../../../src/knowledge/compiler/index.js";

const PAGE =
  `---\ntype: entity\ntitle: "AJ-OS"\nsources:\n  - handbook:a.md\n  - handbook:b.md\n---\n` +
  `${GENERATED_BEGIN}\nGenerated body [[concepts/x|X]].\n${GENERATED_END}\n\n` +
  `## Notes (human)\nhand-written.\n`;

describe("parsePage / serializePage", () => {
  it("splits frontmatter, generated region, and human region", () => {
    const parsed = parsePage(PAGE);
    expect(parsed.generated).toBe("Generated body [[concepts/x|X]].");
    expect(parsed.human).toBe("## Notes (human)\nhand-written.");
    expect(parsed.frontmatter).toContain('title: "AJ-OS"');
  });

  it("round-trips through serializePage preserving the human region", () => {
    const parsed = parsePage(PAGE);
    const rebuilt = serializePage(
      parsed.frontmatter,
      "new generated",
      parsed.human,
    );
    const reparsed = parsePage(rebuilt);
    expect(reparsed.generated).toBe("new generated");
    expect(reparsed.human).toBe("## Notes (human)\nhand-written.");
  });

  it("reports generated=null when a page has no markers", () => {
    const parsed = parsePage(`---\ntype: entity\n---\njust human text`);
    expect(parsed.generated).toBeNull();
    expect(parsed.human).toBe("just human text");
  });
});

describe("readFrontmatter", () => {
  it("reads scalar fields (unquoted) and the sources list", () => {
    const fm = readFrontmatter(parsePage(PAGE).frontmatter);
    expect(fm.fields.type).toBe("entity");
    expect(fm.fields.title).toBe("AJ-OS");
    expect(fm.sources).toEqual(["handbook:a.md", "handbook:b.md"]);
  });
});

describe("extractLinks / extractCallouts", () => {
  it("extracts every wiki-link", () => {
    expect(extractLinks("see [[a|A]] and [[b/c]]")).toEqual(["[[a|A]]", "[[b/c]]"]);
  });

  it("extracts contradiction callout blocks", () => {
    const text = [
      "intro",
      "> [!warning] Contradiction",
      "> claim A (src1) vs claim B (src2)",
      "outro",
      "> [!note] not a warning",
    ].join("\n");
    const callouts = extractCallouts(text);
    expect(callouts).toHaveLength(1);
    expect(callouts[0]).toContain("[!warning] Contradiction");
  });
});
