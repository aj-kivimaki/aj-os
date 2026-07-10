/**
 * Assembly Engine service-boundary tests (CB-019, behaviour deferred to CB-024).
 *
 * CB-019 established the Assembly Engine's service boundary:
 *   createAssemblyEngine → immutable service handle.
 * CB-022 added the `assemble(selectionResult, generatedAt)` stage operation to that
 * same boundary. CB-019 and CB-022 both deferred their behaviour tests to CB-024.
 *
 * This file owns the **boundary** guarantees: the factory takes no construction
 * dependency, returns a plain frozen handle exposing only `assemble`, is stateless,
 * and is deterministic in construction. The `assemble` *behaviour* (section and
 * metadata composition, ordering, determinism, immutability, conformance) is
 * exercised through the public API in `assembly-execution.test.ts`; the end-to-end
 * pipeline is exercised in `context-builder-pipeline.test.ts`. Tests validate only
 * public behaviour — no internal mapping, policy or private helper is imported.
 */

import { describe, it, expect } from "vitest";

import {
  createAssemblyEngine,
  parseSelectionResult,
  type AssemblyEngine,
  type SelectionResult,
} from "../../src/context-builder/index.js";

const GENERATED_AT = "2026-07-10T00:00:00.000Z";

const EMPTY_SELECTION: SelectionResult = parseSelectionResult({
  metadata: { project: "aj-os", task: "CB-024" },
  selectedItems: [],
  excludedItems: [],
});

describe("createAssemblyEngine — construction (no dependency)", () => {
  it("takes no arguments — the engine holds nothing at construction", () => {
    // Like the Selection Engine (and unlike the Collection Engine, constructed with
    // a registry), the Assembly Engine's inputs arrive at `assemble`-time; the
    // `SelectionResult` and injected `generatedAt` are not injected at construction.
    expect(createAssemblyEngine.length).toBe(0);
    expect(() => createAssemblyEngine()).not.toThrow();
  });

  it("returns a plain object handle, not a class instance", () => {
    const engine = createAssemblyEngine();
    expect(Object.getPrototypeOf(engine)).toBe(Object.prototype);
  });

  it("exposes only the `assemble` stage operation", () => {
    const engine = createAssemblyEngine();
    expect(typeof engine.assemble).toBe("function");
    expect(Object.keys(engine)).toEqual(["assemble"]);
  });
});

describe("createAssemblyEngine — determinism & statelessness", () => {
  it("produces the same public service on every call", () => {
    const first = createAssemblyEngine();
    const second = createAssemblyEngine();
    expect(Object.keys(first)).toEqual(Object.keys(second));
  });

  it("is stateless — a fresh engine and a reused engine agree", async () => {
    // No construction state and no runtime state: a reused engine and a fresh one
    // return equal packages for the same input, and repeated calls do not drift.
    const reused = createAssemblyEngine();
    const firstOnReused = await reused.assemble(EMPTY_SELECTION, GENERATED_AT);
    const secondOnReused = await reused.assemble(EMPTY_SELECTION, GENERATED_AT);
    const onFresh = await createAssemblyEngine().assemble(EMPTY_SELECTION, GENERATED_AT);

    expect(secondOnReused).toEqual(firstOnReused);
    expect(onFresh).toEqual(firstOnReused);
  });
});

describe("createAssemblyEngine — immutability", () => {
  it("freezes the service handle", () => {
    expect(Object.isFrozen(createAssemblyEngine())).toBe(true);
  });

  it("rejects mutation of the handle at runtime", () => {
    const engine = createAssemblyEngine();
    expect(() => {
      (engine as { assemble: AssemblyEngine["assemble"] }).assemble = async () =>
        EMPTY_SELECTION as never;
    }).toThrow();
  });
});
