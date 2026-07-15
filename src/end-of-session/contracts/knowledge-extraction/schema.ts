/**
 * KnowledgeExtraction contracts — the validated structured findings a
 * text-generation model produces from a session's `ChangeSet`, plus the parser that
 * turns a raw model response into a deep-frozen instance of the contract.
 *
 * This is an **internal pipeline contract** (PIPELINE-ARCHITECTURE: `ChangeSet`,
 * `KnowledgeExtraction`, and `SessionContext` are internal) — *not* the
 * SPEC-003 → SPEC-004 boundary, which is `CandidateKnowledge` (M4). It is
 * nonetheless immutable and provenance-carrying, consistent with every other
 * End-of-Session contract: the model supplies non-deterministic *content*, and this
 * contract makes it safe by validating and freezing its *structure*.
 *
 * It reuses the `src/knowledge/compiler/extraction.ts` pattern — a Zod schema plus a
 * single raw-string parser (fenced-JSON strip → `JSON.parse` → `safeParse`) — adapted
 * to the module convention of deep-freezing the result and raising a domain error.
 * The extractor stage (EOS-202) is the only producer of a raw response; it neither
 * classifies, deduplicates, merges, scores, nor otherwise interprets the findings —
 * that is downstream (M4 / SPEC-004). This module only defines and validates shape.
 */

import { z } from "zod";

import { deepFreeze } from "../immutable.js";

import type { KnowledgeExtraction } from "./types.js";

/** Raised when a model response cannot be parsed or validated (the `CompilerError` precedent). */
export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractionError";
  }
}

/**
 * The candidate-kind hints a finding may carry. These intentionally mirror the
 * SPEC-003 §8 taxonomy *values* but are a **decoupled soft hint**, not the boundary
 * `CANDIDATE_KINDS`: the model's classification is advisory, and **M4 owns the
 * authoritative mapping** onto the closed `CandidateKind`. Kept local (not imported
 * from the candidate contract) so the internal extraction vocabulary and the
 * cross-spec boundary vocabulary do not couple prematurely.
 */
export const EXTRACTION_KINDS = [
  "handbook-entry",
  "playbook",
  "wiki-publication",
  "lesson-learned",
  "doc-update",
  "automation-idea",
] as const;

/**
 * A finding's kind — a **soft hint** (lenient enum). An unrecognized or absent value
 * falls back to `handbook-entry` rather than failing the whole extraction (the
 * `changeKindSchema`/`entityTypeSchema` precedent); downstream must not depend on a
 * precise kind, and M4 re-classifies authoritatively.
 */
export const extractionKindSchema = z
  .enum(EXTRACTION_KINDS)
  .catch("handbook-entry");

/** Non-empty-string array that defaults to an empty array (compiler precedent). */
const stringListSchema = z.array(z.string().min(1)).default([]);

/**
 * The session summary — the SPEC-003 §8 "Session Summary" primary output. A faithful
 * title plus the key points a reader needs; at least one key point is required.
 * `.strict()` so a hallucinated extra key is rejected, not silently carried.
 */
export const extractionSummarySchema = z
  .object({
    title: z.string().min(1),
    keyPoints: z.array(z.string().min(1)).min(1),
  })
  .strict();

/**
 * A single reusable-knowledge finding. Carries enough for M4 to build a
 * `CandidateKnowledge` deterministically — a kind hint, human-readable
 * `title`/`body`/`rationale`, source linkage for provenance, tags, and an optional
 * model confidence. Source linkage (`relatedChangeIds`, `relatedPaths`) is advisory
 * and may be empty; M4 uses it for `CandidateProvenance` without re-deriving it.
 * `.strict()`.
 */
export const knowledgeFindingSchema = z
  .object({
    kind: extractionKindSchema,
    /** Short human-readable title for the proposed knowledge. */
    title: z.string().min(1),
    /** The proposed reusable knowledge, as markdown. */
    body: z.string().min(1),
    /** Why this knowledge is reusable — the case for capturing it. */
    rationale: z.string().min(1),
    /** Ids of the `SessionChange`s the finding derives from. May be empty. */
    relatedChangeIds: stringListSchema,
    /** Repo-relative paths the finding derives from. May be empty. */
    relatedPaths: stringListSchema,
    /** Free-form tags for later grouping. May be empty. */
    tags: stringListSchema,
    /** Optional model confidence in the finding, in `[0, 1]`; carried verbatim. */
    confidence: z.number().min(0).max(1).optional(),
  })
  .strict();

/**
 * The KnowledgeExtraction contract — the model's structured findings for one session.
 * `findings` **may be empty** (a session can yield no reusable knowledge); a
 * `summary` is always required. `.strict()` so no hallucinated top-level key enters
 * the pipeline.
 */
export const knowledgeExtractionSchema = z
  .object({
    /** The session these findings were extracted for (`ChangeSet.sessionId`). */
    sessionId: z.string().min(1),
    summary: extractionSummarySchema,
    /** The reusable-knowledge findings the model identified. May be empty. */
    findings: z.array(knowledgeFindingSchema).default([]),
  })
  .strict();

/**
 * Strip a ```` ```json … ``` ```` (or bare ```` ``` ````) fence the model may wrap
 * JSON in (the compiler `stripCodeFence` idiom).
 */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  return fenced ? (fenced[1] ?? "").trim() : trimmed;
}

/**
 * Parse a raw model response into a validated, deeply-immutable `KnowledgeExtraction`:
 * strip a code fence, `JSON.parse`, `safeParse` against the schema, and `deepFreeze`.
 * Throws an {@link ExtractionError} (a readable message, never a stack trace) when the
 * body is not valid JSON or does not match the schema. The single entry point for
 * constructing an extraction — the model response is its only producer, so no
 * separate `parse(unknown)` variant exists.
 */
export function parseExtractionResponse(raw: string): KnowledgeExtraction {
  let data: unknown;
  try {
    data = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new ExtractionError("The model did not return valid JSON.");
  }
  const result = knowledgeExtractionSchema.safeParse(data);
  if (!result.success) {
    throw new ExtractionError(
      `The model output did not match the extraction schema: ${result.error.message}`,
    );
  }
  return deepFreeze(result.data);
}
