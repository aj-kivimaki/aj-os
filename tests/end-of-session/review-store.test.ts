/**
 * Filesystem Review Store behaviour tests (EOS-302).
 *
 * Each test builds an isolated review destination in a temp directory and drives the
 * store through its public factory — no real vault. Covers the per-session layout,
 * canonical-JSON round trips (candidates + report), the verbatim markdown review package
 * (EOS-404/EOS-D8), the intentionally-minimal append-only log, the non-canonical
 * destination guard, and the path guards (single-segment `sessionId` / candidate `id`, no
 * escape). The store is persistence-only: it exposes exactly five operations and
 * understands nothing about the artifacts beyond where they go.
 */
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createFilesystemReviewStore,
  parseCandidateKnowledge,
  parseReviewPackage,
  parseSessionReport,
  ReviewStoreError,
  type CandidateKnowledge,
  type ReviewPackage,
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

/**
 * A review package fixture, built through the real contract. Only `markdown` is under
 * test here — `summary` and `candidateIds` are required by `parseReviewPackage` and are
 * inert as far as the store is concerned: it persists the rendered body and reads
 * nothing else.
 */
function reviewPackage(markdown = "# Session review package\n\nOne candidate.\n"): ReviewPackage {
  return parseReviewPackage({
    sessionId,
    generatedAt: "2026-07-16T12:00:00.000Z",
    summary: "1 candidate proposed from this session on main.",
    candidateIds: [`session:${sessionId}:1`],
    markdown,
  });
}

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

  describe("saveReviewPackage", () => {
    it("writes review-package.md with the rendered markdown verbatim", async () => {
      const pkg = reviewPackage();
      await store().saveReviewPackage(sessionId, pkg);

      const raw = await readFile(join(sessionDir(), "review-package.md"), "utf8");
      // Byte-for-byte: the package *is* markdown (EOS-D4), so persisting it is the
      // identity. The store adds nothing — not even a trailing newline, which would be
      // the store editing what the projector rendered.
      expect(raw).toBe(pkg.markdown);
    });

    it("overwrites rather than appends — the package is single-valued per session", async () => {
      const s = store();
      await s.saveReviewPackage(sessionId, reviewPackage("# First render"));
      await s.saveReviewPackage(sessionId, reviewPackage("# Second render"));

      // Contrast with log.md, which is append-only: the package is regenerable from the
      // canonical candidates, so the latest render simply replaces the last.
      const raw = await readFile(join(sessionDir(), "review-package.md"), "utf8");
      expect(raw).toBe("# Second render");
    });

    it("lands beside the other artifacts in the same session directory", async () => {
      const s = store();
      await s.saveCandidates(sessionId, [candidate(1)]);
      await s.saveReport(sessionId, report);
      await s.saveReviewPackage(sessionId, reviewPackage());
      await s.appendLog(sessionId, "Captured 1 candidate.");

      // The store owns every file in the session directory (EOS-D8) — this is the whole
      // layout SPEC-004 will read.
      expect((await readdir(sessionDir())).sort()).toEqual([
        "candidates",
        "log.md",
        "report.json",
        "review-package.md",
      ]);
    });

    it("does not interpret the package — arbitrary markdown is stored as given", async () => {
      // The store neither parses nor validates the prose, and never cross-checks it
      // against the candidates: consistency is guaranteed by construction upstream.
      const odd = reviewPackage("Not even a heading — just text, `code`, and ---\n");
      await store().saveReviewPackage(sessionId, odd);

      expect(await readFile(join(sessionDir(), "review-package.md"), "utf8")).toBe(
        odd.markdown,
      );
    });

    it("rejects a sessionId that is not a single path segment", async () => {
      await expect(
        store().saveReviewPackage("../escape", reviewPackage()),
      ).rejects.toBeInstanceOf(ReviewStoreError);
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
        "saveReviewPackage",
      ]);
      expect(Object.isFrozen(s)).toBe(true);
    });
  });
});
