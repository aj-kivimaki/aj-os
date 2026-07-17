/**
 * Selection execution behaviour tests (CB-016 execution + CB-015 policy, deferred
 * to CB-018).
 *
 * These tests validate the deterministic Selection stage **through the public API**
 * — `createSelectionEngine().select(collectionResult)` — and never import a policy
 * comparator, predicate, duplicate helper or any private function. The Selection
 * Policy (CB-015) is internal platform behaviour; its guarantees are asserted only
 * as the observable output of `select`:
 *
 *   CollectionResult → engine.select → SelectionResult
 *
 * Covered: canonical deterministic ordering (stable total order via the terminal
 * `KnowledgeItem.id` tie-breaker), M3 filtering behaviour, exact-duplicate
 * elimination with routing to `excludedItems`, metadata preservation, knowledge
 * identity preservation, input immutability, deep immutability of the result,
 * determinism across runs, and conformance to the public SelectionResult contract.
 *
 * The SelectionResult *contract* itself (runtime validation, strictness, rejection
 * of a leaked priority field) is owned by `selection-result.test.ts` (CB-014) and
 * is not re-authored here — CB-018 consolidates, it does not duplicate.
 */

import { describe, it, expect } from "vitest";

import {
  createSelectionEngine,
  parseCollectionResult,
  selectionResultSchema,
  type CollectionResult,
  type KnowledgeItem,
} from "../../src/context-builder/index.js";

const METADATA = { project: "aj-os", task: "CB-018" } as const;

/**
 * Build a KnowledgeItem. `content` and `source` default to shared values so two
 * items that differ only by `id` are **exact duplicates** under the approved
 * definition (identical content + structurally identical source; `id` excluded).
 * Distinct `content` makes items non-duplicate while still ordered solely by `id`.
 */
function item(
  id: string,
  overrides: {
    content?: string;
    source?: KnowledgeItem["source"];
  } = {},
): KnowledgeItem {
  return {
    id,
    source:
      overrides.source ??
      ({ id: "AJS-001", type: "standard", title: "Engineering Standard" } as const),
    content: overrides.content ?? "shared knowledge body",
  };
}

/** Build a frozen CollectionResult carrying `items` (no errors unless given). */
function collectionOf(
  items: readonly KnowledgeItem[],
  errors: readonly unknown[] = [],
): CollectionResult {
  return parseCollectionResult({ metadata: METADATA, items, errors });
}

const engine = createSelectionEngine();

