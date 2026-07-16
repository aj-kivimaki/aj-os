/**
 * Observability stage barrel — the workflow's execution log (EOS-405).
 *
 * The `SessionReport` *contract* lives in `contracts/session-report/`; this module is the
 * pure projection that *assembles* one from a run's facts.
 */

export { buildSessionReport } from "./buildSessionReport.js";
export type {
  FatalStageError,
  SessionRunFacts,
} from "./SessionRunFacts.js";
