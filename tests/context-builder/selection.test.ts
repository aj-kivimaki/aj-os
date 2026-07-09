/**
 * Selection Engine service-boundary tests (CB-013, behaviour deferred to CB-018).
 *
 * CB-013 established the Selection Engine's service boundary:
 *   createSelectionEngine → immutable service handle.
 * CB-016 added the `select(collectionResult)` stage operation to that same
 * boundary. CB-013 and CB-016 both deferred their behaviour tests to CB-018.
 *
 * This file owns the **boundary** guarantees: the factory takes no construction
 * dependency, returns a plain frozen handle exposing only `select`, is stateless,
 * and is deterministic in construction. The `select` *behaviour* (filtering,
 * ordering, duplicate elimination, determinism, immutability) is exercised through
 * the public API in `selection-execution.test.ts`; the end-to-end pipeline is
 * exercised in `context-builder-pipeline.test.ts`. Tests validate only public
 * behaviour — no policy internal, comparator or private helper is imported.
 */

import { describe, it, expect } from "vitest";

import {
  createSelectionEngine,
  parseCollectionResult,
  type CollectionResult,
  type SelectionEngine,
} from "../../src/context-builder/index.js";

const EMPTY_RESULT: CollectionResult = parseCollectionResult({
  metadata: { project: "aj-os", task: "CB-018" },
  items: [],
  errors: [],
});

describe("createSelectionEngine — construction (no dependency)", () => {
  it("takes no arguments — the engine holds nothing at construction", () => {
    // Unlike the Collection Engine (constructed with a registry), the Selection
    // Engine's only input arrives at `select`-time; construction needs nothing.
    expect(createSelectionEngine.length).toBe(0);
    expect(() => createSelectionEngine()).not.toThrow();
  });

  it("returns a plain object handle, not a class instance", () => {
    const engine = createSelectionEngine();
    expect(Object.getPrototypeOf(engine)).toBe(Object.prototype);
  });

  it("exposes only the `select` stage operation", () => {
    const engine = createSelectionEngine();
    expect(typeof engine.select).toBe("function");
    expect(Object.keys(engine)).toEqual(["select"]);
  });
});

describe("createSelectionEngine — determinism & statelessness", () => {
  it("produces the same public service on every call", () => {
    const first = createSelectionEngine();
    const second = createSelectionEngine();
    expect(Object.keys(first)).toEqual(Object.keys(second));
  });

  it("is stateless — a fresh engine and a reused engine agree", async () => {
    // No construction state and no runtime state: a reused engine and a fresh one
    // return equal results for the same input, and repeated calls do not drift.
    const reused = createSelectionEngine();
    const firstOnReused = await reused.select(EMPTY_RESULT);
    const secondOnReused = await reused.select(EMPTY_RESULT);
    const onFresh = await createSelectionEngine().select(EMPTY_RESULT);

    expect(secondOnReused).toEqual(firstOnReused);
    expect(onFresh).toEqual(firstOnReused);
  });
});

describe("createSelectionEngine — immutability", () => {
  it("freezes the service handle", () => {
    expect(Object.isFrozen(createSelectionEngine())).toBe(true);
  });

  it("rejects mutation of the handle at runtime", () => {
    const engine = createSelectionEngine();
    expect(() => {
      (engine as { select: SelectionEngine["select"] }).select = async () =>
        EMPTY_RESULT as never;
    }).toThrow();
  });
});
