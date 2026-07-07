/**
 * Context Package schema (CB-003).
 *
 * Defines the runtime-validated, public **Context Package contract** — the
 * canonical output of the Context Builder and the primary input to a coding
 * agent (SPEC-002; AJS-002 Appendix B).
 *
 * This task defines *what* a Context Package contains, not *how* it is produced.
 * No collection, ranking, token estimation, assembly or rendering logic lives
 * here. The contract is portable (independent of output format), deterministic
 * and immutable: `parseContextPackage()` validates then deep-freezes.
 *
 * Structural invariants (unique reference ids, unique section kinds, referential
 * integrity) enforce the standard's *Explainable* and *Self-Contained*
 * principles at the contract boundary. They are validation only — not business
 * logic.
 */

import { z } from "zod";

import type { ContextPackage, DeepReadonly } from "./types.js";

/**
 * Canonical Context Package section identifiers (AJS-002 Appendix B, Required
 * Sections 1–12). The `kind` labels the section's role independently of any
 * rendering; section bodies are carried as opaque text so the contract stays
 * portable across output formats.
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
 * Knowledge-source categories a reference can originate from (AJS-002 §"Context
 * Sources"). These are model- and provider-agnostic source *kinds*, not
 * provider identities or transports.
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

/**
 * Immutable metadata identifying the package and its provenance (AJS-002
 * Appendix B, Metadata). `branch`/`commit` are optional inputs (SPEC-002 §7);
 * `generatedAt` is an ISO-8601 timestamp.
 */
export const contextPackageMetadataSchema = z
  .object({
    /** Version of the Context Package contract this package conforms to. */
    contextVersion: z.string().min(1),
    /** ISO-8601 timestamp of when the package was generated. */
    generatedAt: z.iso.datetime(),
    /** Project the package was assembled for. */
    project: z.string().min(1),
    /** Task the package was assembled for. */
    task: z.string().min(1),
    /** Optional source branch (SPEC-002 §7). */
    branch: z.string().min(1).optional(),
    /** Optional source commit (SPEC-002 §7). */
    commit: z.string().min(1).optional(),
    /** Version of the Context Builder that produced the package. */
    contextBuilderVersion: z.string().min(1),
  })
  .strict();

/**
 * A citable knowledge source that contributed to the package. `locator` is an
 * optional *logical* pointer (e.g. `"AJS-002 §6"`, a repo-relative file) — never
 * an absolute path or provider/transport internal.
 */
export const sourceReferenceSchema = z
  .object({
    /** Stable identifier used to link sections and explainability entries. */
    id: z.string().min(1),
    /** Knowledge-source category (AJS-002). */
    type: z.enum(REFERENCE_TYPES),
    /** Human-readable title of the source. */
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
    /** Canonical section identifier (AJS-002 Appendix B). */
    kind: z.enum(SECTION_KINDS),
    /** Display title for the section. */
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
 * The Context Package contract.
 *
 * Top-level shape mirrors AJS-002 Appendix B / CB-003:
 * `Metadata · Context Sections · References · Explainability · Summary`.
 */
export const contextPackageSchema = z
  .object({
    /** Package identity and provenance. */
    metadata: contextPackageMetadataSchema,
    /** Ordered, self-contained context sections. */
    sections: z.array(contextSectionSchema),
    /** Knowledge sources referenced by the package. */
    references: z.array(sourceReferenceSchema),
    /** Traceability: why the package's content was selected. */
    explainability: contextExplainabilitySchema,
    /** At-a-glance synopsis of the package. May be empty. */
    summary: z.string(),
  })
  .strict()
  .superRefine((pkg, ctx) => {
    // Reference ids must be unique.
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

    // Section kinds must be unique — each canonical section appears at most once.
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

    // Referential integrity: every referenced id must resolve to a declared
    // source (Self-Contained / Explainable).
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
