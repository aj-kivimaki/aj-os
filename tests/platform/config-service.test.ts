/**
 * Contract tests for the platform Config Service (PRODUCT-001, Milestone 2).
 *
 * Each test builds an isolated project root in a temp directory so the
 * service is exercised through its public entry point with no reliance on
 * the real repository layout or working directory.
 */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ConfigError, ConfigService } from "../../src/platform/config/index.js";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "aj-config-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function writeConfig(contents: string): Promise<void> {
  await writeFile(join(root, "aj.config.json"), contents, "utf8");
}

describe("ConfigService", () => {
  it("returns a typed config when the handbook directory exists", async () => {
    await mkdir(join(root, "handbook"));
    await writeConfig(JSON.stringify({ handbook: { path: "./handbook" } }));

    const config = await new ConfigService(root).load();

    expect(config).toEqual({ handbook: { path: "./handbook" } });
  });

  it("fails when the configuration file is missing", async () => {
    await expect(new ConfigService(root).load()).rejects.toBeInstanceOf(
      ConfigError,
    );
    await expect(new ConfigService(root).load()).rejects.toThrow(
      /Configuration file not found/,
    );
  });

  it("fails when the JSON is invalid", async () => {
    await writeConfig("{ not valid json");

    await expect(new ConfigService(root).load()).rejects.toThrow(
      /Invalid JSON/,
    );
  });

  it("fails when handbook.path is missing", async () => {
    await writeConfig(JSON.stringify({ handbook: {} }));

    await expect(new ConfigService(root).load()).rejects.toThrow(
      /handbook\.path/,
    );
  });

  it("fails when the handbook path does not exist", async () => {
    await writeConfig(JSON.stringify({ handbook: { path: "../missing" } }));

    await expect(new ConfigService(root).load()).rejects.toThrow(
      /does not exist/,
    );
  });

  it("fails when the handbook path is a file, not a directory", async () => {
    await writeFile(join(root, "handbook.md"), "# not a dir", "utf8");
    await writeConfig(JSON.stringify({ handbook: { path: "./handbook.md" } }));

    await expect(new ConfigService(root).load()).rejects.toThrow(
      /not a directory/,
    );
  });
});
