# Decision: CB-014 SelectionResult Contract

> **Task:** CB-014 — Define SelectionResult Contract
> **Date:** 2026-07-09
> **Status:** Accepted

---

## Context

CB-014 defines the **SelectionResult** — the canonical, complete, deterministic
outcome of knowledge selection, and the first Milestone M3 *data* contract (after
CB-013 established the Selection Engine boundary). Selection consumes a
`CollectionResult` (CB-009) and partitions its knowledge into what continues
through the pipeline and what does not. The SelectionResult is the immutable
boundary between the Selection Engine and Context Assembly (M4), and — because it
preserves both sides of the decision — the future input to deterministic
explainability (M5) without re-running selection.

This task defines **only** the contract — schema, runtime validation, immutable
types, `parseSelectionResult()`, public exports and documentation. It excludes the
Selection Policy, Selection Engine execution, evaluation, prioritization, ordering
logic, filtering, duplicate elimination and Context Builder integration.

The frozen Milestone 3 plan fully specified the field set (`metadata`,
`selectedItems`, `excludedItems`), mandated no priority field, and required
composition of existing contracts. The one open design decision was the shape of
`metadata`; it is recorded here. **No frozen contract change was required** — the
task was implementable exactly as planned.

## Decision

1. **Three fields: `metadata`, `selectedItems`, `excludedItems`; `.strict()`; both
   arrays may be empty.**
   `{ metadata, selectedItems: KnowledgeItem[], excludedItems: KnowledgeItem[] }`.
   Selected-and-excluded, selected-only, excluded-only and empty are all valid;
   `.strict()` rejects any priority-/score-/ranking-/execution-specific field.

2. **`selectedItems` and `excludedItems` compose the CB-004 `KnowledgeItem`
   schema.** `z.array(knowledgeItemSchema)` on both sides — reused, never
   redefined. No new knowledge contract is introduced and no `KnowledgeItem` field
   is duplicated. Knowledge identity is preserved: items are referenced unchanged.

3. **`metadata` is the selection's provenance — the answered `KnowledgeRequest`,
   reused from the adjacent upstream stage.**
   `selectionResultMetadataSchema = collectionResultMetadataSchema` (itself the
   CB-004 `knowledgeRequestSchema`, `{ project, task, branch?, commit?, issue? }`).
   The selection answers the same request the collection answered, so the metadata
   is carried forward from `CollectionResult.metadata` rather than re-derived.
   Reusing the collection's metadata guarantees the selection provenance can never
   drift from the request that flowed through collection, and keeps Selection
   dependent only on the *public contract of its adjacent stage*
   (PIPELINE-ARCHITECTURE §Stage Independence).

4. **No priority, score or ranking field. Ordering is the contract.**
   `selectedItems` is an ordered array whose order is the public platform
   guarantee Assembly consumes exactly as provided. Any priority used to derive
   that order is an implementation detail of the Selection Policy (CB-015), never
   part of this contract. `.strict()` structurally forbids a leaked `priority`.

5. **No timestamps, durations, counters or diagnostics in metadata.** These break
   determinism and/or leak execution/implementation detail; derived counts are
   redundant with the arrays. All are excluded and rejected by `.strict()`.

6. **No cross-element uniqueness / duplicate detection.** Enforcing that
   `selectedItems` and `excludedItems` are disjoint, or that ids are unique, would
   be selection *behaviour* — out of scope (CB-015/CB-016). The contract validates
   shape, not policy; element-level validation suffices.

7. **Layout mirrors the CB-009 data-contract precedent.** New
   `src/context-builder/selection/result/` with `schema.ts` (schema + `deepFreeze`
   + `parseSelectionResult`), `types.ts` (`DeepReadonly` inferred types) and
   `index.ts` (barrel) — the same shape as `collection/result/`. Re-exported
   through `selection/index.ts` and the top-level `context-builder/index.ts`.

8. **Immutable & deterministic.** `parseSelectionResult()` validates then
   deep-freezes (the established per-module `deepFreeze` helper). The same input
   always yields an equal, deeply-frozen contract.

## Rationale

- **Composition over duplication.** Every field reuses a stable platform schema
  (`knowledgeItemSchema`, `collectionResultMetadataSchema`), keeping the module
  coherent and the contracts single-sourced — the same move CB-009 made for
  `items`/`errors`/`metadata`.
- **Ordering as the public guarantee.** Exposing the deterministic sequence
  directly through `selectedItems` — with no priority field — keeps the boundary
  honest: consumers depend on *order*, not on a ranking number whose meaning would
  leak Selection Policy internals. `.strict()` makes the exclusion enforceable.
- **Determinism by construction.** Provenance-only metadata plus `.strict()` makes
  it structurally impossible to introduce timing/counter/diagnostic fields, so the
  contract stays deterministic, serializable and implementation-independent.
