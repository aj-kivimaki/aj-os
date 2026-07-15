/**
 * CandidateKnowledge contract tests (EOS-003).
 *
 * Covers the canonical SPEC-003 → SPEC-004 boundary contract: runtime validation,
 * strictness, the declared kind taxonomy and its lenient fallback, the pinned
 * `candidate` governance state, provenance completeness/traceability, array
 * defaults, the optional confidence range, and deep immutability. This is a
 * *contract* task — no candidate generation, persistence, or dedup is exercised
 * (those are M4 / SPEC-004). Everything is asserted through the module's public
 * surface (the SPEC-004 import surface, EOS-D1), never through internal files.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseCandidateKnowledge,
  candidateKnowledgeSchema,
  CANDIDATE_KINDS,
  type CandidateKnowledge,
} from "../../src/end-of-session/index.js";

const validCandidate = {
  id: "session:01J8Z3K7Q9WV0FB2XN4MABCDEF:1",
  kind: "handbook-entry",
  title: "Prefer lenient enums for forward-compatible boundary contracts",
  body: "# Lenient enums\n\nUse `.catch` so a new kind never breaks an old parser.",
  rationale: "Recurs across every cross-spec contract; worth capturing once.",
  provenance: {
    sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
    sourceChangeIds: ["change-1", "change-2"],
    sourcePaths: ["src/end-of-session/contracts/candidate/schema.ts"],
    commitHash: "a1b2c3d4",
    generatedAt: "2026-07-15T10:30:00.000Z",
    generator: "end-of-session/knowledge-extractor",
  },
  governanceState: "candidate",
  tags: ["contracts", "zod"],
  related: ["session:01J8Z3K7Q9WV0FB2XN4MABCDEF:2"],
  confidence: 0.82,
} as const satisfies CandidateKnowledge;

/** The minimal valid candidate: required fields only, arrays defaulted, no optionals. */
const minimalInput = {
  id: "session:01J8Z3K7Q9WV0FB2XN4MABCDEF:1",
  kind: "lesson-learned",
  title: "Surface spec conflicts instead of resolving them by invention",
  body: "When docs disagree, stop and ask.",
  rationale: "Prevents a wrong assumption becoming a frozen contract.",
  provenance: {
    sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
    generatedAt: "2026-07-15T10:30:00.000Z",
    generator: "end-of-session/knowledge-extractor",
  },
  governanceState: "candidate",
} as const;

describe("CandidateKnowledge contract", () => {
  it("accepts a fully-populated candidate and preserves its values", () => {
    expect(parseCandidateKnowledge(validCandidate)).toEqual(validCandidate);
  });

  it("defaults the grouping/provenance arrays to empty when omitted", () => {
    const candidate = parseCandidateKnowledge(minimalInput);
    expect(candidate.tags).toEqual([]);
    expect(candidate.related).toEqual([]);
    expect(candidate.provenance.sourceChangeIds).toEqual([]);
    expect(candidate.provenance.sourcePaths).toEqual([]);
    expect(candidate.confidence).toBeUndefined();
  });

  it("accepts every declared kind in the SPEC-003 §8 taxonomy", () => {
    for (const kind of CANDIDATE_KINDS) {
      expect(() =>
        parseCandidateKnowledge({ ...minimalInput, kind }),
      ).not.toThrow();
    }
  });

  it("declares the full six-kind taxonomy", () => {
    expect([...CANDIDATE_KINDS]).toEqual([
      "handbook-entry",
      "playbook",
      "wiki-publication",
      "lesson-learned",
      "doc-update",
      "automation-idea",
    ]);
  });

  it("falls back to 'handbook-entry' for a not-yet-declared string kind — forward-compatible", () => {
    const candidate = parseCandidateKnowledge({
      ...minimalInput,
      kind: "future-kind-from-a-later-analyzer",
    });
    expect(candidate.kind).toBe("handbook-entry");
  });

  it("rejects a missing kind — a producer error, not a forward-compat case", () => {
    const { kind: _kind, ...withoutKind } = minimalInput;
    expect(() => parseCandidateKnowledge(withoutKind)).toThrow(ZodError);
  });

  it("rejects a non-string kind — only unknown strings fall back", () => {
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, kind: 42 }),
    ).toThrow(ZodError);
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, kind: null }),
    ).toThrow(ZodError);
  });

  it("rejects a governanceState other than 'candidate' — SPEC-003 only proposes", () => {
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, governanceState: "approved" }),
    ).toThrow(ZodError);
  });

  it("rejects a missing required field", () => {
    const { rationale: _rationale, ...withoutRationale } = minimalInput;
    expect(() => parseCandidateKnowledge(withoutRationale)).toThrow(ZodError);
  });

  it("rejects an empty required string", () => {
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, title: "" }),
    ).toThrow(ZodError);
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, body: "" }),
    ).toThrow(ZodError);
  });

  it("enforces provenance referential sanity — sessionId must be present", () => {
    const { sessionId: _sessionId, ...provenanceWithoutSession } =
      minimalInput.provenance;
    expect(() =>
      parseCandidateKnowledge({
        ...minimalInput,
        provenance: provenanceWithoutSession,
      }),
    ).toThrow(ZodError);
  });

  it("rejects a malformed generatedAt timestamp", () => {
    expect(() =>
      parseCandidateKnowledge({
        ...minimalInput,
        provenance: { ...minimalInput.provenance, generatedAt: "yesterday" },
      }),
    ).toThrow(ZodError);
  });

  it("rejects a confidence outside [0, 1]", () => {
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, confidence: 1.5 }),
    ).toThrow(ZodError);
    expect(() =>
      parseCandidateKnowledge({ ...minimalInput, confidence: -0.1 }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — no SPEC-004 decision fields may enter the boundary", () => {
    expect(() =>
      parseCandidateKnowledge({ ...validCandidate, reviewDecision: "approve" }),
    ).toThrow(ZodError);
    expect(() =>
      parseCandidateKnowledge({
        ...validCandidate,
        provenance: { ...validCandidate.provenance, stackTrace: "at foo" },
      }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen candidate, including nested provenance and arrays", () => {
    const candidate = parseCandidateKnowledge(validCandidate);
    expect(Object.isFrozen(candidate)).toBe(true);
    expect(Object.isFrozen(candidate.provenance)).toBe(true);
    expect(Object.isFrozen(candidate.provenance.sourcePaths)).toBe(true);
    expect(Object.isFrozen(candidate.tags)).toBe(true);
    expect(() => {
      (candidate as { title: string }).title = "changed";
    }).toThrow();
    expect(() => {
      (candidate.provenance as { generator: string }).generator = "changed";
    }).toThrow();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseCandidateKnowledge(validCandidate)).toEqual(
      parseCandidateKnowledge(validCandidate),
    );
  });

  it("exposes the schema for composition (candidate generation, M4)", () => {
    expect(candidateKnowledgeSchema.safeParse(validCandidate).success).toBe(
      true,
    );
  });
});
