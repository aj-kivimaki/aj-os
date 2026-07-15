/**
 * Session contract types, inferred from the Zod schemas and wrapped in
 * `DeepReadonly` so the runtime and compile-time contracts can never drift and the
 * structures are immutable at every level.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../immutable.js";

import type {
  gitStateSchema,
  sessionContextSchema,
  sessionSchema,
  triggerKindSchema,
} from "./schema.js";

/** The workflow input request (SPEC-003 §7). */
export type SessionContext = DeepReadonly<z.infer<typeof sessionContextSchema>>;

/** The identified run — stable opaque id plus metadata (EOS-D3). */
export type Session = DeepReadonly<z.infer<typeof sessionSchema>>;

/** A session's git state at the moment it ended. */
export type GitState = DeepReadonly<z.infer<typeof gitStateSchema>>;

/** Trigger kind that determined when the session ended. */
export type TriggerKind = z.infer<typeof triggerKindSchema>;
