/**
 * Tests for MERGE — guarded LLM re-synthesis (ADR-004).
 *
 * Uses the real renderer to build the existing + incoming pages, and a stub
 * generator to drive the merge deterministically: a faithful merge passes
 * the guards; a lossy merge trips them and falls back to append.
 */
import { describe, expect, it, vi } from "vitest";

import type { SourceRecord } from "../../../src/ingestion/index.js";
import type { AIResponse } from "../../../src/platform/ai/index.js";
import {
  createLlmMergeEngine,
  parsePage,
  readFrontmatter,
  renderPages,
  serializePage,
  type CompiledPage,
  type SourceExtraction,
  type TextGenerator,
} from "../../../src/knowledge/compiler/index.js";

const AT = () => new Date("2026-07-12T10:00:00.000Z");

function source(id: string): SourceRecord {
  return {
    id,
    uri: `file:///${id}`,
    content: "irrelevant",
    hash: id,
    metadata: {},
  };
}

function extraction(title: string, description: string): SourceExtraction {
  return {
    summary: { title, keyPoints: [title] },
    entities: [{ name: "AJ-OS", type: "product", description }],
    concepts: [],
  };
}

/** The `entities/aj-os.md` page compiled from a single source. */
function entityPage(id: string, title: string, description: string): CompiledPage {
  const pages = renderPages(
    source(id),
    extraction(title, description),
    AT().toISOString(),
  );
  return pages.find((p) => p.path === "entities/aj-os.md")!;
}

function stub(text: string): TextGenerator {
  return { complete: vi.fn(async (): Promise<AIResponse> => ({ text, model: "stub" })) };
}

const EXISTING = entityPage("handbook:library/a.md", "Note A", "AJ-OS is an OS.").content;
const INCOMING = entityPage("handbook:library/b.md", "Note B", "AJ-OS syncs with Notion.");
const EXISTING_LINK = "[[sources/library/a|Note A]]";

describe("MERGE — guarded re-synthesis", () => {
  it("accepts a faithful re-synthesis that retains the prior link", async () => {
    const merged =
      `AJ-OS is an OS that syncs with Notion.\n\n` +
      `Source: ${EXISTING_LINK}\nSource: [[sources/library/b|Note B]]`;
    const engine = createLlmMergeEngine({ generator: stub(merged) }, AT);

    const outcome = await engine.merge(EXISTING, INCOMING);

    expect(outcome.mode).toBe("resynthesized");
    expect(outcome.guardFailures).toEqual([]);
    expect(outcome.provenance).toEqual([
      "handbook:library/a.md",
      "handbook:library/b.md",
    ]);
    expect(outcome.content).toContain("syncs with Notion");
    // provenance widened in frontmatter:
    const fm = readFrontmatter(parsePage(outcome.content!).frontmatter);
    expect(fm.sources).toEqual(["handbook:library/a.md", "handbook:library/b.md"]);
  });

  it("falls back to a lossless append when the re-synthesis drops a prior link", async () => {
    // The model 'forgets' the existing Source link → link-retention guard trips.
    const lossy = "AJ-OS is an OS that syncs with Notion.";
    const engine = createLlmMergeEngine({ generator: stub(lossy) }, AT);

    const outcome = await engine.merge(EXISTING, INCOMING);

    expect(outcome.mode).toBe("appended");
    expect(outcome.guardFailures.some((f) => f.startsWith("link-dropped"))).toBe(true);
    // Nothing lost: the existing link survives, and the new content is added.
    expect(outcome.content).toContain(EXISTING_LINK);
    expect(outcome.content).toContain("[[sources/library/b|Note B]]");
    // provenance still widened.
    expect(outcome.provenance).toEqual([
      "handbook:library/a.md",
      "handbook:library/b.md",
    ]);
  });

  it("falls back to append when a contradiction callout would be dropped", async () => {
    const withCallout = serializePage(
      `type: entity\ntitle: "AJ-OS"\nsources:\n  - handbook:library/a.md\ncreated: 2026-07-01\ngenerated_at: 2026-07-01T00:00:00.000Z`,
      `AJ-OS is an OS.\n\n> [!warning] Contradiction\n> A says X; B says Y.\n\nSource: ${EXISTING_LINK}`,
    );
    // Re-synthesis keeps the link but drops the callout.
    const engine = createLlmMergeEngine(
      { generator: stub(`AJ-OS is an OS. Source: ${EXISTING_LINK}`) },
      AT,
    );

    const outcome = await engine.merge(withCallout, INCOMING);

    expect(outcome.mode).toBe("appended");
    expect(outcome.guardFailures).toContain("callout-dropped");
    expect(outcome.content).toContain("> [!warning] Contradiction");
  });

  it("never touches the human-owned region", async () => {
    const withHuman = serializePage(
      `type: entity\ntitle: "AJ-OS"\nsources:\n  - handbook:library/a.md\ncreated: 2026-07-01\ngenerated_at: 2026-07-01T00:00:00.000Z`,
      `AJ-OS is an OS.\n\nSource: ${EXISTING_LINK}`,
      "## My notes\nHand-written and sacred.",
    );
    const engine = createLlmMergeEngine(
      { generator: stub(`AJ-OS syncs with Notion.\nSource: ${EXISTING_LINK}`) },
      AT,
    );

    const outcome = await engine.merge(withHuman, INCOMING);

    expect(outcome.mode).toBe("resynthesized");
    expect(parsePage(outcome.content!).human).toBe(
      "## My notes\nHand-written and sacred.",
    );
  });

  it("defers with a proposal when the page has no generator-owned region", async () => {
    const noMarkers = `---\ntype: entity\ntitle: "AJ-OS"\nsources:\n  - handbook:library/a.md\n---\nentirely hand-written page`;
    const engine = createLlmMergeEngine({ generator: stub("ignored") }, AT);

    const outcome = await engine.merge(noMarkers, INCOMING);

    expect(outcome.mode).toBe("deferred");
    expect(outcome.content).toBeUndefined();
    expect(outcome.proposal?.path).toBe("entities/aj-os.md");
    // provenance is still computed as the intended superset.
    expect(outcome.provenance).toEqual([
      "handbook:library/a.md",
      "handbook:library/b.md",
    ]);
  });
});
