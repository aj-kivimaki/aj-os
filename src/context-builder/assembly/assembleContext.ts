/**
 * Assembly stage: turn an ordered SelectionResult into an immutable ContextPackage.
 *
 *   SelectionResult + generatedAt → assembleContext → ContextPackage
 *
 * Assembly is structural composition only. It never evaluates, reorders, filters,
 * or classifies knowledge: the partition, ordering, and metadata are decided
 * purely from structural fields (`source.type`, `source.id`, provenance), and each
 * item's `content` is copied verbatim into its section body — never inspected,
 * rewritten, or summarized. Only `selectedItems` participate.
 *
 * The result is built through {@link parseContextPackage}, so structural
 * invariants (unique ids/kinds, referential integrity) and the deep-freeze hold by
 * construction. Assembly is deterministic and pure — identical inputs, including
 * the injected timestamp, always produce a deep-equal package — and does no I/O;
 * `async` only to keep every pipeline stage's signature uniform.
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
 * Version of the Context Package *contract* a package conforms to. Deliberately
 * distinct from {@link CONTEXT_BUILDER.version} (the producing agent's release
 * version): the two answer "what shape is this?" vs. "what produced this?" and are
 * never derived from each other.
 */
export const CONTEXT_VERSION = "1.0";

/** Fixed display title for each section `kind`. */
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
 * Total mapping from a knowledge source type to the section kind it composes,
 * read purely from `source.type`. Several types intentionally share a target kind
 * and so compose a single section. Two kinds (`files-likely-to-change`,
 * `risks-and-edge-cases`) are unreachable under a purely structural rule and thus
 * never populated here.
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
 * Section kinds that are not derived from knowledge: always present, always empty.
 * Assembly never infers their content.
 */
const ALWAYS_PRESENT_EMPTY_KINDS: ReadonlySet<ContextSectionKind> = new Set([
  "objective",
  "success-criteria",
  "constraints",
  "open-questions",
]);

/**
 * Separator between the verbatim bodies of items routed to the same section. A
 * blank line keeps concatenated Markdown readable without Assembly imposing any
 * formatting of its own (rendering is the PromptRenderer's job).
 */
const SECTION_BODY_SEPARATOR = "\n\n";

/** A knowledge-derived section under construction — mutable, pre-parse. */
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
 * The input is never mutated: only `selectedItems` are read (in canonical order),
 * along with the provenance `metadata`; `excludedItems` are ignored. Building
 * through `parseContextPackage` validates and deep-freezes the result, so the
 * output cannot drift from the contract.
 *
 * @param selectionResult - the immutable upstream SelectionResult (never modified)
 * @param generatedAt - the injected ISO-8601 timestamp
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
    // Assembly neither computes explainability nor renders a summary; both are
    // emitted as minimal, structurally valid placeholders.
    explainability: { summary: "", entries: [] },
    summary: "",
  });
}

/**
 * Compose `references` as the de-duplicated union of the selected items' sources,
 * keyed by `source.id` (first occurrence wins, first-appearance order preserved).
 * Every section `referenceId` produced by {@link composeSections} appears here by
 * the same rule, so referential integrity holds by construction.
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
    // Build a fresh object rather than embed the frozen input source; carry
    // `locator` only when present, since the contract omits it otherwise.
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
 * Compose `sections`. Knowledge-derived sections are populated via the structural
 * `source.type → kind` mapping, preserving `selectedItems` order within each: their
 * `content` is the verbatim, blank-line-separated concatenation of the routed
 * bodies, and their `referenceIds` are the composing items' de-duplicated
 * `source.id`s in the same order. The always-present-empty sections are included
 * unconditionally. The returned array follows canonical `SECTION_KINDS` order —
 * Assembly never re-ranks knowledge to order sections.
 */
function composeSections(selectedItems: readonly KnowledgeItem[]): Array<{
  kind: ContextSectionKind;
  title: string;
  content: string;
  referenceIds: string[];
}> {
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
    // Every routed item contributes its body, even when several items share one
    // citable source — knowledge is never dropped.
    draft.contents.push(item.content);
    if (!draft.seenReferenceIds.has(item.source.id)) {
      draft.seenReferenceIds.add(item.source.id);
      draft.referenceIds.push(item.source.id);
    }
  }

  // Emit in canonical SECTION_KINDS order: a knowledge-derived section appears only
  // if it received at least one item; the always-present-empty sections always do.
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
 * Compose `metadata`. Provenance (`project`, `task`, optional `branch`/`commit`)
 * is carried through unchanged — present only when present upstream, never
 * defaulted or fabricated. `generatedAt` is the injected input, and the two
 * version fields are single-sourced from `CONTEXT_VERSION` and
 * `CONTEXT_BUILDER.version`. `KnowledgeRequest.issue` has no home in the contract
 * and is intentionally dropped.
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
