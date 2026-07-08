/**
 * Collection Error contract tests (CB-008).
 *
 * Covers the `CollectionError` data contract: runtime validation, the closed
 * failure-category set, strictness, and deep immutability. This is a *contract*
 * task — no provider execution, collection behaviour or CollectionResult is
 * exercised here (those are CB-009/CB-010). `CollectionError` is a plain data
 * object, not a thrown exception.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseCollectionError,
  collectionErrorSchema,
  FAILURE_CATEGORIES,
  type CollectionError,
} from "../../src/context-builder/index.js";

const validError = {
  id: "err-1",
  providerId: "handbook",
  category: "provider-unavailable",
  message: "The handbook source could not be read.",
} as const satisfies CollectionError;

describe("CollectionError contract", () => {
  it("accepts a valid error and preserves its values", () => {
    const error = parseCollectionError(validError);
    expect(error).toEqual(validError);
  });

  it("accepts every declared failure category", () => {
    for (const category of FAILURE_CATEGORIES) {
      expect(() =>
        parseCollectionError({ ...validError, category }),
      ).not.toThrow();
    }
  });

  it("rejects an unknown failure category — the set is closed", () => {
    expect(() =>
      parseCollectionError({ ...validError, category: "kaboom" }),
    ).toThrow(ZodError);
  });

  it("rejects a missing required field", () => {
    expect(() =>
      parseCollectionError({
        providerId: "handbook",
        category: "provider-error",
        message: "boom",
      }),
    ).toThrow(ZodError);
  });

  it("rejects an empty required field", () => {
    expect(() =>
      parseCollectionError({ ...validError, message: "" }),
    ).toThrow(ZodError);
    expect(() =>
      parseCollectionError({ ...validError, providerId: "" }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseCollectionError({ ...validError, stack: "at foo (bar.ts:1)" }),
    ).toThrow(ZodError);
  });

  it("returns a frozen error (immutable after creation)", () => {
    const error = parseCollectionError(validError);
    expect(Object.isFrozen(error)).toBe(true);
    expect(() => {
      (error as { message: string }).message = "changed";
    }).toThrow();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseCollectionError(validError)).toEqual(
      parseCollectionError(validError),
    );
  });

  it("exposes the schema for composition by the CollectionResult (CB-009)", () => {
    expect(collectionErrorSchema.safeParse(validError).success).toBe(true);
  });
});
