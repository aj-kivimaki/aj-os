# Decision: CB-020 Section Composition Strategy

> **Task:** CB-020 — Section Composition Strategy
> **Date:** 2026-07-10
> **Status:** Accepted — reviewer-approved planning gate before CB-022.

---

## Context

CB-020 fixes the deterministic strategy by which Assembly (CB-022) will compose the
`ContextPackage.sections` (CB-003) from a `SelectionResult` (CB-014). It is a
**decision task**: it specifies and records the rule; the executable mapping lands
in CB-022. This mirrors the CB-015 (Selection Policy) → CB-016 (execution) split.

The Milestone 4 architecture (AD-010, clarified by RC-4) recorded that a
section-classification strategy is required but **intentionally left the specific
mechanism undecided until Planning Review** — precisely because no frozen contract
supplies explicit section identity for a `KnowledgeItem`. CB-020 is that Planning
Review decision. The strategy is bounded by the frozen architecture:

- **AD-002 / AD-010 / RC-4** — Assembly performs *structural composition only*; the
  strategy must be **deterministic**, **purely structural**, **preserve frozen
  contracts**, and perform **no semantic evaluation**.
- **RC-5 / Reviewer Decision A** — the completed package is assembled from multiple
  deterministic inputs; selected `KnowledgeItem`s are only one input. Four Appendix B
  sections are **not** knowledge-derived.
- **RC-6** — Assembly may partition knowledge into sections but **never reorders**
  it; the canonical Selection ordering (CB-014) is preserved.
- **CB-003** — `SECTION_KINDS` (12 canonical Appendix B kinds), the unique-kind and
  referential-integrity invariants, and the `ContextSection` shape are frozen.
- **CB-004** — `REFERENCE_TYPES` (9 source categories) and `KnowledgeItem.source`
  (which reuses the CB-003 `SourceReference` shape) are frozen.

This task specifies **only** the section-composition rule. It constructs no
`ContextPackage`, implements no `assemble`, composes no metadata (CB-021), and adds
no tests. It modifies no frozen contract.

## Decision

### 1. Two classes of section

The 12 frozen `SECTION_KINDS` split into:

- **Knowledge-derived** (composed from selected `KnowledgeItem`s): `relevant-architecture`,
  `coding-standards`, `related-documentation`, `handbook-references`,
  `wiki-references`, `files-likely-to-change`, `existing-implementation-patterns`,
  `risks-and-edge-cases`.
- **Non-knowledge-derived** (Reviewer Decision A — always present, always empty):
  `objective`, `success-criteria`, `constraints`, `open-questions`.

### 2. Total, deterministic, purely structural `source.type → kind` mapping

Every `REFERENCE_TYPES` value maps to exactly one knowledge-derived kind. The
mapping reads **only** the frozen structural field `source.type`; it performs no
content inspection, keyword analysis, scoring, or inference (RC-4):

| `source.type` (CB-004) | → section `kind` (CB-003) |
| ---------------------- | ------------------------- |
| `architecture`         | `relevant-architecture`   |
| `adr`                  | `relevant-architecture`   |
| `standard`             | `coding-standards`        |
| `specification`        | `related-documentation`   |
| `project-documentation`| `related-documentation`   |
| `handbook`             | `handbook-references`     |
| `wiki`                 | `wiki-references`         |
| `source-code`          | `existing-implementation-patterns` |
| `git-history`          | `existing-implementation-patterns` |

The mapping is **total** over `REFERENCE_TYPES` (all 9 types resolve) and
deterministic (no dependence on timing, randomness, or item content). Several types
share a target kind; per the CB-003 unique-kind invariant they **compose one
section** (§4).

Two knowledge-derived kinds — `files-likely-to-change` and `risks-and-edge-cases` —
are **not** reachable from any `source.type` under a purely structural rule (neither
can be determined from `source.type` without semantic evaluation, which RC-4
forbids). They are therefore **not populated in Milestone 4** and, not being
Decision-A sections, **do not appear** in M4 output. A future deterministic
structural rule may populate them without changing this strategy (§7).

### 3. Empty-section policy (Reviewer Decision A)

`objective`, `success-criteria`, `constraints`, and `open-questions` are always
constructed as structurally valid **present-but-empty** sections: empty `content`
and empty `referenceIds`. They are never derived, generated, or inferred. Decision A
remains limited to exactly these four; no other kind is added to the
always-present-empty set.

### 4. Order-preserving partition (RC-6)

- **Within a section**, items appear in canonical `selectedItems` order (CB-014).
  The partition is **stable**: it never reorders knowledge and assigns no
  priority/score.
- **Uniqueness**: items whose `source.type` maps to the same kind compose a single
  section (CB-003 unique-kind invariant).
