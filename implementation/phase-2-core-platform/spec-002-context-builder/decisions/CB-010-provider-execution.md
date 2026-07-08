# Decision: CB-010 Provider Execution

> **Task:** CB-010 — Implement Provider Execution
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-010 introduces the first *runtime behaviour* of the Collection Engine (CB-007).
Providers registered in the Provider Registry (CB-005) must be executed against a
single `KnowledgeRequest` (CB-004); successful providers contribute
`KnowledgeItem`s and failing providers contribute `CollectionError`s (CB-008),
assembled into an immutable `CollectionResult` (CB-009) under the
**partial-collection** model.

The task explicitly reuses the frozen CB-004/005/008/009 contracts and forbids a
new error contract, retry, recovery, logging, error policy, ranking, filtering,
duplicate handling, Context Builder integration and Context Package generation.
Several shape choices were open and are recorded here.

## Decision

1. **Execution is a method on the existing `CollectionEngine`.** `collect(request):
   Promise<CollectionResult>` is added to the CB-007 handle, exactly the extension
   the accepted CB-007 decision anticipated ("CB-010 adds provider execution as a
   method on `CollectionEngine`… extending this contract without changing the
   established boundary"). This is **additive** — no existing member or signature
   changed — so it is not a frozen-contract change requiring re-review.

2. **Execution logic lives in an internal, stateless function.** A new
   `collection/collectKnowledge.ts` holds `collectKnowledge(registry, request)`;
   the engine's `collect` merely closes over the held registry and delegates. The
   engine keeps **no** mutable state — `collect` is a pure function of registry +
   request. No `schema.ts` is added (no new data contract; execution composes
   existing contracts), mirroring the CB-005/CB-007 factory-service precedent.

3. **Concurrent execution, registry-authoritative ordering.** Providers run
   concurrently via `Promise.all`, which preserves *input* (registry) order in its
   resolved array regardless of *completion* timing. Outcomes are aggregated in
   registry order, so provider completion order never influences the result. Each
   provider's `provide()` is wrapped in its own `try/catch` inside the mapped async
   function, keeping the provider paired with its outcome (and avoiding
   `noUncheckedIndexedAccess` index lookups).

4. **A failure is a rejected promise, mapped to `provider-error`.** At execution
   time the engine sees only an opaque rejection; it cannot deterministically
   distinguish `invalid-request` from `provider-unavailable`, so every rejection
   maps to the provider-agnostic catch-all `category: "provider-error"`. The error
   `id` is `collection-error:<providerId>` — unique (registry ids are unique) and
   stable across runs. The `message` is the rejection's message text (or a fixed
   fallback), never a stack trace or runtime object.

5. **Construct through the CB-009 contract.** The assembled `{ metadata, items,
   errors }` is built with `parseCollectionResult`, which validates and
   deep-freezes it. Immutability and contract-conformance come for free, and the
   output cannot drift from the contract. `metadata` is the request itself
   (provenance), matching CB-009.

6. **A provider that finds nothing is not a failure.** It contributes an empty
   item set; only a rejection yields a `CollectionError` (CB-008 semantics).

## Rationale

- **Anticipated seam.** CB-007 deliberately exposed the held registry so execution
  could be added here without reshaping the boundary. Adding `collect` honours
  that plan rather than inventing a new surface.
- **Determinism without sorting.** Relying on `Promise.all` input-order preservation
  makes ordering deterministic by construction; no timestamps, indices or sort keys
  are needed, and no execution metadata leaks into the contract.
- **Faithful partial collection.** Per-provider `try/catch` guarantees one
  provider's failure can never abort the others; failures are represented purely as
  data, never re-thrown once collection has begun.
- **No speculative classification.** Mapping every rejection to `provider-error`
  avoids guessing categories the engine cannot know. Finer classification belongs
  to providers that can classify their own failures — a later concern.

## Consequences

- CB-011 can integrate the Context Builder collection pipeline directly on top of
  `engine.collect(request)` without further engine changes.
- One CB-007 test assertion (`Object.keys(engine)` is exactly `["registry"]`)
  encoded "no behaviour yet"; it was updated to assert the registry is held **and**
  `collect` is a function. This is a test scope-guard, not a public contract.
- Provider output is trusted per the CB-004 `provide()` type (`readonly
  KnowledgeItem[]`). The engine does not defensively re-validate item shape; a
  provider that violates its static type is a programming error, out of scope for
  partial collection.

## Alternatives Considered

### Option A — `Promise.allSettled` with index-based aggregation

Walk `settled[i]` against `providers[i]`. Rejected: under
`noUncheckedIndexedAccess` both accesses are `T | undefined`, forcing non-null
noise; pairing provider+outcome inside the map is cleaner and equally
order-preserving.

### Option B — Sequential `await` in a loop

Deterministic, but serialises independent I/O for no benefit. Rejected in favour
of concurrent execution with order-preserving aggregation.

### Option C — Infer richer failure categories from the thrown error

Rejected: non-deterministic guessing from arbitrary rejection shapes; the engine
has no reliable signal. `provider-error` is the honest, deterministic mapping.

### Selected Option

A method (`collect`) delegating to an internal stateless `collectKnowledge`, with
concurrent execution, registry-order aggregation, `provider-error` mapping, and
CB-009 construction.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 105 passing across 9 files, including the new
  `tests/context-builder/collection-execution.test.ts` (success aggregation,
  partial collection, completion-order independence, determinism, immutability).
- `npm run build` — passes.

## Future Review

- Revisit at CB-011 when the Context Builder consumes `engine.collect`; confirm the
  method composes cleanly without further engine changes.

## Related Documents

Architecture

- ARCH-001

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002 (§7 Inputs, §15 Error Handling)

Implementation Tasks

- CB-004 (KnowledgeProvider/KnowledgeItem/KnowledgeRequest), CB-005
  (ProviderRegistry), CB-007 (CollectionEngine, extended here), CB-008
  (CollectionError), CB-009 (CollectionResult), CB-010 (this task), CB-011
  (integration, enabled by this task)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *Get determinism from the execution primitive, not from
post-hoc sorting.* When fanning out concurrent work whose output order must be
stable, rely on the primitive that already preserves input order (`Promise.all` /
`Promise.allSettled` resolve in input order regardless of completion timing) and
aggregate in that order — instead of collecting-then-sorting or stamping ordering
metadata. The result is deterministic by construction, needs no ordering field in
the contract, and keeps completion timing out of the output. Recorded as a
recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-08 | 1.0     | Decision created |