describe("select — canonical deterministic ordering", () => {
  it("orders selectedItems by the immutable id, independent of input order", async () => {
    // Distinct content keeps every item eligible and non-duplicate; ordering is
    // therefore decided solely by the terminal id comparator.
    const result = await engine.select(
      collectionOf([
        item("k3", { content: "c3" }),
        item("k1", { content: "c1" }),
        item("k2", { content: "c2" }),
      ]),
    );

    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1", "k2", "k3"]);
    expect(result.excludedItems).toEqual([]);
  });

  it("decides order by id — not by content or collection order", async () => {
    // "b" is collected first and has content that would sort before "a"'s; the id
    // tie-breaker still orders "a" before "b".
    const result = await engine.select(
      collectionOf([item("b", { content: "zzz" }), item("a", { content: "aaa" })]),
    );

    expect(result.selectedItems.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("guarantees a stable total order via the terminal id tie-breaker", async () => {
    // Every id is distinct, so the composed comparator is a strict total order:
    // shuffled inputs collapse to one canonical sequence with no ambiguity.
    const ids = ["k10", "k2", "k1", "k20", "k3"];
    const forward = await engine.select(
      collectionOf(ids.map((id) => item(id, { content: id }))),
    );
    const reversed = await engine.select(
      collectionOf([...ids].reverse().map((id) => item(id, { content: id }))),
    );

    // UTF-16 code-unit order (not numeric): "k1" < "k10" < "k2" < "k20" < "k3".
    expect(forward.selectedItems.map((i) => i.id)).toEqual([
      "k1",
      "k10",
      "k2",
      "k20",
      "k3",
    ]);
    expect(reversed.selectedItems.map((i) => i.id)).toEqual(
      forward.selectedItems.map((i) => i.id),
    );
  });
});

describe("select — filtering behaviour (M3)", () => {
  it("retains every well-formed item — nothing is filtered out on eligibility", async () => {
    // At M3 selection is profile-agnostic: every contract-valid KnowledgeItem
    // carries knowledge and is eligible, so filtering excludes nothing. (An
    // empty-content item is unreachable — the KnowledgeItem contract forbids it —
    // so filtering-out is not observable through the public contract at M3.)
    const items = [
      item("k1", { content: "c1" }),
      item("k2", { content: "c2" }),
      item("k3", { content: "c3" }),
    ];
    const result = await engine.select(collectionOf(items));

    expect(result.selectedItems).toHaveLength(items.length);
    expect(result.excludedItems).toEqual([]);
  });

  it("returns an empty SelectionResult for an empty CollectionResult", async () => {
    const result = await engine.select(collectionOf([]));
    expect(result.selectedItems).toEqual([]);
    expect(result.excludedItems).toEqual([]);
  });

  it("selects the items and never surfaces collection errors", async () => {
    // Selection consumes only `items`; CollectionErrors are not part of the
    // SelectionResult contract (it has no `errors` field).
    const result = await engine.select(
      collectionOf(
        [item("k1", { content: "c1" })],
        [
          {
            id: "collection-error:wiki",
            providerId: "wiki",
            category: "provider-error",
            message: "wiki down",
          },
        ],
      ),
    );

    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1"]);
    expect("errors" in result).toBe(false);
  });
});

describe("select — exact-duplicate elimination", () => {
  it("keeps the first occurrence in canonical order and excludes the rest", async () => {
    // Same content + same source, different ids ⇒ exact duplicates (id excluded
    // from identity). The lowest id in canonical order survives; the rest are
    // routed to excludedItems.
    const result = await engine.select(
      collectionOf([item("k3"), item("k1"), item("k2")]),
    );

    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1"]);
    expect(result.excludedItems.map((i) => i.id)).toEqual(["k2", "k3"]);
  });

  it("routes eliminated duplicates to excludedItems unchanged", async () => {
    const duplicate = item("k2");
    const result = await engine.select(collectionOf([item("k1"), duplicate]));

    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1"]);
    expect(result.excludedItems).toEqual([duplicate]);
  });

  it("treats items with the same content but a different source as distinct", async () => {
    const result = await engine.select(
      collectionOf([
        item("k1", {
          source: { id: "AJS-001", type: "standard", title: "Engineering Standard" },
        }),
        item("k2", {
          source: { id: "AJS-002", type: "standard", title: "Context Assembly Standard" },
        }),
      ]),
    );

    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1", "k2"]);
    expect(result.excludedItems).toEqual([]);
  });

  it("treats items with the same source but different content as distinct", async () => {
    const result = await engine.select(
      collectionOf([
        item("k1", { content: "first knowledge" }),
        item("k2", { content: "second knowledge" }),
      ]),
    );

    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1", "k2"]);
    expect(result.excludedItems).toEqual([]);
  });
});

describe("select — metadata & knowledge identity preservation", () => {
  it("carries the request provenance forward as metadata unchanged", async () => {
    const collection = collectionOf([item("k1", { content: "c1" })]);
    const result = await engine.select(collection);
    expect(result.metadata).toEqual(collection.metadata);
  });

  it("never modifies KnowledgeItems — selected items are the originals unchanged", async () => {
    const original = item("k1", { content: "c1" });
    const result = await engine.select(collectionOf([original]));
    expect(result.selectedItems[0]).toEqual(original);
  });
});

describe("select — determinism", () => {
  it("produces identical SelectionResults for identical CollectionResults", async () => {
    const build = () =>
      collectionOf([
        item("k3", { content: "c3" }),
        item("k1", { content: "c1" }),
        item("k2", { content: "c2" }),
      ]);

    const first = await engine.select(build());
    const second = await engine.select(build());
    expect(second).toEqual(first);
  });

  it("is stable across repeated runs on the same input", async () => {
    const collection = collectionOf([item("k2"), item("k1")]);
    const first = await engine.select(collection);
    const second = await engine.select(collection);
    expect(second.selectedItems.map((i) => i.id)).toEqual(
      first.selectedItems.map((i) => i.id),
    );
    expect(second.excludedItems.map((i) => i.id)).toEqual(
      first.excludedItems.map((i) => i.id),
    );
  });
});

describe("select — immutability", () => {
  it("returns a deeply frozen SelectionResult", async () => {
    const result = await engine.select(collectionOf([item("k1"), item("k2")]));

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.selectedItems)).toBe(true);
    expect(Object.isFrozen(result.excludedItems)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.selectedItems[0])).toBe(true);
  });

  it("rejects mutation of the returned collections at runtime", async () => {
    const result = await engine.select(collectionOf([item("k1", { content: "c1" })]));
    expect(() => {
      (result.selectedItems as unknown as KnowledgeItem[]).push(result.selectedItems[0]!);
    }).toThrow();
  });

  it("never mutates the input CollectionResult (orders over a copy)", async () => {
    // The input is collected out of canonical order and stays that way; only the
    // output is sorted — proof that `select` sorts a copy, not the frozen input.
    const collection = collectionOf([
      item("k3", { content: "c3" }),
      item("k1", { content: "c1" }),
      item("k2", { content: "c2" }),
    ]);

    const result = await engine.select(collection);

    expect(collection.items.map((i) => i.id)).toEqual(["k3", "k1", "k2"]);
    expect(result.selectedItems.map((i) => i.id)).toEqual(["k1", "k2", "k3"]);
    expect(Object.isFrozen(collection.items)).toBe(true);
  });
});

describe("select — conforms to the public SelectionResult contract", () => {
  it("produces a result that validates against the public schema", async () => {
    const result = await engine.select(
      collectionOf([item("k1", { content: "c1" }), item("k2", { content: "c2" })]),
    );
    expect(selectionResultSchema.safeParse(result).success).toBe(true);
  });

  it("exposes exactly metadata, selectedItems and excludedItems — no priority field", async () => {
    const result = await engine.select(collectionOf([item("k1", { content: "c1" })]));
    expect(Object.keys(result).sort()).toEqual([
      "excludedItems",
      "metadata",
      "selectedItems",
    ]);
    expect("priority" in result).toBe(false);
  });
});
