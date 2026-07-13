/**
 * Context Builder module — public entry point.
 *
 * The Context Builder assembles the smallest, highest-value Context Package a
 * coding agent needs to complete a single task. This is the module's sole public
 * surface; internal components stay private and are re-exported here.
 */

/** Identity metadata for the Context Builder agent. */
export const CONTEXT_BUILDER = {
  id: "context-builder",
  name: "Context Builder",
  version: "0.1.0",
  owner: "AJ-OS",
  category: "context",
  description:
    "Assembles deterministic, explainable Context Packages from approved AJ-OS knowledge sources.",
} as const;

// Public factory and handle.
export { createContextBuilder } from "./createContextBuilder.js";
export type { ContextBuilder } from "./createContextBuilder.js";

// Public configuration contract.
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

// Public Context Package contract — the canonical Context Builder output.
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

// Public Knowledge Provider contracts — the platform's input types.
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

// Provider Registry — the immutable catalogue of KnowledgeProviders.
export { createProviderRegistry } from "./registry/index.js";
export type { ProviderRegistry } from "./registry/index.js";

// Collection Engine — the service boundary that coordinates knowledge collection.
export { createCollectionEngine } from "./collection/index.js";
export type { CollectionEngine } from "./collection/index.js";

// Collection Error contract — the provider-agnostic representation of a single
// collection failure under the partial-collection model.
export {
  collectionErrorSchema,
  parseCollectionError,
  FAILURE_CATEGORIES,
} from "./collection/index.js";
export type { CollectionError, FailureCategory } from "./collection/index.js";

// CollectionResult contract — the complete outcome of knowledge collection:
// collected items and collected errors together.
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
// selection by applying the Selection Policy to a CollectionResult.
export { createSelectionEngine } from "./selection/index.js";
export type { SelectionEngine } from "./selection/index.js";

// SelectionResult contract — the complete outcome of knowledge selection: ordered
// selected items and excluded items, plus provenance. Ordering of `selectedItems`
// is the contract; there is no priority field.
export {
  selectionResultSchema,
  selectionResultMetadataSchema,
  parseSelectionResult,
} from "./selection/index.js";
export type {
  SelectionResult,
  SelectionResultMetadata,
} from "./selection/index.js";

// Assembly Engine — the service boundary that constructs an immutable
// ContextPackage from an ordered SelectionResult via `assemble`.
export { createAssemblyEngine } from "./assembly/index.js";
export type { AssemblyEngine } from "./assembly/index.js";