- **Presence**: a knowledge-derived section is present **iff at least one selected
  item maps to its kind**. The four Decision-A sections are always present (§3).
- **The `sections` array order is the canonical Appendix B order** — the frozen
  `SECTION_KINDS` enum sequence. This is deterministic, faithful to Appendix B
  (AD-004: the package mirrors Appendix B logical structure), and positions the four
  empty sections at their canonical Appendix B locations. Assembly never re-ranks
  knowledge to order sections; the section order is the fixed Appendix B structure,
  not a decision derived from item priority.

> **Interpretation of "canonical order across sections" (task §2).** Order
> preservation binds the *knowledge*: within any section, item order is exactly the
> canonical `selectedItems` order, and Assembly reorders nothing. Section-to-section
> arrangement follows the fixed Appendix B structure rather than a re-ranking, so no
> knowledge is reordered by the choice of section sequence.

### 5. Section → reference linking (referential integrity by construction)

- A section's `referenceIds` are the `source.id`s of the items that composed it, in
  canonical order, de-duplicated (first occurrence wins).
- The package `references` array is the de-duplicated union of the `source`s of all
  selected items (`KnowledgeItem.source` already carries the frozen CB-003
  `SourceReference` shape — `{ id, type, title, locator? }`), so a section's
  `referenceIds` always resolve to a declared reference.
- Referential integrity (CB-003) therefore holds **by construction**: every
  `referenceId` is drawn from a source that is, by the same rule, present in
  `references`. The empty Decision-A sections carry `referenceIds: []`.
- Only `selectedItems` participate; `excludedItems` (CB-014) never enter assembly.

## Rationale

- **Purely structural keeps the boundary honest.** Keying only on `source.type`
  satisfies RC-4 without smuggling semantic judgment into a structural stage. Where a
  source category has an unambiguous Appendix B home (`architecture`, `handbook`,
  `wiki`, `standard`), the mapping is direct. Where it is adjacent (`specification`
  and `project-documentation` → `related-documentation`; `adr` → `relevant-architecture`
  as an architecture decision record; `git-history` → `existing-implementation-patterns`
  as evidence of how code is built), the target is chosen by source *category*, never
  by content — preserving determinism.
- **Absence over invention.** `files-likely-to-change` and `risks-and-edge-cases`
  cannot be produced from `source.type` without semantic evaluation. Leaving them
  absent (rather than guessing or forcing an empty section) keeps the strategy
  structural and keeps Decision A's empty-section set exactly the four reviewer-named
  sections.
- **Canonical Appendix B section order.** AD-004 makes Appendix B the canonical
  logical structure; the frozen `SECTION_KINDS` enum already encodes that order.
  Using it for the `sections` array is deterministic, requires no derived ordering
  state, and honors RC-6 because item order *within* sections is untouched.
- **Referential integrity by construction** avoids a post-hoc validation pass
  (AD-008: Assembly owns construction, not semantic validation): references and
  section links are derived from the same selected sources, so they cannot drift.

## Consequences

- CB-022 implements this exact mapping and partition as executable behaviour; CB-024
  protects it with permanent tests. The mapping being **total** guarantees CB-022 has
  a defined target for every `source.type`.
- In M4, at most six knowledge-derived kinds can appear (`relevant-architecture`,
  `coding-standards`, `related-documentation`, `handbook-references`,
  `wiki-references`, `existing-implementation-patterns`), each only when it receives
  items, plus the four always-present empty sections.
- The strategy is forward-compatible: future profile-driven or additional structural
  rules extend the mapping (e.g., populating `files-likely-to-change`) without
  altering the partition, ordering, or linking rules recorded here.

## Scope / Non-Goals

- No `assemble` implementation, `ContextPackage` construction, or metadata
  composition (CB-021/CB-022).
- No rendering, semantic validation, explainability computation, or profiles
  (AD-009).
- No `build()` integration and no tests.
- No content generation for the empty sections and no semantic classification.
- No modification of any frozen contract or of the frozen Planning Package.

## References

SPEC-002 · AJS-002 (Appendix B v1.0) · AJS-007 · PIPELINE-ARCHITECTURE.md §Assembly ·
M4 Planning Package · AD-002, AD-004, AD-008, AD-010 · RC-4, RC-5, RC-6 ·
Reviewer Decision A · CB-003 (`SECTION_KINDS`, invariants) · CB-004
(`REFERENCE_TYPES`) · CB-014 (`SelectionResult`).

## Change Log

| Date       | Version | Description                                              |
| ---------- | ------- | -------------------------------------------------------- |
| 2026-07-10 | 1.0     | Initial decision recorded and reviewer-approved (planning gate). |
