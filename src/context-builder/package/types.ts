/**
 * Context Package types, inferred from the Zod schema and wrapped in `DeepReadonly`
 * so the runtime and compile-time contracts can never drift and the package is
 * immutable at every level.
 */

import type { z } from "zod";

import type {
  contextExplainabilitySchema,
  contextPackageMetadataSchema,
  contextPackageSchema,
  contextSectionSchema,
  explainabilityEntrySchema,
  sourceReferenceSchema,
} from "./schema.js";

/** Recursively marks every property, array and nested value as `readonly`. */
export type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

/** Immutable package identity and provenance. */
export type ContextPackageMetadata = DeepReadonly<
  z.infer<typeof contextPackageMetadataSchema>
>;

/** Immutable citable knowledge source. */
export type SourceReference = DeepReadonly<z.infer<typeof sourceReferenceSchema>>;

/** Immutable, self-contained context section. */
export type ContextSection = DeepReadonly<z.infer<typeof contextSectionSchema>>;

/** Immutable per-reference selection rationale. */
export type ExplainabilityEntry = DeepReadonly<z.infer<typeof explainabilityEntrySchema>>;

/** Immutable explainability structure. */
export type ContextExplainability = DeepReadonly<
  z.infer<typeof contextExplainabilitySchema>
>;

/** The immutable Context Package contract. */
export type ContextPackage = DeepReadonly<z.infer<typeof contextPackageSchema>>;

/** Canonical section identifier. */
export type ContextSectionKind = z.infer<typeof contextSectionSchema>["kind"];

/** Knowledge-source category. */
export type ReferenceType = z.infer<typeof sourceReferenceSchema>["type"];
