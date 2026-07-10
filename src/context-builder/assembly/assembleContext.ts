/**
 * Assembly execution — deterministic Context Package construction (CB-022).
 *
 * This is the first *runtime behaviour* of the Assembly Engine (CB-019). It
 * realizes the two frozen Assembly planning decisions — the CB-020
 * section-composition strategy and the CB-021 inputs & metadata composition — as
 * executable behaviour, constructing an immutable {@link ContextPackage} (CB-003)
 * from an ordered {@link SelectionResult} (CB-014) and an injected `generatedAt`
 * timestamp:
 *
 *   SelectionResult + generatedAt → assembleContext → ContextPackage
 *
 * Assembly is **structural composition only** (AD-002, AD-010, RC-4). It performs
 * no evaluation, no reordering, no filtering, and no semantic classification. The
 * partition, ordering and metadata are decided purely from frozen structural
 * fields (`source.type`, `source.id`, the provenance `metadata`); each item's
 * `content` is read but only copied **verbatim** into its section body — never
 * inspected to make a decision, rewritten, or summarized.
 *
 *   1. references — the de-duplicated union of `selectedItems[].source`
 *                   (de-duplicated by `source.id`, first occurrence wins,
 *                   first-appearance order preserved) — CB-020 §5.
 *   2. sections   — the CB-020 partition: knowledge-derived sections populated by
 *                   the total, purely structural `source.type → kind` mapping
 *                   (order-preserving), each carrying the verbatim bodies of the
 *                   items routed to it (canonical order, blank-line separated),
 *                   plus the four Reviewer Decision A sections (`objective`,
 *                   `success-criteria`, `constraints`, `open-questions`) always
 *                   present and empty; the `sections` array follows the canonical
 *                   Appendix B / `SECTION_KINDS` order (AD-004).
 *   3. metadata   — the CB-021 composition: provenance reused from
 *                   `SelectionResult.metadata`, the injected `generatedAt`, and the
 *                   two single-sourced versions.
 *   4. construct  — the package is built **through** `parseContextPackage()`
 *                   (CB-003), so structural invariants (unique ids/kinds,
 *                   referential integrity) and the deep-freeze hold by construction
 *                   (RC-1). This is intrinsic construction, not the deferred
 *                   semantic validation (AD-008).
 *
 * Assembly is **deterministic** and **pure** (AD-007, RC-3): identical inputs —
 * including the injected timestamp — always produce a deep-equal package. It reads
 * no clock, no randomness, no environment, and no external state; every field is
 * reused from the inputs or read from a fixed module-level constant.
 *
 * Assembly is **identity-preserving**: KnowledgeItems are consumed unchanged —
 * never reordered, filtered, merged, rewritten, or summarized (AD-002, Knowledge
 * Identity). Only `selectedItems` participate; `excludedItems` never enter assembly
 * (CB-020 §5).
 *
 * Assembly does **not** render (AD-003) and does **not** compute explainability
 * (AD-009): `explainability` and `summary` are constructed as minimal,
 * structurally valid, present-but-not-computed values (RC-2).
 *
 * The function is `async` to mirror the Collection (`collect`, CB-010) and
 * Selection (`select`, CB-016) stage operations and the anticipated usage
 * `await engine.assemble(...)` (CB-019), keeping every pipeline stage operation
 * uniform for the CB-023 `build(request)` composition. Assembly performs no I/O;
 * the returned promise resolves synchronously with the computed ContextPackage.
 */

import type { KnowledgeItem } from "../providers/index.js";
import { CONTEXT_BUILDER } from "../index.js";
import {
  parseContextPackage,
  SECTION_KINDS,
  type ContextPackage,
  type ContextSectionKind,
  type ReferenceType,
  type SourceReference,
} from "../package/index.js";
import type { SelectionResult } from "../selection/result/index.js";

/**
 * The single canonical source of `ContextPackage.metadata.contextVersion` — the
 * version of the Context Package **contract** (CB-003) a package conforms to
 * (AJS-002 Appendix B v1.0). Ownership was fixed by CB-021 §3; the constant is
 * introduced here as the implementation detail of the executable metadata
 * composition, referenced by Assembly and inlined at no other site.
 *
 * This is deliberately distinct from {@link CONTEXT_BUILDER.version} — the
 * producing agent's release version (`contextBuilderVersion`). The two answer
 * different questions ("what shape is this?" vs. "what produced this?") and are
 * never derived from each other (CB-021 §2).
 */
export const CONTEXT_VERSION = "1.0";

/**
 * Canonical Appendix B display titles for each section `kind` (AJS-002 Appendix B
 * "Required Sections"). Assembly must supply the frozen `ContextSection.title`
 * (non-empty), which CB-020 fixes only by `kind`; this mapping is the fixed,
 * purely structural `kind → title` source. It is keyed only on `kind`, invents no
 * content, and is deterministic (reviewer-approved, 2026-07-10).
 */
