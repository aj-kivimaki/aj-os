/**
 * SessionReport contract types, inferred from the Zod schemas and wrapped in
 * `DeepReadonly` so the runtime and compile-time contracts can never drift and the
 * execution log is immutable at every level.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../immutable.js";

import type {
  candidatesProducedSchema,
  sessionReportErrorSchema,
  sessionReportSchema,
  sessionResultSchema,
} from "./schema.js";

/** The structured execution log of a workflow run (SPEC-003 §16). */
export type SessionReport = DeepReadonly<z.infer<typeof sessionReportSchema>>;

/** A single diagnostic error recorded in the log. */
export type SessionReportError = DeepReadonly<z.infer<typeof sessionReportErrorSchema>>;

/** The candidates a run produced — count plus their ids. */
export type CandidatesProduced = DeepReadonly<z.infer<typeof candidatesProducedSchema>>;

/** The outcome of a workflow run. */
export type SessionResult = z.infer<typeof sessionResultSchema>;
