/**
 * Context Package schema — the runtime-validated, public Context Package contract:
 * the canonical output of the Context Builder and the primary input to a coding
 * agent.
 *
 * This defines *what* a Context Package contains, not *how* it is produced — no
 * collection, ranking, assembly, or rendering logic lives here. The contract is
 * portable (independent of output format), deterministic, and immutable:
 * `parseContextPackage()` validates then deep-freezes. Its structural invariants
 * (unique reference ids, unique section kinds, referential integrity) are
 * validation only, not business logic.
 */

import { z } from "zod";

import type { ContextPackage, DeepReadonly } from "./types.js";

/**
 * Canonical Context Package section identifiers. The `kind` labels a section's
 * role independently of rendering; section bodies are carried as opaque text so
 * the contract stays portable across output formats.
 */
export const SECTION_KINDS = [
  "objective",
  "success-criteria",
  "constraints",
  "relevant-architecture",
  "coding-standards",
  "related-documentation",
  "handbook-references",
  "wiki-references",
  "files-likely-to-change",
  "existing-implementation-patterns",
  "risks-and-edge-cases",
  "open-questions",
] as const;

/**
 * Knowledge-source categories a reference can originate from. These are model- and
 * provider-agnostic source *kinds*, not provider identities or transports.
 */
export const REFERENCE_TYPES = [
  "specification",
  "standard",
  "architecture",
  "project-documentation",
  "handbook",
  "wiki",
  "source-code",
  "adr",
  "git-history",
] as const;

/** Immutable metadata identifying the package and its provenance. */
export const contextPackageMetadataSchema = z
  .object({
    /** Version of the Context Package contract this package conforms to. */
    contextVersion: z.string().min(1),
    generatedAt: z.iso.datetime(),
    /** Project the package was assembled for. */
    project: z.string().min(1),
    /** Task the package was assembled for. */
    task: z.string().min(1),
    branch: z.string().min(1).optional(),
    commit: z.string().min(1).optional(),
    /** Version of the Context Builder that produced the package. */
    contextBuilderVersion: z.string().min(1),
  })
  .strict();

/**
 * A citable knowledge source that contributed to the package. `locator` is an
 * optional *logical* pointer (e.g. a doc section or a repo-relative file path) —
 * never an absolute path or provider/transport internal.
 */
export const sourceReferenceSchema = z
  .object({
    /** Stable identifier used to link sections and explainability entries. */
    id: z.string().min(1),
    type: z.enum(REFERENCE_TYPES),
    title: z.string().min(1),
    /** Optional logical pointer to the source. */
    locator: z.string().min(1).optional(),
  })
  .strict();

/**
 * A single, self-contained section of the package. `content` is opaque body
 * text (rendering is a later concern); `referenceIds` link the section to the
 * sources that justify it (explainability / traceability).
 */
export const contextSectionSchema = z
  .object({
    kind: z.enum(SECTION_KINDS),
    title: z.string().min(1),
    /** Opaque section body; may be empty when the section has no content. */
    content: z.string(),
    /** Ids of the references that justify this section (may be empty). */
    referenceIds: z.array(z.string().min(1)),
  })
  .strict();

/** Explains why a single reference was included, free of ranking/token data. */
export const explainabilityEntrySchema = z
  .object({
    /** Reference this rationale explains. */
    referenceId: z.string().min(1),
    /** Human-readable reason the reference was selected. */
    reason: z.string().min(1),
  })
  .strict();

/**
 * Explainability structure: an overall rationale plus per-reference reasons.
 * Deliberately score-free — ranking information and token calculations are out
 * of scope for the package contract.
 */
export const contextExplainabilitySchema = z
  .object({
    /** Overall rationale for the assembled package. May be empty. */
    summary: z.string(),
    /** Per-reference selection rationales. */
    entries: z.array(explainabilityEntrySchema),
  })
  .strict();

/**
 * The Context Package contract:
 * `Metadata · Context Sections · References · Explainability · Summary`.
 */
export const contextPackageSchema = z
  .object({
    metadata: contextPackageMetadataSchema,
    sections: z.array(contextSectionSchema),
    references: z.array(sourceReferenceSchema),
    /** Traceability: why the package's content was selected. */
    explainability: contextExplainabilitySchema,
    /** At-a-glance synopsis of the package. May be empty. */
    summary: z.string(),
  })
  .strict()
  .superRefine((pkg, ctx) => {
    const seenRefIds = new Set<string>();
    pkg.references.forEach((ref, index) => {
      if (seenRefIds.has(ref.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate reference id: "${ref.id}"`,
          path: ["references", index, "id"],
        });
      }
      seenRefIds.add(ref.id);
    });

    // Each canonical section kind may appear at most once.
    const seenKinds = new Set<string>();
    pkg.sections.forEach((section, index) => {
      if (seenKinds.has(section.kind)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate section kind: "${section.kind}"`,
          path: ["sections", index, "kind"],
        });
      }
      seenKinds.add(section.kind);
    });

    // Referential integrity: every referenced id must resolve to a declared source.
    pkg.sections.forEach((section, sectionIndex) => {
      section.referenceIds.forEach((refId, refIndex) => {
        if (!seenRefIds.has(refId)) {
          ctx.addIssue({
            code: "custom",
            message: `Section references unknown reference id: "${refId}"`,
            path: ["sections", sectionIndex, "referenceIds", refIndex],
          });
        }
      });
    });

    pkg.explainability.entries.forEach((entry, entryIndex) => {
      if (!seenRefIds.has(entry.referenceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Explainability entry references unknown reference id: "${entry.referenceId}"`,
          path: ["explainability", "entries", entryIndex, "referenceId"],
        });
      }
    });
  });

/**
 * Recursively freeze a value, returning it typed as deeply immutable. Used to
 * make a parsed Context Package immutable at runtime as well as in the types.
 */
function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}

/**
 * Validate an unknown value against the Context Package contract and return a
 * deeply-immutable package.
 *
 * Throws a `ZodError` if validation fails (invalid shape, unknown keys,
 * duplicate ids/kinds, or a dangling reference).
 */
export function parseContextPackage(input: unknown): ContextPackage {
  return deepFreeze(contextPackageSchema.parse(input));
}