const SECTION_TITLES: Readonly<Record<ContextSectionKind, string>> = {
  objective: "Objective",
  "success-criteria": "Success Criteria",
  constraints: "Constraints",
  "relevant-architecture": "Relevant Architecture",
  "coding-standards": "Coding Standards",
  "related-documentation": "Related Documentation",
  "handbook-references": "Handbook References",
  "wiki-references": "Wiki References",
  "files-likely-to-change": "Files Likely to Change",
  "existing-implementation-patterns": "Existing Implementation Patterns",
  "risks-and-edge-cases": "Risks & Edge Cases",
  "open-questions": "Open Questions",
};

/**
 * The total, purely structural CB-020 mapping from a knowledge source category
 * ({@link ReferenceType}, CB-004 `REFERENCE_TYPES`) to the knowledge-derived
 * section `kind` (CB-003 `SECTION_KINDS`) it composes. It reads **only**
 * `source.type` — no content inspection, keyword analysis, scoring, or inference
 * (RC-4). The mapping is total over all nine reference types; several types share
 * a target kind and, per the CB-003 unique-kind invariant, compose one section.
 *
 * Two knowledge-derived kinds — `files-likely-to-change` and `risks-and-edge-cases`
 * — are unreachable from any `source.type` under a purely structural rule; they are
 * not populated in M4 and, not being Reviewer Decision A sections, do not appear in
 * the output (CB-020 §2).
 */
const SOURCE_TYPE_TO_SECTION_KIND: Readonly<
  Record<ReferenceType, ContextSectionKind>
> = {
  architecture: "relevant-architecture",
  adr: "relevant-architecture",
  standard: "coding-standards",
  specification: "related-documentation",
  "project-documentation": "related-documentation",
  handbook: "handbook-references",
  wiki: "wiki-references",
  "source-code": "existing-implementation-patterns",
  "git-history": "existing-implementation-patterns",
};

/**
 * The four non-knowledge-derived section kinds (Reviewer Decision A): always
 * present, always empty, never derived or inferred (CB-020 §3). The set is exactly
 * these four; no other kind is added to the always-present-empty set.
 */
const ALWAYS_PRESENT_EMPTY_KINDS: ReadonlySet<ContextSectionKind> = new Set([
  "objective",
  "success-criteria",
  "constraints",
  "open-questions",
]);

/**
 * Separator placed between the verbatim bodies of the items routed to the same
 * section. A blank line keeps concatenated Markdown articles readable without
 * imposing any formatting of Assembly's own (rendering is the PromptRenderer's
 * job, AD-003).
 */
const SECTION_BODY_SEPARATOR = "\n\n";

/** A knowledge-derived section under construction — plain, mutable, pre-parse. */
interface DraftSection {
  kind: ContextSectionKind;
  /** Verbatim item bodies routed to this section, in canonical order. */
  contents: string[];
  referenceIds: string[];
  seenReferenceIds: Set<string>;
}

/**
 * Deterministically construct an immutable Context Package from an ordered
 * SelectionResult and an injected `generatedAt` timestamp.
 *
 * The package is composed by realizing the frozen CB-020 section strategy and the
 * frozen CB-021 metadata composition, then built **through**
 * `parseContextPackage()` (CB-003) so it is validated and deeply frozen —
 * immutability, structural invariants (unique ids/kinds) and referential integrity
 * come for free and the output cannot drift from the contract.
 *
 * The input `SelectionResult` is never mutated: only its `selectedItems` are read
 * (in canonical order) — their `source`, their verbatim `content`, and the
 * provenance `metadata`. `excludedItems` are ignored. Identical inputs always
 * yield a deep-equal package.
 *
 * @param selectionResult - the immutable upstream SelectionResult (never modified)
 * @param generatedAt - the injected ISO-8601 timestamp (CB-021 / Decision B)
 * @returns the immutable, deterministic ContextPackage
 */
export async function assembleContext(
  selectionResult: SelectionResult,
  generatedAt: string,
): Promise<ContextPackage> {
  const { selectedItems, metadata } = selectionResult;

  const references = composeReferences(selectedItems);
  const sections = composeSections(selectedItems);
  const packageMetadata = composeMetadata(metadata, generatedAt);

  return parseContextPackage({
    metadata: packageMetadata,
    sections,
    references,
    // Present-but-not-computed: Assembly does not compute explainability (AD-009)
    // or render a summary (AD-003); both are minimal, structurally valid (RC-2).
    explainability: { summary: "", entries: [] },
    summary: "",
  });
}

