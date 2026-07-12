/**
 * Deterministic tests for page rendering (SPEC-005 §21.5).
 *
 * Renders a fixed extraction (no LLM) to assert the page schema, slugs, and
 * the graph links that make this an LLM Wiki rather than a summarizer.
 */
import { describe, expect, it } from "vitest";

import type { SourceRecord } from "../../../src/ingestion/index.js";
import type { SourceExtraction } from "../../../src/knowledge/compiler/index.js";
import { slugify } from "../../../src/knowledge/naming.js";
import {
  buildSlugIdentities,
  renderPages,
} from "../../../src/knowledge/renderer/index.js";

const SOURCE: SourceRecord = {
  id: "handbook:foundation/04-aj-os/vision.md",
  uri: "file:///vision.md",
  content: "irrelevant to rendering",
  hash: "abc123",
  metadata: { relativePath: "foundation/04-aj-os/vision.md", bytes: 22 },
};

const EXTRACTION: SourceExtraction = {
  summary: { title: "AJ-OS Vision", keyPoints: ["Code-first OS", "Handbook is truth"] },
  entities: [
    { name: "AJ-OS", type: "product", description: "A developer operating system." },
    { name: "AJ Kivimäki", type: "person", description: "The builder." },
  ],
  concepts: [{ name: "LLM Wiki", description: "Compiled knowledge layer." }],
};

const AT = "2026-07-12T08:00:00.000Z";

function render(extraction: SourceExtraction = EXTRACTION) {
  return renderPages(SOURCE, extraction, buildSlugIdentities(extraction), AT);
}

function byPath(pages: ReturnType<typeof render>, path: string) {
  return pages.find((p) => p.path === path);
}

describe("slugify", () => {
  it("kebab-cases and strips diacritics", () => {
    expect(slugify("AJ Kivimäki")).toBe("aj-kivimaki");
    expect(slugify("LLM Wiki")).toBe("llm-wiki");
    expect(slugify("  Weird__Name!! ")).toBe("weird-name");
  });

  it("falls back to 'unnamed' for empty slugs", () => {
    expect(slugify("!!!")).toBe("unnamed");
  });
});

describe("renderPages", () => {
  it("produces one page per entity, concept, and the source summary", () => {
    const pages = render();
    expect(pages.map((p) => p.path).sort()).toEqual([
      "concepts/llm-wiki.md",
      "entities/aj-kivimaki.md",
      "entities/aj-os.md",
      "sources/foundation/04-aj-os/vision.md",
    ]);
  });

  it("renders the source summary with frontmatter, key points, and graph links", () => {
    const summary = byPath(render(), "sources/foundation/04-aj-os/vision.md")!;
    expect(summary.kind).toBe("source");
    expect(summary.content).toContain("type: source");
    expect(summary.content).toContain('title: "AJ-OS Vision"');
    expect(summary.content).toContain("  - handbook:foundation/04-aj-os/vision.md");
    expect(summary.content).toContain("hash: abc123");
    expect(summary.content).toContain("generated_at: 2026-07-12T08:00:00.000Z");
    expect(summary.content).toContain("- Code-first OS");
    // Links out to every entity and concept.
    expect(summary.content).toContain("- [[entities/aj-os|AJ-OS]]");
    expect(summary.content).toContain("- [[entities/aj-kivimaki|AJ Kivimäki]]");
    expect(summary.content).toContain("- [[concepts/llm-wiki|LLM Wiki]]");
    // Provenance link to the origin document (full-path form, no .md).
    expect(summary.content).toContain("[[foundation/04-aj-os/vision|AJ-OS Vision]]");
  });

  it("renders entity pages that link back to the source summary", () => {
    const entity = byPath(render(), "entities/aj-os.md")!;
    expect(entity.kind).toBe("entity");
    expect(entity.content).toContain("type: entity");
    expect(entity.content).toContain("entity_type: product");
    expect(entity.content).toContain("A developer operating system.");
    expect(entity.content).toContain(
      "Source: [[sources/foundation/04-aj-os/vision|AJ-OS Vision]]",
    );
  });

  it("renders concept pages under concepts/ with a backlink", () => {
    const concept = byPath(render(), "concepts/llm-wiki.md")!;
    expect(concept.kind).toBe("concept");
    expect(concept.content).toContain("type: concept");
    expect(concept.content).toContain("Compiled knowledge layer.");
    expect(concept.content).toContain(
      "Source: [[sources/foundation/04-aj-os/vision|AJ-OS Vision]]",
    );
  });

  it("records the contributing source id on every page (provenance)", () => {
    for (const page of render()) {
      expect(page.sources).toEqual(["handbook:foundation/04-aj-os/vision.md"]);
    }
  });

  it("omits the Entities/Concepts sections when there are none", () => {
    const pages = render({
      summary: { title: "T", keyPoints: ["only a point"] },
      entities: [],
      concepts: [],
    });
    expect(pages).toHaveLength(1);
    expect(pages[0]!.content).not.toContain("## Entities");
    expect(pages[0]!.content).not.toContain("## Concepts");
  });

  it("renders lateral related links, skipping unknown targets", () => {
    const pages = render({
      summary: { title: "T", keyPoints: ["p"] },
      entities: [
        { name: "AJ-OS", type: "product", description: "d", related: ["Notion", "Schema Engine", "Ghost"] },
        { name: "Notion", type: "product", description: "d", related: [] },
      ],
      concepts: [{ name: "Schema Engine", description: "d", related: ["AJ-OS"] }],
    });

    const ajos = byPath(pages, "entities/aj-os.md")!;
    expect(ajos.content).toContain("## Related");
    expect(ajos.content).toContain("- [[entities/notion|Notion]]");
    expect(ajos.content).toContain("- [[concepts/schema-engine|Schema Engine]]");
    // "Ghost" is not an extracted item → no link (no broken links).
    expect(ajos.content).not.toContain("Ghost");
    // Concept links back to the entity (a web, not a star).
    expect(byPath(pages, "concepts/schema-engine.md")!.content).toContain(
      "- [[entities/aj-os|AJ-OS]]",
    );
  });

  it("dedupes entities that slugify to the same name", () => {
    const pages = render({
      summary: { title: "T", keyPoints: ["p"] },
      entities: [
        { name: "AJ-OS", type: "product", description: "first" },
        { name: "AJ OS", type: "product", description: "dup" },
      ],
      concepts: [],
    });
    expect(pages.filter((p) => p.path === "entities/aj-os.md")).toHaveLength(1);
  });
});
