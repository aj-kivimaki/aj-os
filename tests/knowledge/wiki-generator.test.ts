/**
 * Orchestration tests for the staged Wiki Generator (SPEC-005 §22, ADR-005).
 *
 * The generator composes: KnowledgeCompiler (extract) → IdentityResolver
 * (resolve) → WikiRenderer (render) → MergeEngine (enrich) → WikiStore. Here
 * the compiler and merge engine are deterministic stubs, and the resolver +
 * renderer are the real slug-based defaults, so these tests exercise the
 * *orchestration*: CREATE / MERGE / RE-DERIVE / STALE and RECONCILE.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { SourceConnector, SourceRecord } from "../../src/ingestion/index.js";
import {
  createFilesystemWikiStore,
  type WikiStore,
} from "../../src/knowledge/wiki-store/index.js";
import {
  parsePage,
  readFrontmatter,
  serializePage,
  type CompiledPage,
  type ExtractedKnowledge,
  type KnowledgeCompiler,
  type MergeEngine,
} from "../../src/knowledge/compiler/index.js";
import { createSlugIdentityResolver } from "../../src/knowledge/identity/index.js";
import { createWikiRenderer } from "../../src/knowledge/renderer/index.js";
import {
  createWikiGenerator,
  WikiGeneratorError,
} from "../../src/knowledge/wiki-generator/index.js";

const CLOCK = () => new Date("2026-07-12T12:00:00.000Z");
const resolver = createSlugIdentityResolver();
const renderer = createWikiRenderer();

let wikiRoot: string;
let store: WikiStore;

function record(id: string, hash = id): SourceRecord {
  return { id, uri: `file:///${id}`, content: id, hash, metadata: {} };
}

function makePage(
  path: string,
  kind: CompiledPage["kind"],
  sources: string[],
  body: string,
): CompiledPage {
  const fm = [
    "type: " + kind,
    'title: "T"',
    "sources:",
    ...sources.map((s) => `  - ${s}`),
  ].join("\n");
  return { path, kind, title: "T", sources, content: serializePage(fm, body) };
}

/** Each source extracts to a summary plus a shared entity named "shared". */
const compiler: KnowledgeCompiler = {
  compile: async (source): Promise<ExtractedKnowledge> => ({
    source,
    extraction: {
      summary: { title: `summary ${source.id}`, keyPoints: [source.id] },
      entities: [
        { name: "shared", type: "other", description: `${source.id} says`, related: [] },
      ],
      concepts: [],
    },
  }),
};

/** A merge engine that unions provenance and rewrites the page. */
const mergeEngine: MergeEngine = {
  merge: async (existing, incoming) => {
    const existingSources = readFrontmatter(parsePage(existing).frontmatter).sources;
    const union = [...new Set([...existingSources, ...incoming.sources])].sort();
    return {
      path: incoming.path,
      mode: "resynthesized",
      provenance: union,
      guardFailures: [],
      content: makePage(incoming.path, incoming.kind, union, "MERGED").content,
    };
  },
};

/** A merge engine that always defers. */
const deferringMergeEngine: MergeEngine = {
  merge: async (_existing, incoming) => ({
    path: incoming.path,
    mode: "deferred",
    provenance: [...incoming.sources],
    guardFailures: ["no-generated-region"],
    proposal: { path: incoming.path, reason: "needs manual merge" },
  }),
};

function generator(
  records: SourceRecord[],
  merge: MergeEngine = mergeEngine,
  compile: KnowledgeCompiler = compiler,
) {
  const connector: SourceConnector = { kind: "handbook", list: async () => records };
  return createWikiGenerator(
    {
      connectors: [connector],
      store,
      compiler: compile,
      resolver,
      renderer,
      mergeEngine: merge,
    },
    CLOCK,
  );
}

async function provenance(path: string): Promise<string[]> {
  const content = (await store.read(path))!;
  return [...readFrontmatter(parsePage(content).frontmatter).sources];
}

beforeEach(async () => {
  wikiRoot = await realpath(await mkdtemp(join(tmpdir(), "aj-gen-")));
  store = createFilesystemWikiStore({ destination: wikiRoot });
});

afterEach(async () => {
  await rm(wikiRoot, { recursive: true, force: true });
});

