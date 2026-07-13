/**
 * Wiring test for the Knowledge Platform Composition Root (M3).
 *
 * Proves that `createKnowledgePipeline` assembles the real platform factories
 * into a working generation cycle — connector → compiler → slug resolver →
 * renderer → store — with a stubbed text generator, so it composes and runs
 * with no network call. It exercises the wiring, not the model.
 */
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createKnowledgePipeline } from "../../../src/knowledge/composition/index.js";
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

    const pipeline = await createKnowledgePipeline(config("wiki-out"), {
      generator,
      now: CLOCK,
    });
    const report = await pipeline.run();

    expect(report.mode).toBe("incremental");
    expect(report.ingested).toEqual(["handbook:foundation/a.md"]);
    expect(report.failed).toEqual([]);

    // The rendered pages, the source summary, and generator bookkeeping landed.
    expect(existsSync(join(dest, "entities", "acme-corp.md"))).toBe(true);
    expect(existsSync(join(dest, "concepts", "widgets.md"))).toBe(true);
    expect(existsSync(join(dest, "sources", "foundation", "a.md"))).toBe(true);
    expect(existsSync(join(dest, ".generator", "state.json"))).toBe(true);
    expect(existsSync(join(dest, "log.md"))).toBe(true);
  });

  it("is incremental: an unchanged source is not re-ingested on the second run", async () => {
    const config1 = config("wiki-out");
    await (await createKnowledgePipeline(config1, { generator, now: CLOCK })).run();

    const second = await (
      await createKnowledgePipeline(config1, { generator, now: CLOCK })
    ).run();

    expect(second.ingested).toEqual([]);
    expect(second.updatedPages).toEqual([]);
  });

  it("skips an empty source directory without error", async () => {
    // library/ is empty; only foundation/a.md should be ingested.
    const report = await (
      await createKnowledgePipeline(config("wiki-out"), { generator, now: CLOCK })
    ).run();

    expect(report.ingested).toHaveLength(1);
    const entities = await readdir(join(resolve(handbook, "wiki-out"), "entities"));
    expect(entities).toContain("acme-corp.md");
  });
});
