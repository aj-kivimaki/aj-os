/**
 * Public-surface enforcement (REX-303, F-044; REX-D8 Option A).
 *
 * Extends the EOS-007 foundation-test pattern (`tests/end-of-session/
 * foundation.test.ts`) to the surfaces M3-A settled. This is the M3-A ratchet:
 * no dead-export detector exists and `noUnusedLocals` cannot see exports
 * (REX-D8), so without these pins the public-surface work M3-A just did would
 * decay on the next PR. Two guards:
 *
 *   1. no wildcard re-export anywhere in `src/` — pins F-037 repo-wide, so a
 *      future barrel cannot silently re-leak everything by default;
 *   2. the barrels REX-302 settled export exactly their intended runtime
 *      surface, and context-builder still exposes the engine service boundaries
 *      F-039 established as deliberately public.
 *
 * Only runtime (value) exports are visible to `Object.keys`; type-only exports
 * erase, exactly as they do in the EOS-007 exemplar. The wildcard guard reads
 * source text, so it catches both.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, it, expect } from "vitest";

import * as config from "../../src/platform/config/index.js";
import * as handbook from "../../src/platform/handbook/index.js";
import * as retrieval from "../../src/platform/retrieval/index.js";
import * as knowledgeAssistant from "../../src/products/knowledge-assistant/index.js";
import * as contextBuilder from "../../src/context-builder/index.js";

const SRC = join(import.meta.dirname, "..", "..", "src");

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

const valueExports = (mod: Record<string, unknown>): string[] =>
  Object.keys(mod)
    .filter((key) => typeof mod[key] !== "undefined")
    .sort();

describe("public surface — no wildcard re-exports (F-037)", () => {
  it("no src file uses a wildcard re-export", () => {
    // A `export * from` re-export leaks a module's whole surface by default.
    // M3-A removed the four that existed; this keeps them gone. Matches
    // `export *` while ignoring the words in this comment (the regex needs the
    // `from` clause).
    const wildcard = /export\s+\*\s+(?:as\s+\w+\s+)?from/;
    const offenders = sourceFiles(SRC).filter((file) =>
      wildcard.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});

describe("public surface — settled barrels export exactly their manifest (REX-302)", () => {
  it("platform/config", () => {
    expect(valueExports(config)).toEqual(["ConfigError", "ConfigService"]);
  });

  it("platform/handbook", () => {
    expect(valueExports(handbook)).toEqual(["HandbookError", "HandbookService"]);
  });

  it("platform/retrieval", () => {
    expect(valueExports(retrieval)).toEqual(["RetrievalService"]);
  });

  it("products/knowledge-assistant", () => {
    expect(valueExports(knowledgeAssistant)).toEqual(["KnowledgeAssistant"]);
  });
});

describe("public surface — context-builder engine boundaries (F-039)", () => {
  // F-039 settled that the three engine factories are deliberately public,
  // independently-constructable boundaries — not private internals. This pins
  // that decision (and the orchestrator) so a future change cannot quietly drop
  // one. It is a presence check, not an exact manifest: M3-A clarified this
  // surface's doc-comment, it did not re-decide every context-builder export.
  it.each([
    "createContextBuilder",
    "createCollectionEngine",
    "createSelectionEngine",
    "createAssemblyEngine",
  ])("exposes %s as a public factory", (name) => {
    expect(typeof (contextBuilder as Record<string, unknown>)[name]).toBe("function");
  });
});
