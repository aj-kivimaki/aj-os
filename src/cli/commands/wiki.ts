import {
  createKnowledgePipeline,
  resetGeneratedWiki,
} from "../../knowledge/composition/index.js";
import type { GenerationReport } from "../../knowledge/wiki-generator/index.js";
import { AjError } from "../../platform/AjError.js";
import { ConfigService } from "../../platform/config/index.js";

/** Options parsed off the `wiki build` command line. */
export interface WikiBuildOptions {
  /** Rebuild from scratch instead of an incremental update. */
  readonly rebuild?: boolean;
}

/**
 * Run one Wiki Generator cycle over the configured sources.
 *
 * The CLI stays thin: it loads configuration, asks the composition root for a
 * ready-to-run pipeline, runs it, and prints the report. All wiring lives in
 * `createKnowledgePipeline`; all generation logic lives in the platform. This
 * command performs no git — orchestration and commits are handled elsewhere.
 */
export async function wikiBuildCommand(options: WikiBuildOptions = {}): Promise<void> {
  const mode = options.rebuild === true ? "rebuild" : "incremental";

  let report: GenerationReport;
  try {
    const config = await new ConfigService().load();
    const { generator, store } = await createKnowledgePipeline(config);
    // A rebuild starts from a clean slate: reset the generator-owned outputs
    // (nothing else in the destination) before regenerating.
    if (options.rebuild === true) {
      await resetGeneratedWiki(store);
    }
    console.log(
      `Building wiki (${mode})… each changed source is compiled with the ` +
        "model, so this may take a few minutes.",
    );
    report = await generator.run({ mode });
  } catch (error) {
    // Every AJ-OS domain error is a known, user-facing problem (missing config,
    // missing API key, a handbook missing `foundation/`, …): print its message
    // friendly. Anything else surfaces loudly. Matching `AjError` rather than an
    // enumerated list is what closes F-060 — `SourceConnectorError` used to fall
    // through to a raw stack trace here.
    if (error instanceof AjError) {
      console.log();
      console.log(error.message);
      console.log();
      return;
    }
    throw error;
  }

  printReport(report);
}

/** Print a concise, human-readable summary of a generation run. */
/**
 * Format the build report as lines — pure, so it is testable without stdout
 * capture, matching `session.ts`'s `formatSessionReport` exemplar (F-065). The
 * caller prints; this function only decides what the report says.
 */
export function formatWikiReport(report: GenerationReport): string[] {
  const lines = [
    "",
    "── Wiki build ────────────────────────────",
    `  Mode              : ${report.mode}`,
    `  Sources ingested  : ${report.ingested.length}`,
    `  Pages updated     : ${report.updatedPages.length}`,
    `  Pages marked stale: ${report.stalePages.length}`,
    `  Removal proposals : ${report.removalProposals.length}`,
  ];

  if (report.failed.length > 0) {
    lines.push(`  Sources failed    : ${report.failed.length}`);
    for (const id of report.failed) {
      lines.push(`      • ${id}`);
    }
  }

  lines.push("──────────────────────────────────────────", report.logEntry, "");
  return lines;
}

function printReport(report: GenerationReport): void {
  for (const line of formatWikiReport(report)) {
    console.log(line);
  }
}
