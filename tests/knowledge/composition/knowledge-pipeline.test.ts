/**
 * Wiring test for the Knowledge Platform Composition Root (M3).
 *
 * Proves that `createKnowledgePipeline` assembles the real platform factories
 * into a working generation cycle — connector → compiler → slug resolver →
 * renderer → store — with a stubbed text generator, so it composes and runs
 * with no network call. It exercises the wiring, not the model. It also proves
 * the `--rebuild` reset semantics (`resetGeneratedWiki`): generator-owned
 * outputs are cleared, unrelated files are preserved.
 */
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createKnowledgePipeline,
  resetGeneratedWiki,
} from "../../../src/knowledge/composition/index.js";
import type { AjConfig } from "../../../src/platform/config/index.js";
import type { TextGenerator } from "../../../src/knowledge/compiler/index.js";

const CLOCK = () => new Date("2026-07-13T12:00:00.000Z");

/** A stub generator that returns one valid extraction for any prompt. */
const EXTRACTION = {
  summary: { title: "Alpha", keyPoints: ["a key point"] },
  entities: [
    { name: "Acme Corp", type: "organization", description: "A company.", related: [] },
  ],
  concepts: [{ name: "Widgets", description: "Small things.", related: [] }],
};

const generator: TextGenerator = {
  complete: async () => ({ text: JSON.stringify(EXTRACTION), model: "stub" }),
};

let handbook: string;

beforeEach(async () => {
  handbook = await mkdtemp(join(tmpdir(), "aj-pipeline-"));
  await mkdir(join(handbook, "foundation"));
  await mkdir(join(handbook, "library")); // present but empty: allowed
  await writeFile(join(handbook, "foundation", "a.md"), "# Alpha\n\nBody.", "utf8");
});

afterEach(async () => {
  await rm(handbook, { recursive: true, force: true });
});

function config(generatedWikiPath: string): AjConfig {
  return { handbook: { path: handbook, generatedWikiPath } };
}

describe("createKnowledgePipeline", () => {
  it("composes the platform and runs a generation cycle into a fresh destination", async () => {
    // The destination does not exist yet — the composition root must create it.
    const dest = resolve(handbook, "wiki-out");
    expect(existsSync(dest)).toBe(false);

    const { generator: gen } = await createKnowledgePipeline(config("wiki-out"), {
      generator,
      now: CLOCK,
    });
    const report = await gen.run();

    expect(report.mode).toBe("incremental");
    expect(report.ingested).toEqual(["handbook:foundation/a.md"]);
    expect(report.failed).toEqual([]);

    // The rendered pages, the source summary, and generator bookkeeping landed.
    expect(existsSync(join(dest, "entities", "acme-corp.md"))).toBe(true);
    expect(existsSync(join(dest, "concepts", "widgets.md"))).toBe(true);
    expect(existsSync(join(dest, "sources", "foundation", "a.md"))).toBe(true);
    expect(existsSync(join(dest, ".generator", "state.json"))).toBe(true);
    expect(existsSync(join(dest, "log.md"))).toBe(true);

    // The corpus catalog the consumer (RetrievalService) reads is generated,
    // linking entities and concepts by the bare slug retrieval resolves.
    expect(existsSync(join(dest, "index.md"))).toBe(true);
    const index = await readFile(join(dest, "index.md"), "utf8");
    expect(index).toContain("[[acme-corp]]");
    expect(index).toContain("[[widgets]]");
  });

  it("is incremental: an unchanged source is not re-ingested on the second run", async () => {
    const cfg = config("wiki-out");
    const first = await createKnowledgePipeline(cfg, { generator, now: CLOCK });
    await first.generator.run();

    const { generator: gen2 } = await createKnowledgePipeline(cfg, {
      generator,
      now: CLOCK,
    });
    const second = await gen2.run();

    expect(second.ingested).toEqual([]);
    expect(second.updatedPages).toEqual([]);
  });

  it("skips an empty source directory without error", async () => {
    // library/ is empty; only foundation/a.md should be ingested.
    const { generator: gen } = await createKnowledgePipeline(config("wiki-out"), {
      generator,
      now: CLOCK,
    });
    const report = await gen.run();

    expect(report.ingested).toHaveLength(1);
    const entities = await readdir(join(resolve(handbook, "wiki-out"), "entities"));
    expect(entities).toContain("acme-corp.md");
  });

  it("--rebuild resets generator-owned outputs while preserving unrelated files", async () => {
    const dest = resolve(handbook, "wiki-out");
    const cfg = config("wiki-out");

    // First build produces the generated wiki.
    const first = await createKnowledgePipeline(cfg, { generator, now: CLOCK });
    await first.generator.run();

    // Simulate a stale generator output from a previous run, plus files the
    // generator does not own (a human note, a README).
    await writeFile(join(dest, "entities", "stale-orphan.md"), "old page", "utf8");
    await mkdir(join(dest, "notes"), { recursive: true });
    await writeFile(join(dest, "notes", "keep.md"), "human note", "utf8");
    await writeFile(join(dest, "README.md"), "human readme", "utf8");

    // Rebuild: reset owned outputs, then regenerate.
    const second = await createKnowledgePipeline(cfg, { generator, now: CLOCK });
    await resetGeneratedWiki(second.store);
    const report = await second.generator.run({ mode: "rebuild" });

    // Stale generator output is gone; fresh output is present and clean.
    expect(existsSync(join(dest, "entities", "stale-orphan.md"))).toBe(false);
    expect(existsSync(join(dest, "entities", "acme-corp.md"))).toBe(true);
    expect(existsSync(join(dest, "concepts", "widgets.md"))).toBe(true);
    expect(existsSync(join(dest, "sources", "foundation", "a.md"))).toBe(true);
    expect(report.mode).toBe("rebuild");
    expect(report.ingested).toEqual(["handbook:foundation/a.md"]);
    expect(report.stalePages).toEqual([]); // no old/new mixing

    // Files the generator does not own are preserved.
    expect(existsSync(join(dest, "notes", "keep.md"))).toBe(true);
    expect(existsSync(join(dest, "README.md"))).toBe(true);
  });
});
