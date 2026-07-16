/**
 * Filesystem Review Store behaviour tests (EOS-302).
 *
 * Each test builds an isolated review destination in a temp directory and drives the
 * store through its public factory — no real vault. Covers the per-session layout,
 * canonical-JSON round trips (candidates + report), the intentionally-minimal append-only
 * log, the non-canonical destination guard, and the path guards (single-segment
 * `sessionId` / candidate `id`, no escape). The store is persistence-only: it exposes
 * exactly four operations and understands nothing about the artifacts beyond where they go.
 */
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createFilesystemReviewStore,
  parseCandidateKnowledge,
  parseSessionReport,
  ReviewStoreError,
  type CandidateKnowledge,
  type SessionReport,
} from "../../src/end-of-session/index.js";

const sessionId = "01J8Z3K7Q9WV0FB2XN4MABCDEF";

function candidate(n: number): CandidateKnowledge {
  return parseCandidateKnowledge({
    id: `session:${sessionId}:${n}`,
    kind: "handbook-entry",
    title: `Candidate ${n}`,
    body: `Body of candidate ${n}.`,
    rationale: "Reusable across sessions.",
    provenance: {
      sessionId,
      sourceChangeIds: [`git:src/file-${n}.ts`],
      sourcePaths: [`src/file-${n}.ts`],
      commitHash: "abc123def456",
      generatedAt: "2026-07-16T12:00:00.000Z",
      generator: "end-of-session/candidate-generator",
    },
    governanceState: "candidate",
    tags: ["testing"],
    related: [],
  });
}

const report: SessionReport = parseSessionReport({
  sessionId,
  trigger: "manual",
  startedAt: "2026-07-16T11:00:00.000Z",
  endedAt: "2026-07-16T12:00:00.000Z",
  durationMs: 3_600_000,
  analyzersRun: ["git-change-analyzer"],
  filesAnalyzed: 2,
  candidatesProduced: { count: 2, ids: [`session:${sessionId}:1`, `session:${sessionId}:2`] },
  errors: [],
  result: "completed",
  logEntry: "Captured 2 candidates.",
});

let dest: string;

beforeEach(async () => {
  // realpath so expectations match the store's canonical root (macOS /var → /private/var).
  dest = await realpath(await mkdtemp(join(tmpdir(), "aj-review-")));
});

afterEach(async () => {
  await rm(dest, { recursive: true, force: true });
});

function store(destination = dest) {
  return createFilesystemReviewStore({ destination });
}

const sessionDir = () => join(dest, "pending", sessionId);

describe("FilesystemReviewStore", () => {
  describe("locate", () => {
    it("resolves the canonical destination root", async () => {
      expect(await store().locate()).toEqual({ root: dest });
    });

    it("throws when the destination does not exist", async () => {
      await expect(store(join(dest, "missing")).locate()).rejects.toThrow(
        /does not exist/,
      );
    });

    it("throws when the destination is a file", async () => {
      const file = join(dest, "afile");
      await writeFile(file, "x", "utf8");
      await expect(store(file).locate()).rejects.toThrow(/not a directory/);
    });

    it("refuses a destination that is canonical knowledge space", async () => {
      const wiki = join(dest, "wiki");
      await mkdir(wiki, { recursive: true });
      const s = store(wiki);
      await expect(s.locate()).rejects.toBeInstanceOf(ReviewStoreError);
      await expect(s.locate()).rejects.toThrow(/canonical/);
    });
  });

  describe("saveCandidates", () => {
    it("writes one canonical-JSON file per candidate, round-tripping to a deep-equal candidate", async () => {
      const candidates = [candidate(1), candidate(2)];
      await store().saveCandidates(sessionId, candidates);

      for (const c of candidates) {
        const raw = await readFile(
          join(sessionDir(), "candidates", `${c.id}.json`),
          "utf8",
        );
        expect(raw.endsWith("\n")).toBe(true);
        expect(parseCandidateKnowledge(JSON.parse(raw))).toEqual(c);
      }
    });

    it("writes nothing (and no candidates directory) for an empty list", async () => {
      await store().saveCandidates(sessionId, []);
      await expect(readdir(join(sessionDir(), "candidates"))).rejects.toThrow();
    });

    it("is deterministic — the same inputs produce the same file set", async () => {
      await store().saveCandidates(sessionId, [candidate(1), candidate(2)]);
      const first = (await readdir(join(sessionDir(), "candidates"))).sort();
      await store().saveCandidates(sessionId, [candidate(1), candidate(2)]);
      const second = (await readdir(join(sessionDir(), "candidates"))).sort();
      expect(second).toEqual(first);
      expect(first).toEqual([
        `session:${sessionId}:1.json`,
        `session:${sessionId}:2.json`,
      ]);
    });
  });

  describe("saveReport", () => {
    it("writes report.json round-tripping to a deep-equal SessionReport", async () => {
      await store().saveReport(sessionId, report);
      const raw = await readFile(join(sessionDir(), "report.json"), "utf8");
      expect(parseSessionReport(JSON.parse(raw))).toEqual(report);
    });
  });

  describe("appendLog", () => {
    it("appends lines (does not overwrite) and ensures a trailing newline", async () => {
      const s = store();
      await s.appendLog(sessionId, "first");
      await s.appendLog(sessionId, "second\n");
      expect(await readFile(join(sessionDir(), "log.md"), "utf8")).toBe(
        "first\nsecond\n",
      );
    });
  });

  describe("path guards", () => {
    it("rejects a sessionId that is not a single safe path segment", async () => {
      const s = store();
      for (const bad of ["../escape", "a/b", "..", ""]) {
        await expect(s.appendLog(bad, "x")).rejects.toBeInstanceOf(
          ReviewStoreError,
        );
      }
    });

    it("rejects a candidate id that is not a single safe path segment", async () => {
      // A contract-valid id (non-empty string) that is unsafe as a filename.
      const escaping = parseCandidateKnowledge({
        ...JSON.parse(JSON.stringify(candidate(1))),
        id: "../evil",
      });
      await expect(
        store().saveCandidates(sessionId, [escaping]),
      ).rejects.toBeInstanceOf(ReviewStoreError);
    });
  });

  describe("surface", () => {
    it("exposes exactly the persistence operations and is frozen", () => {
      const s = store();
      expect(Object.keys(s).sort()).toEqual([
        "appendLog",
        "locate",
        "saveCandidates",
        "saveReport",
      ]);
      expect(Object.isFrozen(s)).toBe(true);
    });
  });
});
