/**
 * End-of-Session Workflow module — public entry point.
 *
 * The End-of-Session Workflow is a **capture pipeline**: it transforms a finished
 * coding session into candidate knowledge for human review. Trigger → Session →
 * analyzers → knowledge extraction → canonical `CandidateKnowledge[]` → review
 * store → review-package projection → session report. It writes only to the
 * non-canonical review store; git commits and wiki generation are deferred
 * orchestration side effects, out of the v1 capture slice (ADR-002, AJS-005 §7).
 *
 * This module's single public entry point will be `run(context)` — the composed
 * workflow's `run(context: SessionContext): Promise<SessionReport>`, wired at the
 * composition root in Milestone M5. Internal stages stay private and are exposed
 * only through this barrel as they are implemented. Consumers import from this
 * entry point, never from internal files.
 *
 * This file is the module's public surface. Contracts are re-exported here from
 * the `contracts/` barrel as they arrive (EOS-002 adds the session contracts);
 * services and the `run` entry point land in later M1+ tasks. The barrel exports
 * nothing that does not yet exist.
 */

// Immutable workflow contracts (EOS-002+), including the published SPEC-003 →
// SPEC-004 boundary contract (`CandidateKnowledge`, EOS-D1/D4), re-exported from
// `contracts/`.
export {
  sessionContextSchema,
  sessionSchema,
  gitStateSchema,
  triggerKindSchema,
  parseSessionContext,
  parseSession,
  TRIGGER_KINDS,
  candidateKnowledgeSchema,
  candidateProvenanceSchema,
  candidateKindSchema,
  parseCandidateKnowledge,
  CANDIDATE_KINDS,
  reviewPackageSchema,
  parseReviewPackage,
  sessionReportSchema,
  sessionReportErrorSchema,
  candidatesProducedSchema,
  sessionResultSchema,
  parseSessionReport,
  SESSION_RESULTS,
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
  knowledgeExtractionSchema,
  knowledgeFindingSchema,
  extractionSummarySchema,
  extractionKindSchema,
  parseExtractionResponse,
  ExtractionError,
  EXTRACTION_KINDS,
} from "./contracts/index.js";

export type {
  SessionContext,
  Session,
  GitState,
  TriggerKind,
  CandidateKnowledge,
  CandidateProvenance,
  CandidateKind,
  ReviewPackage,
  SessionReport,
  SessionReportError,
  CandidatesProduced,
  SessionResult,
  SessionChange,
  AnalyzerError,
  ChangeSet,
  AnalyzerMetadata,
  ChangeKind,
  ChangeType,
  Analyzer,
  KnowledgeExtraction,
  KnowledgeFinding,
  ExtractionSummary,
  ExtractionKind,
} from "./contracts/index.js";

// The Analyzer Registry — infrastructure (deterministic registration + lookup only;
// no execution), exported alongside the contracts as the module's public surface.
export { createAnalyzerRegistry } from "./registry/index.js";
export type { AnalyzerRegistry } from "./registry/index.js";

// The Collection stage (EOS-101) — analyzer-agnostic execution: runs the registry's
// analyzers against a `Session` and assembles an immutable `ChangeSet` under the
// partial-collection model (deterministic w.r.t. registry order and analyzer output).
export { collectChanges } from "./collection/index.js";

// The Git change analyzer (EOS-102) — the first concrete `Analyzer`, a pure
// translator of git observations into `SessionChange`s over an injected read-only
// `GitPort`. The concrete git-backed `GitPort` adapter (`createGitPort`, EOS-103)
// invokes read-only `git diff` and parses its output into `GitFileChange`s.
export { createGitChangeAnalyzer, createGitPort } from "./analyzers/git/index.js";
export type { GitPort, GitFileChange } from "./analyzers/git/index.js";

// The Knowledge Extraction stage (EOS-202) — the pipeline's single non-deterministic
// seam: build a deterministic prompt from the `ChangeSet`, generate through the
// injected `TextGenerator` port, and parse into an immutable `KnowledgeExtraction`
// (EOS-201). Orchestration + structural validation only (the Extractor Invariant).
export {
  createKnowledgeExtractor,
  buildExtractionPrompt,
} from "./extraction/index.js";
export type {
  KnowledgeExtractor,
  TextGenerator,
  KnowledgeExtractorConfig,
} from "./extraction/index.js";

// The Candidate Generation stage (EOS-301) — the deterministic map from the validated
// `KnowledgeExtraction` to the canonical `CandidateKnowledge[]` (the SPEC-003 → SPEC-004
// boundary). A one-to-one, order-preserving structural mapping behind an injected clock:
// it attaches identity, provenance, and authoritative kind, and interprets nothing else
// (the Candidate Generation Invariant).
export { createCandidateGenerator } from "./generation/index.js";
export type {
  CandidateGenerator,
  CandidateGeneratorConfig,
} from "./generation/index.js";

// The Review Store (EOS-302, EOS-D6) — the SPEC-003 → SPEC-004 filesystem boundary. A
// persistence-only, path-guarded, domain-aware adapter: it writes a session's canonical
// candidates (one JSON file each) + `SessionReport` + append-only log to the non-canonical
// review area (`pending/<session-id>/`). It never performs version control and never
// interprets the artifacts (the Persistence Invariant).
export {
  createFilesystemReviewStore,
  ReviewStoreError,
} from "./store/index.js";
export type {
  ReviewStore,
  ReviewLocation,
  FilesystemReviewStoreOptions,
} from "./store/index.js";

// Extensibility seams (EOS-006): how a session is triggered and how completion is
// announced. v1 ships the manual trigger and the no-op notifier; future
// triggers/notifiers plug in behind these ports without changing orchestration.
export { createManualTriggerSource } from "./trigger/index.js";
export type { TriggerSource } from "./trigger/index.js";
export { createNoopNotificationPort } from "./notification/index.js";
export type { NotificationPort } from "./notification/index.js";
