# SPEC-002 Milestone 3 — Retrospective

> **Milestone:** M3 — Knowledge Selection (CB-013 → CB-018)
> **Outcome:** PASS WITH MINOR CORRECTIONS — documentation synchronized during the
> freeze review; ready to freeze (freeze decision reviewer-owned).
> **Date:** 2026-07-09
>
> Milestone retrospectives **accumulate**. This document is the Milestone 3
> retrospective; the Milestone 1 and Milestone 2 retrospectives are preserved
> separately in `RETROSPECTIVE.md` and `RETROSPECTIVE-M2.md`.

---

## Summary

Milestone 3 delivered the Context Builder's second platform *behaviour*:
deterministic knowledge selection over the immutable `CollectionResult`. On the
frozen M1/M2 foundation it added the Selection Engine service boundary (CB-013),
the SelectionResult contract (CB-014), the executable deterministic Selection
Policy (CB-015), selection execution — `SelectionEngine.select` (CB-016), the
Context Builder pipeline extension and public entry-point reconciliation —
`ContextBuilder.build(request)` (CB-017), and the permanent Selection behaviour and
`build()` pipeline tests (CB-018). The suite grew from 119 → 160 tests across 13
files.

The Context Builder now runs Collection → Selection end-to-end through a single
public entry point, `build(request)`, which composes both owned engines once at
construction, invokes `CollectionEngine.collect(request)` then
`SelectionEngine.select(collectionResult)`, and returns the immutable
`SelectionResult` unchanged. Selection filters to eligible items, orders them into
a canonical deterministic sequence via a comparator chain terminating in an
immutable identifier, and eliminates exact duplicates — routing removed items to
`excludedItems`. No assembly, profiles, explainability or ranking heuristics were
implemented — by design.

The one platform-surface change was the approved public API evolution
`ContextBuilder.collect` → `build(request)`, pre-approved during the Milestone 3
planning freeze and reconciled in CB-017. No frozen Milestone 1 or Milestone 2
platform contract was modified: CollectionResult, the Collection Engine, the
Provider Registry, and the configuration contract are unchanged, and the Milestone
2 collection behaviour is preserved as the internal `CollectionEngine.collect`
stage operation.

Validation at freeze review: `npm run typecheck`, `npm run build`, and `npm test`
(160 passing across 13 files) all green.

---

## What worked well

- **Contract-first held for the third milestone running.** CB-014 reified the
  SelectionResult contract before any execution existed (CB-016), so `select`
  populated a pre-existing, frozen contract instead of redesigning one — the same
  discipline that kept M1 and M2 small.
- **Ordering as the contract, not a priority field.** SelectionResult exposes no
  explicit priority/score/rank. Making the canonical ordering of `selectedItems`
  the public guarantee kept the contract minimal and left the policy free to evolve
  (e.g. M5 profile comparators) without a contract change.
- **A single public entry point that always runs the highest-level pipeline.**
  `build(request)` means adding the Selection stage — and, later, Assembly — never
  churns the public surface: callers always invoke `build`, and the return type
  advances (SelectionResult now, ContextPackage at M4) as stages land.
- **Policy validated only through the public API.** The Selection Policy
  (comparators, predicates, duplicate helpers) is module-private; every guarantee —
  canonical ordering, filtering, duplicate elimination — is observable in the output
  of `select`/`build`, so no test imports an internal, and the implementation stays
  free to change.
- **Prove thin orchestration by equality with a manual composition.** Asserting
  `build(request)` deep-equals `select(collect(request))` over the same registry
  proves the Context Builder re-decides nothing; any future drift (the builder
  filtering, reordering or enriching) fails immediately.
- **Scope discipline held again.** Selection is profile-agnostic at M3; no assembly,
  explainability or ranking heuristic leaked in. The stated over-engineering risk did
  not materialise.

## What surprised us

- **The dedicated test task had to *author*, not just consolidate.** Unlike CB-012
  (where CB-007…CB-010 each shipped per-task tests, so CB-012 mostly consolidated),
  the M3 contract-first tasks split differently: CB-014 shipped its contract suite,
  but CB-013 (engine boundary), CB-015 (policy) and CB-016 (execution) deferred their
  behaviour tests to CB-018. CB-018 therefore authored those deferred suites while
  still avoiding re-authoring the CB-014 contract suite. Same "do not duplicate"
  guardrail, materially larger task.
- **A pre-approved API evolution is calmer than an emergent one.** M2's factory
  signature change (CB-011) surfaced mid-implementation and had to be justified on
  the spot. M3's `collect` → `build` evolution was resolved during planning and
  merely *executed* in CB-017 — the same class of change, far less friction, because
  the reconciliation (including the retired regression suite) was decided before code.

## Engineering discoveries

- **Input immutability is best proven by divergence, not just `Object.isFrozen`.**
  Feeding an out-of-canonical-order `CollectionResult` and asserting the input array
  stays unordered while the output is sorted proves `select` copies before sorting —
  a stronger guarantee than a frozen-check alone.
- **`excludedItems` needs deterministic order even without a contractual guarantee.**
  The contract orders only `selectedItems`; leaving `excludedItems` unordered would
  still make the *output* non-deterministic run-to-run. Ordering it with the same
  policy comparator keeps the whole result reproducible without over-promising in the
  contract.
