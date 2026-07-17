/**
 * `aj session end` presentation tests (EOS-408).
 *
 * The command is thin glue — load config, compose, run, print — so the only thing in it
 * worth testing is the part that makes a decision: turning a `SessionReport` into something
 * a human can act on. Both of those functions are pure, so they are tested directly, with
 * no vault, no repository, and no model. (The glue itself is exercised end to end by
 * EOS-409.)
 *
 * The AI-configuration guidance matters most: a missing API key never throws — the workflow
 * records it in a persisted report (EOS-406/407) — so the command has to *notice* it. That
 * detection is the reviewer-approved split: the platform records, the CLI explains.
 */

import { describe, it, expect } from "vitest";

import {
  aiConfigurationHelp,
  formatSessionReport,
} from "../../src/cli/commands/session.js";
import {
  parseSessionReport,
  type SessionReport,
} from "../../src/end-of-session/index.js";

const SESSION_DIR = "/vault/knowledge-review/pending/session-eos-408";

function report(overrides: Record<string, unknown> = {}): SessionReport {
  return parseSessionReport({
    sessionId: "session-eos-408",
    trigger: "manual",
    startedAt: "2026-07-16T10:30:00.000Z",
    endedAt: "2026-07-16T10:30:04.500Z",
    durationMs: 4_500,
    analyzersRun: ["git"],
    filesAnalyzed: 2,
    candidatesProduced: { count: 2, ids: ["session:s:1", "session:s:2"] },
    errors: [],
    result: "completed",
    logEntry: "2026-07-16T10:30:04.500Z session=session-eos-408 result=completed",
    ...overrides,
  });
}

/** The platform's real missing-key message — the text the CLI must recognise. */
const MISSING_KEY =
  "ANTHROPIC_API_KEY is not configured. Set it in your environment (or .env) to enable AI answers.";

function aiFailure(): SessionReport {
  return report({
    result: "failed",
    candidatesProduced: { count: 0, ids: [] },
    errors: [{ source: "extraction", message: MISSING_KEY, recoverable: false }],
  });
}

describe("EOS-408 — AI configuration guidance", () => {
  it("recognises a run that failed for want of an API key", () => {
    const help = aiConfigurationHelp(aiFailure());

    expect(help).toBeDefined();
    expect(help?.join("\n")).toContain("ANTHROPIC_API_KEY");
  });

  it("tells the user what to do and that nothing was lost", () => {
    const help = aiConfigurationHelp(aiFailure())?.join("\n") ?? "";

    // The report is already persisted and canonical knowledge is untouched — the run is
    // re-runnable, and saying so is the whole point of the message.
    expect(help).toContain("aj session end");
    expect(help.toLowerCase()).toContain("not lost");
  });

  it("stays quiet for a healthy run", () => {
    expect(aiConfigurationHelp(report())).toBeUndefined();
  });

  it("stays quiet for failures that are not about configuration", () => {
    const transport = report({
      result: "failed",
      errors: [
        {
          source: "extraction",
          message: "The AI request failed: 503",
          recoverable: false,
        },
      ],
    });

    // An extraction failure is not automatically a *configuration* failure; offering key
    // advice for a transient outage would send the user down the wrong path.
    expect(aiConfigurationHelp(transport)).toBeUndefined();
  });

  it("does not mistake a non-extraction failure for a key problem", () => {
    const elsewhere = report({
      result: "failed",
      errors: [
        {
          source: "persistence",
          message: `disk full near ${MISSING_KEY}`,
          recoverable: false,
        },
      ],
    });

    expect(aiConfigurationHelp(elsewhere)).toBeUndefined();
  });
});

describe("EOS-408 — the report summary", () => {
  it("reports the SPEC-003 §16 fields the run recorded", () => {
    const output = formatSessionReport(report(), SESSION_DIR).join("\n");

    expect(output).toContain("session-eos-408");
    expect(output).toContain("manual");
    expect(output).toContain("completed");
    expect(output).toContain("4500 ms");
    expect(output).toContain("git");
    // Matched loosely: the label and its value are the claim; the column alignment
    // between them is presentation this stage is free to change.
    expect(output).toMatch(/Files analyzed\s*: 2/);
    expect(output).toMatch(/Candidates\s*: 2/);
  });

  it("includes the run's log entry verbatim", () => {
    const each = report();

    expect(formatSessionReport(each, SESSION_DIR)).toContain(each.logEntry);
  });

  it("points a successful run at its review package", () => {
    const output = formatSessionReport(report(), SESSION_DIR).join("\n");

    // The command's whole purpose is to send a human to the review area.
    expect(output).toContain(`${SESSION_DIR}/review-package.md`);
  });

  it("points a failed run at the session directory, not a package that was never rendered", () => {
    const output = formatSessionReport(aiFailure(), SESSION_DIR).join("\n");

    expect(output).toContain(SESSION_DIR);
    expect(output).not.toContain("review-package.md");
  });

  it("lists a partial run's recoverable errors honestly", () => {
    const partial = report({
      result: "partial",
      errors: [{ source: "docs", message: "The analyzer failed.", recoverable: true }],
    });

    const output = formatSessionReport(partial, SESSION_DIR).join("\n");

    expect(output).toContain("partial");
    expect(output).toContain("[recoverable] docs: The analyzer failed.");
    // A partial run still produced candidates, so it still points at the package.
    expect(output).toContain("review-package.md");
  });

  it("marks a fatal error as fatal", () => {
    const output = formatSessionReport(aiFailure(), SESSION_DIR).join("\n");

    expect(output).toContain("[fatal] extraction:");
  });

  it("says nothing about errors when there were none", () => {
    expect(formatSessionReport(report(), SESSION_DIR).join("\n")).not.toContain("Errors");
  });

  it("renders a zero-candidate run without inventing a problem", () => {
    const empty = report({ candidatesProduced: { count: 0, ids: [] } });
    const output = formatSessionReport(empty, SESSION_DIR).join("\n");

    // Zero candidates with no errors is a completed run — a successful capture of nothing.
    expect(output).toMatch(/Candidates\s*: 0/);
    expect(output).toContain("completed");
    expect(output).not.toContain("Errors");
  });
});
