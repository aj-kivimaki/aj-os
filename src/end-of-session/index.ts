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
 * This module's single public entry point is `run(context)` — the composed workflow's
 * `run(context: SessionContext): Promise<SessionReport>` (EOS-406), assembled at the
 * composition root. Internal stages stay private and are exposed only through this
 * barrel. Consumers import from this entry point, never from internal files.
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

// The Session stage (EOS-402) — turns the input `SessionContext` into the identified
// `Session` (EOS-D3): mints the stable opaque id, observes `head`/`dirty`/`branch`
// through the read-only `GitPort` (EOS-D7) so provenance records facts rather than
// claims, and constructs the change range (`<ref>..HEAD`, or `HEAD` for uncommitted +
// staged work). A detached HEAD is captured, not refused: `branch` becomes
// `detached@<short-head>` (the frozen Branch Policy), so nullable branch handling
// stops at this stage.
export { createSessionFactory } from "./session/index.js";
export type {
  SessionFactory,
  SessionFactoryConfig,
  SessionFactoryOptions,
} from "./session/index.js";

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

// The composition root (EOS-407, EOS-D9) — assembles the whole workflow from `AjConfig` in
// one place, the analog of `createKnowledgePipeline`. Resolves `<handbook>/<reviewPath>`,
// ensures it exists, and fails fast via the store's `locate()` guard; builds the git port,
// the single-analyzer registry, the session factory, the extractor over the `AIClient`, the
// candidate generator, the projector, and the no-op notifier. Returns
// `{ workflow, store, trigger }` — the trigger is exposed so an entry point obtains its
// `SessionContext` without touching git. It constructs; it never orchestrates.
export { createEndOfSessionWorkflow } from "./composition/index.js";
export type {
  EndOfSessionPipeline,
  EndOfSessionWorkflowDeps,
} from "./composition/index.js";

// The Workflow orchestrator (EOS-406) — the module's single public entry point,
// `run(context) → SessionReport`. Sequences the injected stages: session → change
// collection → knowledge extraction → candidate generation → review-package projection →
// session report → persistence → notification. **It owns sequencing only** (the frozen
// Orchestrator Invariant): it invokes stages and propagates their results unmodified,
// introducing no business rule, transforming no contract, and bypassing no adapter. A stage
// failure after the session is identified yields a persisted `failed` report rather than a
// rejection — callers read `report.result`.
export { createSessionWorkflow } from "./workflow/index.js";
export type {
  EndOfSessionWorkflow,
  SessionWorkflowDeps,
} from "./workflow/index.js";

// The Observability stage (EOS-405) — assembles the `SessionReport` (SPEC-003 §16), the
// workflow's execution log and the value `run` returns. A **pure projection over existing
// pipeline outputs**: it counts what the stages produced, maps their errors, and states the
// run's outcome (`completed` / `partial` / `failed`) — performing no observation, consulting
// no git, touching no filesystem, and duplicating no earlier stage's logic. A plain function,
// not a factory: it owns no dependency, and the run window is an input rather than a clock
// read. A failed run still yields a valid report — that is how a failure stays observable.
export { buildSessionReport } from "./report/index.js";
export type { SessionRunFacts, FatalStageError } from "./report/index.js";

// The Projection stage (EOS-403, EOS-D4) — renders the human-readable `ReviewPackage`
// markdown *from* the canonical `CandidateKnowledge[]` + `Session`. A pure, deterministic
// function of its explicit inputs (`generatedAt` is passed in, never read from a clock):
// it renders every candidate in canonical order, adds nothing, drops nothing, and
// persists nothing. The package is derived and regenerable from the review store — never
// the source of truth, and never parsed back as data.
export { createReviewPackageProjector } from "./projection/index.js";
export type { ReviewPackageProjector } from "./projection/index.js";

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