- **Retiring a public method is a regression-strategy decision, not a deletion.**
  Removing `ContextBuilder.collect` meant explicitly re-homing its coverage: engine-
  level collection stays owned by the CB-010 suite, and the `build()` pipeline suite
  moves to CB-018. The obsolete builder-level suite was retired with no coverage lost
  — recorded before the file was deleted.

## Process improvements

- **Top-level repository docs drifted again — the M1/M2 recurrence.** The spec-package
  documentation set (package README, MILESTONES, module README header, architecture)
  was kept synchronized per task, but the repository-level `README.md`, `ROADMAP.md`
  and `CHANGELOG.md` still described M3 as "next" at the freeze review, and
  `tests/context-builder/README.md` still described the M1-era 5-file suite. This is
  exactly the drift the M1 and M2 retrospectives flagged. **Recommendation:** make
  "repository-level README / ROADMAP / CHANGELOG and `tests/` README reflect the
  completed milestone" an explicit line in the freeze-review documentation-sync
  checklist (it currently enumerates only the spec-package docs), so repo-root sync is
  a named freeze gate rather than an assumed one. Corrections R1–R6 were applied during
  this freeze review.
- **The module README is a long, accreted task-by-task narrative.** Its per-task
  history is valuable, but appended status prose produced a self-contradiction ("M3 is
  under way" alongside "completes Milestone M3") and a stale test-tree reference to the
  retired `context-builder-collection.test.ts`. Both were corrected here. A future
  milestone may benefit from a light consolidation pass that separates the durable
  "current state" section from the historical per-task log.

## Reusable engineering principles

1. **A single public entry point that always runs the highest-level implemented
   pipeline lets the pipeline grow without churning the public surface.** Stage
   operations live on their engines; only the top-level entry point is public. (CB-017)
2. **Make ordering the contract, not a priority field.** A canonical deterministic
   sequence is a stronger, smaller guarantee than an exposed score. (CB-014/CB-015)
3. **Validate internal policy through the public surface**, never by importing it, so
   the implementation stays free to evolve. (CB-018)
4. **Prove thin orchestration by equality with a manual stage composition.** (CB-018)
5. **Prove input immutability by divergence** (out-of-order input, sorted output),
   not by a frozen-check alone. (CB-018)
6. **Decide regression re-homing before retiring a public method**, and record it, so
   no coverage silently disappears with the deleted suite. (CB-017)

## Deferred improvements (recommended future tasks)

1. Extract a single internal deep-freeze / `DeepReadonly` utility. `deepFreeze` is now
   duplicated across `package/`, `providers/`, `collection/errors/`,
   `collection/result/` and `selection/`, and `DeepReadonly` is imported cross-module
   from `package/types.ts`. Carried from M1/M2 — recommend an early internal
   `context-builder/internal/immutable.ts` cleanup task in a future milestone.
   (Deferred; not a freeze blocker.)
2. Single source for the Context Builder version (identity constant vs package
   `contextBuilderVersion`). Carried from M1/M2 — revisit when assembly lands (M4).
   (Deferred.)
3. **Where should Context Profiles influence selection?** Deferred to M5 by design.
   Selection at M3 is profile-agnostic; the comparator chain is built so a future
   profile can modulate it without changing the SelectionResult contract or the
   `build(request)` entry point.
4. Two frozen M1 documents (`tasks/CB-001.md`,
   `decisions/CB-001-scaffold-scope.md`) still list a speculative `collector/`
   subfolder in their M1-era scaffold examples. Left untouched to preserve frozen M1
   history. Carried from M2. (Recorded, not actioned.)
5. Light consolidation of the module README into a durable "current state" section
   plus a historical per-task log (see Process improvements). (Deferred; optional.)

## Freeze corrections applied

Documentation and process artifacts only — no implementation, no platform contract,
no architecture, no test *behaviour* changed:

- **R1 — CHANGELOG.md:** added the Milestone 3 `Added` entry (CB-013…CB-018) and the
  `ContextBuilder.collect` → `build(request)` public API evolution under `Changed`.
- **R2 — README.md (repository):** added the Milestone 3 task list and completion
  status; updated the trailing summary to "M3 complete; next is Milestone 4 — Context
  Assembly."
- **R3 — ROADMAP.md (repository):** added the Milestone 3 task list and completion
  status; updated the trailing sentence to reflect M3 complete and M4 next.
- **R4 — module README (`src/context-builder/README.md`):** corrected the contradictory
  Status wording ("Milestone M3 is under way" → "is complete").
- **R5 — module README:** annotated the retired `context-builder-collection.test.ts`
  in the CB-012 test tree and added a retirement note; past-tensed the accompanying
  `ContextBuilder.collect` delegation sentence.
- **R6 — `tests/context-builder/README.md`:** refreshed to reflect the current
  permanent suite (160 tests / 13 files) across contracts, collection behaviour and
  selection behaviour, and the retired collect suite.
- This Milestone 3 retrospective created (accumulating, not overwriting M1's or M2's).

`Code reviewed` and `Changes committed` remain reviewer-owned and are intentionally
left open until the milestone is frozen.
