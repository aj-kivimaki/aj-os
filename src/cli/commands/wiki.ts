import {
  createKnowledgePipeline,
  resetGeneratedWiki,
} from "../../knowledge/composition/index.js";
import type { GenerationReport } from "../../knowledge/wiki-generator/index.js";
import { ConfigError, ConfigService } from "../../platform/config/index.js";
import { AIError } from "../../platform/ai/index.js";

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
    // Known, user-facing problems (missing config, missing API key) print a
    // friendly message; anything unexpected surfaces loudly.
    if (error instanceof ConfigError || error instanceof AIError) {
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
function printReport(report: GenerationReport): void {
  console.log();
  console.log("── Wiki build ────────────────────────────");
  console.log(`  Mode              : ${report.mode}`);
  console.log(`  Sources ingested  : ${report.ingested.length}`);
  console.log(`  Pages updated     : ${report.updatedPages.length}`);
  console.log(`  Pages marked stale: ${report.stalePages.length}`);
  console.log(`  Removal proposals : ${report.removalProposals.length}`);

  if (report.failed.length > 0) {
    console.log(`  Sources failed    : ${report.failed.length}`);
    for (const id of report.failed) {
      console.log(`      • ${id}`);
    }
  }
  console.log("──────────────────────────────────────────");
  console.log(report.logEntry);
  console.log();
}
