# Decision: CB-012 Collection Behaviour Tests

> **Task:** CB-012 — Implement Collection Behaviour Tests
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-012 is Milestone M2's dedicated *validation* task: extend the permanent Vitest
suite (CB-006 foundation) to protect the deterministic partial-collection
behaviour built in CB-007…CB-011. Its scope enumerates coverage for the
Collection Engine, provider execution, the CollectionError and CollectionResult
contracts, partial collection, deterministic ordering and Context Builder
integration.

The milestone was implemented **contract-first**, and each of CB-007…CB-010
landed with its own per-task behaviour tests as it was built:

- `collection.test.ts` (CB-007 — engine service boundary)
- `collection-errors.test.ts` (CB-008 — CollectionError contract)
- `collection-result.test.ts` (CB-009 — CollectionResult contract)
- `collection-execution.test.ts` (CB-010 — provider execution & determinism)

So most of CB-012's enumerated coverage already existed and was green (105
tests). Two genuine gaps remained:

1. **Context Builder integration.** CB-011's worklog explicitly deferred its
   behaviour tests to CB-012; nothing exercised `ContextBuilder.collect`
   end-to-end (`factories.test.ts` only covers config and freezing).
2. **Deterministic error ordering.** `collection-execution.test.ts` proved that
   provider *completion* order is ignored for *item* ordering, but not for
   *error* ordering — an explicit CB-012 acceptance criterion.

This raised a scope decision: author the full enumerated suite from scratch, or
consolidate the existing per-task tests and add only the missing coverage.

## Decision

1. **Consolidate, do not recreate.** CB-012 closes the two remaining gaps and
   validates the whole suite; it does not re-author the CB-007…CB-010 behaviour
   tests. Reproducing them would violate the Composition Guardrail ("do not
   duplicate existing behaviour") while adding no protection.

2. **Add a Context Builder integration suite** — new
   `tests/context-builder/context-builder-collection.test.ts`. It exercises the
   integration seam through the public `createContextBuilder(config,
   registry).collect(request)` entry point only: delegation, the result returned
   **unchanged** (asserted equal to a standalone `createCollectionEngine` over the
   same registry — proving no filtering, ranking, deduplication or enrichment),
   items + errors integrated in one partial result, determinism under delayed
   completion, and deep immutability. Provider-execution mechanics are not
   re-tested here — they are owned by the CB-010 suite.

3. **Add deterministic error-ordering tests** to `collection-execution.test.ts`
   (CB-010's natural home) using delayed-**rejecting** fixtures, plus an
   interleaved items+errors ordering case. Delays only prove that completion order
   is *ignored*; nothing is asserted against a clock, preserving the "no
   timing-based assertions" rule.

4. **No platform behaviour and no contract change.** CB-012 introduces only tests
   and documentation. CB-002…CB-011 remain frozen.

## Rejected alternatives

- **Re-author every enumerated test in one CB-012 file.** Produces duplicate
  coverage of frozen contracts, contradicting the "do not duplicate" and "test
  the existing implementation exactly as it exists" guardrails, and creates two
  maintenance sites for the same guarantees.
- **Test `ContextBuilder.collect` by re-checking provider-execution details.**
  Would duplicate the CB-010 suite through a different entry point. Asserting the
  builder's result equals a standalone engine's is the minimal, non-duplicative
  way to prove "thin orchestration, returned unchanged".
- **Assert timing (e.g. that a delayed provider resolved later).** Forbidden by
  the design principles; determinism is proved structurally by ordering, not by
  the clock.

## Consequences

- The full M2 suite grew from 105 to 119 tests across 10 files; `npm test`,
  `npm run typecheck` and `npm run build` all pass.
- Every M2 behaviour — engine boundary, contracts, partial collection,
  deterministic item **and** error ordering, immutability, and the end-to-end
  Context Builder pipeline — is now protected by permanent, public-API-only,
  deterministic tests.
- Milestone M2 satisfies its Definition of Done and is ready for the separate
  Freeze Review.

## Reusable engineering principle

> **In a contract-first milestone, the dedicated test task consolidates and
> completes the suite — it does not recreate the per-task tests that shipped with
> each contract.** When behaviour is implemented incrementally with its own tests,
> the value of a final validation task is closing the *remaining* seams
> (integration points, and any ordering/immutability guarantee not yet asserted)
> and proving the whole suite green — not re-authoring existing coverage. And a
> contract that aggregates two ordered collections must have its ordering
> guarantee asserted for **each** collection independently: proving completion
> order is ignored for items does not prove it for errors.

_This principle is recorded here only; no AJS standard is modified._
