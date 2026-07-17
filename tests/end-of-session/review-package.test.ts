/**
 * ReviewPackage contract tests (EOS-004).
 *
 * Covers the human-readable projection contract (EOS-D4): runtime validation,
 * strictness, array defaults, and deep immutability. This is a *contract* task — no
 * projector/rendering is exercised (that is M5), and the contract holds candidate
 * *references* (`candidateIds`), never embedded canonical records. Everything is
 * asserted through the module's public surface.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseReviewPackage,
  reviewPackageSchema,
  type ReviewPackage,
} from "../../src/end-of-session/index.js";

import { firstUnfrozenPath } from "./support.js";

const validPackage = {
  sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
  generatedAt: "2026-07-15T10:30:00.000Z",
  summary: "3 candidates proposed from the session's git changes.",
  candidateIds: [
    "session:01J8Z3K7Q9WV0FB2XN4MABCDEF:1",
    "session:01J8Z3K7Q9WV0FB2XN4MABCDEF:2",
  ],
  markdown: "# Review\n\n- Candidate 1\n- Candidate 2\n",
} as const satisfies ReviewPackage;

describe("ReviewPackage contract", () => {
  it("accepts a valid projection and preserves its values", () => {
    expect(parseReviewPackage(validPackage)).toEqual(validPackage);
  });

  it("defaults candidateIds to empty and allows an empty summary", () => {
    const pkg = parseReviewPackage({
      sessionId: validPackage.sessionId,
      generatedAt: validPackage.generatedAt,
      summary: "",
      markdown: "# Review\n\nNo candidates this session.\n",
    });
    expect(pkg.candidateIds).toEqual([]);
    expect(pkg.summary).toBe("");
  });

  it("rejects a missing required field", () => {
    const { markdown: _markdown, ...withoutMarkdown } = validPackage;
    expect(() => parseReviewPackage(withoutMarkdown)).toThrow(ZodError);
  });

  it("rejects empty markdown — the projection must carry rendered content", () => {
    expect(() => parseReviewPackage({ ...validPackage, markdown: "" })).toThrow(ZodError);
  });

  it("rejects a malformed generatedAt timestamp", () => {
    expect(() =>
      parseReviewPackage({ ...validPackage, generatedAt: "2026-07-15" }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — no canonical candidate data may leak in", () => {
    expect(() =>
      parseReviewPackage({
        ...validPackage,
        candidates: [{ id: "x", body: "embedded record" }],
      }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen projection, including candidateIds", () => {
    expect(firstUnfrozenPath(parseReviewPackage(validPackage))).toBeNull();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseReviewPackage(validPackage)).toEqual(parseReviewPackage(validPackage));
  });

  it("exposes the schema for composition (the projector, M5)", () => {
    expect(reviewPackageSchema.safeParse(validPackage).success).toBe(true);
  });
});
