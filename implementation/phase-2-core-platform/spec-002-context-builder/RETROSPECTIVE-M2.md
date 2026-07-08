# SPEC-002 Milestone 2 — Retrospective

> **Milestone:** M2 — Knowledge Collection (CB-007 → CB-012)
> **Outcome:** PASS WITH MINOR CORRECTIONS — frozen after documentation/process corrections.
> **Date:** 2026-07-08
>
> Milestone retrospectives **accumulate**. This document is the Milestone 2
> retrospective; the Milestone 1 retrospective is preserved separately in
> `RETROSPECTIVE.md`.

---

## Summary

Milestone 2 delivered the Context Builder's first platform *behaviour*:
deterministic, partial knowledge collection. On the frozen M1 foundation it added
the Collection Engine service boundary (CB-007), the CollectionError contract
(CB-008), the CollectionResult contract (CB-009), deterministic partial provider
execution (CB-010), the end-to-end Context Builder collection pipeline (CB-011),
and the permanent collection behaviour tests (CB-012). The suite grew from 63 → 119
tests.

The Context Builder now collects knowledge end-to-end: `ContextBuilder.collect`
composes and owns a Collection Engine built from an injected Provider Registry,
executes providers concurrently in registry-authoritative order, and returns an
immutable `CollectionResult` aggregating both KnowledgeItems and CollectionErrors.
No ranking, selection, assembly, profiles or explainability behaviour was
implemented — by design.

Validation at freeze: `npm run typecheck`, `npm run build`, and `npm test`
(119 passing across 10 files) all green.

---

## What worked well

- **Contract-first, behaviour-later — reordered mid-planning.** The M2 planning
  correction that sequenced the tasks Error contract → Result contract → Execution
  → Integration → Tests (CB-008 before CB-009 before CB-010) meant every behaviour
  task populated a *pre-existing, frozen* contract instead of redesigning one.
- **Compose contracts; never redefine them.** `CollectionResult.metadata` reuses
  `knowledgeRequestSchema` wholesale, and `items`/`errors` compose the CB-004 /
  CB-008 schemas unchanged — the result contract cannot drift from the inputs it
  aggregates.
- **Failures as data, not exceptions.** Modelling a failure as a validated, frozen
  `CollectionError` POJO (not an `Error` subclass) is exactly what lets errors
  travel *beside* items under the partial-collection model.
- **Determinism by construction.** Concurrent `Promise.all` execution with
  aggregation in registry-index order makes provider *completion* order provably
  irrelevant — no sorting, no clock, no timing assertions.
- **Construct-through-contract.** Building the output with `parseCollectionResult`
  reuses the CB-009 contract as its own constructor: validation and deep-freeze
  come free and the output cannot drift.
- **Guardrails were executable.** The "returned unchanged" (result equals a
  standalone engine) and "does not deduplicate" tests encode the thin-orchestration
  boundary as regression protection, not prose.
- **Scope discipline held.** No ranking/selection/assembly leaked in; the stated
  over-engineering risk did not materialise.

## What surprised us

- **A frozen factory signature legitimately had to evolve.** CB-011 could not give
  a single immutable handle ownership of the engine and an unconditional,
  request-only `collect` without injecting the registry at construction. Every
  additive workaround (second factory, staged builder, call-time registry, optional
  injection) fragmented the public API into conditional or hidden behaviour. The
  smallest *coherent* change — a required second constructor parameter — was
  superior to protecting the letter of the frozen contract.
- **The dedicated test task consolidates, it does not recreate.** Because CB-007…
  CB-010 each shipped their own behaviour tests, CB-012's real value was closing the
  two *remaining* gaps (the CB-011 integration seam and deterministic *error*
  ordering) rather than re-authoring enumerated coverage — reproducing it would have
  violated the "do not duplicate" guardrail.

## Engineering discoveries

