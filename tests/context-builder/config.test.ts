/**
 * Configuration contract tests (CB-002).
 *
 * These tests document the Context Builder's public configuration contract:
 * what a valid configuration is, how invalid input is rejected, and the
 * immutability guarantees callers can rely on. They exercise the public entry
 * point only (`contextBuilderConfigSchema`, `parseContextBuilderConfig`,
 * `CONTEXT_PROFILES`, `OUTPUT_FORMATS`) — never internal files.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  contextBuilderConfigSchema,
  parseContextBuilderConfig,
  CONTEXT_PROFILES,
  OUTPUT_FORMATS,
} from "../../src/context-builder/index.js";

const validConfig = {
  profile: "implementation",
  explainability: true,
  outputFormat: "markdown",
} as const;

describe("Context Builder configuration — public value sets", () => {
  it("exposes exactly the five SPEC-002 §6 context profiles", () => {
    expect([...CONTEXT_PROFILES]).toEqual([
      "implementation",
      "debugging",
      "documentation",
      "review",
      "planning",
    ]);
  });

  it("exposes exactly the two SPEC-002 §8 output formats", () => {
    expect([...OUTPUT_FORMATS]).toEqual(["markdown", "json"]);
  });
});

describe("parseContextBuilderConfig — validation", () => {
  it("accepts a valid configuration and returns its values unchanged", () => {
    const config = parseContextBuilderConfig(validConfig);
    expect(config).toEqual(validConfig);
  });

  it("accepts every declared profile", () => {
    for (const profile of CONTEXT_PROFILES) {
      expect(() => parseContextBuilderConfig({ ...validConfig, profile })).not.toThrow();
    }
  });

  it("accepts every declared output format", () => {
    for (const outputFormat of OUTPUT_FORMATS) {
      expect(() =>
        parseContextBuilderConfig({ ...validConfig, outputFormat }),
      ).not.toThrow();
    }
  });

  it("rejects an unknown profile", () => {
    expect(() =>
      parseContextBuilderConfig({ ...validConfig, profile: "unknown" }),
    ).toThrow(ZodError);
  });

  it("rejects an unknown output format", () => {
    expect(() =>
      parseContextBuilderConfig({ ...validConfig, outputFormat: "yaml" }),
    ).toThrow(ZodError);
  });

  it("rejects a non-boolean explainability flag", () => {
    expect(() =>
      parseContextBuilderConfig({ ...validConfig, explainability: "yes" }),
    ).toThrow(ZodError);
  });

  it("rejects a missing required field (no hidden defaults)", () => {
    const { explainability: _omitted, ...withoutExplainability } = validConfig;
    expect(() => parseContextBuilderConfig(withoutExplainability)).toThrow(ZodError);
  });

  it("rejects unknown keys — the contract is strict", () => {
    expect(() =>
      parseContextBuilderConfig({ ...validConfig, tokenBudget: 1000 }),
    ).toThrow(ZodError);
  });

  it("rejects a non-object input", () => {
    expect(() => parseContextBuilderConfig(null)).toThrow(ZodError);
  });
});

describe("parseContextBuilderConfig — immutability", () => {
  it("returns a frozen configuration", () => {
    const config = parseContextBuilderConfig(validConfig);
    expect(Object.isFrozen(config)).toBe(true);
  });

  it("rejects mutation of a returned configuration at runtime", () => {
    const config = parseContextBuilderConfig(validConfig);
    expect(() => {
      // @ts-expect-error — the contract is readonly; this documents runtime enforcement.
      config.profile = "debugging";
    }).toThrow();
  });
});

describe("contextBuilderConfigSchema — public schema", () => {
  it("is exposed so consumers can compose it, and validates the same contract", () => {
    expect(contextBuilderConfigSchema.safeParse(validConfig).success).toBe(true);
    expect(
      contextBuilderConfigSchema.safeParse({ ...validConfig, extra: 1 }).success,
    ).toBe(false);
  });
});
