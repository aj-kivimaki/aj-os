/**
 * Context Builder module — public entry point.
 *
 * The Context Builder assembles the smallest, highest-value Context Package
 * required for a coding agent to complete a single task (see SPEC-002).
 *
 * This is the sole public surface of the module; internal components remain
 * private and are re-exported here as they are implemented.
 *
 * Scope note: CB-001 established the module boundary; CB-002 adds the public
 * configuration contract and the `createContextBuilder()` factory; CB-003 adds
 * the public Context Package contract (the canonical output type); CB-004 adds
 * the public Knowledge Provider contracts (the platform's input types); CB-005
 * adds the immutable Provider Registry (the catalogue of KnowledgeProviders);
 * CB-007 adds the Collection Engine service boundary (constructed with the
 * registry, which it holds but does not execute); CB-011 integrates the pipeline:
 * the Context Builder composes and owns a Collection Engine (built from an
 * injected Provider Registry) and exposes the first end-to-end collection
 * behaviour; CB-013 opens Milestone M3 by adding the Selection Engine service
 * boundary, extended in CB-014…CB-016 with the SelectionResult contract, the
 * Selection Policy and `select(collectionResult)`; CB-017 extends the Context
 * Builder pipeline with the Selection stage and reconciles the public entry point:
 * the Context Builder now composes and owns both a Collection Engine and a
 * Selection Engine and exposes a single public entry point, `build(request)`, which
 * runs Collection → Selection and returns the resulting SelectionResult unchanged
 * (this supersedes the Milestone 2 era `collect(request)` public method — an
 * approved public API evolution). Assembly, profiles and explainability behaviour
 * are delivered by later Milestone M4+ tasks.
 */

/** Identity of the Context Builder agent (see AJS-004 required metadata). */
export const CONTEXT_BUILDER = {
  id: "context-builder",
  name: "Context Builder",
  version: "0.1.0",
  owner: "AJ-OS",
  category: "context",
  description:
    "Assembles deterministic, explainable Context Packages from approved AJ-OS knowledge sources.",
} as const;

// Public factory and handle (CB-002; pipeline entry point `build` added by CB-017).
export { createContextBuilder } from "./createContextBuilder.js";
export type { ContextBuilder } from "./createContextBuilder.js";

// Public configuration contract (CB-002).
export {
  contextBuilderConfigSchema,
  parseContextBuilderConfig,
  CONTEXT_PROFILES,
  OUTPUT_FORMATS,
} from "./config/index.js";
export type {
  ContextBuilderConfig,
  ContextProfile,
  OutputFormat,
} from "./config/index.js";

// Public Context Package contract — the canonical Context Builder output (CB-003).
export {
  contextPackageSchema,
  contextPackageMetadataSchema,
  contextSectionSchema,
  sourceReferenceSchema,
  contextExplainabilitySchema,
  explainabilityEntrySchema,
  parseContextPackage,
  SECTION_KINDS,
  REFERENCE_TYPES,
} from "./package/index.js";
export type {
  ContextPackage,
  ContextPackageMetadata,
  ContextSection,
  SourceReference,
  ContextExplainability,
  ExplainabilityEntry,
  ContextSectionKind,
  ReferenceType,
} from "./package/index.js";

// Public Knowledge Provider contracts — the platform's input types (CB-004).
export {
  knowledgeRequestSchema,
  knowledgeItemSchema,
  providerMetadataSchema,
  parseKnowledgeRequest,
  parseKnowledgeItem,
} from "./providers/index.js";
export type {
  KnowledgeRequest,
  KnowledgeItem,
  ProviderMetadata,
  KnowledgeProvider,
} from "./providers/index.js";

// Provider Registry — the immutable catalogue of KnowledgeProviders (CB-005).
export { createProviderRegistry } from "./registry/index.js";
export type { ProviderRegistry } from "./registry/index.js";

// Collection Engine — the service boundary that coordinates knowledge
// collection; constructed with the Provider Registry, held not executed (CB-007).
export { createCollectionEngine } from "./collection/index.js";
export type { CollectionEngine } from "./collection/index.js";

// Collection Error contract — the deterministic, provider-agnostic representation
// of a single collection failure under the partial-collection model (CB-008).
export {
  collectionErrorSchema,
  parseCollectionError,
  FAILURE_CATEGORIES,
} from "./collection/index.js";
export type { CollectionError, FailureCategory } from "./collection/index.js";

// CollectionResult contract — the complete, deterministic outcome of knowledge
// collection: collected items and collected errors together (CB-009).
export {
  collectionResultSchema,
  collectionResultMetadataSchema,
  parseCollectionResult,
} from "./collection/index.js";
export type {
  CollectionResult,
  CollectionResultMetadata,
} from "./collection/index.js";

// Selection Engine — the service boundary that performs deterministic knowledge
// selection; a pure boundary at CB-013 (holds nothing), extended in CB-016 with the
// `select(collectionResult)` stage operation that applies the Selection Policy
// (CB-015) to a CollectionResult and returns an immutable SelectionResult (CB-014).
export { createSelectionEngine } from "./selection/index.js";
export type { SelectionEngine } from "./selection/index.js";

// SelectionResult contract — the complete, deterministic outcome of knowledge
// selection: the ordered selected items and the excluded items together, plus the
// answered-request provenance. Ordering of `selectedItems` is the contract; there
// is no priority field (CB-014).
export {
  selectionResultSchema,
  selectionResultMetadataSchema,
  parseSelectionResult,
} from "./selection/index.js";
export type {
  SelectionResult,
  SelectionResultMetadata,
} from "./selection/index.js";
