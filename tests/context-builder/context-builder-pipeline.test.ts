/**
 * Context Builder pipeline behaviour tests — `build(request)` (CB-017, deferred to
 * CB-018; return type advanced to ContextPackage in CB-023).
 *
 * CB-018 is the permanent owner of the `ContextBuilder.build(request)` pipeline
 * regression suite. When `ContextBuilder.collect` was superseded by `build(request)`
 * (the approved public API evolution reconciled in CB-017), the obsolete
 * builder-level `collect` suite was retired; this file replaces that builder-level
 * coverage by validating the pipeline through the single public entry point.
 *
 * CB-023 completes the Milestone 4 pipeline: `build` now runs Collection → Selection
 * → Assembly and returns a ContextPackage. This suite was updated with the smallest
 * change necessary to keep proving its purpose — **thin-orchestration equality** —
 * at the new return type:
 *
 *   KnowledgeRequest → build → CollectionEngine.collect → CollectionResult
 *                           → SelectionEngine.select → SelectionResult
 *                           → AssemblyEngine.assemble(selectionResult, generatedAt)
 *                           → ContextPackage
 *
 * The Context Builder is a **thin orchestrator**: it only composes and sequences the
 * three stages and injects the construction-time timestamp. These tests therefore
 * assert *orchestration*, never engine internals — collection behaviour is
 * permanently owned by the CB-010 suite (`collection-execution.test.ts`), selection
 * behaviour by `selection-execution.test.ts`, and Assembly behaviour (section and
 * metadata composition, package determinism/immutability) is owned by CB-024. The
 * pipeline's correctness is proved by asserting `build(request)` equals a manual
 * three-stage composition `assemble(select(collect(request)))` over the same
 * registry and the same injected timestamp.
 */

import { describe, it, expect } from "vitest";

import {
  createContextBuilder,
  createCollectionEngine,
  createSelectionEngine,
  createAssemblyEngine,
  createProviderRegistry,
  type ContextPackage,
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

const REQUEST: KnowledgeRequest = Object.freeze({ project: "aj-os", task: "CB-023" });

/** A fixed injected timestamp source — makes `build` fully deterministic (RC-3), so
 *  the pipeline output can be compared for equality across runs and builders. */
const FIXED_NOW = "2026-07-10T00:00:00.000Z";
const fixedClock = () => FIXED_NOW;

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

const STANDARD = {
  id: "AJS-001",
  type: "standard",
  title: "Engineering Standard",
} as const;

function item(id: string, content: string): KnowledgeItem {
  return { id, source: STANDARD, content };
}

function builderFor(registry: ProviderRegistry) {
  return createContextBuilder(CONFIG, registry, fixedClock);
}

/** Manual three-stage composition: the pipeline `build` must reproduce exactly,
 *  using the same injected timestamp. */
async function manualCompose(
  registry: ProviderRegistry,
  request: KnowledgeRequest,
): Promise<ContextPackage> {
  const collection = await createCollectionEngine(registry).collect(request);
  const selection = await createSelectionEngine().select(collection);
  return createAssemblyEngine().assemble(selection, FIXED_NOW);
}

describe("build — orchestrates Collection → Selection → Assembly", () => {
  it("equals a manual three-stage composition over the same registry and timestamp", async () => {
    const registry = createProviderRegistry([
      provider("a", [item("k3", "c3")]),
      provider("b", [item("k1", "c1"), item("k2", "c2")]),
    ]);

    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);

    expect(viaBuild).toEqual(viaManual);
  });

  it("returns the assembled ContextPackage unchanged — the builder adds no behaviour", async () => {
    // A thin orchestrator neither filters, reorders, deduplicates, enriches nor
    // re-timestamps: build's output is the Assembly stage's output verbatim.
    const registry = createProviderRegistry([provider("a", [item("k1", "c1")])]);
    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);
    expect(viaBuild.sections).toEqual(viaManual.sections);
    expect(viaBuild.references).toEqual(viaManual.references);
    expect(viaBuild.metadata).toEqual(viaManual.metadata);
  });

  it("exposes `build` as the single public entry point (no `collect`)", async () => {
    const builder = builderFor(createProviderRegistry([provider("a", [])]));
    expect(typeof builder.build).toBe("function");
    expect((builder as { collect?: unknown }).collect).toBeUndefined();
  });
});

describe("build — construction-time timestamp injection", () => {
  it("invokes the injected timestamp source once per build and stamps generatedAt", async () => {
    let calls = 0;
    const countingClock = () => {
      calls += 1;
      return FIXED_NOW;
    };
    const registry = createProviderRegistry([provider("a", [item("k1", "c1")])]);
    const builder = createContextBuilder(CONFIG, registry, countingClock);

    const pkg = await builder.build(REQUEST);

    expect(calls).toBe(1);
    expect(pkg.metadata.generatedAt).toBe(FIXED_NOW);
  });

  it("carries the request provenance forward as package metadata", async () => {
    const registry = createProviderRegistry([provider("a", [item("k1", "c1")])]);
    const pkg = await builderFor(registry).build(REQUEST);
    expect(pkg.metadata.project).toBe("aj-os");
    expect(pkg.metadata.task).toBe("CB-023");
  });
});

describe("build — deterministic pipeline end-to-end", () => {
  it("surfaces canonical selection ordering through the pipeline (via equality)", async () => {
    // Provider order (a→b) collects k3 before k1/k2; the pipeline re-orders by id.
    // Proven by equality with the manual composition — build orchestrates, it does
    // not re-rank; section/reference ordering is Assembly behaviour (CB-024).
    const registry = createProviderRegistry([
      provider("a", [item("k3", "c3")]),
      provider("b", [item("k1", "c1"), item("k2", "c2")]),
    ]);
    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);
    expect(viaBuild).toEqual(viaManual);
  });

  it("eliminates an exact cross-provider duplicate through the pipeline (via equality)", async () => {
    // Two providers contribute identical content + source under different ids: an
    // exact duplicate. The pipeline forwards only the survivor into the package.
    const registry = createProviderRegistry([
      provider("a", [item("k2", "same body")]),
      provider("b", [item("k1", "same body")]),
    ]);
    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);
    expect(viaBuild).toEqual(viaManual);
  });

  it("returns an assembled package for an empty registry", async () => {
    const registry = createProviderRegistry([]);
    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);
    expect(viaBuild).toEqual(viaManual);
  });
});

describe("build — stage independence via immutable contracts", () => {
  it("composes a partial collection through to assembly (a failing provider never aborts)", async () => {
    // The Collection stage yields a partial CollectionResult (items + a
    // CollectionError); Selection consumes its items; Assembly composes the package.
    // Proven by equality with the manual composition — build orchestrates, it does
    // not re-handle errors, and collection errors never reach the ContextPackage.
    const registry = createProviderRegistry([
      provider("a", [item("k1", "c1")]),
      failingProvider("wiki"),
      provider("b", [item("k2", "c2")]),
    ]);

    const viaBuild = await builderFor(registry).build(REQUEST);
    const viaManual = await manualCompose(registry, REQUEST);

    expect(viaBuild).toEqual(viaManual);
    // Errors are a Collection concern; they never enter the ContextPackage.
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

  it("returns a deeply frozen ContextPackage", async () => {
    const registry = createProviderRegistry([
      provider("a", [item("k1", "c1"), item("k2", "c2")]),
    ]);
    const result = await builderFor(registry).build(REQUEST);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.sections)).toBe(true);
    expect(Object.isFrozen(result.references)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(() => {
      (result.references as unknown[]).push(result.references[0]);
    }).toThrow();
  });
});
