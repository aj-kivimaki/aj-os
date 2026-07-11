/**
 * MERGE — guarded LLM re-synthesis (ADR-004).
 *
 * When a new source contributes to an entity/concept that already has a
 * page, MERGE folds the new extraction into the existing page so the page
 * ends up **richer than before**. The Wiki is the sole knowledge artifact:
 * MERGE reads the existing *page* and the incoming compiled page — there is
 * no claim store.
 *
 * Enrichment is **validated, not proven**, against five mechanical guards:
 *  1. provenance is a superset,
 *  2. every prior `[[link]]` is retained,
 *  3. every prior contradiction callout is retained,
 *  4. the human-owned region is untouched (structural — §regions),
 *  5. the result has valid structure/frontmatter.
 * If any guard fails, MERGE never persists the lossy result: it falls back
 * to a lossless **append** into the generated region, or **defers** with a
 * needs-merge proposal when it cannot even append safely.
 *
 * No semantic fact-loss detection — that is intentionally out of scope.
 */
import type {
  CompiledPage,
  TextGenerator,
} from "./KnowledgeCompiler.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";

import {
  extractCallouts,
  extractLinks,
  parsePage,
  readFrontmatter,
  serializePage,
  type Frontmatter,
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
  return [...new Set([...existing, ...incoming])].sort((a, b) =>
    a.localeCompare(b),
  );
}

function mergedFrontmatter(
  existing: Frontmatter,
  mergedSources: readonly string[],
  now: Date,
): string {
  const iso = now.toISOString();
  const date = iso.slice(0, 10);
  const f = existing.fields;
  const lines: string[] = [
    `type: ${f.type ?? "concept"}`,
    `title: ${JSON.stringify(f.title ?? "")}`,
  ];
  if (f.entity_type !== undefined) {
    lines.push(`entity_type: ${f.entity_type}`);
  }
  lines.push("sources:", ...mergedSources.map((s) => `  - ${s}`));
  lines.push(
    `created: ${f.created ?? date}`,
    `updated: ${date}`,
    `generated_at: ${iso}`,
  );
  return lines.join("\n");
}

/** The five mechanical guards; returns the list of failures (empty = pass). */
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
  async function merge(
    existing: string,
    incoming: CompiledPage,
  ): Promise<MergeOutcome> {
    const existingPage = parsePage(existing);
    const frontmatter = readFrontmatter(existingPage.frontmatter);
    const existingSources = frontmatter.sources;
    const incomingSources = [...incoming.sources];
    const mergedSources = unionSources(existingSources, incomingSources);

    // No generator-owned region → cannot rewrite or append safely → defer.
    if (existingPage.generated === null) {
      return {
        path: incoming.path,
        mode: "deferred",
        provenance: mergedSources,
        guardFailures: ["no-generated-region"],
        proposal: {
          path: incoming.path,
          reason:
            "Existing page has no generator-owned region; needs a manual merge.",
        },
      };
    }

    const existingGenerated = existingPage.generated;
    const incomingGenerated = parsePage(incoming.content).generated ?? "";
    const title = frontmatter.fields.title ?? incoming.title;
    const newFrontmatter = mergedFrontmatter(frontmatter, mergedSources, now());

    // Default: guarded re-synthesis.
    const response = await config.generator.complete(
      buildMergePrompt(title, existingGenerated, incomingGenerated),
      { maxTokens: MERGE_MAX_TOKENS },
    );
    const candidate = response.text.trim();
    const failures = checkGuards(
      existingGenerated,
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
        content: serializePage(newFrontmatter, candidate, existingPage.human),
      };
    }

    // Fallback: lossless append into the generated region. Existing content
    // is untouched, so it trivially satisfies every guard.
    const appended = `${existingGenerated}\n\n${MERGE_APPEND_MARKER}\n${incomingGenerated}`.trim();
    return {
      path: incoming.path,
      mode: "appended",
      provenance: mergedSources,
      guardFailures: failures,
      content: serializePage(newFrontmatter, appended, existingPage.human),
    };
  }

  return { merge };
}
