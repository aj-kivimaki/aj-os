/**
 * Contract tests for the platform Prompt Renderer (PRODUCT-001).
 *
 * The renderer transforms a Context Package into an AI-ready prompt and nothing
 * more. These tests exercise it through its public entry point and know nothing
 * about the Knowledge Assistant, any AI provider, or any transport — they depend
 * only on the platform module and the frozen Context Package contract.
 */
import { describe, expect, it } from "vitest";

import { PromptRenderer } from "../../src/platform/prompt/index.js";
import {
  parseContextPackage,
  type ContextPackage,
} from "../../src/context-builder/index.js";

/** Build a valid, frozen Context Package with sensible defaults for a test. */
function makePackage(
  overrides: Partial<{
    task: string;
    sections: ContextPackage["sections"];
    references: ContextPackage["references"];
    summary: string;
  }> = {},
): ContextPackage {
  return parseContextPackage({
    metadata: {
      contextVersion: "1.0",
      generatedAt: "2026-07-10T00:00:00.000Z",
      project: "aj-os",
      task: overrides.task ?? "who am i?",
      contextBuilderVersion: "0.1.0",
    },
    sections: overrides.sections ?? [],
    references: overrides.references ?? [],
    explainability: { summary: "", entries: [] },
    summary: overrides.summary ?? "",
  });
}

const renderer = new PromptRenderer();

describe("PromptRenderer", () => {
  it("instructs the model to answer only from context, admit uncertainty, and cite sources", () => {
    const { system } = renderer.render("who am i?", makePackage());

    expect(system).toContain("only the supplied context");
    expect(system).toMatch(/uncertain/i);
    expect(system).toMatch(/cite the sources/i);
  });

  it("includes the user's question in the user turn", () => {
    const { user } = renderer.render("who am i?", makePackage());

    expect(user).toContain("# Question");
    expect(user).toContain("who am i?");
  });

  it("numbers references and lets sections cite them by label", () => {
    const pkg = makePackage({
      references: [
        { id: "r1", type: "wiki", title: "About Me", locator: "about-me" },
        { id: "r2", type: "wiki", title: "Career" },
      ],
      sections: [
        {
          kind: "wiki-references",
          title: "Wiki References",
          content: "",
          referenceIds: ["r2", "r1"],
        },
      ],
    });

    const { user } = renderer.render("who am i?", pkg);

    expect(user).toContain("[1] About Me (wiki) — about-me");
    expect(user).toContain("[2] Career (wiki)");
    // Citations are ordered by label regardless of referenceIds order.
    expect(user).toContain("Sources: [1], [2]");
  });

  it("omits sections that carry neither content nor citations", () => {
    const pkg = makePackage({
      sections: [
        { kind: "objective", title: "Objective", content: "", referenceIds: [] },
      ],
    });

    const { user } = renderer.render("who am i?", pkg);

    expect(user).not.toContain("## Objective");
    expect(user).toContain("No supporting context was assembled");
  });

  it("reports an empty source list plainly", () => {
    const { user } = renderer.render("who am i?", makePackage());

    expect(user).toContain("# Sources\n\nNone.");
  });

  it("is deterministic — identical inputs render identically", () => {
    const first = renderer.render("who am i?", makePackage());
    const second = renderer.render("who am i?", makePackage());

    expect(first).toEqual(second);
  });
});
