/**
 * Context Builder integration tests (CB-011, validated by CB-012).
 *
 * CB-011 wired the first end-to-end collection pipeline: the Context Builder
 * composes and owns a Collection Engine built from an injected Provider Registry
 * and exposes `collect(request)`, which delegates to that engine and returns the
 * `CollectionResult` **unchanged**. CB-011 deliberately left the behaviour tests
 * to CB-012; this suite is that coverage.
 *
 * These tests exercise the **integration seam** through the public
 * `createContextBuilder(config, registry).collect(request)` entry point only —
 * they assert delegation, that the result is returned unchanged (the Context
 * Builder is a thin orchestration layer that adds no behaviour), that successful
 * knowledge and collection errors are integrated together, that output is
 * deterministic (registry order authoritative), and that the result is deeply
 * immutable. Provider-execution mechanics themselves are owned by the CB-010
 * suite (`collection-execution.test.ts`) and are not re-tested here.
 */

import { describe, it, expect } from "vitest";

import {
  createContextBuilder,
  createCollectionEngine,
  createProviderRegistry,
  type CollectionResult,
  type KnowledgeItem,
  type KnowledgeProvider,
  type KnowledgeRequest,
} from "../../src/context-builder/index.js";

const CONFIG = {
  profile: "implementation",
  explainability: true,
  outputFormat: "markdown",
} as const;

const REQUEST: KnowledgeRequest = Object.freeze({
  project: "aj-os",
  task: "CB-011",
});

/** A provider that resolves with one item citing itself as the source. */
function itemProvider(id: string): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Fixture provider ${id}.`,
    async provide(): Promise<readonly KnowledgeItem[]> {
      return [
        {
          id: `${id}-item`,
          source: { id, type: "handbook", title: `${id} source` },
          content: `knowledge from ${id}`,
        },
      ];
    },
  };
}

/** A provider that rejects — it must contribute a CollectionError, not throw. */
function failingProvider(id: string, message: string): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Failing fixture provider ${id}.`,
    async provide(): Promise<readonly KnowledgeItem[]> {
      throw new Error(message);
    },
  };
}

/** A provider that resolves after `delayMs`, to prove completion order is ignored. */
function delayedItemProvider(id: string, delayMs: number): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Delayed fixture provider ${id}.`,
    async provide(): Promise<readonly KnowledgeItem[]> {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return [
        {
          id: `${id}-item`,
          source: { id, type: "handbook", title: `${id} source` },
          content: `knowledge from ${id}`,
        },
      ];
    },
  };
}

function builderFor(providers: readonly KnowledgeProvider[]) {
  return createContextBuilder(CONFIG, createProviderRegistry(providers));
}

describe("ContextBuilder.collect — delegates to the owned engine", () => {
  it("collects items from every registered provider in registry order", async () => {
    const builder = builderFor([itemProvider("handbook"), itemProvider("wiki")]);
    const result = await builder.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual([
      "handbook-item",
      "wiki-item",
    ]);
    expect(result.errors).toEqual([]);
  });

  it("returns an empty result when no providers are registered", async () => {
    const builder = builderFor([]);
    const result = await builder.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("records the request as provenance metadata", async () => {
    const builder = builderFor([itemProvider("handbook")]);
    const result = await builder.collect({
      project: "aj-os",
      task: "CB-011",
      branch: "feature/x",
    });

    expect(result.metadata).toEqual({
      project: "aj-os",
      task: "CB-011",
      branch: "feature/x",
    });
  });
});

describe("ContextBuilder.collect — thin orchestration (result returned unchanged)", () => {
  it("returns a CollectionResult of exactly metadata/items/errors and nothing else", async () => {
    const builder = builderFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
    ]);
    const result = await builder.collect(REQUEST);

    // The Context Builder adds no fields of its own — the shape is precisely the
    // engine's CollectionResult contract (CB-009).
    expect(Object.keys(result).sort()).toEqual(["errors", "items", "metadata"]);
  });

  it("returns the same result as a Collection Engine over the same registry", async () => {
    // The builder must add no behaviour: no filtering, ranking, deduplication or
    // enrichment. A standalone engine over the identical registry and request is
    // the authoritative baseline; the builder's result must equal it exactly.
    const providers = [
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
      itemProvider("standards"),
    ];
    const registry = createProviderRegistry(providers);

    const builder = createContextBuilder(CONFIG, registry);
    const engine = createCollectionEngine(registry);

    const viaBuilder = await builder.collect(REQUEST);
    const viaEngine = await engine.collect(REQUEST);

    expect(viaBuilder).toEqual(viaEngine);
  });

  it("does not deduplicate items that share identity across providers", async () => {
    // Two providers contribute structurally identical items. A thin orchestration
    // layer forwards both; deduplication is a later milestone (M3), not here.
    const duplicate: KnowledgeItem = {
      id: "shared-item",
      source: { id: "AJS-002", type: "standard", title: "Context Assembly" },
      content: "shared knowledge",
    };
    const provider = (id: string): KnowledgeProvider => ({
      id,
      name: `${id} provider`,
      description: `Fixture provider ${id}.`,
      async provide() {
        return [duplicate];
      },
    });
    const builder = builderFor([provider("a"), provider("b")]);
    const result = await builder.collect(REQUEST);

    expect(result.items).toHaveLength(2);
    expect(result.items.map((i) => i.id)).toEqual(["shared-item", "shared-item"]);
  });
});

describe("ContextBuilder.collect — partial collection (items + errors integrated)", () => {
  it("integrates successful knowledge and provider failures in one result", async () => {
    const builder = builderFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
      itemProvider("standards"),
    ]);
    const result = await builder.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual([
      "handbook-item",
      "standards-item",
    ]);
    expect(result.errors).toEqual([
      {
        id: "collection-error:wiki",
        providerId: "wiki",
        category: "provider-error",
        message: "wiki down",
      },
    ]);
  });

  it("never aborts collection when a provider fails", async () => {
    const builder = builderFor([
      failingProvider("a", "boom-a"),
      failingProvider("b", "boom-b"),
    ]);
    const result = await builder.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors.map((e) => e.providerId)).toEqual(["a", "b"]);
  });
});

describe("ContextBuilder.collect — deterministic output", () => {
  it("orders items by registry index, not provider completion order", async () => {
    // "slow" is registered first but resolves last; the result still leads with it.
    const builder = builderFor([
      delayedItemProvider("slow", 30),
      delayedItemProvider("fast", 0),
    ]);
    const result = await builder.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual(["slow-item", "fast-item"]);
  });

  it("produces equivalent results for repeated collection with identical inputs", async () => {
    const builder = builderFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
    ]);
    const first = await builder.collect(REQUEST);
    const second = await builder.collect(REQUEST);

    expect(second).toEqual(first);
  });
});

describe("ContextBuilder.collect — immutable output", () => {
  it("returns a deeply frozen result", async () => {
    const builder = builderFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
    ]);
    const result = await builder.collect(REQUEST);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.items)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.items[0])).toBe(true);
    expect(Object.isFrozen(result.errors[0])).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("rejects runtime mutation of the returned collections", async () => {
    const builder = builderFor([itemProvider("handbook")]);
    const result = await builder.collect(REQUEST);

    expect(() => {
      (result.items as KnowledgeItem[]).push(result.items[0]);
    }).toThrow();
    expect(() => {
      (result as { metadata: CollectionResult["metadata"] }).metadata =
        result.metadata;
    }).toThrow();
  });
});
