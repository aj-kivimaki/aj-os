# Decision: CB-013 Selection Engine Service Boundary

> **Task:** CB-013 — Establish Selection Engine Service
> **Date:** 2026-07-09
> **Status:** Accepted

---

## Context

CB-013 opens Milestone M3 (Knowledge Selection) by establishing the **Selection
Engine** — the platform service that will perform deterministic knowledge
selection, transforming a `CollectionResult` (CB-009) into a future
SelectionResult (CB-014). This task establishes **only the service boundary**:

```text
createSelectionEngine → immutable service handle
```

The task explicitly excludes SelectionResult, selection rules, selection
execution, prioritization, filtering, duplicate elimination, Context Builder
integration and behaviour tests, and forbids placeholder methods and invented
future APIs. The stage operation the engine will expose, `select(collectionResult)`,
arrives with its behaviour in CB-016 — mirroring how the Collection Engine boundary
(CB-007) preceded `collect` (CB-010).

The precedent is CB-007. The one material difference from that precedent drove the
open shape choices recorded here.

## Decision

1. **Layout mirrors the CB-007 factory-service precedent.** New
   `src/context-builder/selection/` with `createSelectionEngine.ts` (the
   `SelectionEngine` interface **and** its factory, co-located) and `index.ts`
   (barrel). **No `schema.ts`** — the engine introduces no new *data* contract
   (SelectionResult is CB-014).

2. **The factory takes no arguments.** `createSelectionEngine(): SelectionEngine`.
   Unlike the Collection Engine — constructed with the Provider Registry it holds
   and later executes — the Selection Engine has **no construction-time
   dependency**. Its only input, the `CollectionResult`, arrives as the future
   `select(collectionResult)` argument (CB-016), and its Selection Policy arrives
   in CB-015. There is genuinely nothing to inject at CB-013.

3. **The handle is an empty, frozen boundary.** `SelectionEngine = {}` — the
   interface exposes no members and `createSelectionEngine` returns
   `Object.freeze({})`. No `select()` method (or any other member) is added — that
   would be a placeholder for behaviour owned by CB-016, which the task forbids.

4. **Immutable, stateless, deterministic.** The returned handle is
   `Object.freeze`d; the engine keeps no mutable runtime state; every call yields
   the same public service.

5. **Pipeline-independent.** The engine does not own the Collection Engine, the
   Provider Registry or any Knowledge Provider; it will communicate only through
   immutable platform contracts.

6. **No tests added.** The task scope lists exactly five deliverables (interface,
   factory, handle, exports, documentation) and explicitly excludes behaviour
   tests; acceptance requires only that *existing* tests remain green. A pure,
   memberless boundary has no behaviour to exercise — the boundary is first
   exercised by CB-016's `select` behaviour tests. The 119-test M2 suite is
   unchanged.

## Rationale

- **Consistency.** The engine is a factory-created *service*; the closest
  precedents are `createCollectionEngine.ts` / `createProviderRegistry.ts` /
  `createContextBuilder.ts`, which co-locate interface + factory. Following them
  keeps the module coherent.
- **No empty ceremony.** `schema.ts` exists only in sibling modules that declare
  Zod *data* schemas. The engine declares none (CB-005/CB-007 principle, carried
  forward).
- **Honest minimalism.** CB-007 exposed its held `registry` for observability, but
  the Selection Engine has no held dependency. Manufacturing an artificial member
  (or a `select()` stub) purely to be "observable" would be the placeholder the
  task forbids. An empty, frozen handle is the truthful minimal boundary; its
  members arrive with the behaviour that needs them.

## Consequences

- CB-014 defines the SelectionResult contract; CB-015 defines the deterministic
  Selection Policy (comparator chain); CB-016 adds `select(collectionResult)` as a
  method on `SelectionEngine`, consuming a `CollectionResult` and returning a
  `SelectionResult` — **extending** this contract without changing the established
  boundary. CB-017 integrates the engine into the Context Builder's
  `build(request)` pipeline entry point.
- Because the boundary starts empty rather than carrying a stub, no member has to
  be reshaped or removed when `select` lands — the seam only grows.

## Alternatives Considered

### Option A — Inject the future dependency now (e.g. a Selection Policy or CollectionResult)

Description: give `createSelectionEngine` a parameter to hold, mirroring CB-007's
held registry.

Pros

- Superficially symmetrical with the Collection Engine.

Cons

- The Selection Policy is CB-015 and the `CollectionResult` is a per-`select`
  runtime input, not a construction dependency. Injecting either now invents a
  future API and holds state the boundary does not need. Rejected.

### Option B — Empty, argument-free frozen boundary (selected)

Description: co-locate interface + factory; `createSelectionEngine()` takes no
arguments and returns `Object.freeze({})`; no members.

Pros

- Honest to the actual dependencies (none); no placeholder; no invented API;
  CB-014…CB-016 extend it cleanly; consistent factory-service pattern.

Cons

- The boundary is not independently "observable" the way CB-007's `registry` was —
  but there is nothing to observe yet, and construction/immutability are covered
  once `select` behaviour tests land in CB-016.

### Selected Option

Option B.

## Other alternatives

- **Adding a `select()` placeholder** — explicitly forbidden ("no placeholder
  methods", "do not invent future APIs"); it would be a stub for CB-016. Rejected.
- **A `selection/schema.ts`** — no new data contract exists (SelectionResult is
  CB-014). Rejected (CB-005/CB-007 precedent).
- **Adding a construction/immutability test now** — outside the task's five
  deliverables; the excluded-behaviour boundary is exercised by CB-016. Rejected
  to keep the task minimal.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 119 passing across 10 files (unchanged from Milestone 2; no tests
  added or modified).
- `npm run build` — passes; emits `dist/context-builder/selection/`.

## Future Review

- Revisit at CB-016 when `select(collectionResult)` is added to the engine;
  confirm the execution method extends this contract without altering the
  established boundary, and at CB-017 when the Context Builder composes the engine
  behind `build(request)`.

## Related Documents

Architecture

- ARCH-001, PIPELINE-ARCHITECTURE.md

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-007 (Collection Engine boundary precedent), CB-013 (this task), CB-014
  (SelectionResult contract), CB-015 (Selection Policy), CB-016 (selection
  execution, extends this service), CB-017 (Context Builder integration)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *A boundary-only task should hold exactly what it depends
on — which is sometimes nothing.* CB-007 taught "expose the injected dependency so
the boundary is observable"; CB-013 refines it: when a service has no
construction-time dependency, the correct boundary is genuinely empty. Do not
manufacture a member or a method stub to imitate a sibling service — an artificial
member is the very placeholder the discipline forbids, and it forces a reshape when
the real behaviour lands. Let the seam grow only when the behaviour that needs it
arrives. Recorded as a recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-09 | 1.0     | Decision created |