- **Enables CB-015/CB-016 without behaviour.** Exporting `selectionResultSchema`
  lets later tasks construct a `SelectionResult` during selection, consuming this
  contract without changing it.

## Consequences

- CB-015 defines the deterministic Selection Policy (comparator chain); CB-016
  executes selection and **constructs** a `SelectionResult` — partitioning a
  `CollectionResult`'s items into ordered `selectedItems` and `excludedItems` and
  carrying the answered request as `metadata` — consuming this contract without
  altering it.
- CB-017 integrates selection into the Context Builder's `build(request)` pipeline
  entry point; `build` returns the `SelectionResult` as the highest-level
  implemented stage output at Milestone 3.
- M4 (assembly) reads a `SelectionResult` as its sole input and consumes
  `selectedItems` in the given order, performing no reordering.
- If future provenance beyond the request proves necessary, extend the metadata
  additively with justified stable fields — never with execution detail.

## Alternatives Considered

### Metadata shape

- **Option A — provenance = the answered request, reused from CB-009 (selected).**
  `selectionResultMetadataSchema = collectionResultMetadataSchema`. Expresses
  pipeline lineage (Selection preserves the collection's provenance), depends only
  on the adjacent stage's public contract, deterministic and provider-agnostic.
- **Option B — re-import `knowledgeRequestSchema` directly from CB-004.**
  Structurally identical, but reaches past the adjacent Collection stage into the
  provider contracts. Rejected in favour of expressing lineage through the
  upstream stage that Selection actually consumes.
- **Option C — rich runtime metadata (`generatedAt`, counts of selected/excluded).**
  Rejected outright: breaks determinism and is explicitly forbidden
  (timestamps/counters/diagnostics); counts are redundant with the arrays.

### Priority representation

- **Option A — ordering only, no priority field (selected).** Matches the frozen
  plan: ordering of `selectedItems` is the contract; priority is a Selection
  Policy implementation detail.
- **Option B — an explicit `priority`/`score` per item or a parallel ranking
  array.** Rejected — forbidden by the frozen plan; it would leak policy internals
  into the public contract and invite drift between the number and the order.

### Other alternatives

- **Enforcing selected/excluded disjointness or id-uniqueness via `superRefine`.**
  Rejected — that is selection/dedup *behaviour* (CB-015/CB-016), out of scope; the
  contract validates shape, not policy.
- **A single `items` array with a per-item `selected` flag.** Rejected — collapses
  the two stable outcomes into a flag, loses the ordered `selectedItems`
  guarantee, and reintroduces a per-item boolean the contract deliberately avoids.
- **Embedding the source `CollectionResult`.** Rejected as redundant structure; the
  selection outcome is the partition plus provenance, not a copy of its input.

### Selected Option

Option A (provenance metadata reused from CB-009) with flat, composed, ordered
`selectedItems` + `excludedItems` arrays and no priority field.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 135 passing across 11 files, including new
  `tests/context-builder/selection-result.test.ts` (selected+excluded,
  selected-only, excluded-only, empty, order preserved, provenance locators,
  identity preserved, missing collections rejected, invalid embedded selected/
  excluded item rejected, invalid metadata rejected, strict unknown-key rejection,
  leaked-priority rejection, deep freeze, determinism, schema composition). Up from
  119 (M2) — 16 new tests; no existing test modified.
- `npm run build` — passes; emits `dist/context-builder/selection/result/`.

## Future Review

- Revisit at CB-016 (construct during selection execution) and M4 (assembly reads
  the result); confirm both **consume** this contract without altering it, and that
  provenance-only metadata and ordering-as-the-contract remain sufficient.

## Related Documents

Architecture

- ARCH-001, PIPELINE-ARCHITECTURE.md (§Selection, §Deterministic Ordering,
  §Stage Independence, §Knowledge Identity)

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-004 (Provider contracts — `KnowledgeItem`, reused here), CB-009
  (`CollectionResult` — metadata reused here), CB-013 (Selection Engine boundary),
  CB-014 (this task), CB-015 (Selection Policy), CB-016 (selection execution,
  constructs this), CB-017 (Context Builder integration)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *Expose the guarantee, not the mechanism.* Selection needs
a deterministic order; the ordered `selectedItems` array *is* that guarantee, so
the contract publishes the order and withholds the priority/score that produced it.
Publishing a ranking number instead would leak a Policy implementation detail into
a frozen public contract and invite drift between the number and the order.
Combined with CB-009's principle (reuse the input contract as provenance; let
`.strict()` enforce the exclusion of runtime fields), a pipeline-stage outcome
contract should carry exactly *the decision and its provenance* — never the
mechanism that computed it. Recorded as a recommendation only; no AJS document is
modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-09 | 1.0     | Decision created |
