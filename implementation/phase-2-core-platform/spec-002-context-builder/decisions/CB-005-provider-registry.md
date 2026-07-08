# Decision: CB-005 Provider Registry

> **Task:** CB-005 — Define Provider Registry
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-005 defines the **Provider Registry** — the immutable catalogue of the
`KnowledgeProvider`s (CB-004) available to the Context Builder. Its
responsibility is strictly bounded:

```text
KnowledgeProviders → validation → immutable registry → lookup
```

The task requires a `createProviderRegistry()` factory, an immutable provider
collection, provider lookup, duplicate-provider rejection during construction,
and explicit public exports. It excludes provider execution, discovery,
dependency injection, plugin loading, collection, ranking and Context Package
generation, and forbids provider-specific logic and runtime mutation.

The suggested output layout was `registry/{schema.ts, types.ts, index.ts}`, but
the task permits the organization to "evolve if implementation reveals a better
organization." Several shape choices were open and are recorded here.

## Decision

1. **Layout mirrors the `createContextBuilder()` service precedent, not the
   data-contract module precedent.** New `src/context-builder/registry/` with
   `createProviderRegistry.ts` (the `ProviderRegistry` interface **and** its
   factory, co-located) and `index.ts` (barrel). **No `schema.ts`** is created.

2. **Minimal contract:** `ProviderRegistry = { providers, get(id) }`.
   `providers` is a readonly, insertion-ordered array (expose the catalogue);
   `get(id)` returns `KnowledgeProvider | undefined` (retrieve). No
   `has`/`size`/`filter`/`filterByType` — they are not required by the task's two
   responsibilities and would be speculative.

3. **Validation at construction:** every provider must carry a non-empty string
   `id` (the identifier the registry keys on); duplicate `id`s are rejected. Both
   throw a plain `Error` with a clear message. The registry validates only the
   `id` — never provider behaviour — keeping it provider-agnostic.

4. **Deterministic ordering = caller insertion order.** `providers` preserves the
   order the caller supplied; the same input always yields the same registry. No
   sorting.

5. **Immutable:** the returned handle and the `providers` array are frozen
   (`Object.freeze`). The provider objects themselves are **not** frozen — they
   are caller-owned and carry a `provide` method; the registry guarantees an
   immutable *catalogue*, not immutable providers.

## Rationale

- **Simplicity / consistency.** The registry is a factory-created *service*, and
  the closest existing precedent is `createContextBuilder.ts`, which co-locates
  its `ContextBuilder` interface with its factory. Following that precedent is
  more consistent than forcing the data-contract layout used by `config/`,
  `package/` and `providers/`.
- **No empty ceremony.** `schema.ts` exists in sibling modules because they
  declare Zod *data* schemas. The registry introduces no new data contract — it
  composes the CB-004 `KnowledgeProvider`. Its only validation (non-empty id,
  uniqueness) is imperative construction logic, not a declarative schema, so a
  `schema.ts` would be an empty file.
- **Minimal API.** `providers` + `get` fully cover "expose registered providers"
  and "retrieve providers." Anything more is speculative and violates the task's
  "avoid speculative features" principle.
- **Determinism without surprise.** Insertion order is already deterministic and
  preserves the caller's explicit intent; sorting would silently reorder the
  catalogue.

## Consequences

- Collection (M3) can iterate `registry.providers` in a stable order and resolve
  a provider by `id` via `registry.get`.
- New lookup needs (e.g. by source type, or a `has` predicate) are **additive**
  and owned by the task that needs them — not added speculatively now.
- Because provider objects are not frozen, providers remain free to hold internal
  state (e.g. a cached client) without fighting the registry.

## Alternatives Considered

### Option A — Suggested `registry/{schema.ts, types.ts, index.ts}` layout

Description: Match the task's example layout exactly, with an empty/near-empty
`schema.ts`.

Pros

- Literal match to the task's Expected Outputs.

Cons

- `schema.ts` would be empty ceremony (no new data contract exists).
- Splitting a small behavioural interface from its only implementation adds files
  without value.

### Option B — Co-locate interface + factory (selected)

Description: `createProviderRegistry.ts` holds the `ProviderRegistry` interface
and factory; `index.ts` re-exports. No `schema.ts`.

Pros

- Consistent with the `createContextBuilder.ts` service precedent.
- No empty files; the module reflects what actually exists.

Cons

- Deviates from the task's suggested file split (explicitly permitted).

### Selected Option

Option B. The task permits the layout to evolve, and the service precedent is a
better fit for a factory-created behavioural contract than the data-contract
layout.

## Other alternatives

- **`.strict()`-parsing providers via `providerMetadataSchema`** — would validate
  `id`/`name`/`description`, but the schema is `.strict()` and a real provider
  also carries a `provide` method, so strict parsing would wrongly reject valid
  providers. Rejected in favour of a targeted non-empty-`id` check.
- **Sorting providers by `id`** — also deterministic, but silently reorders the
  caller's explicit ordering. Rejected in favour of preserving insertion order.
- **Deep-freezing provider objects** — would fight providers that hold internal
  state and is not the registry's responsibility. Rejected; only the catalogue is
  frozen.
- **Richer API (`has`, `size`, `filterByType`)** — not required by the task;
  speculative. Rejected; additive later.

## Validation

- `npm run typecheck` and `npm run build` pass.
- Ad-hoc runtime harness (12 checks): construction, lookup, unknown-id →
  `undefined`, insertion-order determinism, empty-registry validity, duplicate-id
  rejection, empty-id rejection, frozen handle and frozen `providers` array — all
  green. (No test runner is configured yet; automated tests arrive with CB-006.)

## Future Review

- Revisit when CB-006 adds the test runner (port the harness to real tests) and
  when M2/M3 need additional lookup ergonomics.

## Related Documents

Architecture

- ARCH-001

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-004 (KnowledgeProvider contract, consumed here), CB-005 (this task),
  CB-006 (testing infrastructure)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *A "suggested file layout" in a task is a hint, not a
contract. Match the module's kind, not the example.* Data-contract modules earn a
`schema.ts`; factory-created service modules co-locate their interface with their
factory. Creating files to satisfy a template — an empty `schema.ts` here — adds
surface without meaning and should be avoided.

**Carried-forward recommendation (from CB-004):** the insertion-order +
`Object.freeze` immutability idiom now recurs across `config/`, `package/`,
`providers/` and `registry/`. When the shared `deepFreeze`/`DeepReadonly`
utilities are promoted to an internal module, this idiom is a candidate to
consolidate alongside them. Recorded as a recommendation only; no AJS document is
modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-08 | 1.0     | Decision created |
