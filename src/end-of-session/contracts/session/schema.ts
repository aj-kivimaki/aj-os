/**
 * Session contracts — the workflow input (`SessionContext`) and the identified run
 * (`Session`).
 *
 * Per EOS-D3 a session is a **first-class concept**: `SessionContext` is the input
 * *request* and `Session` is the *identified run* with a stable, opaque identity.
 * The two are kept deliberately separate — the request is never conflated with the
 * identified session. These schemas define *what* the contracts contain and their
 * invariants, not *how* they are produced: session creation / id generation is a
 * composition concern (M5) and populating `gitState` needs git access (M2). Both
 * contracts are immutable: `parseSessionContext()` / `parseSession()` validate then
 * deep-freeze.
 *
 * Timestamps are ISO-8601 strings; no clock is embedded in the contract (clocks are
 * injected at composition — the Context Builder `now` precedent).
 */

import { z } from "zod";

import { deepFreeze } from "../immutable.js";

import type { Session, SessionContext } from "./types.js";

/**
 * The trigger kinds that determine *when* a session ends. v1 implements exactly one
 * value — `manual` (`aj session end`). Additional kinds (git-hook, scheduled, IDE,
 * n8n; SPEC-003 §14, MILESTONES "Deferred") are added to this domain by the tasks
 * that implement their `TriggerSource`; they are intentionally *not* pre-listed
 * here (a lenient `.catch` already tolerates them until then — see below).
 */
export const TRIGGER_KINDS = ["manual"] as const;

/**
 * Trigger kind, modeled as a **lenient** enum: an unrecognized value falls back to
 * `manual` rather than failing validation, so a `Session` persisted by a newer
 * version with an as-yet-unimplemented trigger still parses (the compiler
 * `entityTypeSchema` precedent). The trigger source is platform-controlled, so this
 * leniency is forward-compatibility, not sanitization of untrusted input.
 */
export const triggerKindSchema = z.enum(TRIGGER_KINDS).catch("manual");

/**
 * The workflow input request (SPEC-003 §7). Carries only stable locators describing
 * the finished session; it holds no identity and no derived state. `.strict()` so
 * unknown keys are rejected.
 */
export const sessionContextSchema = z
  .object({
    /** Project the session belongs to. */
    project: z.string().min(1),
    /** Repository the session took place in. */
    repository: z.string().min(1),
    /** Branch the session was on. */
    branch: z.string().min(1),
    /** Commit hash at session end, when known. */
    commitHash: z.string().min(1).optional(),
    /** Commit message at session end, when known. */
    commitMessage: z.string().min(1).optional(),
    /** Free-form notes the engineer supplied for the session. */
    sessionNotes: z.string().min(1).optional(),
    /** Identifier of the task the session worked on. */
    taskId: z.string().min(1).optional(),
    /** Logical pointer to the Context Package the session was built from. */
    contextPackageRef: z.string().min(1).optional(),
  })
  .strict();

/**
 * The session's git state at the moment it ended: the analyzed `range`, the `head`
 * commit, and whether the working tree was `dirty`. This is *metadata* about the
 * identified run; it is populated with real git access in M2. `.strict()`.
 */
export const gitStateSchema = z
  .object({
    /** HEAD commit hash at session end. */
    head: z.string().min(1),
    /** Whether the working tree had uncommitted changes at session end. */
    dirty: z.boolean(),
    /** The resolved commit range the workflow analyzes (e.g. `"main..HEAD"`). */
    range: z.string().min(1),
  })
  .strict();

/**
 * The identified run (EOS-D3). Identity is a stable, **opaque** `id` that is
 * independent of the trigger source, so provenance stays stable as new triggers
 * appear; `startedAt`/`endedAt`/`trigger`/`gitState`/`branch` are metadata.
 *
 * The `id` contract is: **non-empty, opaque, and stable for the life of the
 * session**. The contract prescribes only that invariant — never the generator.
 * The concrete generator (UUID/ULID) is chosen at implementation (M5); `id` is
 * deliberately not derived from branch or timestamp. `.strict()`.
 */
export const sessionSchema = z
  .object({
    /** Stable, opaque session identity — not derived from branch/timestamp. */
    id: z.string().min(1),
    /** When the session started (ISO-8601). */
    startedAt: z.iso.datetime(),
    /** When the session ended (ISO-8601). */
    endedAt: z.iso.datetime(),
    trigger: triggerKindSchema,
    gitState: gitStateSchema,
    /** Branch the session was on. */
    branch: z.string().min(1),
  })
  .strict();

/**
 * Validate an unknown value against the `SessionContext` contract and return a
 * deeply-immutable request. Throws a `ZodError` on an invalid shape, unknown keys,
 * or an empty required field.
 */
export function parseSessionContext(input: unknown): SessionContext {
  return deepFreeze(sessionContextSchema.parse(input));
}

/**
 * Validate an unknown value against the `Session` contract and return a
 * deeply-immutable identified run. Throws a `ZodError` on an invalid shape, unknown
 * keys, an empty required field, or a malformed timestamp. An unrecognized
 * `trigger` does not throw — it falls back to `manual`.
 */
export function parseSession(input: unknown): Session {
  return deepFreeze(sessionSchema.parse(input));
}
