/**
 * Context Builder pipeline behaviour tests — `build(request)` (CB-017, deferred to
 * CB-018).
 *
 * CB-018 is the permanent owner of the `ContextBuilder.build(request)` pipeline
 * regression suite. When `ContextBuilder.collect` was superseded by `build(request)`
 * (the approved public API evolution reconciled in CB-017), the obsolete
 * builder-level `collect` suite was retired; this file replaces that builder-level
 * coverage by validating the Collection → Selection pipeline through the single
 * public entry point:
 *
 *   KnowledgeRequest → build → CollectionEngine.collect → CollectionResult
 *                           → SelectionEngine.select → SelectionResult
 *
 * The Context Builder is a **thin orchestrator**: it only composes the two stages.
 * These tests therefore assert *orchestration*, never engine internals — engine-level
 * collection behaviour (provider execution, partial collection, deterministic error
 * ordering) is permanently owned by the CB-010 suite (`collection-execution.test.ts`)
 * and selection behaviour by `selection-execution.test.ts`; neither is re-tested here.
 * The pipeline's correctness is proved by asserting `build(request)` equals a manual
 * two-engine composition over the same registry.
 */

import { describe, it, expect } from "vitest";

import {
  createContextBuilder,
  createCollectionEngine,
  createSelectionEngine,
  createProviderRegistry,
  type KnowledgeItem,
  type KnowledgeProvider,
  type KnowledgeRequest,
  type ProviderRegistry,
} from "../../src/context-builder/index.js";

const CONFIG = {
  profile: "implementation",
  explainability: true,
  outputFormat: "markdown",
} as const;

const REQUEST: KnowledgeRequest = Object.freeze({ project: "aj-os", task: "CB-018" });

/** A provider that contributes the given items (source shared so cross-provider
 *  identical content + source are exact duplicates). */
