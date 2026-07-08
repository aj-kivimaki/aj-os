# Decision: CB-007 Collection Engine Service Boundary

> **Task:** CB-007 — Establish Collection Engine Service
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-007 opens Milestone M2 (Knowledge Collection) by establishing the **Collection
Engine** — the platform service that will coordinate deterministic knowledge
collection. This task establishes **only the service boundary**:

```text
ProviderRegistry → createCollectionEngine → immutable service handle
```

The engine is **constructed with** the Provider Registry (CB-005), which it
**holds but does not execute**. The task explicitly excludes provider execution,
`CollectionResult`, `CollectionError`, error handling, ranking and Context Package
generation, and forbids placeholder implementations and speculative abstractions.
Behaviour (provider execution) arrives in CB-010, after the CB-008 error contract
and CB-009 result contract exist (contract-first ordering).

The task's suggested layout was `collection/{createCollectionEngine.ts, index.ts}`
and permits organisation to "evolve if implementation reveals a better
organization." A few shape choices were open and are recorded here.

## Decision

1. **Layout mirrors the factory-service precedent (CB-005), not the data-contract
   precedent.** New `src/context-builder/collection/` with
   `createCollectionEngine.ts` (the `CollectionEngine` interface **and** its
   factory, co-located) and `index.ts` (barrel). **No `schema.ts`** — the engine
   composes the CB-005 `ProviderRegistry` and introduces no new *data* contract.

2. **The handle exposes the held registry.** `CollectionEngine = { registry }`,
   a single `readonly registry: ProviderRegistry`. This makes the acceptance
   criterion "accepts and holds the registry" directly observable and testable,
   mirroring `ContextBuilder` exposing `config` and `ProviderRegistry` exposing
   `providers`. No `collect()` method (or any other member) is added — that would
   be a placeholder for behaviour owned by CB-010.

3. **Fail-fast construction.** A `null`/`undefined` registry throws a plain
   `Error`; the service is rejected rather than built in a broken state, mirroring
   `createProviderRegistry()`. This is construction-input validation, not business
   logic. The already-immutable registry is **not** re-validated or copied — the
   engine holds the same reference.

4. **Immutable, stateless, deterministic.** The returned handle is
   `Object.freeze`d; the engine keeps no mutable runtime state; the same registry
   always yields the same public service.

5. **The registry is held, never executed.** CB-007 reads nothing from the
   registry and calls no provider. Tests enforce this with a provider fixture
   whose `provide()` throws.

## Rationale

- **Consistency.** The engine is a factory-created *service*; the closest
  precedent is `createProviderRegistry.ts`/`createContextBuilder.ts`, which
  co-locate interface + factory. Following it keeps the module coherent.
- **No empty ceremony.** `schema.ts` exists in sibling modules that declare Zod
  *data* schemas. The engine declares none, so a `schema.ts` would be an empty
  file — surface without meaning (the CB-005 principle, carried forward).
- **Observable boundaries.** Exposing the held `registry` lets the boundary be
  proven by tests without adding behaviour — a boundary-only task stays valuable
  by being verifiable, not by shipping stubs.
- **Minimal API.** A single `registry` member fully covers "hold the registry."
  Anything more (a `collect()` stub, provider accessors) is speculative and owned
  by later tasks.

## Consequences

- CB-010 adds provider execution as a method on `CollectionEngine`, consuming the
  held `registry` and returning a `CollectionResult` (CB-009) that aggregates
  KnowledgeItems and CollectionErrors (CB-008) — **extending** this contract
  without changing the established boundary.
- Because the engine holds the registry reference (immutable) rather than copying
  it, execution in CB-010 iterates `registry.providers` in the registry's
  deterministic order with no additional plumbing.

## Alternatives Considered

### Option A — Opaque handle (`CollectionEngine = {}`), registry captured in closure

Description: hold the registry privately in the factory closure; expose nothing.

Pros

- Hides an implementation detail until execution needs it.

Cons

- "Accepts and holds the registry" becomes unobservable — only indirectly
  testable once CB-010 exists. Weakens the boundary this task exists to prove.

Rejected: a boundary task should be verifiable now.

### Option B — Expose `readonly registry` (selected)

Description: co-locate interface + factory; expose the held registry on a frozen
handle; fail-fast on a missing registry.

Pros

- Consistent with `ContextBuilder`/`ProviderRegistry`; boundary is testable now;
  no stubs; CB-010 extends it cleanly.

Cons

- Exposes a member some might consider internal — but it is the injected input,
  not internal state, and is already immutable.

### Selected Option

Option B.

## Other alternatives

- **Adding a `collect()` placeholder** — explicitly forbidden ("no placeholder
  implementations"); it would be a stub for CB-010 behaviour. Rejected.
- **Re-validating / cloning the registry** — the registry is already validated and
  frozen by its own factory; re-validation is duplicated logic and cloning breaks
  reference identity. Rejected; hold the reference.
- **A `collection/schema.ts`** — no new data contract exists. Rejected (CB-005
  precedent).

## Validation

- `npm run typecheck` — passes.
- `npm test` — 71 passing across 6 files, including new
  `tests/context-builder/collection.test.ts` (construction, registry injection,
  held-not-executed, determinism, immutability).
- `npm run build` — passes.

## Future Review

- Revisit at CB-010 when provider execution is added to the engine; confirm the
  execution method extends this contract without altering the established
  boundary.

## Related Documents

Architecture

- ARCH-001

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-005 (ProviderRegistry, injected here), CB-007 (this task), CB-008 (error
  contract), CB-009 (result contract), CB-010 (provider execution, extends this
  service)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *A boundary-only task earns its keep by being observable.*
When a task establishes a seam with no behaviour, expose the injected dependency
(here, the held registry) so the "accepts and holds" contract is provable by
tests today — rather than an opaque handle that can only be verified once
behaviour lands. Pair it with a fixture that throws on execution, so "held, not
executed" is enforced by the suite, not merely by intent. Recorded as a
recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-08 | 1.0     | Decision created |
