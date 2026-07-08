# Decision: CB-004 Knowledge Provider Contracts

> **Task:** CB-004 — Define Knowledge Provider Contracts
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-004 defines the Context Builder's **input contracts** — how knowledge enters
the platform — as stable, immutable, provider-agnostic data contracts that
future milestones implement against but never redesign:

```text
KnowledgeRequest → KnowledgeProvider → KnowledgeItem[] → Context Builder → Context Package
```

The task requires `KnowledgeRequest`, `KnowledgeProvider` and `KnowledgeItem`,
runtime validation (Zod), inferred types, immutability, and explicit public
exports. It excludes provider implementations, the registry, collection,
ranking and Context Package generation, and forbids provider-specific fields,
implementation-specific metadata, filesystem details, ranking/package
information and transport concerns. The request must be a single immutable
object, not an expanding parameter list.

Several shape choices were open and are recorded here.

## Decision

1. **Module layout follows `config/` and `package/`.** New
   `src/context-builder/providers/` with `schema.ts` (Zod + parsers), `types.ts`
   (inferred types + the `KnowledgeProvider` interface) and `index.ts` (barrel).
   This deviates from the task's suggested per-contract file split
   (`request.ts`, `provider.ts`, `knowledge-item.ts`) in favour of consistency
   with the existing foundation modules — the task permits the structure to
   "evolve if implementation reveals a better organization."

2. **`KnowledgeRequest = { project, task, branch?, commit?, issue? }`.** These
   are the SPEC-002 §7 inputs that help a provider *locate* knowledge. The
   Context Profile and workflow type are **excluded**: they are Context Builder
   *configuration* (CB-002) and drive ranking/assembly — concerns a provider
   must not know about. Future request inputs are additive and do not change the
   provider interface.

3. **`KnowledgeItem = { id, source, content }`, reusing CB-003's
   `sourceReferenceSchema` as `source`.** `id` uniquely identifies the item (one
   source may yield many); `source` reuses the approved
   `{ id, type, title, locator? }` contract so the same citable-source shape
   flows unchanged from provider output into Context Package references;
   `content` is opaque body text (`min(1)` — a knowledge item must carry
   knowledge). Composition over a parallel source model (AJS-003 §6, "Reuse over
   rewriting").

4. **No freeform `metadata` bag.** The task lists "metadata" as an *example* but
   also forbids provider-specific/implementation-specific metadata. A freeform
   bag would re-introduce provider-specific data through the back door, so the
   item models explicit, stable fields only.

5. **`KnowledgeProvider` is a TypeScript interface extending `ProviderMetadata`.**
   `{ id, name, description }` (identify + describe) plus a single method
   `provide(request: KnowledgeRequest): Promise<readonly KnowledgeItem[]>`. One
   immutable request object (never expanding primitive parameters); `async` so
   future file/API-backed providers satisfy the same contract without a
   signature change; `readonly` result because the Context Builder owns ordering
   and ranking.

6. **`providerMetadataSchema` exported for runtime validation.** Provider
   identity is expressed as a Zod schema (not just a type) so a future registry
   (CB-005) can validate providers at registration — without CB-004 implementing
   any registry behaviour.

7. **Immutable at runtime and in types.** `parseKnowledgeRequest` and
   `parseKnowledgeItem` validate then **deep-freeze**; types are
   `DeepReadonly<z.infer<…>>`, reusing CB-003's `DeepReadonly`. Every schema is
   `.strict()`.

## Rationale

- Reusing `SourceReference` makes the eventual collection→package mapping trivial
  and keeps a single citable-source model across the platform.
- Excluding profile/workflow from the request keeps providers strictly
  provider-agnostic and prevents configuration leaking across the boundary.
- A single immutable request object future-proofs the interface: new inputs are
  additive and never reshape `provide`.
- Deep-freeze + `DeepReadonly` gives one drift-free immutability guarantee
  observable at runtime, consistent with CB-002/CB-003.

## Consequences

- Providers (M2) implement `KnowledgeProvider` and return validated
  `KnowledgeItem`s; the registry (CB-005) can validate `ProviderMetadata`.
- Knowledge quality levels (AJS-003) and richer request inputs remain **additive**
  future extensions, owned by the task that needs them — not added speculatively.
- `provide` is asynchronous, so collection (M3) awaits providers uniformly.

## Alternatives Considered

- **Freeform `metadata` bag on `KnowledgeItem`** — matches the "metadata"
  example literally but becomes a provider-specific dumping ground, breaking
  provider-agnosticism. Rejected in favour of explicit stable fields.
- **A parallel source model for items** (distinct from CB-003's
  `SourceReference`) — would duplicate an approved contract and complicate the
  collection→package mapping. Rejected in favour of reuse.
- **Including Context Profile / workflow type in the request** — they are
  SPEC-002 §7 inputs, but they are configuration/ranking concerns; passing them
  to providers would couple providers to Context Builder configuration. Rejected.
- **Synchronous `provide`** — simpler now, but every real provider (files, APIs)
  is asynchronous; a later switch would be a breaking signature change. Rejected
  in favour of `Promise`.
- **Per-contract files** (`request.ts`, `provider.ts`, `knowledge-item.ts`) —
  the task's suggested layout, but inconsistent with `config/`/`package/`.
  Rejected in favour of the established `schema.ts`/`types.ts`/`index.ts` layout.

## Process Recommendation (reusable engineering principle)

**Extract shared immutability utilities.** The `deepFreeze` runtime helper and
the `DeepReadonly` type now exist in both `package/` and `providers/`. When a
third consumer appears, promote them to a single internal module (e.g.
`src/context-builder/internal/immutable.ts`) and migrate existing modules. Left
un-refactored here to avoid modifying reviewed CB-003 code within CB-004's
scope. Recorded as a recommendation only; no AJS document is modified.

**Reusable principle:** *When a task lists a generic field like "metadata" as an
example, treat it as a prompt to model explicit stable fields — not as a licence
to add a freeform bag.* Freeform bags silently defeat provider-agnostic /
implementation-independent contracts.
