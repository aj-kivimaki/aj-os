/**
 * SelectionResult contract tests (CB-014).
 *
 * Covers the `SelectionResult` data contract: runtime validation, composition of
 * the CB-004 `KnowledgeItem` contract into `selectedItems`/`excludedItems`, the
 * request-provenance metadata (reused from CB-009), ordering as the public
 * contract (no priority field), strictness and deep immutability. This is a
 * *contract* task — no Selection Engine behaviour, Selection Policy, ordering
 * logic or duplicate elimination is exercised here (those are CB-015/CB-016).
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseSelectionResult,
  selectionResultSchema,
  type SelectionResult,
  type KnowledgeItem,
} from "../../src/context-builder/index.js";

const itemA: KnowledgeItem = {
  id: "k1",
  source: {
    id: "AJS-002",
    type: "standard",
    title: "Context Assembly Standard",
  },
  content: "Give the AI exactly the information it needs.",
};

const itemB: KnowledgeItem = {
  id: "k2",
  source: {
    id: "AJS-001",
    type: "standard",
    title: "Engineering Standard",
  },
  content: "Prefer deterministic behaviour.",
};

const metadata = { project: "aj-os", task: "CB-014" } as const;

const selectedAndExcluded = {
  metadata,
  selectedItems: [itemA],
  excludedItems: [itemB],
} as const satisfies SelectionResult;

describe("SelectionResult contract", () => {
  it("validates a result with selected and excluded items", () => {
    const result = parseSelectionResult(selectedAndExcluded);
    expect(result).toEqual(selectedAndExcluded);
  });

  it("validates a result with only selected items (nothing excluded)", () => {
    const result = parseSelectionResult({
      metadata,
      selectedItems: [itemA],
      excludedItems: [],
    });
    expect(result.selectedItems).toHaveLength(1);
    expect(result.excludedItems).toEqual([]);
  });

  it("validates a result with only excluded items (nothing selected)", () => {
    const result = parseSelectionResult({
      metadata,
      selectedItems: [],
      excludedItems: [itemA],
    });
    expect(result.selectedItems).toEqual([]);
    expect(result.excludedItems).toHaveLength(1);
  });

  it("validates an empty result (no selected, no excluded)", () => {
    const empty = parseSelectionResult({
      metadata,
      selectedItems: [],
      excludedItems: [],
    });
    expect(empty.selectedItems).toEqual([]);
    expect(empty.excludedItems).toEqual([]);
  });

  it("preserves selectedItems order — ordering is the public contract", () => {
    const ordered = parseSelectionResult({
      metadata,
      selectedItems: [itemB, itemA],
      excludedItems: [],
    });
    expect(ordered.selectedItems.map((i) => i.id)).toEqual(["k2", "k1"]);
  });

  it("carries the request provenance in metadata (optional locators)", () => {
    const result = parseSelectionResult({
      metadata: { project: "aj-os", task: "CB-014", branch: "feature/x" },
      selectedItems: [],
      excludedItems: [],
    });
    expect(result.metadata.branch).toBe("feature/x");
  });

  it("preserves KnowledgeItems unmodified (identity is not rewritten)", () => {
    const result = parseSelectionResult(selectedAndExcluded);
    expect(result.selectedItems[0]).toEqual(itemA);
    expect(result.excludedItems[0]).toEqual(itemB);
  });

  it("rejects a missing required collection (selectedItems/excludedItems/metadata)", () => {
    expect(() => parseSelectionResult({ metadata, selectedItems: [itemA] })).toThrow(
      ZodError,
    );
    expect(() => parseSelectionResult({ selectedItems: [], excludedItems: [] })).toThrow(
      ZodError,
    );
  });

  it("rejects an invalid embedded selected item (composed CB-004 contract)", () => {
    expect(() =>
      parseSelectionResult({
        metadata,
        selectedItems: [{ ...itemA, content: "" }],
        excludedItems: [],
      }),
    ).toThrow(ZodError);
  });

  it("rejects an invalid embedded excluded item (composed CB-004 contract)", () => {
    expect(() =>
      parseSelectionResult({
        metadata,
        selectedItems: [],
        excludedItems: [{ ...itemB, id: "" }],
      }),
    ).toThrow(ZodError);
  });

  it("rejects invalid metadata (composed CB-004 request contract)", () => {
    expect(() =>
      parseSelectionResult({
        metadata: { project: "aj-os" },
        selectedItems: [],
        excludedItems: [],
      }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() => parseSelectionResult({ ...selectedAndExcluded, priority: 1 })).toThrow(
      ZodError,
    );
  });

  it("rejects a leaked priority field — ordering is the only contract", () => {
    expect(() =>
      parseSelectionResult({
        metadata,
        selectedItems: [{ ...itemA, priority: 1 }],
        excludedItems: [],
      }),
    ).toThrow(ZodError);
  });

  it("returns a deeply frozen result (immutable after creation)", () => {
    const result = parseSelectionResult(selectedAndExcluded);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.selectedItems)).toBe(true);
    expect(Object.isFrozen(result.selectedItems[0])).toBe(true);
    expect(Object.isFrozen(result.excludedItems)).toBe(true);
    expect(Object.isFrozen(result.excludedItems[0])).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(() => {
      // Deliberately bypassing the type system: the point is the *runtime*
      // guarantee, and `readonly` is erased at runtime. `as unknown as` is what
      // the compiler asks for when a cast is intentional rather than a mistake.
      (result as unknown as { selectedItems: KnowledgeItem[] }).selectedItems.push(itemB);
    }).toThrow();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseSelectionResult(selectedAndExcluded)).toEqual(
      parseSelectionResult(selectedAndExcluded),
    );
  });

  it("exposes the schema for composition by later tasks (CB-015/CB-016)", () => {
    expect(selectionResultSchema.safeParse(selectedAndExcluded).success).toBe(true);
  });
});
