/**
 * Provider Registry contract tests (CB-005).
 *
 * The registry is an immutable catalogue of KnowledgeProviders:
 *   providers → validation → immutable registry → lookup.
 * These tests document construction, duplicate/empty-id validation, lookup,
 * deterministic ordering and immutability. Provider execution, discovery and
 * ranking are out of scope and not exercised.
 */

import { describe, it, expect } from "vitest";

import {
  createProviderRegistry,
  type KnowledgeProvider,
} from "../../src/context-builder/index.js";

/** Minimal provider fixture — identity only; `provide` is never called here. */
function makeProvider(id: string): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Fixture provider ${id}.`,
    async provide() {
      return [];
    },
  };
}

describe("createProviderRegistry — construction & lookup", () => {
  it("exposes the registered providers in caller insertion order", () => {
    const providers = [makeProvider("handbook"), makeProvider("wiki")];
    const registry = createProviderRegistry(providers);
    expect(registry.providers.map((p) => p.id)).toEqual(["handbook", "wiki"]);
  });

  it("supports an empty registry", () => {
    const registry = createProviderRegistry([]);
    expect(registry.providers).toEqual([]);
    expect(registry.get("anything")).toBeUndefined();
  });

  it("retrieves a provider by id", () => {
    const handbook = makeProvider("handbook");
    const registry = createProviderRegistry([handbook, makeProvider("wiki")]);
    expect(registry.get("handbook")).toBe(handbook);
  });

  it("returns undefined for an unknown id", () => {
    const registry = createProviderRegistry([makeProvider("handbook")]);
    expect(registry.get("missing")).toBeUndefined();
  });
});

describe("createProviderRegistry — validation", () => {
  it("rejects duplicate provider ids", () => {
    expect(() =>
      createProviderRegistry([
        makeProvider("handbook"),
        makeProvider("handbook"),
      ]),
    ).toThrow(/duplicate/i);
  });

  it("rejects a provider with an empty id", () => {
    expect(() => createProviderRegistry([makeProvider("")])).toThrow(/id/i);
  });
});

describe("createProviderRegistry — determinism", () => {
  it("produces the same order for the same input", () => {
    const providers = [
      makeProvider("a"),
      makeProvider("b"),
      makeProvider("c"),
    ];
    const first = createProviderRegistry(providers).providers.map((p) => p.id);
    const second = createProviderRegistry(providers).providers.map((p) => p.id);
    expect(first).toEqual(second);
    expect(first).toEqual(["a", "b", "c"]);
  });
});

describe("createProviderRegistry — immutability", () => {
  it("freezes the registry handle and its providers array", () => {
    const registry = createProviderRegistry([makeProvider("handbook")]);
    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.providers)).toBe(true);
  });

  it("rejects mutation of the providers array at runtime", () => {
    const registry = createProviderRegistry([makeProvider("handbook")]);
    expect(() => {
      (registry.providers as KnowledgeProvider[]).push(makeProvider("wiki"));
    }).toThrow();
  });

  it("does not reflect later mutation of the caller's input array", () => {
    const providers = [makeProvider("handbook")];
    const registry = createProviderRegistry(providers);
    providers.push(makeProvider("wiki"));
    expect(registry.providers.map((p) => p.id)).toEqual(["handbook"]);
  });
});
