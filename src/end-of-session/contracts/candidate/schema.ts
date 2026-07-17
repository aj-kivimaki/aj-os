/**
 * CandidateKnowledge — the **canonical output of SPEC-003** and the durable contract
 * that crosses the SPEC-003 → SPEC-004 boundary (EOS-D1, EOS-D4). It is the single
 * unit of *proposed* reusable knowledge produced from a finished session, carrying
 * enough provenance and grouping metadata for SPEC-004 (Knowledge Review) to group,
 * deduplicate, and compare against the Handbook.
 *
 * This is a **boundary contract**: SPEC-004 cannot recover a field SPEC-003 omits,
 * so the contract biases toward completeness of provenance and grouping metadata.
 * It defines *what* a candidate is, not *how* it is produced — candidate generation
 * (M4) and persistence (M4 Review Store) live elsewhere, and duplicate detection /
 * Handbook comparison are SPEC-004's responsibility, not fields here. It carries no
 * SPEC-004 *decision* fields (approve/reject/defer) — those are SPEC-004's output.
 * The contract is immutable: `parseCandidateKnowledge()` validates then deep-freezes.
 *
 * Two accepted decisions are fixed here (finalized in EOS-003, reviewer AJ):
 *
 * - **`kind` domain** — the full SPEC-003 §8 candidate taxonomy (six kinds). This is
 *   the *declared boundary vocabulary* shared with SPEC-004, not a v1 capability
 *   list: v1 need not emit every kind, and a future analyzer can begin producing a
 *   declared kind without revising this boundary contract.
 * - **`id` scheme** — `session:<sessionId>:<n>`, an identity/provenance handle that
 *   is stable within a session. It deliberately does **not** encode semantic
 *   identity or deduplication; those remain SPEC-004's responsibility (ARCH). The
 *   schema keeps `id` a non-empty string and documents the scheme rather than
 *   enforcing its format, so the boundary stays stable if id generation evolves
 *   (mirrors the opaque `Session.id` treatment). Generation itself is M4.
 */

import { z } from "zod";

import { deepFreeze } from "../immutable.js";

import type { CandidateKnowledge } from "./types.js";

/**
 * The candidate kinds SPEC-003 can propose — the full SPEC-003 §8 output taxonomy.
 * This is the durable vocabulary SPEC-004 groups by; it is intentionally complete
 * rather than scoped to what the v1 slice emits, so the boundary contract does not
 * change as deferred analyzers (playbooks, docs, automation, lessons-learned) land.
 */
export const CANDIDATE_KINDS = [
  "handbook-entry",
  "playbook",
  "wiki-publication",
  "lesson-learned",
  "doc-update",
  "automation-idea",
] as const;

/**
 * The safe fallback kind an unrecognized (but present) value resolves to. The full
 * declared domain is enumerated above, so this is reached only by a not-yet-declared
 * future kind.
 */
const FALLBACK_KIND = "handbook-entry" satisfies (typeof CANDIDATE_KINDS)[number];

/**
 * Candidate kind — **required**, and forward-compatibly lenient about *unknown
 * values* only. `kind` must be present: a missing `kind` is a producer error (M4
 * candidate generation always sets it) and fails validation, so the boundary
 * contract detects implementation mistakes. An unrecognized non-empty *string*
 * value, by contrast, falls back to `handbook-entry` rather than throwing, so an
 * older parser never rejects a candidate whose kind a newer version introduced (the
 * compiler `entityTypeSchema` precedent, narrowed to present string values).
 *
 * Implemented with `z.preprocess` rather than `.catch`: `.catch` cannot distinguish
 * a missing value from an unknown one (it swallows both), whereas preprocess maps
 * only an out-of-domain string to the fallback and leaves `undefined`/non-string
 * input for the required enum to reject.
 */
export const candidateKindSchema = z.preprocess(
  (value) =>
    typeof value === "string" && !(CANDIDATE_KINDS as readonly string[]).includes(value)
      ? FALLBACK_KIND
      : value,
  z.enum(CANDIDATE_KINDS),
);

/** Non-empty-string array that defaults to an empty array (compiler precedent). */
const stringListSchema = z.array(z.string().min(1)).default([]);

/**
 * Provenance — where the candidate came from, complete enough for SPEC-004 to trace
 * it back and for auditability (AJS-006 §Traceability). `.strict()` so no runtime or
 * generation internals leak into the contract.
 */
export const candidateProvenanceSchema = z
  .object({
    /** The session this candidate was proposed from (`Session.id`). Required. */
    sessionId: z.string().min(1),
    /** Ids of the `SessionChange`s that motivated the candidate. May be empty. */
    sourceChangeIds: stringListSchema,
    /** Repo-relative paths the candidate derives from. May be empty. */
    sourcePaths: stringListSchema,
    /** Commit hash the candidate is associated with, when known. */
    commitHash: z.string().min(1).optional(),
    /** When the candidate was generated (ISO-8601). */
    generatedAt: z.iso.datetime(),
    /** Identifier of the producer that generated the candidate. */
    generator: z.string().min(1),
  })
  .strict();

/**
 * The CandidateKnowledge contract — the canonical SPEC-003 → SPEC-004 unit of
 * proposed knowledge. `.strict()` so SPEC-004 review-decision fields (or any
 * unknown key) can never enter the boundary.
 */
export const candidateKnowledgeSchema = z
  .object({
    /** Stable identity/provenance handle — scheme `session:<sessionId>:<n>` (M4). */
    id: z.string().min(1),
    kind: candidateKindSchema,
    /** Short human-readable title. */
    title: z.string().min(1),
    /** The proposed knowledge, as markdown. */
    body: z.string().min(1),
    /** Why this knowledge is reusable — the case for capturing it. */
    rationale: z.string().min(1),
    provenance: candidateProvenanceSchema,
    /**
     * Governance state — the AJS-006 `Candidate` state, pinned as a literal. SPEC-003
     * only ever proposes; the `candidate` → `approved` transition is SPEC-004's human
     * gate, so this field is never anything else at this boundary.
     */
    governanceState: z.literal("candidate"),
    /** Free-form tags for SPEC-004 grouping. May be empty. */
    tags: stringListSchema,
    /** Ids of related candidates, for SPEC-004 grouping. May be empty. */
    related: stringListSchema,
    /** Optional producer confidence in the candidate, in `[0, 1]`. */
    confidence: z.number().min(0).max(1).optional(),
  })
  .strict();

/**
 * Validate an unknown value against the `CandidateKnowledge` contract and return a
 * deeply-immutable candidate. Throws a `ZodError` on an invalid shape, unknown keys,
 * an empty required field, a missing or non-string `kind`, a missing
 * `provenance.sessionId`, a malformed `generatedAt`, or a `governanceState` other
 * than `"candidate"`. An unrecognized *string* `kind` does not throw — it falls back
 * to `handbook-entry`.
 */
export function parseCandidateKnowledge(input: unknown): CandidateKnowledge {
  return deepFreeze(candidateKnowledgeSchema.parse(input));
}
