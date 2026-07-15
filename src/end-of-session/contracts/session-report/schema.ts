/**
 * SessionReport — the structured, canonical **execution log** of a workflow run
 * (SPEC-003 §16). It records *what happened* — trigger, timing, what was analyzed,
 * what was produced, what went wrong, and the outcome — as an observability and
 * audit record. It describes **execution results and diagnostics, not workflow
 * decisions**: approving/rejecting candidates is SPEC-004's concern and never
 * appears here.
 *
 * This is a shape-only contract. It does **not** compute or cross-validate its
 * fields: denormalized values (`durationMs`, `candidatesProduced.count`) are
 * produced and kept consistent by the workflow (M4/M5), not derived or checked here.
 * No clock is embedded — timestamps are injected at composition (the Context Builder
 * `now` precedent). The contract is immutable: `parseSessionReport()` validates then
 * deep-freezes.
 */

import { z } from "zod";

import { deepFreeze } from "../immutable.js";
import { triggerKindSchema } from "../session/schema.js";

import type { SessionReport } from "./types.js";

/**
 * The outcome of a workflow run — a **closed** enum (unlike the lenient trigger/kind
 * enums): `result` is producer-controlled and must be exact, so an unrecognized
 * value is a bug, not a forward-compatible extension.
 *
 * - `completed` — the run finished with no errors.
 * - `partial`   — the run finished, but one or more analyzers/stages contributed
 *   errors (partial collection; SPEC-003 §15 recoverable).
 * - `failed`    — the run could not complete (SPEC-003 §15 fatal).
 */
export const SESSION_RESULTS = ["completed", "partial", "failed"] as const;
export const sessionResultSchema = z.enum(SESSION_RESULTS);

/** Non-empty-string array that defaults to an empty array (module contract idiom). */
const stringListSchema = z.array(z.string().min(1)).default([]);

/**
 * A single execution error recorded in the log — a diagnostic, not a thrown
 * exception. Structurally aligned with the EOS-005 `AnalyzerError`
 * (`{ analyzer, message, recoverable }`), but owned by the report: the log
 * aggregates errors from any stage (not only analyzers), so `source` generalizes
 * `analyzer`. `recoverable` maps to the SPEC-003 §15 recoverable/fatal split.
 * `.strict()` so no stack traces or runtime internals enter the record.
 */
export const sessionReportErrorSchema = z
  .object({
    /** What produced the error — an analyzer id or a workflow stage. */
    source: z.string().min(1),
    /** Human-readable description of the failure (not a stack trace). */
    message: z.string().min(1),
    /** Whether the run could continue past this error (SPEC-003 §15). */
    recoverable: z.boolean(),
  })
  .strict();

/**
 * The candidates a run produced: a `count` plus their `ids`. Both are recorded (the
 * SPEC-003 §16 observability shape); the contract does not enforce
 * `count === ids.length` — keeping them consistent is the producer's job. `.strict()`.
 */
export const candidatesProducedSchema = z
  .object({
    /** Number of candidates produced. */
    count: z.number().int().min(0),
    /** Ids of the produced candidates (`CandidateKnowledge.id`). May be empty. */
    ids: stringListSchema,
  })
  .strict();

/**
 * The SessionReport contract (SPEC-003 §16). `.strict()` so no SPEC-004 review
 * decision or handling policy can enter this execution log.
 */
export const sessionReportSchema = z
  .object({
    /** The session this report describes (`Session.id`). */
    sessionId: z.string().min(1),
    /** How the session was triggered (reuses the lenient session trigger enum). */
    trigger: triggerKindSchema,
    /** When the run started (ISO-8601). */
    startedAt: z.iso.datetime(),
    /** When the run ended (ISO-8601). */
    endedAt: z.iso.datetime(),
    /** Wall-clock run duration in milliseconds (producer-computed). */
    durationMs: z.number().int().min(0),
    /** Ids of the analyzers that ran. May be empty. */
    analyzersRun: stringListSchema,
    /** Number of files analyzed across the run. */
    filesAnalyzed: z.number().int().min(0),
    candidatesProduced: candidatesProducedSchema,
    /** Errors recorded during the run. May be empty. */
    errors: z.array(sessionReportErrorSchema).default([]),
    result: sessionResultSchema,
    /** A human-readable summary line for the execution log. */
    logEntry: z.string().min(1),
  })
  .strict();

/**
 * Validate an unknown value against the `SessionReport` contract and return a
 * deeply-immutable execution log. Throws a `ZodError` on an invalid shape, unknown
 * keys, an empty required field, a malformed timestamp, a negative/non-integer
 * count or duration, or a `result` outside the closed set.
 */
export function parseSessionReport(input: unknown): SessionReport {
  return deepFreeze(sessionReportSchema.parse(input));
}
