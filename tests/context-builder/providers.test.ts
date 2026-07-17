/**
 * Knowledge contract tests (CB-004).
 *
 * Covers the platform's input contracts: `KnowledgeRequest`, `KnowledgeItem`,
 * provider metadata, and the `KnowledgeProvider` interface. The interface is
 * behavioural (it has a method), so it is documented with a minimal in-test
 * stub — a test fixture, not a platform provider. No provider behaviour,
 * collection or ranking is exercised here.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseKnowledgeRequest,
  parseKnowledgeItem,
  providerMetadataSchema,
  type KnowledgeItem,
  type KnowledgeProvider,
  type KnowledgeRequest,
} from "../../src/context-builder/index.js";

const validRequest = { project: "aj-os", task: "CB-006" } as const;

const validItem = {
  id: "item-1",
  source: {
    id: "AJS-002",
    type: "standard",
    title: "Context Assembly Standard",
  },
  content: "Rank knowledge using AJS-002 Appendix A.",
} as const;

describe("KnowledgeRequest contract", () => {
  it("accepts the required project + task", () => {
    const request = parseKnowledgeRequest(validRequest);
    expect(request).toEqual(validRequest);
  });

  it("accepts the optional branch, commit and issue locators", () => {
    expect(() =>
      parseKnowledgeRequest({
        ...validRequest,
        branch: "main",
        commit: "abc123",
        issue: "AJ-42",
      }),
    ).not.toThrow();
  });

  it("rejects a missing required field", () => {
    expect(() => parseKnowledgeRequest({ project: "aj-os" })).toThrow(ZodError);
  });

  it("rejects an empty required field", () => {
    expect(() => parseKnowledgeRequest({ ...validRequest, project: "" })).toThrow(
      ZodError,
    );
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseKnowledgeRequest({ ...validRequest, profile: "implementation" }),
    ).toThrow(ZodError);
  });

  it("returns a frozen request", () => {
    expect(Object.isFrozen(parseKnowledgeRequest(validRequest))).toBe(true);
  });
});

describe("KnowledgeItem contract", () => {
  it("accepts a valid item and preserves its values", () => {
    const item = parseKnowledgeItem(validItem);
    expect(item).toEqual(validItem);
  });

  it("requires non-empty content — an item must carry knowledge", () => {
    expect(() => parseKnowledgeItem({ ...validItem, content: "" })).toThrow(ZodError);
  });

  it("reuses the Context Package source-reference contract for `source`", () => {
    expect(() =>
      parseKnowledgeItem({
        ...validItem,
        source: { ...validItem.source, type: "not-a-source-kind" },
      }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() => parseKnowledgeItem({ ...validItem, score: 0.9 })).toThrow(ZodError);
  });

  it("deeply freezes the parsed item, including its source", () => {
    const item = parseKnowledgeItem(validItem);
    expect(Object.isFrozen(item)).toBe(true);
    expect(Object.isFrozen(item.source)).toBe(true);
  });
});

describe("provider metadata contract", () => {
  it("accepts valid provider metadata", () => {
    expect(
      providerMetadataSchema.safeParse({
        id: "handbook",
        name: "Handbook Provider",
        description: "Reads approved handbook knowledge.",
      }).success,
    ).toBe(true);
  });

  it("rejects metadata missing a required field", () => {
    expect(
      providerMetadataSchema.safeParse({ id: "handbook", name: "Handbook" }).success,
    ).toBe(false);
  });
});

describe("KnowledgeProvider interface", () => {
  // A minimal fixture that satisfies the interface. Its presence documents the
  // contract shape (metadata + `provide`) and proves it is implementable.
  const stub: KnowledgeProvider = {
    id: "stub",
    name: "Stub Provider",
    description: "A test fixture provider.",
    async provide(request: KnowledgeRequest): Promise<readonly KnowledgeItem[]> {
      return [parseKnowledgeItem({ ...validItem, id: `for-${request.task}` })];
    },
  };

  it("exposes provider metadata (id, name, description)", () => {
    expect(stub.id).toBe("stub");
    expect(stub.name).toBe("Stub Provider");
    expect(stub.description).toBe("A test fixture provider.");
  });

  it("contributes KnowledgeItems for a request via `provide`", async () => {
    const items = await stub.provide(parseKnowledgeRequest(validRequest));
    expect(items).toHaveLength(1);
    expect(items[0]!.id).toBe("for-CB-006");
  });
});
