/**
 * Candidate Generator behaviour & determinism tests (EOS-301).
 *
 * The Candidate Generator is deterministic, so these tests need no stub — only a fixed
 * injected clock. They pin the frozen **Candidate Generation Invariant** (a one-to-one,
 * order-preserving structural mapping: each finding → exactly one candidate, no merge /
 * split / reorder / invent / remove), the field-level mapping (identity, authoritative
 * kind, verbatim content, complete provenance, empty `related`, `candidate` governance
 * state), structure determinism under a fixed clock, immutability, the session-
 * consistency guard, and a frozen handle. Everything is asserted through the module's
 * public surface.
 */

import { describe, it, expect } from "vitest";

import {
  createCandidateGenerator,
  parseExtractionResponse,
  parseSession,
  type KnowledgeExtraction,
  type Session,
} from "../../src/end-of-session/index.js";
import { firstUnfrozenPath } from "./support.js";

const sessionId = "01J8Z3K7Q9WV0FB2XN4MABCDEF";
const generatedAt = "2026-07-16T12:00:00.000Z";
const fixedNow = (): Date => new Date(generatedAt);

const session: Session = parseSession({
  id: sessionId,
  startedAt: "2026-07-16T11:00:00.000Z",
  endedAt: generatedAt,
  trigger: "manual",
  gitState: { head: "abc123def456", dirty: false, range: "main..HEAD" },
  branch: "feat/spec-003-m4-candidate-generation",
});

/**
 * A two-finding extraction: one finding carries source linkage + tags + confidence, the
 * next carries none of the optionals. Built through `parseExtractionResponse` (the only
 * `KnowledgeExtraction` constructor) so the fixture is a real validated extraction.
 */
const extraction: KnowledgeExtraction = parseExtractionResponse(
  JSON.stringify({
    sessionId,
    summary: {
      title: "Add the Candidate Generator",
      keyPoints: ["Map extraction findings to canonical candidates."],
    },
    findings: [
      {
        kind: "lesson-learned",
        title: "Isolate model non-determinism behind a port",
        body: "Depend on a `TextGenerator` port so the stage is stub-testable.",
        rationale: "Keeps every surrounding stage deterministic.",
        relatedChangeIds: ["git:src/end-of-session/extraction/index.ts"],
        relatedPaths: ["src/end-of-session/extraction/index.ts"],
        tags: ["architecture", "testing"],
        confidence: 0.9,
      },
      {
        kind: "handbook-entry",
        title: "Producer owns its output contract",
        body: "The producing spec defines the contract; consumers import it.",
        rationale: "Keeps the dependency graph acyclic.",
      },
    ],
  }),
);

describe("createCandidateGenerator — mapping", () => {
  it("maps each finding to exactly one candidate, in order (one-to-one)", () => {
    const candidates = createCandidateGenerator({ now: fixedNow }).generate(
      extraction,
      session,
    );

    expect(candidates).toHaveLength(extraction.findings.length);
    expect(candidates.map((c) => c.id)).toEqual([
      `session:${sessionId}:1`,
      `session:${sessionId}:2`,
    ]);
    // Candidate n derives from finding n (order preserved, nothing merged/reordered).
    expect(candidates.map((c) => c.title)).toEqual(
      extraction.findings.map((f) => f.title),
    );
  });

  it("carries the model's content verbatim and sets identity, kind, and governance", () => {
    const [first] = createCandidateGenerator({ now: fixedNow }).generate(
      extraction,
      session,
    );
    const finding = extraction.findings[0];

    expect(first).toMatchObject({
      id: `session:${sessionId}:1`,
      kind: "lesson-learned",
      title: finding?.title,
      body: finding?.body,
      rationale: finding?.rationale,
      tags: ["architecture", "testing"],
      related: [],
      governanceState: "candidate",
      confidence: 0.9,
    });
  });

  it("assembles complete, correct provenance", () => {
    const [first] = createCandidateGenerator({ now: fixedNow }).generate(
      extraction,
      session,
    );

    expect(first?.provenance).toEqual({
      sessionId,
      sourceChangeIds: ["git:src/end-of-session/extraction/index.ts"],
      sourcePaths: ["src/end-of-session/extraction/index.ts"],
      commitHash: "abc123def456",
      generatedAt,
      generator: "end-of-session/candidate-generator",
    });
  });

  it("omits confidence when the finding gave none, and defaults optional lists to empty", () => {
    const [, second] = createCandidateGenerator({ now: fixedNow }).generate(
      extraction,
      session,
    );

    expect(second?.confidence).toBeUndefined();
    expect(second?.tags).toEqual([]);
    expect(second?.related).toEqual([]);
    expect(second?.provenance.sourceChangeIds).toEqual([]);
    expect(second?.provenance.sourcePaths).toEqual([]);
  });

  it("shares one generatedAt across all candidates of a run", () => {
    const candidates = createCandidateGenerator({ now: fixedNow }).generate(
      extraction,
      session,
    );
    const stamps = new Set(candidates.map((c) => c.provenance.generatedAt));
    expect(stamps).toEqual(new Set([generatedAt]));
  });

  it("returns an empty array for an extraction with no findings", () => {
    const empty = parseExtractionResponse(
      JSON.stringify({
        sessionId,
        summary: { title: "Nothing reusable", keyPoints: ["No findings."] },
        findings: [],
      }),
    );
    expect(
      createCandidateGenerator({ now: fixedNow }).generate(empty, session),
    ).toEqual([]);
  });
});

describe("createCandidateGenerator — determinism & immutability", () => {
  it("produces deep-equal output across runs with a fixed clock", () => {
    const generator = createCandidateGenerator({ now: fixedNow });
    expect(generator.generate(extraction, session)).toEqual(
      generator.generate(extraction, session),
    );
  });

  it("deep-freezes every candidate and the returned array", () => {
    const candidates = createCandidateGenerator({ now: fixedNow }).generate(
      extraction,
      session,
    );
    // The whole collection is immutable — firstUnfrozenPath walks the array and every
    // nested candidate, so a null result pins both the array and its elements as frozen.
    expect(firstUnfrozenPath(candidates)).toBeNull();
  });

  it("returns a frozen handle", () => {
    expect(Object.isFrozen(createCandidateGenerator({ now: fixedNow }))).toBe(
      true,
    );
  });

  it("defaults to the wall clock when no clock is injected", () => {
    const [first] = createCandidateGenerator().generate(extraction, session);
    // A real ISO timestamp was stamped (we do not pin its value here).
    expect(() => new Date(first!.provenance.generatedAt).toISOString()).not.toThrow();
    expect(Number.isNaN(Date.parse(first!.provenance.generatedAt))).toBe(false);
  });
});

describe("createCandidateGenerator — guards", () => {
  it("throws when the extraction and session describe different runs", () => {
    const otherSession = parseSession({
      ...JSON.parse(JSON.stringify(session)),
      id: "01JADIFFERENTSESSIONID000000",
    });
    expect(() =>
      createCandidateGenerator({ now: fixedNow }).generate(
        extraction,
        otherSession,
      ),
    ).toThrow(/does not match session\.id/);
  });
});
