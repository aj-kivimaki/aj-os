/**
 * `aj session end` — the v1 manual trigger (SPEC-003 §6), and the only way anyone runs the
 * capture pipeline.
 *
 * The command stays thin: it loads configuration, asks the composition root for a
 * ready-to-run workflow, obtains the session's context from the trigger the root exposes
 * (EOS-D9 — so this file needs no git), runs it, and prints the report. All wiring lives in
 * `createEndOfSessionWorkflow`; all logic lives in the platform. This command performs **no
 * git** and writes nothing itself — v1 commits nothing at all (ADR-002 §4, AJS-005 §7).
 *
 * Its one real responsibility is **presentation**: turning a `SessionReport` into something
 * a human can act on. That work lives in the pure functions below, so it can be tested
 * without a vault, a repository, or a model.
 */

import { join } from "node:path";

import {
  createEndOfSessionWorkflow,
  ReviewStoreError,
  type SessionReport,
} from "../../end-of-session/index.js";
import { ConfigError, ConfigService } from "../../platform/config/index.js";

/** Options parsed off the `session end` command line. */
export interface SessionEndOptions {
  /** Measure the session from this git ref instead of the working tree. */
  readonly since?: string;
  /** The engineer's own account of the session (EOS-D10). */
  readonly notes?: string;
}

/**
 * The environment variable the platform's AI capability needs. The extraction stage fails
 * with a message naming it when it is missing — see {@link aiConfigurationHelp}.
 */
const AI_KEY = "ANTHROPIC_API_KEY";

/** The review area's state directory. Display only — the store owns the real layout. */
const PENDING = "pending";

/**
 * Guidance for a run that failed because the AI capability is not configured, or
 * `undefined` when that is not what happened.
 *
 * The workflow does not — and must not — pre-flight the API key: it runs, extraction fails,
 * and the failure is recorded in a persisted `SessionReport` like any other (EOS-406/407).
 * That leaves the CLI to notice and explain, which is exactly the right split: the platform
 * records what happened, the command decides how to say it.
 *
 * Detection reads the report rather than catching an exception, because the error never
 * escapes `run` — it is data by the time the command sees it. The extraction stage is the
 * only one that talks to the model, and the platform's own message names the variable, so
 * "an extraction error mentioning `ANTHROPIC_API_KEY`" is the narrowest honest test.
 */
export function aiConfigurationHelp(report: SessionReport): string[] | undefined {
  const misconfigured = report.errors.some(
    (error) => error.source === "extraction" && error.message.includes(AI_KEY),
  );
  if (!misconfigured) {
    return undefined;
  }

  return [
    "",
    `Knowledge extraction needs ${AI_KEY}, which is not configured.`,
    "",
    `  Set it in your environment or .env, then run 'aj session end' again:`,
    `    ${AI_KEY}=sk-ant-...`,
    "",
    "Your session was not lost: the run is recorded above, and nothing was written to",
    "your canonical knowledge. Re-running once the key is set captures the session.",
  ];
}

/**
 * Render a completed run for a human.
 *
 * Reports the SPEC-003 §16 fields from the report and nothing more — it does not recount,
 * re-derive, or re-judge anything the report already states. Returns lines rather than
 * printing them, so the presentation is testable without capturing stdout.
 */
export function formatSessionReport(report: SessionReport, sessionDir: string): string[] {
  const lines = [
    "",
    "── Session end ───────────────────────────",
    `  Session         : ${report.sessionId}`,
    `  Trigger         : ${report.trigger}`,
    `  Result          : ${report.result}`,
    `  Duration        : ${report.durationMs} ms`,
    `  Analyzers run   : ${report.analyzersRun.join(", ")}`,
    `  Files analyzed  : ${report.filesAnalyzed}`,
    `  Candidates      : ${report.candidatesProduced.count}`,
  ];

  if (report.errors.length > 0) {
    lines.push(`  Errors          : ${report.errors.length}`);
    for (const error of report.errors) {
      const kind = error.recoverable ? "recoverable" : "fatal";
      lines.push(`      • [${kind}] ${error.source}: ${error.message}`);
    }
  }

  lines.push("──────────────────────────────────────────", report.logEntry, "");

  // Where to go next. The candidates are the canonical record either way, so the
  // directory is always worth naming; the package only exists when the run got far enough
  // to render one.
  if (report.result === "failed") {
    lines.push(`Run recorded at: ${sessionDir}`);
  } else {
    lines.push(`Review the candidates: ${join(sessionDir, "review-package.md")}`);
  }

  return lines;
}

/**
 * Capture knowledge from the finished session in the current repository.
 *
 * Loads configuration, composes the workflow, runs it, and prints the result. A run that
 * fails still returns a persisted report (EOS-406), so this reads `report.result` rather
 * than relying on an exception — and sets a non-zero exit code so a git hook or CI wrapper
 * can tell. A `partial` run succeeded (some analyzer contributed an error) and exits zero.
 */
export async function sessionEndCommand(options: SessionEndOptions = {}): Promise<void> {
  let report: SessionReport;
  let sessionDir: string;

  try {
    const config = await new ConfigService().load();
    const { workflow, store, trigger } = await createEndOfSessionWorkflow(config, {
      ...(options.since !== undefined ? { since: options.since } : {}),
      ...(options.notes !== undefined ? { sessionNotes: options.notes } : {}),
    });

    console.log(
      "Ending session… the session's changes are analyzed by the model, so this " +
        "may take a minute.",
    );

    report = await workflow.run(await trigger.createContext());
    sessionDir = join((await store.locate()).root, PENDING, report.sessionId);
  } catch (error) {
    // Known, user-facing problems print a friendly message; anything unexpected surfaces
    // loudly.
    //
    // `AIError` is deliberately absent: it cannot arrive here. `new AIClient()` never
    // throws, and the extractor is its only caller, so a missing key fails *inside*
    // extraction and the workflow records it in a persisted report rather than raising
    // (EOS-406/407). `aiConfigurationHelp` reads it back out of that report.
    if (error instanceof ConfigError || error instanceof ReviewStoreError) {
      console.log();
      console.log(error.message);
      console.log();
      process.exitCode = 1;
      return;
    }
    throw error;
  }

  for (const line of formatSessionReport(report, sessionDir)) {
    console.log(line);
  }

  const help = aiConfigurationHelp(report);
  if (help !== undefined) {
    for (const line of help) {
      console.log(line);
    }
  }

  if (report.result === "failed") {
    process.exitCode = 1;
  }
}
