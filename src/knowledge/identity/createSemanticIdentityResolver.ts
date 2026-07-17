/**
 * Semantic Identity Resolver — the LLM-backed matcher.
 *
 * Staged: normalize → lexical shortlist (token overlap, same kind only) → LLM
 * adjudicates same-vs-new among the shortlist → confidence → thresholds.
 * Conservative by construction: only a high-confidence match resolves to
 * `existing`; a plausible-but-uncertain match is `unsure`; everything else is
 * `new`. A false split is acceptable; a false merge is not.
 *
 * The LLM (behind {@link TextGenerator}) is the only non-deterministic step; the
 * shortlist and thresholds are deterministic. Any parse failure or out-of-shortlist
 * answer falls back to `new`, never a risky merge.
 */
import { z } from "zod";

import type { TextGenerator } from "../compiler/index.js";
import type { RenderedPrompt } from "../../platform/prompt/index.js";

import type {
  Candidate,
  ExistingPage,
  IdentityResolver,
  Resolution,
} from "./IdentityResolver.js";

export interface SemanticIdentityResolverConfig {
  readonly generator: TextGenerator;
  /** Max candidates shown to the LLM. Default 5. */
  readonly shortlistSize?: number;
  /** Confidence at/above which a match is `existing`. Default 0.85. */
  readonly existingThreshold?: number;
  /** Confidence at/above which a match is `unsure` (else `new`). Default 0.55. */
  readonly unsureThreshold?: number;
}

const ADJUDICATION_MAX_TOKENS = 512;

const adjudicationSchema = z.object({
  match: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
}

function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  return intersection / (a.size + b.size - intersection);
}

function stripFence(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  return fenced ? (fenced[1] ?? "").trim() : trimmed;
}

const SYSTEM = `You deduplicate a knowledge wiki. Decide whether a newly \
extracted __KIND__ refers to the SAME real-world thing as one of a few \
existing pages.

Be conservative: only answer with a match when you are confident they denote \
the same thing. A false merge corrupts accumulated knowledge; a false split \
(a harmless duplicate) is acceptable. Different facets, scopes, or related-but- \
distinct things are NOT the same.

Return ONLY JSON: { "match": <existing page path> | null, "confidence": 0..1, \
"reason": "<one sentence>" }.`;

function buildPrompt(
  candidate: Candidate,
  candidates: readonly ExistingPage[],
): RenderedPrompt {
  const list = candidates
    .map(
      (p, i) =>
        `${i + 1}. path: ${p.path}\n   title: ${p.title}\n   about: ${p.description}`,
    )
    .join("\n");
  return {
    system: SYSTEM.replace("__KIND__", candidate.kind),
    user: `New ${candidate.kind}:\n  name: ${candidate.name}\n  about: ${candidate.description}\n\nExisting pages:\n${list}\n\nReturn only the JSON verdict.`,
  };
}

export function createSemanticIdentityResolver(
  config: SemanticIdentityResolverConfig,
): IdentityResolver {
  const shortlistSize = config.shortlistSize ?? 5;
  const existingThreshold = config.existingThreshold ?? 0.85;
  const unsureThreshold = config.unsureThreshold ?? 0.55;

  function shortlist(
    candidate: Candidate,
    existing: readonly ExistingPage[],
  ): ExistingPage[] {
    const candidateTokens = tokenize(candidate.name);
    return existing
      .filter((page) => page.kind === candidate.kind)
      .map((page) => ({ page, score: jaccard(candidateTokens, tokenize(page.title)) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, shortlistSize)
      .map(({ page }) => page);
  }

  async function resolve(
    candidate: Candidate,
    existing: readonly ExistingPage[],
  ): Promise<Resolution> {
    const candidates = shortlist(candidate, existing);
    if (candidates.length === 0) {
      return {
        kind: "new",
        confidence: 1,
        explanation: "no lexically similar existing pages",
      };
    }

    const paths = candidates.map((p) => p.path);
    let verdict: z.infer<typeof adjudicationSchema>;
    try {
      const response = await config.generator.complete(
        buildPrompt(candidate, candidates),
        { maxTokens: ADJUDICATION_MAX_TOKENS },
      );
      verdict = adjudicationSchema.parse(JSON.parse(stripFence(response.text)));
    } catch {
      // Unparseable → never risk a merge.
      return {
        kind: "new",
        confidence: 0,
        explanation: `considered [${paths.join(", ")}]; adjudication failed, defaulting to new`,
      };
    }

    const explanation = `considered [${paths.join(", ")}]; ${verdict.reason}`;
    const match =
      verdict.match !== null && paths.includes(verdict.match) ? verdict.match : null;

    if (match !== null && verdict.confidence >= existingThreshold) {
      return {
        kind: "existing",
        targetPath: match,
        confidence: verdict.confidence,
        explanation,
      };
    }
    if (match !== null && verdict.confidence >= unsureThreshold) {
      return {
        kind: "unsure",
        targetPath: match,
        confidence: verdict.confidence,
        explanation,
      };
    }
    return { kind: "new", confidence: verdict.confidence, explanation };
  }

  return { resolve };
}
