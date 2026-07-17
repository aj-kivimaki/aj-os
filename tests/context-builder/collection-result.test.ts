/**
 * CollectionResult contract tests (CB-009).
 *
 * Covers the `CollectionResult` data contract: runtime validation, composition of
 * the CB-004 `KnowledgeItem` and CB-008 `CollectionError` contracts, the
 * partial-collection cases (items only, items + errors, empty errors, empty
 * result), strictness and deep immutability. This is a *contract* task — no
 * provider execution or collection behaviour is exercised here (that is CB-010).
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseCollectionResult,
  collectionResultSchema,
  type CollectionResult,
  type KnowledgeItem,
  type CollectionError,
} from "../../src/context-builder/index.js";

const item: KnowledgeItem = {
  id: "k1",
  source: {
    id: "AJS-002",
    type: "standard",
    title: "Context Assembly Standard",
  },
  content: "Give the AI exactly the information it needs.",
};

const error: CollectionError = {
  id: "err-1",
  providerId: "handbook",
  category: "provider-unavailable",
  message: "The handbook source could not be read.",
};

const metadata = { project: "aj-os", task: "CB-009" } as const;

const itemsOnly = {
  metadata,
  items: [item],
  errors: [],
} as const satisfies CollectionResult;

describe("CollectionResult contract", () => {
  it("validates a result with only items (no failures)", () => {
    const result = parseCollectionResult(itemsOnly);
    expect(result).toEqual(itemsOnly);
  });

  it("validates a partial result with both items and errors", () => {
    const partial = { metadata, items: [item], errors: [error] };
    const result = parseCollectionResult(partial);
    expect(result.items).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });

  it("validates a result with an empty error collection", () => {
    expect(() =>
      parseCollectionResult({ metadata, items: [item], errors: [] }),
    ).not.toThrow();
  });

  it("validates an empty result (no items, no errors)", () => {
    const empty = parseCollectionResult({ metadata, items: [], errors: [] });
    expect(empty.items).toEqual([]);
    expect(empty.errors).toEqual([]);
  });

  it("carries the request provenance in metadata (optional locators)", () => {
    const result = parseCollectionResult({
      metadata: { project: "aj-os", task: "CB-009", branch: "feature/x" },
      items: [],
      errors: [],
    });
    expect(result.metadata.branch).toBe("feature/x");
  });

  it("rejects a missing required collection (items/errors/metadata)", () => {
    expect(() =>
      parseCollectionResult({ metadata, items: [item] }),
    ).toThrow(ZodError);
    expect(() =>
      parseCollectionResult({ items: [], errors: [] }),
    ).toThrow(ZodError);
  });

  it("rejects an invalid embedded item (composed CB-004 contract)", () => {
    expect(() =>
      parseCollectionResult({
        metadata,
        items: [{ ...item, content: "" }],
        errors: [],
      }),
    ).toThrow(ZodError);
  });

  it("rejects an invalid embedded error (composed CB-008 contract)", () => {
    expect(() =>
      parseCollectionResult({
        metadata,
        items: [],
        errors: [{ ...error, category: "kaboom" }],
      }),
    ).toThrow(ZodError);
  });

  it("rejects invalid metadata (composed CB-004 request contract)", () => {
    expect(() =>
      parseCollectionResult({
        metadata: { project: "aj-os" },
        items: [],
        errors: [],
      }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseCollectionResult({ ...itemsOnly, durationMs: 42 }),
    ).toThrow(ZodError);
  });

  it("returns a deeply frozen result (immutable after creation)", () => {
    const result = parseCollectionResult({
      metadata,
      items: [item],
      errors: [error],
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.items)).toBe(true);
    expect(Object.isFrozen(result.items[0])).toBe(true);
    expect(Object.isFrozen(result.errors[0])).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(() => {
      // Deliberately bypassing the type system: the point is the *runtime*
      // guarantee, and `readonly` is erased at runtime. `as unknown as` is what
      // the compiler asks for when a cast is intentional rather than a mistake.
      (result as unknown as { items: KnowledgeItem[] }).items.push(item);
    }).toThrow();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseCollectionResult(itemsOnly)).toEqual(
      parseCollectionResult(itemsOnly),
    );
  });

  it("exposes the schema for composition by later tasks (CB-010)", () => {
    expect(collectionResultSchema.safeParse(itemsOnly).success).toBe(true);
  });
});
