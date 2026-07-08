# Decision: CB-008 Collection Error Contract

> **Task:** CB-008 — Define Collection Error Contract
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-008 defines the **CollectionError** — the first Milestone M2 *data* contract,
placed **before** the `CollectionResult` (CB-009) so the result can embed
collected errors alongside collected items. The Context Builder uses a
**partial-collection** model: a single provider failing never aborts collection;
a provider contributes *either* KnowledgeItems *or* a `CollectionError`.

This task defines **only** the error contract — schema, runtime validation,
immutable types, `parseCollectionError()`, public exports and documentation. It
excludes provider execution, `CollectionResult`, retry, recovery, logging,
ranking and Context Package generation.

The task named four example fields (error identifier, provider identifier,
failure category, human-readable message) and asked that any additional field be
justified as a stable platform concept. A few shape choices were open and are
recorded here.

## Decision

1. **A plain data contract, not a JS `Error`.** `CollectionError` is a validated,
   frozen POJO — not an `Error` subclass. It exposes no stack traces, exceptions,
   timestamps or runtime objects (CB-008 forbids these). Failures are
   *represented*, not thrown; this is what lets an error travel beside items in
   the CB-009 result.

2. **Four fields, exactly the sanctioned examples.**
   `{ id, providerId, category, message }`, all required, `.strict()`.
   - `id` — a stable identifier for the failure.
   - `providerId` — the failing provider/source (CB-008 Inputs: "a provider `id`
     identifies the failing source"); provider-agnostic (only the `id`).
   - `category` — the failure classification (see 3).
   - `message` — a human-readable description.

3. **`category` is a closed `z.enum`, not a free string.**
   `FAILURE_CATEGORIES = ["invalid-request", "provider-unavailable",
   "provider-error"]`, mirroring the CB-003 `SECTION_KINDS`/`REFERENCE_TYPES`
   const-array + `z.enum` convention. Grounded in SPEC-002 §15 (Error Handling)
   and AJS-004 (Failure Handling). A closed set keeps the contract deterministic
   and provider-agnostic — providers cannot leak implementation-specific error
   codes into the platform.

4. **Empty is not an error.** A provider that finds nothing contributes an empty
   item set; a `CollectionError` is reserved for an actual failure. Documented so
   CB-010 does not conflate the two.

5. **Layout mirrors the data-contract precedent (CB-004), not the service
   precedent (CB-007).** New `src/context-builder/collection/errors/` with
   `schema.ts` (schema + `deepFreeze` + `parseCollectionError`), `types.ts`
   (`DeepReadonly` inferred types) and `index.ts` (barrel) — because this *is* a
   new data contract (unlike the engine, which introduced none). Re-exported
   through `collection/index.ts` and the top-level `context-builder/index.ts`.

6. **Immutable & deterministic.** `parseCollectionError()` validates then
   deep-freezes (the CB-003/CB-004 `deepFreeze` helper, duplicated per-module per
   the established convention). The same input always yields an equal contract.

## Rationale

- **Consistency.** The error is a data contract; the closest precedents are
  `package/` and `providers/`, which pair `schema.ts` + `types.ts` + `index.ts`
  with a `parse*` validator that deep-freezes. Following them keeps the module
  coherent.
- **Provider-agnostic by construction.** `.strict()` rejects leaked fields (e.g.
  a `stack`); the closed `category` enum rejects leaked codes. Provider specifics
  cannot enter the contract even by accident.
- **Enables CB-009 without behaviour.** Exporting `collectionErrorSchema` lets the
  `CollectionResult` embed the contract compositionally, with no collection
  behaviour introduced here.

## Consequences

- CB-009 embeds `collectionErrorSchema` in the `CollectionResult` alongside
  `knowledgeItemSchema`, aggregating items + errors under partial collection.
- CB-010 constructs `CollectionError`s during provider execution (assigning `id`,
  `providerId`, mapping a failure to a `category`) — **consuming** this contract
  without changing it.
- If a future failure mode is not covered by the three categories, extend
  `FAILURE_CATEGORIES` (additive) rather than widening the field to a free string.

## Alternatives Considered

### Option A — `category` as a free-form string

Description: allow any string code so providers describe their own failures.

Pros

- Maximum flexibility; no enum to maintain.

Cons

- Non-deterministic and provider-leaky — implementation-specific codes enter the
  platform contract, defeating "provider-agnostic" and "deterministic".

Rejected: the contract's purpose is a *stable* classification.

### Option B — Closed `z.enum` failure category (selected)

Description: a small closed set grounded in SPEC-002 §15 / AJS-004.

Pros

- Deterministic, provider-agnostic, matches the codebase enum convention;
  extends additively.

Cons

- New failure modes require an (additive) enum change — acceptable and explicit.

### Selected Option

Option B.

## Other alternatives

- **Modelling `CollectionError` as a JS `Error` subclass** — would reintroduce
  stack traces / runtime objects and is not serialisable beside items. Rejected;
  the contract is a POJO.
- **Echoing the `KnowledgeRequest` inside the error** — redundant with the
  CB-009 result context and bloats a minimal contract. Rejected; `providerId`
  identifies the source.
- **A `recoverable`/`retryable` flag** — recovery semantics are explicitly out of
  scope for this task. Rejected; `category` classifies, it does not prescribe
  handling.
- **A `timestamp` field** — that is logging (out of scope). Rejected.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 80 passing across 7 files, including new
  `tests/context-builder/collection-errors.test.ts` (valid parse, every category,
  unknown category rejected, missing/empty fields rejected, strict unknown-key
  rejection, deep freeze, determinism, schema composition).
- `npm run build` — passes.

## Future Review

- Revisit at CB-009 (embed in `CollectionResult`) and CB-010 (construct during
  provider execution); confirm both **consume** this contract without altering it,
  and that the three categories cover the real provider failure modes.

## Related Documents

Architecture

- ARCH-001

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002 (§15 Error Handling)

Implementation Tasks

- CB-003 (Context Package contract, pattern), CB-004 (Provider contracts,
  pattern), CB-007 (Collection Engine, holds the registry), CB-008 (this task),
  CB-009 (CollectionResult, embeds this), CB-010 (Provider execution, constructs
  this)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *Represent failures as validated, immutable contracts —
not exceptions.* When a platform must carry failures deterministically alongside
successful results (partial collection), model the failure as a `.strict()`,
deep-frozen data object with a **closed** category enum, rather than an `Error`
subclass or a free-form code. This keeps failures serialisable, provider-agnostic
and deterministic, and turns the failure taxonomy into an explicit, reviewable
platform boundary. Recorded as a recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-08 | 1.0     | Decision created |
