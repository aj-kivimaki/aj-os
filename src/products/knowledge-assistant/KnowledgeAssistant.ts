import { createInterface, type Interface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { ConfigError, ConfigService } from "../../platform/config/index.js";
import { HandbookError, HandbookService } from "../../platform/handbook/index.js";
import {
  RetrievalService,
  type RetrievalResult,
} from "../../platform/retrieval/index.js";
import { PromptRenderer, type RenderedPrompt } from "../../platform/prompt/index.js";
import { AIClient, AIError, type AIResponse } from "../../platform/ai/index.js";
import {
  createContextBuilder,
  createProviderRegistry,
  type ContextPackage,
} from "../../context-builder/index.js";

import { createWikiKnowledgeProvider } from "./wikiKnowledgeProvider.js";

/**
 * Presentation options for a Knowledge Assistant interaction.
 *
 * The single carrier for debug mode. The CLI decides whether debug is on and
 * passes this down; nothing in the platform ever sees it. It affects what the
 * product *shows*, never what it *does*.
 */
export interface AskOptions {
  /** When true, print pipeline diagnostics alongside the answer. */
  readonly debug?: boolean;
}

/** Elapsed milliseconds per pipeline stage, gathered only to display in debug. */
type StageTimings = Record<string, number>;

/**
 * The platform capabilities the Knowledge Assistant consumes.
 *
 * Injected so the product is constructible — and testable — without a real
 * filesystem or API key (REX-402). Production wires the real capabilities via
 * {@link defaultKnowledgeAssistantDeps}; a test injects fakes. `HandbookService`
 * and `RetrievalService` are built per question from runtime config, so they
 * enter as factories rather than instances.
 */
export interface KnowledgeAssistantDeps {
  readonly config: ConfigService;
  readonly promptRenderer: PromptRenderer;
  readonly ai: AIClient;
  readonly createHandbook: (path: string, generatedWikiPath: string) => HandbookService;
  readonly createRetrieval: (wikiPath: string) => RetrievalService;
}

/**
 * The product's production dependencies — the real platform wiring. Constructing
 * `config`/`ai` here touches no filesystem and requires no key (keys are
 * validated only when an answer is first requested), so this is side-effect-free.
 */
export function defaultKnowledgeAssistantDeps(): KnowledgeAssistantDeps {
  return {
    config: new ConfigService(),
    promptRenderer: new PromptRenderer(),
    ai: new AIClient(),
    createHandbook: (path, generatedWikiPath) =>
      new HandbookService(path, generatedWikiPath),
    createRetrieval: (wikiPath) => new RetrievalService(wikiPath),
  };
}

/**
 * The Knowledge Assistant product.
 *
 * The product owns the entire interactive experience: it renders the
 * welcome screen, reads questions from the user, and manages the session
 * lifecycle. The CLI only launches this product — it never drives the
 * interaction itself.
 */
export class KnowledgeAssistant {
  /** Commands that end the interactive session. */
  private static readonly EXIT_COMMANDS = new Set(["exit", "quit"]);

  /** Project provenance recorded on every Context Package this product builds. */
  private static readonly PROJECT = "aj-os";

  /**
   * Product version.
   *
   * This is intentionally separate from package.json because package.json
   * represents the AJ-OS Platform version. When products eventually gain
   * their own manifests, this constant should be replaced by that source.
   */
  private static readonly PRODUCT_VERSION = "1.0.0";

  /**
   * Platform capabilities the product consumes (product → platform; the platform
   * knows nothing about this product). Injected via the constructor so the
   * product is testable without a real filesystem or key; production supplies the
   * real wiring through {@link defaultKnowledgeAssistantDeps}. `HandbookService`
   * and `RetrievalService` are built per question from runtime config, so they
   * are held as factories.
   */
  private readonly config: ConfigService;
  private readonly promptRenderer: PromptRenderer;
  private readonly ai: AIClient;
  private readonly createHandbook: (
    path: string,
    generatedWikiPath: string,
  ) => HandbookService;
  private readonly createRetrieval: (wikiPath: string) => RetrievalService;

  constructor(deps: Partial<KnowledgeAssistantDeps> = {}) {
    const resolved = { ...defaultKnowledgeAssistantDeps(), ...deps };
    this.config = resolved.config;
    this.promptRenderer = resolved.promptRenderer;
    this.ai = resolved.ai;
    this.createHandbook = resolved.createHandbook;
    this.createRetrieval = resolved.createRetrieval;
  }

  /**
   * Start an interactive session and run it until the user leaves.
   *
   * Uses Node's built-in `node:readline/promises` so the product has no
   * external prompt dependency. `options` only affects presentation — every
   * question is answered by the same pipeline regardless of debug mode.
   */
  async run(options: AskOptions = {}): Promise<void> {
    const rl = createInterface({ input: stdin, output: stdout });

    // When the input stream ends (Ctrl+D, or a piped EOF), readline emits
    // "close". A pending `question()` promise does not settle on its own in
    // that case, so we abort it explicitly to unblock the loop.
    const closed = new AbortController();
    rl.on("close", () => closed.abort());

    this.printWelcome();

    try {
      await this.loop(rl, closed.signal, options);
    } finally {
      rl.close();
    }

    this.printGoodbye();
  }

  /** Read and handle questions until the user exits or the input ends. */
  private async loop(
    rl: Interface,
    signal: AbortSignal,
    options: AskOptions,
  ): Promise<void> {
    while (true) {
      let input: string;

      try {
        input = await rl.question("> ", { signal });
      } catch {
        // The input stream closed (e.g. Ctrl+D). Treat it as leaving.
        return;
      }

      const question = input.trim();

      if (this.isExit(question)) {
        return;
      }

      if (question.length === 0) {
        continue;
      }

      await this.answer(question, options);
    }
  }

  /**
   * Answer a single question — the product's one-shot entry point.
   *
   * This is the entire pipeline, end to end, for one question. The product
   * composes the platform capabilities in order: load configuration,
   * locate the generated wiki, retrieve the most relevant articles, then hand
   * those articles to the Context Builder to assemble a Context Package, render
   * that package into an AI-ready prompt, then hand the prompt to the AI client
   * for an answer. The product owns only the composition and the display; every
   * platform capability stays independent and unaware of this product.
   *
   * Both interaction modes flow through here: the CLI's one-shot form calls it
   * directly, and the interactive {@link run} loop calls it once per question.
   * There is exactly one orchestration path.
   *
   * `options.debug` affects *presentation only*. The platform calls below run
   * identically in either mode; debug just additionally reveals the pipeline
   * diagnostics the product gathers along the way. Timing each stage is a
   * measurement around the same calls — it changes no behavior.
   */
  async answer(question: string, options: AskOptions = {}): Promise<void> {
    const debug = options.debug ?? false;
    const timings: StageTimings = {};

    let handbookPath: string;
    let results: RetrievalResult[];
    let context: ContextPackage | undefined;
    let prompt: RenderedPrompt | undefined;
    try {
      const config = await measure(timings, "config", () => this.config.load());
      handbookPath = config.handbook.path;

      const handbook = this.createHandbook(
        config.handbook.path,
        config.handbook.generatedWikiPath,
      );
      const info = await measure(timings, "handbook", () => handbook.locateWiki());

      const retrieval = this.createRetrieval(info.wikiPath);
      results = await measure(timings, "retrieval", () => retrieval.search(question));

      if (results.length > 0) {
        context = await measure(timings, "context", () =>
          this.buildContext(question, results),
        );
        const built = context;
        prompt = await measure(timings, "prompt", () =>
          this.promptRenderer.render(question, built),
        );
      }
    } catch (error) {
      this.printUserError(error);
      return;
    }

    // No relevant knowledge: a friendly notice shown in every mode. Debug adds
    // the retrieval diagnostics that explain the empty result.
    if (context === undefined || prompt === undefined) {
      if (debug) {
        this.printDebugDiagnostics(handbookPath, results, undefined, undefined, timings);
      }
      console.log();
      console.log("No relevant handbook articles were found for that question.");
      console.log();
      return;
    }

    const renderedPrompt = prompt;
    let answer: AIResponse;
    try {
      answer = await measure(timings, "ai", () => this.ai.answer(renderedPrompt));
    } catch (error) {
      // Surface the diagnostics gathered so far, then the friendly error.
      if (debug) {
        this.printDebugDiagnostics(handbookPath, results, context, undefined, timings);
      }
      this.printUserError(error);
      return;
    }

    if (debug) {
      this.printDebugDiagnostics(handbookPath, results, context, answer.model, timings);
    }

    this.printAnswer(answer);
    this.printCitations(context);
  }

  /**
   * Assemble a Context Package from the retrieved articles.
   *
   * The product reuses the existing Context Builder unchanged: it wraps the
   * retrieved articles in a KnowledgeProvider, registers it, and runs the
   * builder's `build` pipeline. The Context Builder assembles context and
   * nothing more — it calls no AI, renders no prompt, and knows nothing about
   * this product or the CLI.
   */
  private async buildContext(
    question: string,
    results: RetrievalResult[],
  ): Promise<ContextPackage> {
    const registry = createProviderRegistry([createWikiKnowledgeProvider(results)]);
    const builder = createContextBuilder(
      {
        profile: "documentation",
        explainability: true,
        outputFormat: "markdown",
      },
      registry,
    );

    return builder.build({
      project: KnowledgeAssistant.PROJECT,
      task: question,
    });
  }

  /**
   * Print the internal pipeline diagnostics — debug mode only. Everything here
   * is either already produced by the pipeline (handbook path, retrieved
   * articles, references, model) or trivially derived from it (serialized size,
   * token estimate, stage timings). Nothing is invented.
   *
   * `context`/`model` are absent when the pipeline stopped early (no relevant
   * articles, or the AI call failed); the block still reports what it reached.
   */
  private printDebugDiagnostics(
    handbookPath: string,
    results: RetrievalResult[],
    context: ContextPackage | undefined,
    model: string | undefined,
    timings: StageTimings,
  ): void {
    console.log();
    console.log("── Debug diagnostics ─────────────────────");
    console.log(`  Handbook           : ${handbookPath}`);
    console.log(`  Retrieved articles : ${results.length}`);
    for (const result of results) {
      console.log(`      • ${result.title}`);
    }

    if (context !== undefined) {
      const serialized = JSON.stringify(context);
      const bytes = Buffer.byteLength(serialized, "utf8");
      console.log(`  Included sources   : ${context.references.length}`);
      console.log(`  Context size       : ${formatBytes(bytes)}`);
      console.log(`  Estimated tokens   : ~${estimateTokens(serialized)}`);
      console.log(`  Prompt rendered    : ✓`);
    }

    console.log(`  AI model           : ${model ?? "(not reached)"}`);
    console.log(`  Stage timings      :`);
    for (const [stage, ms] of Object.entries(timings)) {
      console.log(`      ${stage.padEnd(9)}: ${ms.toFixed(1)} ms`);
    }
    console.log("──────────────────────────────────────────");
  }

  /** Print the generated answer, the final output of the pipeline. */
  private printAnswer(answer: AIResponse): void {
    console.log();
    console.log(answer.text);
    console.log();
  }

  /**
   * Print the citations backing the answer — shown in every mode. The numbering
   * matches the bracketed labels the Prompt Renderer assigns (references in
   * order, `[1]`, `[2]`, …), so the inline markers in the answer resolve here.
   */
  private printCitations(context: ContextPackage): void {
    if (context.references.length === 0) {
      return;
    }

    console.log("Citations:");
    context.references.forEach((reference, index) => {
      console.log(`  [${index + 1}] ${reference.title}`);
    });
    console.log();
  }

  /** Print a known platform error to the user; re-throw anything unexpected. */
  private printUserError(error: unknown): void {
    if (
      !(error instanceof ConfigError) &&
      !(error instanceof HandbookError) &&
      !(error instanceof AIError)
    ) {
      // Not a recognised, user-facing problem — let it surface loudly.
      throw error;
    }

    console.log();
    console.log(error.message);
    console.log();
  }

  private isExit(question: string): boolean {
    return KnowledgeAssistant.EXIT_COMMANDS.has(question.toLowerCase());
  }

  private printWelcome(): void {
    console.log("────────────────────────────────────────");
    console.log("AJ-OS Knowledge Assistant");
    console.log(`Version ${KnowledgeAssistant.PRODUCT_VERSION}`);
    console.log("────────────────────────────────────────");
    console.log();
    console.log("Ask me anything about your handbook.");
    console.log("Type 'exit' or 'quit' to leave.");
    console.log();
  }

  private printGoodbye(): void {
    console.log();
    console.log("Goodbye!");
  }
}

/**
 * Run `fn`, record how long it took under `stage`, and return its result. The
 * timing is purely observational — it wraps the same platform call the pipeline
 * would make anyway and never alters it. Works for sync or async `fn`.
 */
async function measure<T>(
  timings: StageTimings,
  stage: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  const start = performance.now();
  const value = await fn();
  timings[stage] = performance.now() - start;
  return value;
}

/** Rough token estimate (~4 characters per token) for a diagnostic display. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Format a byte count as a compact human-readable size. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}
