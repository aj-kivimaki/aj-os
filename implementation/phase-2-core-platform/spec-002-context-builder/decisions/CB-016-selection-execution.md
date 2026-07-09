# Decision: CB-016 Selection Execution

> **Task:** CB-016 — Selection Execution
> **Date:** 2026-07-09
> **Status:** Accepted

---

## Context

CB-016 introduces the first *runtime behaviour* of the Selection Engine (CB-013). The
engine must **apply** the deterministic Selection Policy (CB-015) to an immutable
`CollectionResult` (CB-009) and assemble an immutable `SelectionResult` (CB-014)
under the pipeline's determinism and knowledge-identity guarantees.

The task explicitly reuses the frozen CB-013/014/015 surfaces and forbids redefining
the Selection Policy, introducing new comparators, exposing comparators publicly,
introducing priority/score/ranking, communicating with providers, accessing external
services, maintaining runtime state, integrating with the Context Builder (CB-017),
assembling Context Packages, adding explainability, or adding behaviour tests
(CB-018). The policy owns every decision; execution only sequences those decisions
and constructs the contract.

The frozen Milestone M3 plan and the CB-015 policy fully specified the decision model
(evaluation, filtering, an ordered comparator chain terminating in an immutable
identifier, and the approved Exact Duplicate Definition). What remained open were a
few execution-shape choices, recorded here.

## Decision

1. **Execution is a method on the existing `SelectionEngine`, delegating to an
   internal stateless function.** `select(collectionResult): Promise<SelectionResult>`
   is added to the CB-013 handle — exactly the extension its (empty) interface and
   documentation anticipated ("In CB-016 the engine gains … `select`"). This is
   **additive**: no existing member or signature changed, so it is not a
   frozen-contract change requiring re-review. The behaviour lives in a new
   `selection/selectKnowledge.ts`; `select` merely delegates, keeping the engine
   stateless — mirroring how CB-010 placed `collectKnowledge` behind
   `CollectionEngine.collect`. No `schema.ts` is added (execution composes existing
   contracts; it defines no new data contract).

2. **Execution sequences the policy in four steps and never re-decides.**
   filter (`isRetainedKnowledgeItem`) → order (`compareKnowledgeItems`, over a copy)
   → eliminate exact duplicates (`partitionExactDuplicates`, in canonical order) →
   construct via `parseSelectionResult`. Every decision is imported from CB-015; the
   executor embeds no evaluation, filtering, ordering or duplicate rule of its own,
   introduces no new comparator, and exposes no priority/score/ranking value.

3. **Order the retained items over a copy — never mutate the input.** The
   `CollectionResult.items` array is deep-frozen; `Array.prototype.sort` orders in
   place, so the retained items are spread into a new array before sorting. Immutable
   inputs stay immutable (PIPELINE-ARCHITECTURE §Immutable Boundaries, §Knowledge
   Identity).

4. **Deduplicate *after* ordering.** `partitionExactDuplicates` retains the **first
   occurrence in canonical order**; applying it to the canonically-ordered retained
   items is what makes "first occurrence" deterministic and matches the approved
   Exact Duplicate Definition. `selectedItems` is therefore the deduplicated
   canonical sequence — the ordering that *is* the public contract.

