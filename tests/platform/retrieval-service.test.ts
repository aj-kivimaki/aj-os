/**
 * Contract tests for the platform Retrieval Service (PRODUCT-001, Milestone 4).
 *
 * Each test builds an isolated wiki in a temp directory and exercises the
 * service through its public entry point. The tests know nothing about the
 * Knowledge Assistant — they depend only on the platform module.
 *
 * The searchable corpus is defined by `wiki/index.md`: the service scores only
 * the articles the index links to. These tests pin that contract — they assert
 * that unlinked files (maintainer docs like `CLAUDE.md`) are never searched and
 * that the wiki tree is not scanned recursively for candidates.
 */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { RetrievalService } from "../../src/platform/retrieval/index.js";

let wiki: string;

beforeEach(async () => {
  wiki = await mkdtemp(join(tmpdir(), "aj-wiki-"));
});

afterEach(async () => {
  await rm(wiki, { recursive: true, force: true });
});

async function writeArticle(relPath: string, contents: string): Promise<void> {
  const full = join(wiki, relPath);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, contents, "utf8");
}

/** Write `index.md` listing the given slugs as Obsidian wiki links. */
async function writeIndex(...slugs: string[]): Promise<void> {
  const body = ["# Index", "", ...slugs.map((s) => `- [[${s}]] — catalog entry`)];
  await writeArticle("index.md", body.join("\n"));
}

describe("RetrievalService", () => {
  it("returns nothing for an empty wiki (no index to define the corpus)", async () => {
    const results = await new RetrievalService(wiki).search("context builder");

    expect(results).toEqual([]);
  });

  it("returns nothing when the index links no articles", async () => {
    await writeIndex();
    await writeArticle("context-builder.md", "# Context Builder\n\ncontext builder");

    const results = await new RetrievalService(wiki).search("context builder");

    expect(results).toEqual([]);
  });

  it("matches a linked article and uses its heading as the title", async () => {
    await writeIndex("context-builder");
    await writeArticle(
      "context-builder.md",
      "# Context Builder\n\nThe context builder assembles context.",
    );

    const results = await new RetrievalService(wiki).search("context builder");

    expect(results).toHaveLength(1);
    expect(results[0]!.title).toBe("Context Builder");
    expect(results[0]!.path).toBe(join(wiki, "context-builder.md"));
    expect(results[0]!.score).toBeGreaterThan(0);
  });

  it("only considers articles the index links", async () => {
    await writeIndex("match");
    await writeArticle("match.md", "# Match\n\nDependency injection wiring.");
    // Present on disk and a strong keyword match, but not linked by the index.
    await writeArticle("miss.md", "# Miss\n\nDependency injection injection injection.");

    const results = await new RetrievalService(wiki).search("dependency injection");

    expect(results.map((r) => r.title)).toEqual(["Match"]);
  });

  it("ignores unlinked maintainer files such as CLAUDE.md", async () => {
    await writeIndex("about-me");
    await writeArticle("about-me.md", "# About Me\n\nWho I am and what I do.");
    // A maintainer doc written in the first person — a strong "i" match under
    // the naive scorer, yet absent from the index and therefore never searched.
    await writeArticle(
      "CLAUDE.md",
      "# Wiki Maintainer Schema\n\nI maintain the wiki. I read the index. I update.",
    );

    const results = await new RetrievalService(wiki).search("who am i");

    expect(results.map((r) => r.title)).toEqual(["About Me"]);
  });

  it("resolves links to articles that live in subdirectories", async () => {
    await writeIndex("about-me", "wwise");
    await writeArticle("sources/about-me.md", "# About Me\n\nsearchterm here");
    await writeArticle("entities/wwise.md", "# Wwise\n\nsearchterm again");

    const results = await new RetrievalService(wiki).search("searchterm");

    expect(results.map((r) => r.title).sort()).toEqual(["About Me", "Wwise"]);
  });

  it("does not recursively scan the wiki tree for candidates", async () => {
    await writeIndex("linked");
    await writeArticle("linked.md", "# Linked\n\nsearchterm");
    // A matching file nested two levels deep and not linked: a recursive scan
    // would surface it, an index-driven corpus must not.
    await writeArticle("nested/deep/orphan.md", "# Orphan\n\nsearchterm searchterm");

    const results = await new RetrievalService(wiki).search("searchterm");

    expect(results.map((r) => r.title)).toEqual(["Linked"]);
  });

  it("ranks more relevant articles first", async () => {
    await writeIndex("strong", "weak");
    await writeArticle("strong.md", "# Strong\n\nprompt prompt prompt renderer renderer");
    await writeArticle("weak.md", "# Weak\n\nprompt mentioned once here.");

    const results = await new RetrievalService(wiki).search("prompt renderer");

    expect(results.map((r) => r.title)).toEqual(["Strong", "Weak"]);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
  });

  it("returns at most five articles", async () => {
    const slugs = Array.from({ length: 8 }, (_, i) => `article-${i}`);
    await writeIndex(...slugs);
    for (const slug of slugs) {
      await writeArticle(`${slug}.md`, `# ${slug}\n\nkeyword`);
    }

    const results = await new RetrievalService(wiki).search("keyword");

    expect(results).toHaveLength(5);
  });

  it("falls back to the file name when there is no heading", async () => {
    await writeIndex("no-heading");
    await writeArticle("no-heading.md", "Just body text about widgets.");

    const results = await new RetrievalService(wiki).search("widgets");

    expect(results).toHaveLength(1);
    expect(results[0]!.title).toBe("no-heading");
  });
});
