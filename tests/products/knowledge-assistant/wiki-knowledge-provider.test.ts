/**
 * Tests for the Knowledge Assistant's Context Builder integration.
 *
 * `createWikiKnowledgeProvider` is the product-layer adapter that turns the
 * platform's `RetrievalResult[]` into the Context Builder's `KnowledgeProvider`
 * input. These tests exercise the adapter directly and end-to-end through the
 * real, unmodified Context Builder, proving that retrieved wiki articles become
 * a valid `ContextPackage` filed under the canonical `wiki-references` section.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createContextBuilder,
  createProviderRegistry,
} from "../../../src/context-builder/index.js";
import type { RetrievalResult } from "../../../src/platform/retrieval/index.js";
import { createWikiKnowledgeProvider } from "../../../src/products/knowledge-assistant/wikiKnowledgeProvider.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "aj-ctx-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** Write an article file and return a RetrievalResult pointing at it. */
async function article(
  name: string,
  title: string,
  body: string,
  score = 1,
): Promise<RetrievalResult> {
  const path = join(dir, name);
  await writeFile(path, body, "utf8");
  return { path, title, score };
}

const CONFIG = {
  profile: "documentation",
  explainability: true,
  outputFormat: "markdown",
} as const;

const FIXED_NOW = () => "2026-07-10T00:00:00.000Z";

describe("createWikiKnowledgeProvider", () => {
  it("reads each retrieved article's body into a wiki KnowledgeItem", async () => {
    const results = [
      await article("about-me.md", "About Me", "# About Me\n\nWho AJ is."),
    ];

    const items = await createWikiKnowledgeProvider(results).provide({
      project: "aj-os",
      task: "who am i",
    });

    expect(items).toHaveLength(1);
    expect(items[0]!.id).toBe("about-me");
    expect(items[0]!.source).toEqual({
      id: "about-me",
      type: "wiki",
      title: "About Me",
    });
    expect(items[0]!.content).toContain("Who AJ is.");
  });

  it("skips articles whose body is empty (a KnowledgeItem must carry knowledge)", async () => {
    const results = [
      await article("empty.md", "Empty", "   \n  "),
      await article("real.md", "Real", "# Real\n\nActual content."),
    ];

    const items = await createWikiKnowledgeProvider(results).provide({
      project: "aj-os",
      task: "q",
    });

    expect(items.map((i) => i.id)).toEqual(["real"]);
  });

  it("advertises stable provider metadata", () => {
    const provider = createWikiKnowledgeProvider([]);

    expect(provider.id).toBe("wiki");
    expect(provider.name.length).toBeGreaterThan(0);
    expect(provider.description.length).toBeGreaterThan(0);
  });
});

describe("Context Builder integration (RetrievalResult[] → ContextPackage)", () => {
  it("assembles retrieved articles into wiki references and a wiki-references section", async () => {
    const results = [
      await article("about-me.md", "About Me", "# About Me\n\nWho AJ is."),
      await article("aj-os.md", "AJ-OS", "# AJ-OS\n\nThe operating system."),
    ];

    const builder = createContextBuilder(
      CONFIG,
      createProviderRegistry([createWikiKnowledgeProvider(results)]),
      FIXED_NOW,
    );

    const pkg = await builder.build({ project: "aj-os", task: "who am i" });

    // References carry the retrieved titles, all typed as wiki sources.
    expect(pkg.references.map((r) => r.title)).toEqual(["About Me", "AJ-OS"]);
    expect(pkg.references.every((r) => r.type === "wiki")).toBe(true);

    // The wiki sources land in the canonical wiki-references section.
    const wikiSection = pkg.sections.find((s) => s.kind === "wiki-references");
    expect(wikiSection?.referenceIds).toEqual(["about-me", "aj-os"]);

    // Provenance flows from the request; the injected clock is used verbatim.
    expect(pkg.metadata.project).toBe("aj-os");
    expect(pkg.metadata.task).toBe("who am i");
    expect(pkg.metadata.generatedAt).toBe("2026-07-10T00:00:00.000Z");
  });

  it("is deterministic for identical inputs and an injected clock", async () => {
    const results = [
      await article("a.md", "A", "# A\n\nalpha content"),
      await article("b.md", "B", "# B\n\nbeta content"),
    ];

    const build = () =>
      createContextBuilder(
        CONFIG,
        createProviderRegistry([createWikiKnowledgeProvider(results)]),
        FIXED_NOW,
      ).build({ project: "aj-os", task: "q" });

    expect(await build()).toEqual(await build());
  });
});
