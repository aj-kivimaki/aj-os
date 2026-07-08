/**
 * Collection Engine service-boundary tests (CB-007).
 *
 * CB-007 establishes only the service boundary:
 *   ProviderRegistry → createCollectionEngine → immutable service handle.
 * These tests document construction, registry injection ("held, not executed"),
 * determinism and immutability. Provider execution, CollectionResult and
 * CollectionError are out of scope (CB-008…CB-010) and are not exercised — in
 * particular, no provider's `provide` method is ever called here.
 */

import { describe, it, expect } from "vitest";

import {
  createCollectionEngine,
  createProviderRegistry,
  type KnowledgeProvider,
  type ProviderRegistry,
} from "../../src/context-builder/index.js";

/**
 * Minimal provider fixture whose `provide` throws — CB-007 must never execute it.
 * If any test triggers execution, the throw surfaces the boundary violation.
 */
function makeProvider(id: string): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Fixture provider ${id}.`,
    async provide() {
      throw new Error(`provider "${id}" must not be executed in CB-007`);
    },
  };
}

function makeRegistry(ids: readonly string[]): ProviderRegistry {
  return createProviderRegistry(ids.map(makeProvider));
}

describe("createCollectionEngine — construction & registry injection", () => {
  it("holds the injected registry on the handle", () => {
    const registry = makeRegistry(["handbook", "wiki"]);
    const engine = createCollectionEngine(registry);
    expect(engine.registry).toBe(registry);
  });

  it("holds an empty registry", () => {
    const registry = makeRegistry([]);
    const engine = createCollectionEngine(registry);
    expect(engine.registry).toBe(registry);
    expect(engine.registry.providers).toEqual([]);
  });

  it("rejects a missing registry", () => {
    expect(() =>
      createCollectionEngine(undefined as unknown as ProviderRegistry),
    ).toThrow(/registry/i);
    expect(() =>
      createCollectionEngine(null as unknown as ProviderRegistry),
    ).toThrow(/registry/i);
  });
});

describe("createCollectionEngine — holds, does not execute", () => {
  it("does not execute any provider during construction", () => {
    // makeProvider's `provide` throws; a clean construction proves no execution.
    const registry = makeRegistry(["handbook", "wiki"]);
    expect(() => createCollectionEngine(registry)).not.toThrow();
  });

  it("exposes only the registry (no collection behaviour in CB-007)", () => {
    const engine = createCollectionEngine(makeRegistry(["handbook"]));
    expect(Object.keys(engine)).toEqual(["registry"]);
  });
});

describe("createCollectionEngine — determinism", () => {
  it("produces the same public service for the same registry", () => {
    const registry = makeRegistry(["a", "b", "c"]);
    const first = createCollectionEngine(registry);
    const second = createCollectionEngine(registry);
    expect(first.registry).toBe(second.registry);
    expect(Object.keys(first)).toEqual(Object.keys(second));
  });
});

describe("createCollectionEngine — immutability", () => {
  it("freezes the service handle", () => {
    const engine = createCollectionEngine(makeRegistry(["handbook"]));
    expect(Object.isFrozen(engine)).toBe(true);
  });

  it("rejects mutation of the handle at runtime", () => {
    const engine = createCollectionEngine(makeRegistry(["handbook"]));
    expect(() => {
      (engine as { registry: ProviderRegistry }).registry = makeRegistry([]);
    }).toThrow();
  });
});
