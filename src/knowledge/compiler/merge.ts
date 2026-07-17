/**
 * MERGE — guarded LLM re-synthesis.
 *
 * When a new source contributes to an entity/concept that already has a page,
 * MERGE folds the new extraction into the existing page so the page ends up
 * **richer than before**. The whole body is generator-owned; MERGE re-synthesizes
 * it — the guards protect accumulated *generated* knowledge, not manual edits. The
 * Wiki is the sole knowledge artifact: MERGE reads the existing *page* and the
 * incoming page — there is no separate claim store.
 *
 * Enrichment is **validated, not proven**, against mechanical guards:
 *  1. provenance is a superset,
 *  2. every prior `[[link]]` is retained,
 *  3. every prior contradiction callout is retained,
 *  4. the result is non-empty / structurally valid.
 * If any guard fails, MERGE never persists the lossy result: it falls back to a
 * lossless **append**, or **defers** when it cannot even append safely.
 *
 * Learned frontmatter metadata (`aliases`) is preserved across the merge; there is
 * no semantic fact-loss detection — that is intentionally out of scope.
 */
import type { CompiledPage, TextGenerator } from "./KnowledgeCompiler.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";

import {
  extractCallouts,
  extractLinks,
  parsePage,
  patchFrontmatter,
  readFrontmatter,
  serializePage,
} from "./regions.js";

const MERGE_MAX_TOKENS = 4096;
const MERGE_APPEND_MARKER = "<!-- aj-os:merged -->";

export type MergeMode = "resynthesized" | "appended" | "deferred";

export interface MergeProposal {
  readonly path: string;
  readonly reason: string;
}

export interface MergeOutcome {
  readonly path: string;
  readonly mode: MergeMode;
  /** The merged page, unless `mode === "deferred"`. */
  readonly content?: string;
  /** Merged provenance (superset of existing + incoming). */
  readonly provenance: readonly string[];
  /** Guards that failed (empty on a clean re-synthesis). */
  readonly guardFailures: readonly string[];
  /** Present when `mode === "deferred"`. */
  readonly proposal?: MergeProposal;
}

export interface MergeEngine {
  /** Merge `incoming` into the `existing` page content at the same path. */
  merge(existing: string, incoming: CompiledPage): Promise<MergeOutcome>;
}

const SYSTEM = `You merge two versions of one wiki page section into a single, \
richer section for an "LLM Wiki".

Rules — these are strict:
- Preserve ALL existing content, every [[wiki-link]], and every \
"> [!warning]" callout from the EXISTING section. Never drop them.
- Integrate the NEW information, adding what it contributes.
- If NEW contradicts EXISTING, do NOT choose a side: add a \
"> [!warning] Contradiction" callout stating both claims and their sources.
- Keep it factual and tight; the result must be at least as informative as \
EXISTING.
- Output ONLY the merged markdown section — no frontmatter, no code fence.`;

function buildMergePrompt(
  title: string,
  existingGenerated: string,
  incomingGenerated: string,
): RenderedPrompt {
  const user = `Merge the two sections of the page "${title}".

--- EXISTING (preserve everything) ---
${existingGenerated}
--- NEW (fold in) ---
${incomingGenerated}
--- END ---

Return only the merged markdown section.`;
  return { system: SYSTEM, user };
}

function unionSources(
  existing: readonly string[],
  incoming: readonly string[],
): string[] {
  return [...new Set([...existing, ...incoming])].sort((a, b) => a.localeCompare(b));
}

/**
 * Rebuild the merged frontmatter by patching the existing block: widen `sources`,
 * bump `updated`/`generated_at`, and **preserve every other field** — title, type,
 * created, and human-added fields like `aliases`.
 */
function mergedFrontmatter(
  existingFrontmatter: string,
  mergedSources: readonly string[],
  now: Date,
): string {
  const iso = now.toISOString();
  return patchFrontmatter(existingFrontmatter, {
    sources: mergedSources,
    scalars: { updated: iso.slice(0, 10), generated_at: iso },
  });
}

/** Run the mechanical enrichment guards; returns the failures (empty = pass). */
function checkGuards(
  existingGenerated: string,
  candidateGenerated: string,
  existingSources: readonly string[],
  incomingSources: readonly string[],
  mergedSources: readonly string[],
): string[] {
  const failures: string[] = [];

  // 1. provenance superset
  const merged = new Set(mergedSources);
  for (const id of [...existingSources, ...incomingSources]) {
    if (!merged.has(id)) {
      failures.push(`provenance-not-superset:${id}`);
    }
  }
  // 2. link retention
  const candidateLinks = new Set(extractLinks(candidateGenerated));
  for (const link of extractLinks(existingGenerated)) {
    if (!candidateLinks.has(link)) {
      failures.push(`link-dropped:${link}`);
    }
  }
  // 3. contradiction-callout retention
  for (const callout of extractCallouts(existingGenerated)) {
    if (!candidateGenerated.includes(callout)) {
      failures.push("callout-dropped");
    }
  }
  // 4. structure/frontmatter validity of the generated body
  if (candidateGenerated.trim() === "") {
    failures.push("empty-generated-region");
  }
  return failures;
}

export function createLlmMergeEngine(
  config: { generator: TextGenerator },
  now: () => Date = () => new Date(),
): MergeEngine {
  async function merge(existing: string, incoming: CompiledPage): Promise<MergeOutcome> {
    const existingPage = parsePage(existing);
    const frontmatter = readFrontmatter(existingPage.frontmatter);
    const existingSources = frontmatter.sources;
    const incomingSources = [...incoming.sources];
    const mergedSources = unionSources(existingSources, incomingSources);

    // No frontmatter → malformed page we cannot safely patch → defer.
    if (existingPage.frontmatter === "") {
      return {
        path: incoming.path,
        mode: "deferred",
        provenance: mergedSources,
        guardFailures: ["no-frontmatter"],
        proposal: {
          path: incoming.path,
          reason: "Existing page has no frontmatter; needs a manual merge.",
        },
      };
    }

    // The whole body is generator-owned: re-synthesize it.
    const existingBody = existingPage.body;
    const incomingBody = parsePage(incoming.content).body;
    const title = frontmatter.fields.title ?? incoming.title;
    const newFrontmatter = mergedFrontmatter(
      existingPage.frontmatter,
      mergedSources,
      now(),
    );

    // Default: guarded re-synthesis.
    const response = await config.generator.complete(
      buildMergePrompt(title, existingBody, incomingBody),
      { maxTokens: MERGE_MAX_TOKENS },
    );
    const candidate = response.text.trim();
    const failures = checkGuards(
      existingBody,
      candidate,
      existingSources,
      incomingSources,
      mergedSources,
    );

    if (failures.length === 0) {
      return {
        path: incoming.path,
        mode: "resynthesized",
        provenance: mergedSources,
        guardFailures: [],
        content: serializePage(newFrontmatter, candidate),
      };
    }

    // Fallback: lossless append. Existing generated knowledge is untouched, so
    // it trivially satisfies every guard (this protects accumulated *generated*
    // knowledge, not manual edits).
    const appended = `${existingBody}\n\n${MERGE_APPEND_MARKER}\n${incomingBody}`.trim();
    return {
      path: incoming.path,
      mode: "appended",
      provenance: mergedSources,
      guardFailures: failures,
      content: serializePage(newFrontmatter, appended),
    };
  }

  return { merge };
}
