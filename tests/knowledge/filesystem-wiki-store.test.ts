/**
 * Contract tests for the Filesystem Wiki Store (SPEC-007).
 *
 * Each test builds an isolated wiki destination in a temp directory and
 * exercises the store through its public factory, validating the
 * persistence-only, path-guarded contract via read/write/list/delete/
 * appendLog round trips.
 */
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createFilesystemWikiStore,
  WikiStoreError,
} from "../../src/knowledge/wiki-store/index.js";

let dest: string;

beforeEach(async () => {
  // realpath so expectations match the store's canonical root (macOS /var
  // → /private/var symlink).
  dest = await realpath(await mkdtemp(join(tmpdir(), "aj-wiki-")));
});

afterEach(async () => {
  await rm(dest, { recursive: true, force: true });
});

function store(destination = dest) {
  return createFilesystemWikiStore({ destination });
}

describe("FilesystemWikiStore", () => {
  describe("locate", () => {
    it("resolves the canonical destination root", async () => {
      expect(await store().locate()).toEqual({ root: dest });
    });

    it("throws when the destination does not exist", async () => {
      const s = store(join(dest, "missing"));
      await expect(s.locate()).rejects.toBeInstanceOf(WikiStoreError);
      await expect(s.locate()).rejects.toThrow(/does not exist/);
    });

    it("throws when the destination is a file", async () => {
      const file = join(dest, "afile");
      await writeFile(file, "x", "utf8");
      await expect(store(file).locate()).rejects.toThrow(/not a directory/);
    });
  });

  describe("write / read round trip", () => {
    it("writes and reads back content, including unicode", async () => {
      const s = store();
      await s.write("index.md", "# Wiki — café ☕");
      expect(await s.read("index.md")).toBe("# Wiki — café ☕");
    });

    it("creates parent directories on write", async () => {
      const s = store();
      await s.write("concepts/deep/note.md", "hi");
      expect(await s.read("concepts/deep/note.md")).toBe("hi");
    });

    it("overwrites an existing entry", async () => {
      const s = store();
      await s.write("a.md", "one");
      await s.write("a.md", "two");
      expect(await s.read("a.md")).toBe("two");
    });

    it("returns null when reading a missing entry", async () => {
      expect(await store().read("nope.md")).toBeNull();
    });
  });

  describe("list", () => {
    it("lists all files as sorted posix-relative paths, skipping dotfiles", async () => {
      const s = store();
      await s.write("index.md", "i");
      await s.write("concepts/b.md", "b");
      await s.write("concepts/a.md", "a");
      await writeFile(join(dest, ".DS_Store"), "junk", "utf8");

      expect(await s.list()).toEqual(["concepts/a.md", "concepts/b.md", "index.md"]);
    });

    it("filters to a subtree by prefix on a segment boundary", async () => {
      const s = store();
      await s.write("concepts/a.md", "a");
      await s.write("concepts-x/c.md", "c"); // must NOT match "concepts"
      await s.write("entities/e.md", "e");

      expect(await s.list("concepts")).toEqual(["concepts/a.md"]);
      expect(await s.list("concepts/")).toEqual(["concepts/a.md"]);
    });

    it("returns an empty array for an empty or unknown prefix subtree", async () => {
      const s = store();
      await s.write("index.md", "i");
      expect(await s.list("missing")).toEqual([]);
    });
  });

  describe("delete", () => {
    it("removes an entry", async () => {
      const s = store();
      await s.write("a.md", "a");
      await s.delete("a.md");
      expect(await s.read("a.md")).toBeNull();
    });

    it("is idempotent when the entry is already gone", async () => {
      await expect(store().delete("ghost.md")).resolves.toBeUndefined();
    });
  });

  describe("removeTree", () => {
    it("removes a single file", async () => {
      const s = store();
      await s.write("log.md", "x");
      await s.removeTree("log.md");
      expect(await s.read("log.md")).toBeNull();
    });

    it("recursively removes a directory subtree", async () => {
      const s = store();
      await s.write("entities/a.md", "a");
      await s.write("entities/nested/b.md", "b");
      await s.removeTree("entities");
      expect(await s.list("entities")).toEqual([]);
    });

    it("is idempotent when the entry is already gone", async () => {
      await expect(store().removeTree(".generator")).resolves.toBeUndefined();
    });

    it("is path-guarded against escaping the destination", async () => {
      await expect(store().removeTree("../outside")).rejects.toBeInstanceOf(
        WikiStoreError,
      );
    });
  });

  describe("appendLog", () => {
    it("creates log.md and accumulates entries with newlines", async () => {
      const s = store();
      await s.appendLog("first run");
      await s.appendLog("second run\n"); // trailing newline not doubled
      expect(await s.read("log.md")).toBe("first run\nsecond run\n");
    });
  });

  describe("path guarding", () => {
    it("rejects parent-traversal paths on every operation", async () => {
      const s = store();
      await expect(s.read("../escape.md")).rejects.toThrow(/escapes/);
      await expect(s.write("../escape.md", "x")).rejects.toThrow(/escapes/);
      await expect(s.delete("../escape.md")).rejects.toThrow(/escapes/);
    });

    it("rejects absolute paths", async () => {
      await expect(store().write("/etc/passwd", "x")).rejects.toThrow(WikiStoreError);
    });

    it("rejects empty paths", async () => {
      await expect(store().read("")).rejects.toThrow(/non-empty/);
    });

    it("rejects a write that would escape through a symlinked directory", async () => {
      const outside = await mkdtemp(join(tmpdir(), "aj-outside-"));
      try {
        await mkdir(join(dest, "real"), { recursive: true });
        await symlink(outside, join(dest, "link"), "dir");

        await expect(store().write("link/evil.md", "x")).rejects.toThrow(/symlink/);
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });
});
