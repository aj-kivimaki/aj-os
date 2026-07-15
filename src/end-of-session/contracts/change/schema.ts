/**
 * Session change contracts — the analyzer stage's output vocabulary (the Collection
 * stage of the pipeline). An `Analyzer` observes a `Session` and contributes
 * normalized `SessionChange` records; a `ChangeSet` aggregates the changes **and**
 * the `AnalyzerError`s from a run, mirroring the SPEC-002 `CollectionResult` so M2
 * can implement **partial collection** — one analyzer failing never aborts the
 * workflow.
 *
 * These define *what* an analyzer contributes, not *how* it observes it: no analyzer
 * behavior, git access, or registry execution lives here (those are EOS-005's
 * registry seam and M2). The contracts are minimal, analyzer-agnostic, and
 * immutable: every schema is `.strict()` and the parse helpers deep-freeze.
 */

import { z } from "zod";

import { deepFreeze } from "../immutable.js";

import type { AnalyzerError, ChangeSet, SessionChange } from "./types.js";

/**
 * The kind of change — a **soft hint** (lenient enum). Analyzers may not classify
 * perfectly, so an unrecognized or absent kind falls back to `other` rather than
 * failing validation (the compiler `entityTypeSchema` precedent); downstream must
 * not depend on a precise kind.
 */
export const CHANGE_KINDS = [
  "source",
  "documentation",
  "config",
  "test",
  "other",
] as const;
export const changeKindSchema = z.enum(CHANGE_KINDS).catch("other");

/**
 * How a path changed — a **closed** enum (unlike `kind`): the change type is a
 * definite classification an analyzer resolves from the source system, so an
 * unrecognized value is a bug, not a soft hint. An analyzer that encounters a
 * finer-grained status (e.g. copied) maps it onto one of these at M2.
 */
export const CHANGE_TYPES = ["added", "modified", "deleted", "renamed"] as const;
export const changeTypeSchema = z.enum(CHANGE_TYPES);

/**
 * Analyzer-specific supplementary metadata, as a bounded string map (e.g. a rename's
 * former path). Values are constrained to strings so it stays a small, immutable
 * annotation rather than an untyped dumping ground (contrast the CB-004
 * `KnowledgeItem`, which forbids a metadata bag entirely); downstream must not
 * depend on specific keys. Defaults to `{}`.
 */
const metadataSchema = z.record(z.string(), z.string()).default({});

/**
 * The static identity an analyzer advertises, so the registry can identify it and
 * key on its `id`. Exposed as a schema (mirroring the CB-004 `providerMetadataSchema`)
 * for parity, though the registry validates `id` directly.
 */
export const analyzerMetadataSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    /** Human-readable description of what the analyzer observes. */
    description: z.string().min(1),
  })
  .strict();

/**
 * A single normalized change an analyzer observed in a session. `id` is namespaced
 * `<analyzer>:<local>` (e.g. `git:src/foo.ts`) so ids are stable and origin-tagged
 * (the `SourceRecord` namespacing precedent). `.strict()`.
 */
export const sessionChangeSchema = z
  .object({
    /** Stable, namespaced change id (`<analyzer>:<local>`). */
    id: z.string().min(1),
    kind: changeKindSchema,
    /** Repo-relative path the change concerns. */
    path: z.string().min(1),
    changeType: changeTypeSchema,
    /** Human-readable summary of the change. */
    summary: z.string().min(1),
    metadata: metadataSchema,
  })
  .strict();

/**
 * A single analyzer failure — a data record, not a thrown exception. This is the
 * canonical error the `ChangeSet` carries for partial collection; the SPEC-003 §16
 * `SessionReport` error aligns with it. `recoverable` maps to the SPEC-003 §15
 * recoverable/fatal split. `.strict()` so no stack traces or runtime internals leak.
 */
export const analyzerErrorSchema = z
  .object({
    /** Id of the analyzer that failed. */
    analyzer: z.string().min(1),
    /** Human-readable description of the failure (not a stack trace). */
    message: z.string().min(1),
    /** Whether collection could continue past this failure (SPEC-003 §15). */
    recoverable: z.boolean(),
  })
  .strict();

/**
 * The aggregate outcome of the collection stage for a session: the `changes` and the
 * `errors`, carried together so M2 can implement partial collection (mirrors the
 * SPEC-002 `CollectionResult`). `.strict()`.
 */
export const changeSetSchema = z
  .object({
    /** The session these changes were collected for (`Session.id`). */
    sessionId: z.string().min(1),
    /** The normalized changes analyzers contributed. May be empty. */
    changes: z.array(sessionChangeSchema).default([]),
    /** Per-analyzer failures. May be empty. */
    errors: z.array(analyzerErrorSchema).default([]),
    metadata: metadataSchema,
  })
  .strict();

/**
 * Validate an unknown value against the `SessionChange` contract and return a
 * deeply-immutable change. Throws a `ZodError` on an invalid shape, unknown keys, an
 * empty required field, or an unrecognized `changeType`. An unrecognized `kind` does
 * not throw — it falls back to `other`.
 */
export function parseSessionChange(input: unknown): SessionChange {
  return deepFreeze(sessionChangeSchema.parse(input));
}

/**
 * Validate an unknown value against the `AnalyzerError` contract and return a
 * deeply-immutable error. Throws a `ZodError` on an invalid shape, unknown keys, or
 * an empty required field.
 */
export function parseAnalyzerError(input: unknown): AnalyzerError {
  return deepFreeze(analyzerErrorSchema.parse(input));
}

/**
 * Validate an unknown value against the `ChangeSet` contract and return a
 * deeply-immutable change set. Throws a `ZodError` on an invalid shape, unknown
 * keys, an empty `sessionId`, or an invalid embedded change/error.
 */
export function parseChangeSet(input: unknown): ChangeSet {
  return deepFreeze(changeSetSchema.parse(input));
}
