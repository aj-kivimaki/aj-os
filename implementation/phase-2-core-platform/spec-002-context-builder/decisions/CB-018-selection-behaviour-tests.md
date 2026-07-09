# Decision: CB-018 Selection Behaviour Tests

> **Task:** CB-018 — Selection Behaviour Tests
> **Date:** 2026-07-09
> **Status:** Accepted

---

## Context

CB-018 is Milestone M3's dedicated *validation* task: extend the permanent Vitest
suite (CB-006 foundation) to protect the deterministic Selection stage built in
CB-013…CB-017, and — per the frozen plan and the CB-017 reconciliation — become the
**permanent owner** of the `ContextBuilder.build(request)` pipeline regression suite
that replaced the retired builder-level `collect` suite.

M3 was implemented contract-first, but its per-task test split differs from M2:

- CB-014 shipped its **contract** suite (`selection-result.test.ts`).
- CB-013 (Selection Engine boundary), CB-015 (Selection Policy) and CB-016
  (`select` execution) each **deferred** their behaviour tests to CB-018 (recorded in
  those task docs and the CB-016 decision record).
- CB-017 retired the obsolete `context-builder-collection.test.ts` when
  `ContextBuilder.collect` was superseded by `build(request)`, and assigned the
  permanent `build` pipeline suite to CB-018.

So — unlike CB-012, which mostly consolidated already-shipped suites — CB-018 had to
**author** the Selection Engine, execution and pipeline behaviour suites, while still
avoiding re-authoring the CB-014 contract suite. A second constraint shaped the work:
the Selection Policy (CB-015) is **module-private** (comparators, predicates,
duplicate helpers are not exported), so its guarantees can only be validated through
the public API.

## Decision

1. **Author three behaviour suites; consolidate, do not recreate, the contract
   suite.** New files:
   - `selection.test.ts` — CB-013 Selection Engine **boundary** (no construction
     dependency, plain frozen handle exposing only `select`, stateless, deterministic
     construction).
   - `selection-execution.test.ts` — CB-016 `select` behaviour and the internal
     CB-015 policy, exercised **only** through `createSelectionEngine().select(...)`.
   - `context-builder-pipeline.test.ts` — CB-017 `build(request)` orchestration and
     end-to-end behaviour.
   The pre-existing `selection-result.test.ts` (CB-014) is **not** re-authored — that
   would duplicate coverage of a frozen contract (Composition Guardrail).

2. **Validate the Selection Policy through the public API, never by importing it.**
   Canonical ordering, filtering and duplicate elimination are all observable in the
   output of `select`/`build`. No comparator, predicate, duplicate helper or private
   function is imported, so the internal policy stays free to evolve (e.g. M5 profile
   comparators prepended ahead of the terminal `compareById`).

3. **Prove pipeline orchestration by equality with a manual composition.**
   `build(request)` is asserted to deep-equal `select(collect(request))` over the same
   registry. This proves the Context Builder is a thin orchestrator that adds no
   behaviour, **without** re-testing any engine internal. Engine-level collection
   behaviour (provider execution, partial collection, deterministic error ordering)
   stays owned by the CB-010 suite (`collection-execution.test.ts`).

4. **Assert the honest M3 filtering behaviour.** At M3 every contract-valid
   KnowledgeItem is eligible (non-empty content), and an empty-content item is
   unreachable through the `KnowledgeItem` contract, so filtering-out is not observable
   through the public surface. The suite asserts what *is* true and reachable — every
   well-formed item is retained — and documents why, rather than fabricating an
   unreachable filtered-out case or reaching past the contract.

5. **Prove input immutability by divergence.** Feeding an out-of-canonical-order
   `CollectionResult` and asserting the input array stays unordered while the output is
   sorted proves `select` sorts a copy — a stronger guarantee than `Object.isFrozen`
   alone.

6. **No platform behaviour and no contract change.** CB-018 introduces only tests and
   documentation. CB-002…CB-017 remain frozen.

## Rejected alternatives

- **Re-author the CB-014 contract suite inside CB-018.** Produces duplicate coverage
  of a frozen contract; contradicts the "do not duplicate" guardrail. Contract
  conformance is instead re-asserted lightly through `select` output (schema
  round-trip, key set, no priority field), not by re-testing `parseSelectionResult`.
- **Import the policy comparators/predicates and unit-test them directly.** Forbidden
  by the task ("do not test comparator implementation details / policy internals") and
  would couple the permanent suite to internal structure the architecture keeps free
  to evolve.
- **Re-test provider execution / registry ordering through `build`.** Would duplicate
  the CB-010 suite through a different entry point. Asserting `build` equals the manual
  two-engine composition is the minimal, non-duplicative way to prove orchestration.
- **Construct an empty-content item to force a filtered-out case.** Impossible through
  the public contract (the `KnowledgeItem` schema rejects it) and would misrepresent
  M3 selection, which filters nothing on eligibility grounds.

## Consequences

- The full suite grew from 123 to 160 tests across 13 files; `npm test`,
  `npm run typecheck` and `npm run build` all pass.
- Every M3 Selection behaviour — engine boundary, deterministic canonical ordering,
  filtering, exact-duplicate elimination and routing, metadata and identity
  preservation, input immutability, deep immutability, determinism, and the end-to-end
  `build(request)` pipeline — is protected by permanent, public-API-only, deterministic
  tests.
- The `build(request)` pipeline regression suite retired in CB-017 is restored and
  extended, now permanently owned by CB-018.
- Milestone M3 satisfies its Definition of Done and is ready for the separate Freeze
  Review.

## Reusable engineering principle

> **A dedicated validation task authors the behaviour suites its milestone deferred to
> it and consolidates the ones already shipped — and it validates internal policy only
> through the public surface it feeds.** When comparators/predicates are module-private,
> their guarantees (ordering, filtering, deduplication) are asserted as the observable
> output of the public entry point, leaving the implementation free to evolve; and an
> orchestrator is proved thin by asserting its output equals a manual composition of the
> stages, never by re-testing the stages through it.

_This principle is recorded here only; no AJS standard is modified._
