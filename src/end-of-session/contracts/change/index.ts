/**
 * Session change contracts — public surface of the analyzer stage's output
 * vocabulary and the `Analyzer` port. Exposes the schemas, validators, the change
 * kind/type sets, and inferred immutable types.
 */

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
} from "./schema.js";

export type {
  SessionChange,
  AnalyzerError,
  ChangeSet,
  AnalyzerMetadata,
  ChangeKind,
  ChangeType,
  Analyzer,
} from "./types.js";
