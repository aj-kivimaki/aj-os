/**
 * Context Package — public surface of the package contract (CB-003).
 *
 * The Context Package is the canonical output of the Context Builder. This
 * barrel exposes the contract only: schema, validator, canonical value sets and
 * inferred types. Future milestones populate the package; they do not redesign
 * this contract.
 */

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
} from "./schema.js";

export type {
  ContextPackage,
  ContextPackageMetadata,
  ContextSection,
  SourceReference,
  ContextExplainability,
  ExplainabilityEntry,
  ContextSectionKind,
  ReferenceType,
} from "./types.js";