/**
 * Compose `references` as the de-duplicated union of the selected items' sources,
 * keyed by `source.id`, first occurrence winning, first-appearance order preserved
 * (CB-020 §5). Only `selectedItems` participate. Referential integrity holds by
 * construction: every section `referenceId` (§`composeSections`) is a `source.id`
 * that, by the same rule, appears here.
 */
function composeReferences(
  selectedItems: readonly KnowledgeItem[],
): SourceReference[] {
  const references: SourceReference[] = [];
  const seen = new Set<string>();

  for (const item of selectedItems) {
    const { source } = item;
    if (seen.has(source.id)) {
      continue;
    }
    seen.add(source.id);
    // Construct a fresh plain object rather than embedding the frozen input source,
    // carrying `locator` only when present (the frozen contract omits it otherwise).
    const reference: SourceReference = {
      id: source.id,
      type: source.type,
      title: source.title,
      ...(source.locator !== undefined ? { locator: source.locator } : {}),
    };
    references.push(reference);
  }

  return references;
}

/**
 * Compose `sections` per the CB-020 partition. Knowledge-derived sections are
 * populated by the total, purely structural `source.type → kind` mapping while
 * preserving the canonical `selectedItems` order within each section (RC-6); their
 * `referenceIds` are the composing items' `source.id`s in that order, de-duplicated
 * (first occurrence wins), and their `content` is the verbatim concatenation of the
 * routed items' bodies in that same canonical order (blank-line separated). The four
 * Reviewer Decision A sections are always present and empty. The returned `sections`
 * array follows the canonical Appendix B / `SECTION_KINDS` order (AD-004): Assembly
 * never re-ranks knowledge to order sections.
 */
function composeSections(selectedItems: readonly KnowledgeItem[]): Array<{
  kind: ContextSectionKind;
  title: string;
  content: string;
  referenceIds: string[];
}> {
  // Partition selected items into knowledge-derived sections, preserving canonical
  // order both within a section and in the order sections are first populated.
  const drafts = new Map<ContextSectionKind, DraftSection>();
  for (const item of selectedItems) {
    const kind = SOURCE_TYPE_TO_SECTION_KIND[item.source.type];
    let draft = drafts.get(kind);
    if (draft === undefined) {
      draft = {
        kind,
        contents: [],
        referenceIds: [],
        seenReferenceIds: new Set(),
      };
      drafts.set(kind, draft);
    }
    // Every routed item contributes its body verbatim (knowledge is never dropped),
    // even when several items share one citable source.
    draft.contents.push(item.content);
    if (!draft.seenReferenceIds.has(item.source.id)) {
      draft.seenReferenceIds.add(item.source.id);
      draft.referenceIds.push(item.source.id);
    }
  }

  // Emit sections in canonical Appendix B / SECTION_KINDS order. A knowledge-derived
  // section appears iff it received at least one item; the four Decision A sections
  // are always present and empty.
  const sections: Array<{
    kind: ContextSectionKind;
    title: string;
    content: string;
    referenceIds: string[];
  }> = [];
  for (const kind of SECTION_KINDS) {
    if (ALWAYS_PRESENT_EMPTY_KINDS.has(kind)) {
      sections.push({
        kind,
        title: SECTION_TITLES[kind],
        content: "",
        referenceIds: [],
      });
      continue;
    }
    const draft = drafts.get(kind);
    if (draft === undefined) {
      continue;
    }
    sections.push({
      kind,
      title: SECTION_TITLES[kind],
      content: draft.contents.join(SECTION_BODY_SEPARATOR),
      referenceIds: draft.referenceIds,
    });
  }

  return sections;
}

/**
 * Compose `metadata` per the CB-021 field ownership. Provenance
 * (`project`, `task`, and optional `branch`/`commit`) is reused unchanged from the
 * SelectionResult provenance — carried through exactly, present in the package iff
 * present in the provenance, never defaulted or fabricated. `generatedAt` is the
 * injected input. The two version fields are single-sourced separately:
 * `contextBuilderVersion ← CONTEXT_BUILDER.version` and
 * `contextVersion ← CONTEXT_VERSION`. `KnowledgeRequest.issue` has no metadata home
 * in the frozen `.strict()` contract and is intentionally dropped (CB-021 §4).
 */
function composeMetadata(
  provenance: SelectionResult["metadata"],
  generatedAt: string,
): {
  contextVersion: string;
  generatedAt: string;
  project: string;
  task: string;
  branch?: string;
  commit?: string;
  contextBuilderVersion: string;
} {
  return {
    contextVersion: CONTEXT_VERSION,
    generatedAt,
    project: provenance.project,
    task: provenance.task,
    ...(provenance.branch !== undefined ? { branch: provenance.branch } : {}),
    ...(provenance.commit !== undefined ? { commit: provenance.commit } : {}),
    contextBuilderVersion: CONTEXT_BUILDER.version,
  };
}
