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
 * (`SessionContext`, `Session`) land here in EOS-002 and the canonical boundary
 * contract (`CandidateKnowledge`) in EOS-003; `ReviewPackage`/`SessionReport` and
 * `SessionChange`/`ChangeSet` follow in EOS-004..EOS-005.
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
