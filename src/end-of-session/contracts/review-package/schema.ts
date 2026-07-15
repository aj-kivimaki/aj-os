/**
 * ReviewPackage — the human-readable **projection** of a session's proposed
 * knowledge (EOS-D4). It is a deterministic rendering derived *from* the canonical
 * `CandidateKnowledge[]` + `Session`; it is **non-canonical, never parsed back as
 * data, and regenerable at any time** from the candidates in the review store.
 *
 * Because the candidates are the source of truth, this package holds
 * `candidateIds` — *references* into the store — not embedded candidate records, so
 * canonical data is never duplicated here. `markdown` is opaque rendered text; the
 * contract carries presentation, not business logic. It defines *what* the package
 * contains, not *how* it is rendered — the projector that produces `markdown` is M5.
 * No clock is embedded: `generatedAt` is injected at composition (the Context
 * Builder `now` precedent). The contract is immutable: `parseReviewPackage()`
 * validates then deep-freezes.
 */

import { z } from "zod";

import { deepFreeze } from "../immutable.js";

import type { ReviewPackage } from "./types.js";

/**
 * The ReviewPackage contract:
 * `sessionId · generatedAt · summary · candidateIds · markdown`. `.strict()` so no
 * canonical candidate fields or rendering internals leak into the projection.
 */
export const reviewPackageSchema = z
  .object({
    /** The session this package projects (`Session.id`). */
    sessionId: z.string().min(1),
    /** When the package was rendered (ISO-8601, injected at composition). */
    generatedAt: z.iso.datetime(),
    /** At-a-glance human synopsis of the review. May be empty. */
    summary: z.string(),
    /**
     * References to the canonical candidates this package projects — ids into the
     * review store, **not** embedded records (EOS-D4). May be empty. Cross-checking
     * these against the candidates provided at projection time is M5's job; this
     * contract validates shape only.
     */
    candidateIds: z.array(z.string().min(1)).default([]),
    /** The rendered review package body, as opaque markdown. */
    markdown: z.string().min(1),
  })
  .strict();

/**
 * Validate an unknown value against the `ReviewPackage` contract and return a
 * deeply-immutable projection. Throws a `ZodError` on an invalid shape, unknown
 * keys, an empty required field, or a malformed `generatedAt`.
 */
export function parseReviewPackage(input: unknown): ReviewPackage {
  return deepFreeze(reviewPackageSchema.parse(input));
}
