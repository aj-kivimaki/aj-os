import type {
  ContextPackage,
  ContextSection,
  SourceReference,
} from "../../context-builder/index.js";

import type { RenderedPrompt } from "./types.js";

/**
 * Renders a Context Package into an AI-ready prompt.
 *
 * This is a self-contained platform capability with a single responsibility:
 * turn a `question` and an assembled `ContextPackage` into a {@link
 * RenderedPrompt}. It is the boundary between "what context did we assemble?"
 * (the Context Builder's job) and "how do we ask a model about it?" (the
 * renderer's job).
 *
 * It is deliberately *not* an AI client. The renderer:
 *
 *   - calls no AI and awaits nothing — `render` is pure and synchronous;
 *   - knows no provider, no model, no API, and no transport (HTTP/SDK/stream);
 *   - reads only the frozen Context Package contract, never re-deriving context.
 *
 * Because a Context Package is immutable and the renderer reads no clock, no
 * randomness and no environment, rendering is deterministic: identical inputs
 * always produce the identical prompt.
 */
export class PromptRenderer {
  /**
   * The standing system instruction. It is fixed text — independent of any
   * particular question or package — so it lives as a constant rather than being
   * rebuilt per call. It encodes the three behavioural guarantees the product
   * relies on: answer only from the supplied context, admit uncertainty, and
   * cite sources.
   */
  private static readonly SYSTEM_PROMPT = [
    "You are the AJ-OS Knowledge Assistant.",
    "You answer questions using only the context supplied in the user message.",
    "",
    "Follow these rules without exception:",
    "- Use only the supplied context. Do not rely on outside or prior knowledge.",
    "- If the context does not contain the answer, say so plainly and do not guess.",
    "- Be explicit about uncertainty; never fabricate facts, sources, or details.",
    "- Cite the sources you used with their bracketed labels (e.g. [1], [2]).",
    "- Keep answers concise and grounded in the cited context.",
  ].join("\n");

  /**
   * Render a prompt for `question` grounded in `context`.
   *
   * The user turn is assembled in a stable order — question, then the context
   * sections, then the numbered source list — so a model can ground its answer
   * and cite sources by label. Sources are numbered once (by their order in the
   * package) and sections refer back to those same numbers.
   *
   * @param question The user's original question.
   * @param context The immutable Context Package to ground the answer in.
   */
  render(question: string, context: ContextPackage): RenderedPrompt {
    // Number each reference once; sections cite these same labels so the model
    // can trace any claim back to a listed source.
    const labels = new Map<string, number>();
    context.references.forEach((reference, index) => {
      labels.set(reference.id, index + 1);
    });

    const user = [
      this.renderQuestion(question),
      this.renderContext(context, labels),
      this.renderSources(context.references, labels),
    ].join("\n\n");

    return { system: PromptRenderer.SYSTEM_PROMPT, user };
  }

  /** Render the question block that opens the user turn. */
  private renderQuestion(question: string): string {
    return `# Question\n\n${question.trim()}`;
  }

  /**
   * Render the assembled context: the package summary (when present) followed by
   * each context section that carries content or cited sources. Sections that are
   * both empty and uncited add nothing a model can use, so they are omitted to
   * keep the prompt focused.
   */
  private renderContext(
    context: ContextPackage,
    labels: ReadonlyMap<string, number>,
  ): string {
    const blocks: string[] = ["# Context"];

    const summary = context.summary.trim();
    if (summary.length > 0) {
      blocks.push(summary);
    }

    const sections = context.sections
      .map((section) => this.renderSection(section, labels))
      .filter((block): block is string => block !== undefined);

    if (sections.length === 0 && summary.length === 0) {
      blocks.push("No supporting context was assembled for this question.");
    } else {
      blocks.push(...sections);
    }

    return blocks.join("\n\n");
  }

  /**
   * Render a single context section, or `undefined` when it has neither content
   * nor cited sources. A section's `content` may be empty while it still cites
   * the sources that justify it; in that case the citation line alone tells the
   * model which listed sources are relevant to that section.
   */
  private renderSection(
    section: ContextSection,
    labels: ReadonlyMap<string, number>,
  ): string | undefined {
    const content = section.content.trim();
    const citation = this.citationList(section.referenceIds, labels);

    if (content.length === 0 && citation === undefined) {
      return undefined;
    }

    const lines = [`## ${section.title}`];
    if (content.length > 0) {
      lines.push(content);
    }
    if (citation !== undefined) {
      lines.push(`Sources: ${citation}`);
    }
    return lines.join("\n\n");
  }

  /**
   * Render the numbered source list the model cites from. Each entry pairs a
   * source's label with its title, category and optional logical locator — never
   * an absolute path or provider internal, since the package contract forbids
   * those.
   */
  private renderSources(
    references: readonly SourceReference[],
    labels: ReadonlyMap<string, number>,
  ): string {
    if (references.length === 0) {
      return "# Sources\n\nNone.";
    }

    const lines = references.map((reference) => {
      const label = labels.get(reference.id);
      const locator =
        reference.locator !== undefined ? ` — ${reference.locator}` : "";
      return `[${label}] ${reference.title} (${reference.type})${locator}`;
    });

    return ["# Sources", ...lines].join("\n");
  }

  /**
   * Turn a section's reference ids into a citation string like `[1], [3]`,
   * ordered by label. Returns `undefined` when the section cites nothing.
   */
  private citationList(
    referenceIds: readonly string[],
    labels: ReadonlyMap<string, number>,
  ): string | undefined {
    const numbers = referenceIds
      .map((id) => labels.get(id))
      .filter((label): label is number => label !== undefined)
      .sort((a, b) => a - b);

    if (numbers.length === 0) {
      return undefined;
    }

    return numbers.map((n) => `[${n}]`).join(", ");
  }
}
