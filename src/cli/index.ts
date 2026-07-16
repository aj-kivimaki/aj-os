#!/usr/bin/env node
import { Command } from "commander";
import { askCommand } from "./commands/ask.js";
import { sessionEndCommand } from "./commands/session.js";
import { wikiBuildCommand } from "./commands/wiki.js";

/** Options parsed off the `ask` command line. */
interface AskCliOptions {
  readonly debug?: boolean;
}

const DEBUG_FLAG = "--debug";
const DEBUG_DESCRIPTION = "show internal pipeline diagnostics";

const program = new Command();

program.name("aj");

// Primary interface: `aj ask` launches the flagship Knowledge Assistant.
// With a question argument it answers once and exits; without, it starts an
// interactive session. `--debug` adds pipeline diagnostics (presentation only).
program
  .command("ask")
  .description("Ask the Knowledge Assistant")
  .argument("[question]", "answer a single question and exit")
  .option(DEBUG_FLAG, DEBUG_DESCRIPTION)
  .action(async (question: string | undefined, options: AskCliOptions) => {
    await askCommand(question, { debug: options.debug === true });
  });

// `aj wiki build` runs one Wiki Generator cycle over the configured sources,
// closing the producer side of the loop. The command is a thin entry point;
// composition lives in the Knowledge Platform composition root.
program
  .command("wiki")
  .description("Manage the generated wiki")
  .command("build")
  .description("Generate the wiki from the configured sources")
  .option("--rebuild", "rebuild from scratch instead of updating incrementally")
  .action(async (options: { rebuild?: boolean }) => {
    await wikiBuildCommand({ rebuild: options.rebuild === true });
  });

// `aj session end` closes the consumer side of the loop: it captures the finished
// session's reusable knowledge as candidates for human review. The command is a thin
// entry point; composition lives in the End-of-Session composition root, and the run
// writes only to the non-canonical review area — never to canonical knowledge, and
// never to git.
program
  .command("session")
  .description("Capture knowledge from your coding sessions")
  .command("end")
  .description("End the current session and capture candidate knowledge for review")
  .option("--since <ref>", "measure the session from <ref> instead of the working tree")
  .option("--notes <text>", "your account of the session — what the diff cannot show")
  .action(async (options: { since?: string; notes?: string }) => {
    await sessionEndCommand({
      ...(options.since !== undefined ? { since: options.since } : {}),
      ...(options.notes !== undefined ? { notes: options.notes } : {}),
    });
  });

// Deprecated alias: `aj knowledge ask` is kept working for backward
// compatibility and can be removed in a future major version.
program
  .command("knowledge")
  .description("Deprecated. Use `aj ask` instead.")
  .command("ask")
  .description("Deprecated alias for `aj ask`")
  .argument("[question]", "answer a single question and exit")
  .option(DEBUG_FLAG, DEBUG_DESCRIPTION)
  .action(async (question: string | undefined, options: AskCliOptions) => {
    console.warn(
      "The 'knowledge ask' command is deprecated. Use 'aj ask' instead.",
    );
    await askCommand(question, { debug: options.debug === true });
  });

program.parse();
