/**
 * Tests for page parsing (ADR-002: frontmatter + generator-owned body), the
 * frontmatter helpers, and the learned-metadata (alias) preservation the
 * feedback layer relies on (ADR-006).
 */
import { describe, expect, it } from "vitest";

import {
  carryLearnedMetadata,
  extractCallouts,
  extractLinks,
  parsePage,
  patchFrontmatter,
  readFrontmatter,
  serializePage,
} from "../../../src/knowledge/compiler/index.js";

const PAGE =
  `---\ntype: entity\ntitle: "AJ-OS"\naliases:\n  - Fantasy Demo\n` +
  `sources:\n  - handbook:a.md\n  - handbook:b.md\ncreated: 2026-07-01\n---\n` +
  `Body text with [[concepts/x|X]].\n`;

describe("parsePage / serializePage", () => {
  it("splits frontmatter and body", () => {
    const parsed = parsePage(PAGE);
    expect(parsed.frontmatter).toContain('title: "AJ-OS"');
    expect(parsed.body).toBe("Body text with [[concepts/x|X]].");
  });

  it("round-trips through serializePage", () => {
    const parsed = parsePage(PAGE);
    const reparsed = parsePage(serializePage(parsed.frontmatter, "new body"));
    expect(reparsed.frontmatter).toContain('title: "AJ-OS"');
    expect(reparsed.body).toBe("new body");
  });

  it("treats a page with no frontmatter as all body", () => {
    const parsed = parsePage("just text");
    expect(parsed.frontmatter).toBe("");
    expect(parsed.body).toBe("just text");
  });
});

describe("readFrontmatter", () => {
  it("reads scalar fields, sources, and aliases", () => {
    const fm = readFrontmatter(parsePage(PAGE).frontmatter);
    expect(fm.fields.type).toBe("entity");
    expect(fm.fields.title).toBe("AJ-OS");
    expect(fm.sources).toEqual(["handbook:a.md", "handbook:b.md"]);
    expect(fm.aliases).toEqual(["Fantasy Demo"]);
  });
});

describe("patchFrontmatter", () => {
  it("overrides sources and scalars while preserving aliases + title", () => {
    const patched = patchFrontmatter(parsePage(PAGE).frontmatter, {
      sources: ["handbook:a.md", "handbook:c.md"],
      scalars: { updated: "2026-07-12", generated_at: "2026-07-12T00:00:00.000Z" },
    });
    const fm = readFrontmatter(patched);
    expect(fm.sources).toEqual(["handbook:a.md", "handbook:c.md"]);
    expect(fm.aliases).toEqual(["Fantasy Demo"]); // preserved
    expect(fm.fields.title).toBe("AJ-OS"); // preserved
    expect(fm.fields.updated).toBe("2026-07-12");
    expect(fm.fields.created).toBe("2026-07-01"); // untouched
  });
});

describe("carryLearnedMetadata", () => {
  it("carries aliases from an existing page into a fresh re-render", () => {
    const fresh = serializePage('type: entity\ntitle: "AJ-OS"', "fresh body");
    const carried = carryLearnedMetadata(PAGE, fresh);
    expect(readFrontmatter(parsePage(carried).frontmatter).aliases).toEqual([
      "Fantasy Demo",
    ]);
    expect(parsePage(carried).body).toBe("fresh body");
  });

  it("is a no-op when the existing page has no learned metadata", () => {
    const existing = serializePage("type: entity\ntitle: X", "b");
    const fresh = serializePage("type: entity\ntitle: X", "c");
    expect(carryLearnedMetadata(existing, fresh)).toBe(fresh);
  });
});

describe("extractLinks / extractCallouts", () => {
  it("extracts every wiki-link", () => {
    expect(extractLinks("see [[a|A]] and [[b/c]]")).toEqual(["[[a|A]]", "[[b/c]]"]);
  });

  it("extracts contradiction callout blocks", () => {
    const text = ["> [!warning] Contradiction", "> A vs B", "outro"].join("\n");
    expect(extractCallouts(text)).toHaveLength(1);
  });
});
