/**
 * Orchestration tests for the integrated Wiki Generator (SPEC-005 §22).
 *
 * The generator composes a KnowledgeCompiler, a MergeEngine, and a WikiStore.
 * Here the compiler and merge engine are deterministic stubs (the real LLM
 * behavior is proven in the compiler/merge tests and end-to-end), so these
 * tests exercise the *orchestration*: CREATE / MERGE / RE-DERIVE / STALE on
 * INGEST, and partial/full orphan on RECONCILE.
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
  type CompiledKnowledge,
  type CompiledPage,
  type KnowledgeCompiler,
  type MergeEngine,
} from "../../src/knowledge/compiler/index.js";
import {
  createWikiGenerator,
  WikiGeneratorError,
} from "../../src/knowledge/wiki-generator/index.js";

const CLOCK = () => new Date("2026-07-12T12:00:00.000Z");

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
  const fm = ["type: " + kind, 'title: "T"', "sources:", ...sources.map((s) => `  - ${s}`)].join(
    "\n",
  );
  return { path, kind, title: "T", sources, content: serializePage(fm, body) };
}

/** Each source compiles to its own summary page plus a shared entity page. */
const compiler: KnowledgeCompiler = {
  compile: async (source): Promise<CompiledKnowledge> => ({
    sourceId: source.id,
    pages: [
      makePage(`sources/${source.id}.md`, "source", [source.id], `summary ${source.id}`),
      makePage("entities/shared.md", "entity", [source.id], `${source.id} says something`),
    ],
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

/** A merge engine that always defers (cannot merge safely). */
const deferringMergeEngine: MergeEngine = {
  merge: async (_existing, incoming) => ({
    path: incoming.path,
    mode: "deferred",
    provenance: [...incoming.sources],
    guardFailures: ["no-generated-region"],
    proposal: { path: incoming.path, reason: "needs manual merge" },
  }),
};

function generator(records: SourceRecord[], merge: MergeEngine = mergeEngine) {
  const connector: SourceConnector = {
    kind: "handbook",
    list: async () => records,
  };
  return createWikiGenerator(
    { connectors: [connector], store, compiler, mergeEngine: merge },
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

describe("WikiGenerator INGEST (integrated compiler)", () => {
  it("creates a source's summary and entity pages on first ingest", async () => {
    const report = await generator([record("a")]).run();

    expect(report.ingested).toEqual(["a"]);
    expect(report.updatedPages).toEqual(["entities/shared.md", "sources/a.md"]);
    expect(await store.read("sources/a.md")).toContain("summary a");
    expect(await provenance("entities/shared.md")).toEqual(["a"]);
  });

  it("merges a second source into a shared page, unioning provenance", async () => {
    const report = await generator([record("a"), record("b")]).run();

    // entities/shared.md is created by a, then merged with b.
    expect(await provenance("entities/shared.md")).toEqual(["a", "b"]);
    expect(await store.read("entities/shared.md")).toContain("MERGED");
    expect(report.updatedPages).toContain("entities/shared.md");
  });

  it("is idempotent: a second run with no changes writes nothing", async () => {
    await generator([record("a")]).run();
    const second = await generator([record("a")]).run();

    expect(second.ingested).toEqual([]);
    expect(second.updatedPages).toEqual([]);
  });

  it("re-derives a source's own page but marks a shared page stale on modify", async () => {
    await generator([record("a"), record("b")]).run();

    // a changes; b unchanged.
    const report = await generator([record("a", "a-v2"), record("b")]).run();

    expect(report.ingested).toEqual(["a"]);
    // a's own summary re-derived...
    expect(report.updatedPages).toContain("sources/a.md");
    // ...but the shared page (a + b) is marked stale, not re-merged.
    expect(report.stalePages).toContain("entities/shared.md");
    expect(await store.read("entities/shared.md")).toContain(
      "stale_reason: source-modified",
    );
  });

  it("leaves a page untouched when the merge engine defers", async () => {
    await generator([record("a")]).run();
    const before = await store.read("entities/shared.md");

    // b would merge, but the engine defers → page unchanged.
    const report = await generator([record("a"), record("b")], deferringMergeEngine).run();

    expect(await store.read("entities/shared.md")).toBe(before);
    expect(report.updatedPages).not.toContain("entities/shared.md");
  });
});

describe("WikiGenerator RECONCILE (multi-source)", () => {
  it("marks a fully-orphaned page stale with a removal proposal", async () => {
    await generator([record("a")]).run();

    const report = await generator([]).run(); // a removed

    expect(report.reconciled).toEqual(["a"]);
    expect(report.stalePages).toContain("sources/a.md");
    expect(report.removalProposals).toContainEqual({
      path: "sources/a.md",
      reason: "All contributing sources were removed.",
      orphanedSources: ["a"],
    });
  });

  it("keeps a partially-orphaned shared page (stale, no proposal)", async () => {
    await generator([record("a"), record("b")]).run();

    const report = await generator([record("a")]).run(); // b removed

    // shared has a live source (a) → partial orphan, kept.
    expect(report.stalePages).toContain("entities/shared.md");
    expect(await store.read("entities/shared.md")).toContain(
      "stale_reason: partial-orphan",
    );
    expect(report.removalProposals.map((p) => p.path)).not.toContain(
      "entities/shared.md",
    );
    // provenance stays sticky.
    expect(await provenance("entities/shared.md")).toEqual(["a", "b"]);
    // b's own summary is fully orphaned → proposal.
    expect(report.removalProposals.map((p) => p.path)).toContain("sources/b.md");
  });
});

describe("WikiGenerator errors", () => {
  it("throws on duplicate source ids across connectors", async () => {
    const c1: SourceConnector = { kind: "handbook", list: async () => [record("a")] };
    const c2: SourceConnector = { kind: "handbook", list: async () => [record("a")] };
    const gen = createWikiGenerator(
      { connectors: [c1, c2], store, compiler, mergeEngine },
      CLOCK,
    );
    await expect(gen.run()).rejects.toThrow(/Duplicate source id/);
  });

  it("throws on incompatible generator state", async () => {
    await store.write(".generator/state.json", JSON.stringify({ version: 1 }));
    await expect(generator([record("a")]).run()).rejects.toBeInstanceOf(
      WikiGeneratorError,
    );
  });
});
