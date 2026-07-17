/**
 * Wiki report formatter tests (REX-503, F-065).
 *
 * `formatWikiReport` was split out of a `console.log`-only `printReport` so the
 * report is testable without stdout capture — matching `session.ts`'s
 * `formatSessionReport` exemplar. These assert the report content directly.
 */
import { describe, it, expect } from "vitest";

import { formatWikiReport } from "../../src/cli/commands/wiki.js";
import type { GenerationReport } from "../../src/knowledge/wiki-generator/index.js";

function report(overrides: Partial<GenerationReport> = {}): GenerationReport {
  return {
    mode: "incremental",
    ingested: ["a", "b"],
    failed: [],
    reconciled: [],
    updatedPages: ["index.md"],
    stalePages: [],
    removalProposals: [],
    lint: { findings: [] },
    logEntry: "log line",
    ...overrides,
  } as GenerationReport;
}

describe("formatWikiReport", () => {
  it("renders the counts as lines and includes the log entry", () => {
    const lines = formatWikiReport(report());
    const text = lines.join("\n");
    expect(text).toContain("── Wiki build");
    expect(text).toContain("Mode              : incremental");
    expect(text).toContain("Sources ingested  : 2");
    expect(text).toContain("Pages updated     : 1");
    expect(lines).toContain("log line");
    // Leading and trailing blank lines are preserved (the printer prints each).
    expect(lines[0]).toBe("");
    expect(lines.at(-1)).toBe("");
  });

  it("lists failed sources only when there are any", () => {
    expect(formatWikiReport(report()).join("\n")).not.toContain("Sources failed");

    const withFailures = formatWikiReport(report({ failed: ["x", "y"] })).join("\n");
    expect(withFailures).toContain("Sources failed    : 2");
    expect(withFailures).toContain("• x");
    expect(withFailures).toContain("• y");
  });
});
