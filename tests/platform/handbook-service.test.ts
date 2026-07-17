/**
 * Contract tests for the platform Handbook Service (PRODUCT-001, Milestone 3).
 *
 * Each test builds an isolated handbook root in a temp directory so the
 * service is exercised through its public entry point with no reliance on
 * the real repository layout or working directory.
 */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { HandbookError, HandbookService } from "../../src/platform/handbook/index.js";

let handbook: string;

beforeEach(async () => {
  handbook = await mkdtemp(join(tmpdir(), "aj-handbook-"));
});

afterEach(async () => {
  await rm(handbook, { recursive: true, force: true });
});

describe("HandbookService", () => {
  it("returns handbook and wiki paths when the wiki exists", async () => {
    await mkdir(join(handbook, "wiki-generated"));

    const info = await new HandbookService(handbook, "wiki-generated").locateWiki();

    expect(info).toEqual({
      handbookPath: resolve(handbook),
      wikiPath: resolve(handbook, "wiki-generated"),
    });
  });

  it("resolves whatever generated-wiki directory name it is given", async () => {
    await mkdir(join(handbook, "custom-wiki"));

    const info = await new HandbookService(handbook, "custom-wiki").locateWiki();

    expect(info.wikiPath).toBe(resolve(handbook, "custom-wiki"));
  });

  it("fails when the handbook directory does not exist", async () => {
    const missing = join(handbook, "nope");

    await expect(
      new HandbookService(missing, "wiki-generated").locateWiki(),
    ).rejects.toThrow(/handbook directory does not exist/);
  });

  it("fails with a clear message when the wiki is missing", async () => {
    await expect(
      new HandbookService(handbook, "wiki-generated").locateWiki(),
    ).rejects.toThrow("The configured handbook does not contain a generated wiki.");
    await expect(
      new HandbookService(handbook, "wiki-generated").locateWiki(),
    ).rejects.toBeInstanceOf(HandbookError);
  });

  it("fails when the wiki path is a file, not a directory", async () => {
    await writeFile(join(handbook, "wiki-generated"), "not a dir", "utf8");

    await expect(
      new HandbookService(handbook, "wiki-generated").locateWiki(),
    ).rejects.toThrow("The configured handbook does not contain a generated wiki.");
  });
});
