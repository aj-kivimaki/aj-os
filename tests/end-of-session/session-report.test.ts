/**
 * SessionReport contract tests (EOS-004).
 *
 * Covers the structured execution-log contract (SPEC-003 §16): runtime validation,
 * the closed result set, the reused lenient trigger, numeric constraints, array
 * defaults, the report-owned error shape, and deep immutability. This is a
 * *contract* task — no report is computed (that is M4/M5), and the log records
 * execution results/diagnostics, never workflow decisions. Everything is asserted
 * through the module's public surface.
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";

import {
  parseSessionReport,
  sessionReportSchema,
  SESSION_RESULTS,
  type SessionReport,
} from "../../src/end-of-session/index.js";

import { firstUnfrozenPath } from "./support.js";

const validReport = {
  sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
  trigger: "manual",
  startedAt: "2026-07-15T09:00:00.000Z",
  endedAt: "2026-07-15T10:30:00.000Z",
  durationMs: 5_400_000,
  analyzersRun: ["git"],
  filesAnalyzed: 12,
  candidatesProduced: {
    count: 2,
    ids: ["session:01J8Z3K7Q9WV0FB2XN4MABCDEF:1", "session:01J8Z3K7Q9WV0FB2XN4MABCDEF:2"],
  },
  errors: [{ source: "git", message: "A file could not be diffed.", recoverable: true }],
  result: "partial",
  logEntry: "Run completed with 1 recoverable error; 2 candidates produced.",
} as const satisfies SessionReport;

/** Minimal valid report: required fields, arrays defaulted, no recorded errors. */
const minimalInput = {
  sessionId: "01J8Z3K7Q9WV0FB2XN4MABCDEF",
  trigger: "manual",
  startedAt: "2026-07-15T09:00:00.000Z",
  endedAt: "2026-07-15T09:00:01.000Z",
  durationMs: 1000,
  filesAnalyzed: 0,
  candidatesProduced: { count: 0 },
  result: "completed",
  logEntry: "Run completed; no changes detected.",
} as const;

describe("SessionReport contract", () => {
  it("accepts a fully-populated report and preserves its values", () => {
    expect(parseSessionReport(validReport)).toEqual(validReport);
  });

  it("defaults the analyzer/error/id arrays to empty when omitted", () => {
    const report = parseSessionReport(minimalInput);
    expect(report.analyzersRun).toEqual([]);
    expect(report.errors).toEqual([]);
    expect(report.candidatesProduced.ids).toEqual([]);
  });

  it("accepts every result in the closed set", () => {
    for (const result of SESSION_RESULTS) {
      expect(() => parseSessionReport({ ...minimalInput, result })).not.toThrow();
    }
  });

  it("rejects a result outside the closed set — result is not lenient", () => {
    expect(() => parseSessionReport({ ...minimalInput, result: "aborted" })).toThrow(
      ZodError,
    );
  });

  it("rejects a negative or non-integer duration/count", () => {
    expect(() => parseSessionReport({ ...minimalInput, durationMs: -1 })).toThrow(
      ZodError,
    );
    expect(() => parseSessionReport({ ...minimalInput, filesAnalyzed: 1.5 })).toThrow(
      ZodError,
    );
    expect(() =>
      parseSessionReport({
        ...minimalInput,
        candidatesProduced: { count: -2 },
      }),
    ).toThrow(ZodError);
  });

  it("rejects a malformed timestamp", () => {
    expect(() => parseSessionReport({ ...minimalInput, endedAt: "not-a-date" })).toThrow(
      ZodError,
    );
  });

  it("rejects a report-error missing recoverable, and stack-trace leakage", () => {
    expect(() =>
      parseSessionReport({
        ...minimalInput,
        errors: [{ source: "git", message: "boom" }],
      }),
    ).toThrow(ZodError);
    expect(() =>
      parseSessionReport({
        ...minimalInput,
        errors: [
          {
            source: "git",
            message: "boom",
            recoverable: false,
            stack: "at foo",
          },
        ],
      }),
    ).toThrow(ZodError);
  });

  it("rejects unknown keys — no SPEC-004 decision fields in the execution log", () => {
    expect(() =>
      parseSessionReport({ ...validReport, reviewOutcome: "approved" }),
    ).toThrow(ZodError);
  });

  it("returns a deeply-frozen report, including nested groups and arrays", () => {
    expect(firstUnfrozenPath(parseSessionReport(validReport))).toBeNull();
  });

  it("is deterministic — same input yields an equal contract", () => {
    expect(parseSessionReport(validReport)).toEqual(parseSessionReport(validReport));
  });

  it("exposes the schema for composition (report generation, M4/M5)", () => {
    expect(sessionReportSchema.safeParse(validReport).success).toBe(true);
  });
});