- **Determinism must be proved for every ordered collection independently.** The
  suite proved completion order was ignored for *items* but not yet for *errors*; a
  contract aggregating two ordered collections needs the ordering guarantee asserted
  for both. Delayed-*rejecting* fixtures prove it without timing assertions.
- **The engine sees only opaque rejections.** At execution time a failure is just a
  rejected promise, so every rejection maps to the provider-agnostic catch-all
  `provider-error`; finer classification belongs to providers that can classify
  their own failures, not the engine.
- **Empty is not an error.** A provider that finds nothing contributes an empty item
  set, not a `CollectionError` — encoding this in the contract docs kept execution
  (CB-010) from conflating the two.

## Process improvements (adopted during this freeze)

- **Documentation-synchronization is now a milestone Definition-of-Done gate.** The
  module README drifted (stale "in progress" status; a milestone/focus table that
  mislabelled M2–M4) — the same class of drift flagged in the M1 retrospective. The
  freeze workflow (`SPEC-FREEZE-REVIEW.md` Step 6 + Freeze Decision) now carries an
  explicit checklist (package README, module README, MILESTONES, retrospective,
  decision records, synchronized status tables) so this cannot recur.
- **MILESTONES.md is the roadmap of record.** There is no separate `ROADMAP.md`;
  the freeze-review documentation was corrected to reference MILESTONES.md so future
  freeze reviews do not chase a non-existent document.
- **Milestone retrospectives accumulate.** M2's retrospective is a new file rather
  than an overwrite of M1's, preserving milestone-by-milestone history.

## Reusable engineering principles

1. **Own a construction-time collaborator ⇒ the constructing factory must receive
   it.** Routing a required dependency through a second factory, a staged method or
   optional injection trades a coherent public API for the letter of a frozen
   contract. Prefer the smallest *coherent* change and surface it as a reviewed
   contract evolution before writing code. (CB-011)
2. **Represent failures as validated, frozen data, not exceptions** — the
   prerequisite for partial collection. (CB-008/CB-010)
3. **Construct-through-contract** — build outputs via the contract's own
   parse-and-freeze so they cannot drift. (CB-010)
4. **Prove determinism per ordered collection independently**, using delayed-
   settling fixtures rather than clock assertions. (CB-012)
5. **In a contract-first milestone, the dedicated test task consolidates rather
   than recreates.** (CB-012)

## Deferred improvements (recommended future tasks)

1. Extract a single internal deep-freeze / `DeepReadonly` utility. `deepFreeze` is
   now duplicated across `package/`, `providers/`, `collection/errors/` and
   `collection/result/`, and `DeepReadonly` is imported cross-module from
   `package/types.ts`. Carried over from M1 — recommend an early internal
   `context-builder/internal/immutable.ts` cleanup task in a future milestone.
   (Deferred; not a freeze blocker.)
2. Single source for the Context Builder version (identity constant vs package
   `contextBuilderVersion`). Carried over from M1 — revisit when assembly lands
   (M4). (Deferred.)
3. Two frozen M1 documents (`tasks/CB-001.md`, `decisions/CB-001-scaffold-scope.md`)
   still list a speculative `collector/` subfolder in their M1-era scaffold
   examples. Left untouched to preserve frozen M1 history; the live module README
   was corrected to `collection/`. (Recorded, not actioned.)

## Freeze corrections applied

Documentation/process only — no code behaviour, tests (beyond one code comment),
contracts, architecture or milestone plan changed:

- Module README: corrected status ("in progress" → complete) and the
  milestone/focus table (M2 Knowledge Collection, M3 Knowledge Selection,
  M4 Context Assembly); `collector/` → `collection/`.
- `collectKnowledge.ts`: corrected a stale `Promise.allSettled` code comment to
  match the `Promise.all` implementation (comment only).
- `SPEC-FREEZE-REVIEW.md`: MILESTONES.md designated the roadmap of record; added
  the documentation-synchronization Definition-of-Done checklist.
- This Milestone 2 retrospective created (accumulating, not overwriting M1's).
