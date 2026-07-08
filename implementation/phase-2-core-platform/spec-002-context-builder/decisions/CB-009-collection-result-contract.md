# Decision: CB-009 CollectionResult Contract

> **Task:** CB-009 — Define CollectionResult Contract
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-009 defines the **CollectionResult** — the canonical, complete, deterministic
outcome of knowledge collection, and the second Milestone M2 *data* contract
(after CB-008's `CollectionError`). The Context Builder uses a
**partial-collection** model: a single provider failing never aborts collection,
so a result must aggregate **both** collected `KnowledgeItem`s (CB-004) and
collected `CollectionError`s (CB-008).

This task defines **only** the contract — schema, runtime validation, immutable
types, `parseCollectionResult()`, public exports and documentation. It excludes
provider execution, collection engine behaviour, ranking, selection, duplicate
detection, retry, recovery, logging, timing and Context Package generation.

The task required `items + errors + metadata` but did **not** enumerate the
metadata fields — it asked that any field be justified as a stable platform
concept, and forbade execution-specific fields (timing, retry, tokens,
diagnostics, provider internals, stack traces). The metadata shape was the one
open design decision, recorded here.

## Decision

1. **Three fields: `metadata`, `items`, `errors`; `.strict()`; both arrays may be
   empty.** `{ metadata, items: KnowledgeItem[], errors: CollectionError[] }`.
   Items-only, items+errors (partial), empty-errors and empty-result are all
   valid; `.strict()` rejects any execution-/ranking-/selection-specific field.

2. **`items` and `errors` compose the existing schemas.**
   `items: z.array(knowledgeItemSchema)` (CB-004) and
   `errors: z.array(collectionErrorSchema)` (CB-008) — reused, never redefined.

3. **`metadata` is the collection's provenance — the answered `KnowledgeRequest`,
   reused wholesale.** `collectionResultMetadataSchema = knowledgeRequestSchema`
   (`{ project, task, branch?, commit?, issue? }`). A result records *which
   request it answered*, mirroring the CB-003 Context Package metadata
   (`project`/`task`/`branch`/`commit`) and the CB-004 move of reusing the
   `SourceReference` contract inside a `KnowledgeItem`. Reusing the request schema
   guarantees the metadata can never drift from the request the collection ran
   for.

4. **No timestamps, durations, retry counts, token estimates, counts or
   diagnostics in metadata.** These break determinism (same input → different
   output) and/or leak execution/implementation detail; derived counts are
   redundant with the arrays. All are excluded and rejected by `.strict()`.

5. **No cross-element uniqueness / duplicate detection.** Unlike the CB-003
   package (which enforces unique reference ids for *referential integrity*), the
   result has no cross-references, so element-level validation suffices.
   Enforcing uniqueness would be selection/dedup *behaviour* — out of scope (M3).

6. **Layout mirrors the data-contract precedent.** New
   `src/context-builder/collection/result/` with `schema.ts` (schema +
   `deepFreeze` + `parseCollectionResult`), `types.ts` (`DeepReadonly` inferred
   types) and `index.ts` (barrel) — the same shape as `collection/errors/`.
   Re-exported through `collection/index.ts` and the top-level
   `context-builder/index.ts`.

7. **Immutable & deterministic.** `parseCollectionResult()` validates then
   deep-freezes (the established per-module `deepFreeze` helper). The same input
   always yields an equal, deeply-frozen contract.

## Rationale

- **Composition over duplication.** Every field reuses a stable platform schema
  (`knowledgeItemSchema`, `collectionErrorSchema`, `knowledgeRequestSchema`),
  keeping the module coherent and the contracts single-sourced.
- **Determinism by construction.** Provenance-only metadata plus `.strict()`
  makes it structurally impossible to introduce timing/retry/token fields, so the
  contract stays deterministic, serializable and implementation-independent.
- **Enables CB-010 without behaviour.** Exporting `collectionResultSchema` lets
  CB-010 construct results during provider execution, consuming this contract
  without changing it.

## Consequences

- CB-010 constructs a `CollectionResult` after executing the registry's
  providers — assembling `items`, mapping failures to `errors`, and carrying the
  answered request as `metadata` — **consuming** this contract without altering
  it.
- M3 (selection) reads a `CollectionResult` as its input; dedup/ranking operate
  on it rather than being baked into the contract.
- If future provenance beyond the request proves necessary, extend the metadata
  additively with justified stable fields — never with execution detail.

## Alternatives Considered

### Metadata shape

- **Option A — provenance = the answered `KnowledgeRequest` (selected).** Reuses
  CB-004, matches the CB-003 precedent, deterministic and provider-agnostic.
- **Option B — a fresh minimal metadata object (e.g. only a contract version).**
  Thinner but less useful, and a version constant adds surface without tying the
  result to its input. Rejected as under-informative.
- **Option C — rich runtime metadata (`generatedAt`, durations, counts).**
  Rejected outright: breaks determinism and is explicitly forbidden
  (timing/diagnostics).

### Other alternatives

- **Enforcing unique item/error ids via `superRefine`.** Rejected — that is
  duplicate detection / selection behaviour, out of scope; the result may legitimately
  carry a partial, undeduplicated set.
- **A top-level `status`/`ok` flag.** Redundant — partiality is fully described by
  the (possibly empty) `errors` array; a derived flag invites drift. Rejected.
- **Separate `results`-per-provider grouping.** Rejected as premature structure;
  the flat items+errors aggregate is the minimal stable outcome.

### Selected Option

Option A (provenance metadata) with flat, composed `items` + `errors` arrays.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 93 passing across 8 files, including new
  `tests/context-builder/collection-result.test.ts` (items-only, items+errors,
  empty-errors, empty-result, provenance locators, missing collections rejected,
  invalid embedded item/error/metadata rejected, strict unknown-key rejection,
  deep freeze, determinism, schema composition).
- `npm run build` — passes.

## Future Review

- Revisit at CB-010 (construct during provider execution) and M3 (selection reads
  the result); confirm both **consume** this contract without altering it, and
  that provenance-only metadata remains sufficient.

## Related Documents

Architecture

- ARCH-001

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002 (§15 Error Handling; partial collection)

Implementation Tasks

- CB-003 (Context Package contract, metadata precedent), CB-004 (Provider
  contracts — `KnowledgeItem`, `KnowledgeRequest`, reused here), CB-008
  (`CollectionError`, embedded here), CB-009 (this task), CB-010 (Provider
  execution, constructs this)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *Determinism is a schema constraint, not just a runtime
discipline.* When a contract must be deterministic and serializable, encode that
by (a) reusing the input contract as provenance instead of stamping runtime
metadata, and (b) using a `.strict()` schema so timing/retry/token/diagnostic
fields cannot enter even by accident. The taxonomy of "what may appear in the
outcome" becomes an explicit, reviewable boundary rather than a convention.
Recorded as a recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-08 | 1.0     | Decision created |
