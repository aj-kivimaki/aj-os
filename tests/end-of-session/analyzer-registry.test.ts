/**
 * Analyzer Registry tests (EOS-005).
 *
 * The registry is infrastructure that owns deterministic registration and lookup
 * only. These tests assert — through the public surface — that it holds injected
 * analyzers in insertion order, retrieves by id, fails fast on an empty/duplicate
 * id, is frozen, and **never executes** an analyzer (a fixture whose `analyze`
 * throws is registered and looked up without the throw ever firing). Modeled on the
 * SPEC-002 provider registry (CB-005).
 */

import { describe, it, expect } from "vitest";

import {
  createAnalyzerRegistry,
  type Analyzer,
  type Session,
  type SessionChange,
} from "../../src/end-of-session/index.js";

/** A fixture analyzer whose `analyze` throws — proves the registry never runs it. */
function makeAnalyzer(id: string): Analyzer {
  return {
    id,
    name: `${id} analyzer`,
    description: `Fixture analyzer ${id}.`,
    analyze(_session: Session): Promise<readonly SessionChange[]> {
      throw new Error(`analyzer ${id} must not be executed by the registry`);
    },
  };
}

describe("Analyzer Registry", () => {
  it("holds analyzers in the caller's insertion order", () => {
    const git = makeAnalyzer("git");
    const docs = makeAnalyzer("docs");
    const registry = createAnalyzerRegistry([git, docs]);
    expect(registry.analyzers).toEqual([git, docs]);
  });

  it("retrieves an analyzer by id, or undefined when absent", () => {
    const git = makeAnalyzer("git");
    const registry = createAnalyzerRegistry([git]);
    expect(registry.get("git")).toBe(git);
    expect(registry.get("nope")).toBeUndefined();
  });

  it("never executes a registered analyzer", () => {
    const git = makeAnalyzer("git");
    expect(() => {
      const registry = createAnalyzerRegistry([git]);
      registry.get("git");
      void registry.analyzers;
    }).not.toThrow();
  });

  it("throws on an analyzer with a missing or empty id", () => {
    const bad = { ...makeAnalyzer("git"), id: "" };
    expect(() => createAnalyzerRegistry([bad])).toThrow(/non-empty string id/);
  });

  it("throws on a duplicate analyzer id", () => {
    expect(() =>
      createAnalyzerRegistry([makeAnalyzer("git"), makeAnalyzer("git")]),
    ).toThrow(/duplicate analyzer id "git"/);
  });

  it("returns a frozen handle and a frozen analyzers array", () => {
    const registry = createAnalyzerRegistry([makeAnalyzer("git")]);
    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.analyzers)).toBe(true);
    expect(() => {
      (registry.analyzers as Analyzer[]).push(makeAnalyzer("docs"));
    }).toThrow();
  });

  it("accepts an empty registry", () => {
    const registry = createAnalyzerRegistry([]);
    expect(registry.analyzers).toEqual([]);
    expect(registry.get("git")).toBeUndefined();
  });
});
