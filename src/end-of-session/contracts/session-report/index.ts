/**
 * SessionReport — public surface of the structured execution-log contract
 * (SPEC-003 §16). Exposes the schemas, validator, the closed result set, and
 * inferred immutable types.
 */

export {
  sessionReportSchema,
  sessionReportErrorSchema,
  candidatesProducedSchema,
  sessionResultSchema,
  parseSessionReport,
  SESSION_RESULTS,
} from "./schema.js";

export type {
  SessionReport,
  SessionReportError,
  CandidatesProduced,
  SessionResult,
} from "./types.js";
