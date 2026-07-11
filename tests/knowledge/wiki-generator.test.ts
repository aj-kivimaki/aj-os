/**
 * End-to-end tests for the minimal Wiki Generator (SPEC-005, Step 3).
 *
 * These compose the real Filesystem SourceConnector and Filesystem Wiki
 * Store against temp directories, proving the vertical slice: detect
 * added/changed sources via `.generator/state.json`, INGEST them into
 * pages, persist state, and return a GenerationReport. No RECONCILE /
 * reverse index / LINT yet.
 */
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm, rm as removeFile, writeFile } from "node:fs/promises";
import { realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createFilesystemSourceConnector,
  type SourceConnector,
} from "../../src/ingestion/index.js";
import {
  createFilesystemWikiStore,
  type WikiStore,
} from "../../src/knowledge/wiki-store/index.js";
import {
  createWikiGenerator,
  WikiGeneratorError,
} from "../../src/knowledge/wiki-generator/index.js";

const CLOCK = () => new Date("2026-01-02T03:04:05.000Z");

let sourceRoot: string;
let wikiRoot: string;
let store: WikiStore;
let connector: SourceConnector;

async function writeSource(relative: string, content: string): Promise<void> {
  const abs = join(sourceRoot, relative);
  await mkdir(join(abs, ".."), { recursive: true });
  await writeFile(abs, content, "utf8");
}

function generator(connectors: SourceConnector[] = [connector]) {
  return createWikiGenerator({ connectors, store }, CLOCK);
}

beforeEach(async () => {
  sourceRoot = await realpath(await mkdtemp(join(tmpdir(), "aj-gen-src-")));
  wikiRoot = await realpath(await mkdtemp(join(tmpdir(), "aj-gen-wiki-")));
  // Both configured source dirs always exist (as in the real vault); the
  // connector treats a missing source directory as a fatal misconfig.
  await mkdir(join(sourceRoot, "foundation"), { recursive: true });
  await mkdir(join(sourceRoot, "library"), { recursive: true });
  store = createFilesystemWikiStore({ destination: wikiRoot });
  connector = createFilesystemSourceConnector({
    kind: "handbook",
    baseDir: sourceRoot,
    sources: ["foundation", "library"],
  });
});

afterEach(async () => {
  await rm(sourceRoot, { recursive: true, force: true });
  await rm(wikiRoot, { recursive: true, force: true });
});

describe("WikiGenerator.run (minimal slice)", () => {
  it("ingests all sources on first run and writes provenance-stamped pages", async () => {
    await writeSource("foundation/about.md", "# About");
    await writeSource("library/note.md", "a note");

    const report = await generator().run();

    expect(report.mode).toBe("incremental");
    expect(report.ingested).toEqual([
      "handbook:foundation/about.md",
      "handbook:library/note.md",
    ]);
    expect(report.updatedPages).toEqual([
      "sources/foundation/about.md",
      "sources/library/note.md",
    ]);
    expect(report.reconciled).toEqual([]);
    expect(report.stalePages).toEqual([]);
    expect(report.removalProposals).toEqual([]);
    expect(report.lint.findings).toEqual([]);

    const hash = createHash("sha256").update("# About", "utf8").digest("hex");
    expect(await store.read("sources/foundation/about.md")).toBe(
      [
        "---",
        "type: source",
        "sources:",
        "  - handbook:foundation/about.md",
        `hash: ${hash}`,
        "generated_at: 2026-01-02T03:04:05.000Z",
        "---",
        "",
        "# About",
      ].join("\n"),
    );
  });

  it("keeps generator state under a hidden dir, invisible to list()", async () => {
    await writeSource("library/note.md", "x");
    await generator().run();

    // state exists...
    expect(await store.read(".generator/state.json")).not.toBeNull();
    // ...but it is hidden from user-facing listings (dot-dir skipped),
    // while wiki pages appear.
    const listed = await store.list();
    expect(listed).toContain("sources/library/note.md");
    expect(listed.some((p) => p.startsWith(".generator"))).toBe(false);
  });

  it("writes a log entry per run", async () => {
    await writeSource("library/note.md", "x");
    await generator().run();

    expect(await store.read("log.md")).toBe(
      "2026-01-02T03:04:05.000Z generator=v1 mode=incremental ingested=1 pages=1\n",
    );
  });

  it("is idempotent: a second run with no changes ingests nothing", async () => {
    await writeSource("library/note.md", "x");
    await generator().run();

    const second = await generator().run();

    expect(second.ingested).toEqual([]);
    expect(second.updatedPages).toEqual([]);
  });

  it("re-ingests only a changed source", async () => {
    await writeSource("library/a.md", "one");
    await writeSource("library/b.md", "stable");
    await generator().run();

    await writeSource("library/a.md", "one edited");
    const report = await generator().run();

    expect(report.ingested).toEqual(["handbook:library/a.md"]);
    expect(await store.read("sources/library/a.md")).toContain("one edited");
  });

  it("ingests only a newly added source", async () => {
    await writeSource("library/a.md", "a");
    await generator().run();

    await writeSource("library/c.md", "c");
    const report = await generator().run();

    expect(report.ingested).toEqual(["handbook:library/c.md"]);
  });

  it("rebuild mode re-ingests everything regardless of state", async () => {
    await writeSource("library/a.md", "a");
    await writeSource("library/b.md", "b");
    await generator().run();

    const report = await generator().run({ mode: "rebuild" });

    expect(report.mode).toBe("rebuild");
    expect(report.ingested).toEqual([
      "handbook:library/a.md",
      "handbook:library/b.md",
    ]);
  });

  it("does not touch pages for a removed source (no RECONCILE yet)", async () => {
    await writeSource("library/a.md", "a");
    await writeSource("library/gone.md", "bye");
    await generator().run();

    await removeFile(join(sourceRoot, "library/gone.md"));
    const report = await generator().run();

    expect(report.ingested).toEqual([]);
    // The page survives — removal is deferred to a later RECONCILE slice.
    expect(await store.read("sources/library/gone.md")).toContain("bye");
    expect(await store.list()).toContain("sources/library/gone.md");
  });

  it("throws on duplicate source ids across connectors", async () => {
    await writeSource("library/a.md", "a");
    const twin = createFilesystemSourceConnector({
      kind: "handbook",
      baseDir: sourceRoot,
      sources: ["library"],
    });

    await expect(generator([connector, twin]).run()).rejects.toThrow(
      /Duplicate source id across connectors/,
    );
  });

  it("throws on corrupt generator state", async () => {
    await writeSource("library/a.md", "a");
    await store.write(".generator/state.json", "{ not json");

    await expect(generator().run()).rejects.toBeInstanceOf(WikiGeneratorError);
  });
});
