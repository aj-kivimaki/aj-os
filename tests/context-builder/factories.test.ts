/**
 * Factory API contract tests (CB-002, CB-005).
 *
 * The Context Builder exposes its services through factories — consumers never
 * instantiate internal classes. These tests document the guarantees common to
 * both factories: they return a plain, frozen handle, and they validate their
 * input up front. Schema-level and behaviour-level details live in
 * `config.test.ts` and `registry.test.ts`; this file owns the factory pattern
 * itself.
 */

import { describe, it, expect } from "vitest";

import {
  createContextBuilder,
  createProviderRegistry,
  type KnowledgeProvider,
} from "../../src/context-builder/index.js";

const validConfig = {
  profile: "implementation",
  explainability: true,
  outputFormat: "markdown",
} as const;

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

describe("createContextBuilder()", () => {
  // CB-011: the Context Builder composes an owned Collection Engine from an
  // injected Provider Registry at construction, so the factory now takes a
  // required registry alongside the configuration.
  const registry = createProviderRegistry([makeProvider("handbook")]);

  it("returns a handle exposing the validated configuration", () => {
    const builder = createContextBuilder(validConfig, registry);
    expect(builder.config).toEqual(validConfig);
  });

  it("returns a plain object handle, not a class instance", () => {
    const builder = createContextBuilder(validConfig, registry);
    expect(Object.getPrototypeOf(builder)).toBe(Object.prototype);
  });

  it("returns a frozen handle whose config is frozen", () => {
    const builder = createContextBuilder(validConfig, registry);
    expect(Object.isFrozen(builder)).toBe(true);
    expect(Object.isFrozen(builder.config)).toBe(true);
  });

  it("validates its input — invalid configuration is rejected", () => {
    // @ts-expect-error — exercising the runtime validation boundary.
    expect(() => createContextBuilder({ profile: "unknown" }, registry)).toThrow();
  });
});

describe("createProviderRegistry()", () => {
  it("returns a registry handle exposing providers and lookup", () => {
    const registry = createProviderRegistry([makeProvider("handbook")]);
    expect(typeof registry.get).toBe("function");
    expect(registry.providers.map((p) => p.id)).toEqual(["handbook"]);
  });

  it("returns a plain object handle, not a class instance", () => {
    const registry = createProviderRegistry([]);
    expect(Object.getPrototypeOf(registry)).toBe(Object.prototype);
  });

  it("returns a frozen handle", () => {
    const registry = createProviderRegistry([makeProvider("handbook")]);
    expect(Object.isFrozen(registry)).toBe(true);
  });

  it("validates its input — a broken catalogue is rejected", () => {
    expect(() =>
      createProviderRegistry([
        makeProvider("handbook"),
        makeProvider("handbook"),
      ]),
    ).toThrow();
  });
});