5. **Order `excludedItems` deterministically with the same policy comparator.** The
   SelectionResult contract guarantees ordering only for `selectedItems`, but the
   determinism principle ("identical CollectionResults always produce identical
   SelectionResults") still requires a deterministic order for `excludedItems`.
   Filtered-out items and eliminated duplicates are combined and ordered with
   `compareKnowledgeItems` — reusing the policy's existing total-order comparator
   rather than inventing new ordering logic or leaking a ranking value. Each excluded
   item is preserved unchanged (identity preserved), supporting future deterministic
   explainability (M5) without re-running selection.

6. **`select` is `async` (`Promise<SelectionResult>`).** Selection performs **no**
   I/O, but the async signature mirrors the CB-010 `collect` stage operation and the
   frozen anticipated usage `await engine.select(collectionResult)` (CB-013 source
   and README), and keeps both stage operations uniform for the CB-017
   `build(request)` composition. The promise resolves synchronously with the computed
   result.

7. **Construct through the CB-014 contract.** The assembled `{ metadata,
   selectedItems, excludedItems }` is built with `parseSelectionResult`, which
   validates and deep-freezes it. Immutability and contract-conformance come for
   free, and the output cannot drift from the contract. `metadata` is the collection
   provenance carried forward unchanged (the request the selection answered).

## Rationale

- **Anticipated seam.** CB-013 deliberately left the boundary empty and documented
  the future `select`; adding it here honours that plan rather than reshaping the
  surface.
- **Small executor, because policy is separate.** With CB-015 owning evaluation,
  filtering, ordering and duplicate identity, execution reduces to sequencing plus
  contract construction — the payoff of the CB-015/CB-016 split.
- **Determinism by construction.** A total-order comparator + retain-first-in-order
  dedupe + stateless pure functions make identical inputs yield identical outputs,
  with no timing, randomness or external state; ordering `excludedItems` with the
  same comparator extends that guarantee to the whole result.
- **Immutability preserved.** Copy-before-sort and CB-014 deep-freeze keep both the
  frozen input and the returned output immutable.
- **Uniform pipeline stages.** An async `select` composes uniformly with the async
  `collect` in the CB-017 pipeline.

## Consequences

- CB-017 can integrate the `build(request)` pipeline directly on top of
  `engine.select(collectionResult)` without further engine changes.
- CB-018 will add behaviour tests exercising this execution (filtering, canonical
  ordering, exact-duplicate elimination, determinism, immutability); CB-016 adds
  none, per scope.
- The Selection Policy (CB-015) and the `selectKnowledge` behaviour remain internal —
  they are applied through `select`, never re-exported. The module's public export
  surface is unchanged.
- Item shape is trusted per the frozen CB-009 `CollectionResult`; the engine does not
  defensively re-validate items before selecting (they are re-validated once at
  `parseSelectionResult`).

## Alternatives Considered

### Synchronous `select(collectionResult): SelectionResult`

Honest about the absence of I/O. Rejected in favour of `async`: the frozen CB-013
documentation illustrates `await engine.select(...)`, the prompt directs mirroring
CB-010's async `collect`, and a uniform async stage operation composes cleanly in the
CB-017 async pipeline. A synchronous return is compatible with those docs (await
unwraps a non-promise), so this remains a low-stakes, reversible choice.

### Leave `excludedItems` in encounter order (filtered-out in collection order,
duplicates in canonical order)

Also deterministic, but mixes two orderings within one array. Rejected in favour of a
single, self-consistent canonical order using the comparator the policy already
defines. (At M3 filtering excludes nothing, so in practice `excludedItems` holds only
eliminated duplicates, already canonical — the choice is low-stakes today but keeps
the M5-filtering future clean.)

### Deduplicate before ordering

Rejected: the approved Exact Duplicate Definition retains the **first occurrence in
canonical order**, so ordering must precede elimination for "first" to be
well-defined and deterministic.

### Selected Option

A `select` method delegating to an internal stateless `selectKnowledge`, sequencing
filter → order (over a copy) → dedupe → CB-014 construction, with canonically-ordered
`excludedItems` and an async signature.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 135 passing across 11 files (unchanged: CB-016 adds **no** behaviour
  tests, per scope — those are CB-018; existing tests remain green).
- `npm run build` — passes; emits `dist/context-builder/selection/selectKnowledge.js`
  and the extended `createSelectionEngine`.
- Behaviour additionally exercised with a throwaway script (out-of-order items with an
  exact duplicate): `selectedItems` came back in canonical id order with the duplicate
  removed (first occurrence retained), the duplicate in `excludedItems`, metadata
  carried forward, output deeply frozen and identical across runs, and the input array
  untouched. Script removed after verification.

## Future Review

- Revisit at CB-017 when `build(request)` composes `collect` then `select`; confirm
  the async stage operation composes cleanly without further engine changes.
- Revisit at M5 when Context Profiles modulate evaluation/ordering — confirm execution
  needs no change because it only *applies* the policy.

## Related Documents

Architecture

- ARCH-001, PIPELINE-ARCHITECTURE.md (§Selection, §Deterministic Ordering,
  §Knowledge Identity, §Deterministic Behaviour, §Stage Operations)

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-009 (`CollectionResult`, consumed), CB-013 (Selection Engine boundary, extended
  here), CB-014 (`SelectionResult`, constructed), CB-015 (Selection Policy, applied),
  CB-016 (this task), CB-017 (integration, enabled by this task), CB-018 (behaviour
  tests, enabled by this task)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *An executor sequences decisions; it never re-decides.* When a
task's decision model already lives in a separate policy, the execution stage should
reduce to importing those decisions, sequencing them, and constructing the output
contract — adding no rule of its own. If the executor finds itself defining an
ordering, threshold or identity rule, that rule belongs in the policy, not the
executor. The one ordering the executor *may* choose is where the contract guarantees
none (here, `excludedItems`) — and even then it should reuse an existing policy
primitive rather than invent one, so the whole output stays deterministic without new
decision logic. Recorded as a recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-09 | 1.0     | Decision created |
