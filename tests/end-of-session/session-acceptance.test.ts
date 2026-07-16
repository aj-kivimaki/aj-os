/**
 * SPEC-003 acceptance tests (EOS-409) — the v1 vertical slice, judged against the
 * specification.
 *
 * One test per §19 criterion, named in the specification's own words, so this file is
 * legible to someone holding SPEC-003 who has never read the code. The mechanics of wiring
 * are the integration suite's concern; this suite asks only: **did the workflow do what it
 * promised?**
 *
 * A real composed run over a disposable fixture repo and vault, with the model stubbed. The
 * strongest test here is the last one: canonical knowledge is proven byte-identical, not
 * assumed.
 */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createEndOfSessionWorkflow,
  parseCandidateKnowledge,
  parseSessionReport,
  type CandidateKnowledge,
  type SessionReport,
} from "../../src/end-of-session/index.js";

import {
  CANONICAL_AREAS,
  cleanupFixtures,
  FIXED_INSTANT,
  fixtureConfig,
  fixtureRepo,
  fixtureVault,
  snapshotCanonical,
  stubGenerator,
  type Snapshot,
} from "./session-fixtures.js";

let handbook: string;
let canonicalBefore: Snapshot;
let report: SessionReport;
let sessionDir: string;

/**
 * One real run, shared by every criterion below — the same run the acceptance claims are
 * judged against, exactly as a reviewer would judge one session.
 */
beforeEach(async () => {
  handbook = await fixtureVault();
  const repositoryPath = await fixtureRepo();
  canonicalBefore = await snapshotCanonical(handbook);

  const { workflow, store, trigger } = await createEndOfSessionWorkflow(
    fixtureConfig(handbook),
    { generator: stubGenerator(), now: () => FIXED_INSTANT, repositoryPath },
  );

  report = await workflow.run(await trigger.createContext());
  sessionDir = join((await store.locate()).root, "pending", report.sessionId);
});

afterEach(cleanupFixtures);

/** Every candidate the run persisted, read back through the published contract. */
async function persistedCandidates(): Promise<CandidateKnowledge[]> {
  const dir = join(sessionDir, "candidates");
  const files = (await readdir(dir)).sort();
  return Promise.all(
    files.map(async (file) =>
      parseCandidateKnowledge(JSON.parse(await readFile(join(dir, file), "utf8"))),
    ),
  );
}

describe("SPEC-003 §19 — Acceptance Criteria", () => {
  it("Session summary generated", async () => {
    const markdown = await readFile(join(sessionDir, "review-package.md"), "utf8");

    // Two summaries, both produced by the run: the report's one-line execution summary,
    // and the package's human synopsis of the session it projects.
    expect(report.logEntry).toContain(`session=${report.sessionId}`);
    expect(markdown).toContain("Session review package");
    expect(markdown).toContain(report.sessionId);
    // The synopsis states what the session actually yielded, derived from the candidates.
    expect(markdown).toContain(`${report.candidatesProduced.count} candidates proposed`);
  });

  it("Candidate handbook entries generated", async () => {
    const candidates = await persistedCandidates();

    expect(candidates.some((each) => each.kind === "handbook-entry")).toBe(true);
    // Proposed, never approved — the governance state SPEC-003 may only ever write.
    for (const candidate of candidates) {
      expect(candidate.governanceState).toBe("candidate");
      expect(candidate.provenance.sessionId).toBe(report.sessionId);
    }
  });

  it("Candidate wiki publications prepared", async () => {
    const candidates = await persistedCandidates();

    // v1 treats `kind` as a validated pass-through (an M4 ratified decision): the model
    // proposes it, and the workflow carries it to the review store intact. Asserting that
    // the workflow *decides* to prepare wiki publications would test a capability v1
    // deliberately does not have.
    expect(candidates.some((each) => each.kind === "wiki-publication")).toBe(true);
  });

  it("Review package created", async () => {
    const markdown = await readFile(join(sessionDir, "review-package.md"), "utf8");
    const candidates = await persistedCandidates();

    expect(markdown.length).toBeGreaterThan(0);
    // Every candidate is represented — the projection drops nothing.
    for (const candidate of candidates) {
      expect(markdown).toContain(candidate.title);
    }
  });

  it("Canonical knowledge unchanged", async () => {
    const after = await snapshotCanonical(handbook);

    // SPEC-003's permanent promise (§17), proven rather than assumed: every file under
    // foundation/, library/, and wiki/ is byte-identical, and none was added or removed.
    // The store's construction guard proves a canonical *destination* is refused; this
    // proves a correctly-configured run never reaches canonical space either.
    expect([...after.entries()].sort()).toEqual([...canonicalBefore.entries()].sort());
    expect(after.size).toBeGreaterThan(0); // the areas had content to leave alone
    for (const area of CANONICAL_AREAS) {
      expect([...after.keys()].some((path) => path.startsWith(`${area}/`))).toBe(true);
    }
  });

  it("Logs recorded", async () => {
    const persisted = parseSessionReport(
      JSON.parse(await readFile(join(sessionDir, "report.json"), "utf8")),
    );
    const log = await readFile(join(sessionDir, "log.md"), "utf8");

    // §16's observability record: trigger, duration, files analyzed, candidates, errors,
    // result — persisted as data, and echoed in the session's append-only log.
    expect(persisted).toEqual(report);
    expect(persisted.trigger).toBe("manual");
    expect(persisted.result).toBe("completed");
    expect(persisted.durationMs).toBeGreaterThanOrEqual(0);
    expect(persisted.filesAnalyzed).toBeGreaterThan(0);
    expect(log).toContain(report.logEntry);
  });
});

describe("SPEC-003 — the boundary the acceptance criteria protect", () => {
  it("hands SPEC-004 a store it can consume", async () => {
    // The whole point of the slice: SPEC-004 reads this directory through the contracts
    // SPEC-003 publishes. Every artifact round-trips.
    const candidates = await persistedCandidates();

    expect(candidates.length).toBe(report.candidatesProduced.count);
    expect(candidates.map((each) => each.id).sort()).toEqual(
      [...report.candidatesProduced.ids].sort(),
    );
  });

  it("approves nothing and publishes nothing", async () => {
    const candidates = await persistedCandidates();

    // Automation proposes; humans approve (AJS-006). Every candidate SPEC-003 writes is in
    // the `candidate` state — the `candidate → approved` transition is SPEC-004's human
    // gate, and nothing in this pipeline can perform it.
    //
    // Deliberately not asserting the *absence* of a review-decision field: the contract is
    // `.strict()` and every candidate here came through `parseCandidateKnowledge`, so such a
    // key cannot exist. That check would pass no matter what this code did.
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(candidate.governanceState).toBe("candidate");
    }
  });
});
