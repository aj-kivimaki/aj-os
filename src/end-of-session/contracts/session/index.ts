/**
 * Session contracts — public surface. Exposes the input request (`SessionContext`)
 * and the identified run (`Session`) contracts: schemas, validators, the trigger
 * kinds, and inferred immutable types.
 */

export {
  sessionContextSchema,
  sessionSchema,
  gitStateSchema,
  triggerKindSchema,
  parseSessionContext,
  parseSession,
  TRIGGER_KINDS,
} from "./schema.js";

export type {
  SessionContext,
  Session,
  GitState,
  TriggerKind,
} from "./types.js";