describe("WikiGenerator INGEST (staged pipeline)", () => {
  it("creates a source's summary and entity pages on first ingest", async () => {
    const report = await generator([record("a.md")]).run();

    expect(report.ingested).toEqual(["a.md"]);
    expect(report.updatedPages).toEqual(["entities/shared.md", "sources/a.md"]);
    expect(await store.read("sources/a.md")).toContain("summary a.md");
    expect(await provenance("entities/shared.md")).toEqual(["a.md"]);
  });

  it("writes a corpus catalog (index.md) listing generated pages", async () => {
    await generator([record("a.md")]).run();

    const index = await store.read("index.md");
    expect(index).not.toBeNull();
    expect(index).toContain("## Entities");
    expect(index).toContain("[[shared]]"); // entity linked by bare slug
    expect(index).toContain("## Sources");
    expect(index).toContain("[[sources/a]]"); // source linked by path
  });

  it("merges a second source into a shared page, unioning provenance", async () => {
    const report = await generator([record("a.md"), record("b.md")]).run();

    expect(await provenance("entities/shared.md")).toEqual(["a.md", "b.md"]);
    expect(await store.read("entities/shared.md")).toContain("MERGED");
    expect(report.updatedPages).toContain("entities/shared.md");
  });

  it("is idempotent: a second run with no changes writes nothing", async () => {
    await generator([record("a.md")]).run();
    const second = await generator([record("a.md")]).run();

    expect(second.ingested).toEqual([]);
    expect(second.updatedPages).toEqual([]);
  });

  it("re-derives a source's own page but marks a shared page stale on modify", async () => {
    await generator([record("a.md"), record("b.md")]).run();

    const report = await generator([record("a.md", "a-v2"), record("b.md")]).run();

    expect(report.ingested).toEqual(["a.md"]);
    expect(report.updatedPages).toContain("sources/a.md");
    expect(report.stalePages).toContain("entities/shared.md");
    expect(await store.read("entities/shared.md")).toContain(
      "stale_reason: source-modified",
    );
  });

  it("leaves a page untouched when the merge engine defers", async () => {
    await generator([record("a.md")]).run();
    const before = await store.read("entities/shared.md");

    const report = await generator(
      [record("a.md"), record("b.md")],
      deferringMergeEngine,
    ).run();

    expect(await store.read("entities/shared.md")).toBe(before);
    expect(report.updatedPages).not.toContain("entities/shared.md");
  });

  it("skips a source whose extraction fails and continues the batch", async () => {
    const flaky: KnowledgeCompiler = {
      compile: async (s) => {
        if (s.id === "bad.md") {
          throw new Error("boom");
        }
        return compiler.compile(s);
      },
    };
    const report = await generator(
      [record("a.md"), record("bad.md")],
      mergeEngine,
      flaky,
    ).run();

    expect(report.ingested).toEqual(["a.md"]);
    expect(report.failed).toEqual(["bad.md"]);
    expect(await store.read("sources/a.md")).not.toBeNull();
  });
});

describe("WikiGenerator RECONCILE (multi-source)", () => {
  it("marks a fully-orphaned page stale with a removal proposal", async () => {
    await generator([record("a.md")]).run();

    const report = await generator([]).run(); // a removed

    expect(report.reconciled).toEqual(["a.md"]);
    expect(report.stalePages).toContain("sources/a.md");
    expect(report.removalProposals).toContainEqual({
      path: "sources/a.md",
      reason: "All contributing sources were removed.",
      orphanedSources: ["a.md"],
    });
  });

  it("keeps a partially-orphaned shared page (stale, no proposal)", async () => {
    await generator([record("a.md"), record("b.md")]).run();

    const report = await generator([record("a.md")]).run(); // b removed

    expect(report.stalePages).toContain("entities/shared.md");
    expect(await store.read("entities/shared.md")).toContain(
      "stale_reason: partial-orphan",
    );
    expect(report.removalProposals.map((p) => p.path)).not.toContain(
      "entities/shared.md",
    );
    expect(await provenance("entities/shared.md")).toEqual(["a.md", "b.md"]);
    expect(report.removalProposals.map((p) => p.path)).toContain("sources/b.md");
  });
});

describe("WikiGenerator errors", () => {
  it("throws on duplicate source ids across connectors", async () => {
    const c1: SourceConnector = { kind: "handbook", list: async () => [record("a.md")] };
    const c2: SourceConnector = { kind: "handbook", list: async () => [record("a.md")] };
    const gen = createWikiGenerator(
      { connectors: [c1, c2], store, compiler, resolver, renderer, mergeEngine },
      CLOCK,
    );
    await expect(gen.run()).rejects.toThrow(/Duplicate source id/);
  });

  it("throws on incompatible generator state", async () => {
    await store.write(".generator/state.json", JSON.stringify({ version: 1 }));
    await expect(generator([record("a.md")]).run()).rejects.toBeInstanceOf(
      WikiGeneratorError,
    );
  });
});
