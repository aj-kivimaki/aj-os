/**
 * Context Package contract tests (CB-003).
 *
 * The Context Package is the canonical output of the Context Builder. These
 * tests document its schema, runtime validation, structural invariants and
 * deep immutability. They are deterministic: every timestamp is a fixed
 * literal, and no value depends on the clock, filesystem or randomness.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseContextPackage,
  SECTION_KINDS,
  REFERENCE_TYPES,
} from "../../src/context-builder/index.js";

/** A fully-populated, valid package used as the baseline for mutation tests. */
function validPackage() {
  return {
    metadata: {
      contextVersion: "1.0",
      generatedAt: "2026-07-08T00:00:00.000Z",
      project: "aj-os",
      task: "CB-006",
      contextBuilderVersion: "0.1.0",
    },
    sections: [
      {
        kind: "objective",
        title: "Objective",
        content: "Establish the contract testing foundation.",
        referenceIds: ["ref-spec"],
      },
      {
        kind: "coding-standards",
        title: "Coding Standards",
        content: "Follow AJS-002.",
        referenceIds: [],
      },
    ],
    references: [
      {
        id: "ref-spec",
        type: "specification",
        title: "SPEC-002 — Context Builder Agent",
        locator: "docs/specifications/SPEC-002",
      },
    ],
    explainability: {
      summary: "Selected the governing specification.",
      entries: [{ referenceId: "ref-spec", reason: "Defines the task." }],
    },
    summary: "Foundation context package.",
  };
}

describe("Context Package — public value sets", () => {
  it("exposes the 12 canonical AJS-002 Appendix B section kinds", () => {
    expect(SECTION_KINDS).toHaveLength(12);
    expect([...SECTION_KINDS]).toContain("objective");
    expect([...SECTION_KINDS]).toContain("open-questions");
  });

  it("exposes the AJS-002 knowledge-source reference types", () => {
    expect([...REFERENCE_TYPES]).toContain("specification");
    expect([...REFERENCE_TYPES]).toContain("standard");
    expect([...REFERENCE_TYPES]).toContain("source-code");
  });
});

describe("parseContextPackage — schema & runtime validation", () => {
  it("accepts a fully-populated valid package", () => {
    expect(() => parseContextPackage(validPackage())).not.toThrow();
  });

  it("accepts a minimal valid package (empty collections, empty summaries)", () => {
    const minimal = {
      metadata: {
        contextVersion: "1.0",
        generatedAt: "2026-07-08T00:00:00.000Z",
        project: "aj-os",
        task: "CB-006",
        contextBuilderVersion: "0.1.0",
      },
      sections: [],
      references: [],
      explainability: { summary: "", entries: [] },
      summary: "",
    };
    expect(() => parseContextPackage(minimal)).not.toThrow();
  });

  it("rejects unknown top-level keys — the contract is strict", () => {
    expect(() => parseContextPackage({ ...validPackage(), tokens: 42 })).toThrow(
      ZodError,
    );
  });

  it("rejects unknown metadata keys — metadata is strict", () => {
    const pkg = validPackage();
    expect(() =>
      parseContextPackage({
        ...pkg,
        metadata: { ...pkg.metadata, author: "aj" },
      }),
    ).toThrow(ZodError);
  });

  it("rejects a non-ISO generatedAt timestamp", () => {
    const pkg = validPackage();
    expect(() =>
      parseContextPackage({
        ...pkg,
        metadata: { ...pkg.metadata, generatedAt: "yesterday" },
      }),
    ).toThrow(ZodError);
  });

  it("rejects an empty required metadata field", () => {
    const pkg = validPackage();
    expect(() =>
      parseContextPackage({
        ...pkg,
        metadata: { ...pkg.metadata, project: "" },
      }),
    ).toThrow(ZodError);
  });

  it("rejects an unknown section kind", () => {
    const pkg = validPackage();
    pkg.sections[0]!.kind = "prologue";
    expect(() => parseContextPackage(pkg)).toThrow(ZodError);
  });

  it("rejects an unknown reference type", () => {
    const pkg = validPackage();
    pkg.references[0]!.type = "slack";
    expect(() => parseContextPackage(pkg)).toThrow(ZodError);
  });
});

describe("parseContextPackage — structural invariants", () => {
  it("rejects duplicate reference ids", () => {
    const pkg = validPackage();
    pkg.references.push({ ...pkg.references[0]! });
    expect(() => parseContextPackage(pkg)).toThrow(ZodError);
  });

  it("rejects duplicate section kinds", () => {
    const pkg = validPackage();
    pkg.sections.push({
      kind: "objective",
      title: "Objective again",
      content: "duplicate",
      referenceIds: [],
    });
    expect(() => parseContextPackage(pkg)).toThrow(ZodError);
  });

  it("rejects a section referencing an unknown reference id", () => {
    const pkg = validPackage();
    pkg.sections[0]!.referenceIds = ["ref-does-not-exist"];
    expect(() => parseContextPackage(pkg)).toThrow(ZodError);
  });

  it("rejects an explainability entry referencing an unknown reference id", () => {
    const pkg = validPackage();
    pkg.explainability.entries = [{ referenceId: "ref-ghost", reason: "dangling" }];
    expect(() => parseContextPackage(pkg)).toThrow(ZodError);
  });
});

describe("parseContextPackage — deep immutability", () => {
  it("deeply freezes the parsed package", () => {
    const pkg = parseContextPackage(validPackage());
    expect(Object.isFrozen(pkg)).toBe(true);
    expect(Object.isFrozen(pkg.metadata)).toBe(true);
    expect(Object.isFrozen(pkg.sections)).toBe(true);
    expect(Object.isFrozen(pkg.sections[0])).toBe(true);
    expect(Object.isFrozen(pkg.sections[0]!.referenceIds)).toBe(true);
    expect(Object.isFrozen(pkg.references[0])).toBe(true);
    expect(Object.isFrozen(pkg.explainability.entries[0])).toBe(true);
  });

  it("rejects mutation of nested package values at runtime", () => {
    const pkg = parseContextPackage(validPackage());
    expect(() => {
      // @ts-expect-error — the contract is deeply readonly; this documents runtime enforcement.
      pkg.metadata.project = "other";
    }).toThrow();
  });
});
