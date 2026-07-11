/**
 * Contract tests for the Filesystem Source Connector (SPEC-006).
 *
 * Each test builds an isolated source tree in a temp directory and
 * exercises the connector through its public factory, validating the
 * SourceConnector contract: normalized, namespaced, stable-id records with
 * a separate content-hash change signal.
 */
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createFilesystemSourceConnector,
  SourceConnectorError,
} from "../../src/ingestion/index.js";

let base: string;

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), "aj-source-"));
});

afterEach(async () => {
  await rm(base, { recursive: true, force: true });
});

async function write(relative: string, content: string): Promise<void> {
  const abs = join(base, relative);
  await mkdir(join(abs, ".."), { recursive: true });
  await writeFile(abs, content, "utf8");
}

function connector(sources: string[], kind = "handbook") {
  return createFilesystemSourceConnector({ kind, baseDir: base, sources });
}

describe("FilesystemSourceConnector", () => {
  it("enumerates markdown across sources with namespaced, base-relative ids, sorted", async () => {
    await write("foundation/about.md", "# About");
    await write("library/00-x/note.md", "note");
    await write("library/readme.md", "readme");

    const records = await connector(["foundation", "library"]).list();

    expect(records.map((r) => r.id)).toEqual([
      "handbook:foundation/about.md",
      "handbook:library/00-x/note.md",
      "handbook:library/readme.md",
    ]);
  });

  it("recurses into subdirectories and ignores non-markdown and dotfiles", async () => {
    await write("library/a.md", "a");
    await write("library/deep/b.md", "b");
    await write("library/notes.txt", "ignore me");
    await write("library/.hidden.md", "ignore me too");
    await write("library/.git/c.md", "ignore whole dot dir");

    const records = await connector(["library"]).list();

    expect(records.map((r) => r.id)).toEqual([
      "handbook:library/a.md",
      "handbook:library/deep/b.md",
    ]);
  });

  it("produces a stable id but a changed hash when content is edited", async () => {
    await write("library/x.md", "original");
    const before = (await connector(["library"]).list())[0];

    await write("library/x.md", "edited");
    const after = (await connector(["library"]).list())[0];

    expect(after?.id).toBe(before?.id);
    expect(after?.hash).not.toBe(before?.hash);
  });

  it("gives identical content the same hash and different content different hashes", async () => {
    await write("library/a.md", "same");
    await write("library/b.md", "same");
    await write("library/c.md", "different");

    const [a, b, c] = await connector(["library"]).list();

    expect(a?.hash).toBe(b?.hash);
    expect(c?.hash).not.toBe(a?.hash);
  });

  it("normalizes CRLF so hashes are platform-stable", async () => {
    await write("library/crlf.md", "line1\r\nline2\r\n");
    await write("library/lf.md", "line1\nline2\n");

    const [crlf, lf] = await connector(["library"]).list();

    expect(crlf?.content).toBe("line1\nline2\n");
    expect(crlf?.hash).toBe(lf?.hash);
  });

  it("populates uri and metadata for each record", async () => {
    await write("library/x.md", "hello");

    const [record] = await connector(["library"]).list();

    expect(record?.uri).toBe(pathToFileURL(join(base, "library/x.md")).href);
    expect(record?.metadata).toEqual({
      relativePath: "library/x.md",
      bytes: Buffer.byteLength("hello", "utf8"),
    });
  });

  it("exposes the connector kind", () => {
    expect(connector(["library"]).kind).toBe("handbook");
  });

  it("returns an empty list when a source directory has no markdown", async () => {
    await mkdir(join(base, "library"), { recursive: true });

    expect(await connector(["library"]).list()).toEqual([]);
  });

  it("throws when a source directory does not exist", async () => {
    await expect(connector(["nope"]).list()).rejects.toBeInstanceOf(
      SourceConnectorError,
    );
    await expect(connector(["nope"]).list()).rejects.toThrow(
      /does not exist/,
    );
  });

  it("throws when a source resolves outside baseDir", async () => {
    await expect(connector(["../escape"]).list()).rejects.toThrow(
      /outside baseDir/,
    );
  });

  it("dedupes a file reached via overlapping sources (no duplicates)", async () => {
    await write("library/a.md", "a");
    await write("library/sub/b.md", "b");

    // "library" and "library/sub" overlap; b.md is reachable via both.
    const records = await connector(["library", "library/sub"]).list();

    expect(records.map((r) => r.id)).toEqual([
      "handbook:library/a.md",
      "handbook:library/sub/b.md",
    ]);
  });

  it("rejects an invalid connector kind", () => {
    expect(() => connector(["library"], "bad:kind")).toThrow(
      SourceConnectorError,
    );
    expect(() => connector(["library"], "")).toThrow(SourceConnectorError);
  });
});
