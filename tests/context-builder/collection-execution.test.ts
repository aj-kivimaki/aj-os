/**
 * Provider execution — deterministic partial collection tests (CB-010).
 *
 * CB-010 adds the first runtime behaviour to the Collection Engine (CB-007):
 * `engine.collect(request)` executes the held registry's providers and assembles
 * an immutable CollectionResult (CB-009) of KnowledgeItems (CB-004) and
 * CollectionErrors (CB-008) under the partial-collection model.
 *
 * These tests exercise: successful providers contribute items; a failing provider
 * yields a CollectionError without aborting collection; success and failure appear
 * together; execution order follows the registry regardless of completion timing;
 * and the returned result is deeply immutable.
 */

import { describe, it, expect } from "vitest";

import {
  createCollectionEngine,
  createProviderRegistry,
  type KnowledgeItem,
  type KnowledgeProvider,
  type KnowledgeRequest,
} from "../../src/context-builder/index.js";

const REQUEST: KnowledgeRequest = Object.freeze({
  project: "aj-os",
  task: "CB-010",
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

/** A provider that rejects after `delayMs`, to prove failure completion order is ignored. */
function delayedFailingProvider(id: string, delayMs: number): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Delayed failing fixture provider ${id}.`,
    async provide(): Promise<readonly KnowledgeItem[]> {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      throw new Error(`${id} failed`);
    },
  };
}

function engineFor(providers: readonly KnowledgeProvider[]) {
  return createCollectionEngine(createProviderRegistry(providers));
}

describe("collect — successful providers contribute items", () => {
  it("collects items from every successful provider", async () => {
    const engine = engineFor([itemProvider("handbook"), itemProvider("wiki")]);
    const result = await engine.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual(["handbook-item", "wiki-item"]);
    expect(result.errors).toEqual([]);
  });

  it("returns an empty result for an empty registry", async () => {
    const engine = engineFor([]);
    const result = await engine.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("records the request as provenance metadata", async () => {
    const engine = engineFor([itemProvider("handbook")]);
    const result = await engine.collect(REQUEST);

    expect(result.metadata).toEqual({ project: "aj-os", task: "CB-010" });
  });

  it("treats a provider that finds nothing as success, not failure", async () => {
    const empty: KnowledgeProvider = {
      id: "empty",
      name: "empty provider",
      description: "Contributes nothing.",
      async provide() {
        return [];
      },
    };
    const engine = engineFor([empty]);
    const result = await engine.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors).toEqual([]);
  });
});

describe("collect — partial collection (a failure never aborts)", () => {
  it("surfaces a failing provider as a CollectionError", async () => {
    const engine = engineFor([failingProvider("handbook", "source unreadable")]);
    const result = await engine.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors).toEqual([
      {
        id: "collection-error:handbook",
        providerId: "handbook",
        category: "provider-error",
        message: "source unreadable",
      },
    ]);
  });

  it("collects items and errors together (partial outcome)", async () => {
    const engine = engineFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
      itemProvider("standards"),
    ]);
    const result = await engine.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual([
      "handbook-item",
      "standards-item",
    ]);
    expect(result.errors.map((e) => e.providerId)).toEqual(["wiki"]);
  });

  it("does not throw when every provider fails", async () => {
    const engine = engineFor([
      failingProvider("a", "boom-a"),
      failingProvider("b", "boom-b"),
    ]);
    const result = await engine.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors.map((e) => e.providerId)).toEqual(["a", "b"]);
  });

  it("falls back to a stable message for a non-Error rejection", async () => {
    const weird: KnowledgeProvider = {
      id: "weird",
      name: "weird provider",
      description: "Rejects with a non-Error.",
      async provide(): Promise<readonly KnowledgeItem[]> {
        throw undefined;
      },
    };
    const engine = engineFor([weird]);
    const result = await engine.collect(REQUEST);

    expect(result.errors[0]!.message).toBe(
      "The provider failed to contribute knowledge.",
    );
  });
});

describe("collect — determinism (registry order is authoritative)", () => {
  it("orders items by registry index, not completion order", async () => {
    // "slow" is registered first but resolves last; "fast" resolves first.
    const engine = engineFor([
      delayedItemProvider("slow", 30),
      delayedItemProvider("fast", 0),
    ]);
    const result = await engine.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual(["slow-item", "fast-item"]);
  });

  it("orders errors by registry index, not failure completion order", async () => {
    // "slow" is registered first but rejects last; "fast" rejects first. The
    // CollectionErrors must still appear in registry order — provider completion
    // order never influences result ordering.
    const engine = engineFor([
      delayedFailingProvider("slow", 30),
      delayedFailingProvider("fast", 0),
    ]);
    const result = await engine.collect(REQUEST);

    expect(result.items).toEqual([]);
    expect(result.errors.map((e) => e.providerId)).toEqual(["slow", "fast"]);
  });

  it("orders interleaved items and errors by registry index regardless of timing", async () => {
    // Registry order: item(slow) · fail(fast) · item(fast) · fail(slow). Despite
    // the fast providers settling first, items and errors each follow registry
    // order deterministically.
    const engine = engineFor([
      delayedItemProvider("i-slow", 30),
      delayedFailingProvider("e-fast", 0),
      delayedItemProvider("i-fast", 0),
      delayedFailingProvider("e-slow", 30),
    ]);
    const result = await engine.collect(REQUEST);

    expect(result.items.map((i) => i.id)).toEqual(["i-slow-item", "i-fast-item"]);
    expect(result.errors.map((e) => e.providerId)).toEqual(["e-fast", "e-slow"]);
  });

  it("produces the same result shape for repeated runs", async () => {
    const engine = engineFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
    ]);
    const first = await engine.collect(REQUEST);
    const second = await engine.collect(REQUEST);

    expect(second.items.map((i) => i.id)).toEqual(
      first.items.map((i) => i.id),
    );
    expect(second.errors.map((e) => e.id)).toEqual(
      first.errors.map((e) => e.id),
    );
  });
});

describe("collect — immutable output", () => {
  it("returns a deeply frozen result", async () => {
    const engine = engineFor([
      itemProvider("handbook"),
      failingProvider("wiki", "wiki down"),
    ]);
    const result = await engine.collect(REQUEST);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.items)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.items[0])).toBe(true);
    expect(Object.isFrozen(result.errors[0])).toBe(true);
  });

  it("rejects mutation of the returned collections at runtime", async () => {
    const engine = engineFor([itemProvider("handbook")]);
    const result = await engine.collect(REQUEST);

    expect(result.items).not.toHaveLength(0);
    expect(() => {
      (result.items as unknown as KnowledgeItem[]).push(result.items[0]!);
    }).toThrow();
  });
});