function provider(id: string, items: readonly KnowledgeItem[]): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Fixture provider ${id}.`,
    async provide(): Promise<readonly KnowledgeItem[]> {
      return items;
    },
  };
}

/** A provider that rejects — contributes a CollectionError, never aborts collection. */
function failingProvider(id: string): KnowledgeProvider {
  return {
    id,
    name: `${id} provider`,
    description: `Failing fixture provider ${id}.`,
    async provide(): Promise<readonly KnowledgeItem[]> {
      throw new Error(`${id} unavailable`);
    },
  };
}

const STANDARD = { id: "AJS-001", type: "standard", title: "Engineering Standard" } as const;

function item(id: string, content: string): KnowledgeItem {
  return { id, source: STANDARD, content };
}

function builderFor(registry: ProviderRegistry) {
  return createContextBuilder(CONFIG, registry);
}

/** Manual two-engine composition: the pipeline `build` must reproduce exactly. */
async function manualCompose(registry: ProviderRegistry, request: KnowledgeRequest) {
  const collection = await createCollectionEngine(registry).collect(request);
  return createSelectionEngine().select(collection);
}

describe("build — orchestrates Collection → Selection", () => {
  it("equals a manual two-engine composition over the same registry", async () => {
    const registry = createProviderRegistry([
      provider("a", [item("k3", "c3")]),
      provider("b", [item("k1", "c1"), item("k2", "c2")]),
    ]);

    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);

    expect(viaBuild).toEqual(viaManual);
  });

  it("returns the SelectionResult unchanged — the builder adds no behaviour", async () => {
    // A thin orchestrator neither filters, reorders, deduplicates nor enriches:
    // build's output is byte-for-byte the selection stage's output.
    const registry = createProviderRegistry([provider("a", [item("k1", "c1")])]);
    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);
    expect(viaBuild.selectedItems).toEqual(viaManual.selectedItems);
    expect(viaBuild.excludedItems).toEqual(viaManual.excludedItems);
    expect(viaBuild.metadata).toEqual(viaManual.metadata);
  });

  it("exposes `build` as the single public entry point (no `collect`)", async () => {
    const builder = builderFor(createProviderRegistry([provider("a", [])]));
    expect(typeof builder.build).toBe("function");
    expect((builder as { collect?: unknown }).collect).toBeUndefined();
  });
});

describe("build — deterministic selection end-to-end", () => {
  it("orders selectedItems canonically regardless of collection order", async () => {
    // Provider order (a→b) collects k3 before k1/k2; selection re-orders by id.
    const registry = createProviderRegistry([
      provider("a", [item("k3", "c3")]),
      provider("b", [item("k1", "c1"), item("k2", "c2")]),
    ]);
    const result = await builderFor(registry).build(REQUEST);
    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1", "k2", "k3"]);
    expect(result.excludedItems).toEqual([]);
  });

  it("eliminates an exact cross-provider duplicate through the pipeline", async () => {
    // Two providers contribute identical content + source under different ids: an
    // exact duplicate. The lowest id survives; the other is routed to excludedItems.
    const registry = createProviderRegistry([
      provider("a", [item("k2", "same body")]),
      provider("b", [item("k1", "same body")]),
    ]);
    const result = await builderFor(registry).build(REQUEST);
    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1"]);
    expect(result.excludedItems.map((i) => i.id)).toEqual(["k2"]);
  });

  it("carries the request provenance forward as metadata", async () => {
    const registry = createProviderRegistry([provider("a", [item("k1", "c1")])]);
    const result = await builderFor(registry).build(REQUEST);
    expect(result.metadata).toEqual({ project: "aj-os", task: "CB-018" });
  });

  it("returns an empty SelectionResult for an empty registry", async () => {
    const result = await builderFor(createProviderRegistry([])).build(REQUEST);
    expect(result.selectedItems).toEqual([]);
    expect(result.excludedItems).toEqual([]);
  });
});

describe("build — stage independence via immutable contracts", () => {
  it("composes a partial collection into selection (a failing provider never aborts)", async () => {
    // The Collection stage yields a partial CollectionResult (items + a
    // CollectionError); the Selection stage consumes its items. Proven by equality
    // with the manual composition — build orchestrates, it does not re-handle errors.
    const registry = createProviderRegistry([
      provider("a", [item("k1", "c1")]),
      failingProvider("wiki"),
      provider("b", [item("k2", "c2")]),
    ]);

    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);

    expect(viaBuild).toEqual(viaManual);
    expect(viaBuild.selectedItems.map((i) => i.id)).toEqual(["k1", "k2"]);
    // Errors are a Collection concern; they never enter the SelectionResult.
    expect("errors" in viaBuild).toBe(false);
  });
});

describe("build — end-to-end determinism & immutability", () => {
  it("produces identical results across repeated executions", async () => {
    const registry = createProviderRegistry([
      provider("a", [item("k2", "c2"), item("k1", "c1")]),
    ]);
    const builder = builderFor(registry);
    const first = await builder.build(REQUEST);
    const second = await builder.build(REQUEST);
    expect(second).toEqual(first);
  });

  it("produces identical results for two builders over equal registries", async () => {
    const providers = () => [provider("a", [item("k2", "c2"), item("k1", "c1")])];
    const first = await builderFor(createProviderRegistry(providers())).build(REQUEST);
    const second = await builderFor(createProviderRegistry(providers())).build(REQUEST);
    expect(second).toEqual(first);
  });

  it("returns a deeply frozen SelectionResult", async () => {
    const registry = createProviderRegistry([
      provider("a", [item("k1", "c1"), item("k2", "c2")]),
    ]);
    const result = await builderFor(registry).build(REQUEST);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.selectedItems)).toBe(true);
    expect(Object.isFrozen(result.excludedItems)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(() => {
      (result.selectedItems as KnowledgeItem[]).push(result.selectedItems[0]);
    }).toThrow();
  });
});
