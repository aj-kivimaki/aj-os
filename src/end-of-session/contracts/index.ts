/**
 * End-of-Session Workflow — contracts barrel.
 *
 * The immutable contracts the workflow exchanges between stages, and the published
 * boundary contract that crosses the SPEC-003 → SPEC-004 boundary
 * (`CandidateKnowledge`, owned here per EOS-D1). Keeping the contracts behind their
 * own barrel lets a consumer (e.g. SPEC-004 Knowledge Review) import a contract
 * without pulling in the module's services or analyzers.
 *
 * Contracts arrive incrementally across the M1 tasks: the session contracts
 * (`SessionContext`, `Session`) land here in EOS-002, the canonical boundary
 * contract (`CandidateKnowledge`) in EOS-003, the workflow outputs
 * (`ReviewPackage` projection, `SessionReport` log) in EOS-004, and the analyzer
 * stage's change contracts + `Analyzer` port (`SessionChange`, `AnalyzerError`,
 * `ChangeSet`) in EOS-005.
 */

export {
  sessionContextSchema,
  sessionSchema,
  gitStateSchema,
  triggerKindSchema,
  parseSessionContext,
  parseSession,
  TRIGGER_KINDS,
} from "./session/index.js";

export type {
  SessionContext,
  Session,
  GitState,
  TriggerKind,
} from "./session/index.js";

// The canonical SPEC-003 → SPEC-004 boundary contract (EOS-D1, EOS-D4).
export {
  candidateKnowledgeSchema,
  candidateProvenanceSchema,
  candidateKindSchema,
  parseCandidateKnowledge,
  CANDIDATE_KINDS,
} from "./candidate/index.js";

export type {
  CandidateKnowledge,
  CandidateProvenance,
  CandidateKind,
} from "./candidate/index.js";

// The workflow outputs: the human-readable projection (EOS-D4) and the execution
// log (SPEC-003 §16).
export { reviewPackageSchema, parseReviewPackage } from "./review-package/index.js";

export type { ReviewPackage } from "./review-package/index.js";

export {
  sessionReportSchema,
  sessionReportErrorSchema,
  candidatesProducedSchema,
  sessionResultSchema,
  parseSessionReport,
  SESSION_RESULTS,
} from "./session-report/index.js";

export type {
  SessionReport,
  SessionReportError,
  CandidatesProduced,
  SessionResult,
} from "./session-report/index.js";

// The analyzer stage's change vocabulary and the `Analyzer` port (EOS-005). The
// registry that holds analyzers is infrastructure, exported from `../registry/`.
export {
  sessionChangeSchema,
  analyzerErrorSchema,
  changeSetSchema,
  analyzerMetadataSchema,
  changeKindSchema,
  changeTypeSchema,
  parseSessionChange,
  parseAnalyzerError,
  parseChangeSet,
  CHANGE_KINDS,
  CHANGE_TYPES,
} from "./change/index.js";

export type {
  SessionChange,
  AnalyzerError,
  ChangeSet,
  AnalyzerMetadata,
  ChangeKind,
  ChangeType,
  Analyzer,
} from "./change/index.js";
