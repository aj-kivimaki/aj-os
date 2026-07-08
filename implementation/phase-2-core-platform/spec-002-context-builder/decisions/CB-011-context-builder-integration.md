# Decision: CB-011 Context Builder Integration

> **Task:** CB-011 — Integrate Context Builder Collection Pipeline
> **Date:** 2026-07-08
> **Status:** Accepted (approved architectural evolution)

---

## Context

CB-011 integrates the first end-to-end collection pipeline. Per the task's
Integration Point, the Context Builder must **compose** a Collection Engine
(`createCollectionEngine(registry)`), **own** that engine, and expose a
`collect(request)` entry point that returns the engine's `CollectionResult`
unchanged. The entry point receives a `KnowledgeRequest` only — the registry is
not passed to `collect`.

The frozen CB-002 factory was `createContextBuilder(config)`, with a
`ContextBuilder` interface exposing only `readonly config`. There was no seam to
supply a registry, so satisfying CB-011 appeared to require changing a frozen
public contract. Under the Implementation Guardrail this was raised as an
architectural review **before** any code was written.

## Decision

1. **The Context Builder is the single public orchestration service.** It composes
   and owns the Collection Engine; it does not introduce a parallel orchestration
   service, a second factory, staged construction, optional injection or
   conditional `collect` behaviour (all explicitly rejected).

2. **The registry is injected at construction — an approved evolution of the
   frozen CB-002 factory.** The signature changes from
   `createContextBuilder(config)` to `createContextBuilder(config, registry)` with
   a **required** `ProviderRegistry`, and the `ContextBuilder` interface gains
   `collect(request): Promise<CollectionResult>`. This is the smallest change that
   lets a single immutable handle own the engine and expose an unconditional,
   request-only `collect`.

3. **`collect` delegates directly.** The factory composes the engine once
   (`createCollectionEngine(registry)`) and `collect` closes over it and returns
   its result verbatim. The Context Builder does **not** inspect, modify, filter,
   rank, deduplicate or enrich the `CollectionResult`; determinism and immutability
   are inherited from the engine (CB-010) and `parseCollectionResult` (CB-009).

4. **No other public contract changed.** ContextBuilderConfig, ProviderRegistry,
   CollectionEngine, KnowledgeRequest, CollectionResult, CollectionError and
   KnowledgeItem are untouched. Only the three CB-002/CB-005 factory-test call
   sites that depend on the old signature were updated.

## Rejected alternatives

- **Additive second factory / integration wrapper** (`createCollectionPipeline`,
  `createContextBuilderWithCollection`). Preserves the CB-002 signature but demotes
  the canonical constructor to a Context Builder that cannot collect, producing a
  duplicate public API and either two `ContextBuilder` shapes (conditional
  `collect`) or a non-functional handle (hidden behaviour). Violates the
  Composition Guardrail (no parallel orchestration service).
- **Staged builder method** (`builder.withCollection(registry)`). Makes `collect`
  conditionally present and introduces staged construction — both forbidden.
- **Registry at call time** (`collect(registry, request)`). The builder would no
  longer own the engine and the entry point would stop being request-only —
  contradicts CB-011.
- **Optional registry / pre-built engine injection.** Explicitly disallowed by the
  approved scope.

## Consequences

- The Context Builder is now operational end-to-end; the same request and registry
  always produce the same deeply-frozen `CollectionResult`.
- The public API stays coherent: one orchestration service, one `collect`, no
  duplicate factories, no hidden behaviour.
- CB-012 (collection behaviour tests) can exercise `ContextBuilder.collect`
  directly; behaviour tests were intentionally left out of CB-011.

## Reusable engineering principle

> **When a service must own a collaborator that is established at construction,
> the constructing factory must receive that collaborator.** Preserving a frozen
> factory signature by routing the dependency through a second factory, a staged
> method or optional injection trades a coherent public API for the letter of the
> contract — it yields conditional/hidden behaviour or a duplicate surface. The
> smallest *coherent* change (extend the factory's parameters) is preferable to
> any additive workaround that fragments the public API. Surface such a change as
> an explicit, reviewed contract evolution before writing code.

_This principle is recorded here only; no AJS standard is modified._
