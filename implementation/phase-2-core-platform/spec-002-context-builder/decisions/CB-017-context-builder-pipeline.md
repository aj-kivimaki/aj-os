# Decision: CB-017 Extend Context Builder Pipeline

> **Task:** CB-017 — Extend Context Builder Pipeline
> **Date:** 2026-07-09
> **Status:** Accepted (includes approved public API evolution)

---

## Context

CB-017 extends the deterministic Context Builder pipeline with the Selection stage.
Per the frozen Milestone 3 plan and PIPELINE-ARCHITECTURE.md, the Context Builder
must compose the Collection Engine (CB-007/CB-010) and the Selection Engine
(CB-013/CB-016), run `collect` then `select`, and return the resulting
`SelectionResult` unchanged. It is an **orchestration** task: the Collection Engine
owns collection, the Selection Engine owns selection, and the Context Builder owns
only the pipeline.

The approved design also reconciles the public entry point. The Milestone 2 era
Context Builder exposed `collect(request): Promise<CollectionResult>` (CB-011). The
architecture requires a **single** public entry point — "only `build(request)` is
public on the Context Builder"; stage operations and intermediate results stay
internal. So `build(request)` supersedes `collect(request)`. This entry-point
evolution was reviewed and approved during the Milestone 3 planning freeze and
recorded as "reconciled in CB-017" (MILESTONES.md, README, task doc).

Two questions remained open for implementation, both recorded here: (1) exactly how
the public surface changes, and (2) how the frozen CB-011/CB-012 builder-level
regression suite — which exercises the superseded `collect` — is reconciled.

## Decision

1. **The Context Builder composes both engines once, at construction, and owns
   them.** `createContextBuilder(config, registry)` builds the owned Collection
   Engine (`createCollectionEngine(registry)`) and a Selection Engine
   (`createSelectionEngine()`, which has no construction-time dependency). Both are
   composed exactly once; the registry is injected only to build the Collection
   Engine. This preserves the CB-011 factory signature — no further signature change.

2. **`build(request)` is the single public entry point; `collect` is removed.** The
   `ContextBuilder` interface exposes `config` and
   `build(request): Promise<SelectionResult>` — nothing else. `build` invokes
   `collectionEngine.collect(request)` then `selectionEngine.select(collectionResult)`
   and returns the Selection Engine's result **verbatim**. The Milestone 2 era public
   `collect` method is removed (superseded). This is the approved public API
   evolution; it is the only public-contract change in CB-017.

3. **`build` is a thin orchestrator — it re-decides nothing.** The Context Builder
   implements no selection policy and no collection behaviour, and does not inspect,
   modify, filter, reorder, deduplicate, enrich or construct anything. It sequences
   two stages and returns the second stage's output. Determinism and deep immutability
   are inherited from the engines (CB-010/CB-016) and `parseSelectionResult` (CB-014);
   the handle holds no runtime state and is frozen.

4. **Stage operations and the intermediate result stay internal.**
   `CollectionEngine.collect` and `SelectionEngine.select` remain on their engines,
   and the intermediate `CollectionResult` is a local of `build`. Only `build` is
   public on the Context Builder, matching PIPELINE-ARCHITECTURE §Public Entry Point /
   §Stage Operations.

5. **No new export.** `ContextBuilder`, the two engine factories, and the CB-014
   `SelectionResult` contract were already public; `build` is a method on the existing
   handle. The module's public export surface is unchanged.

6. **The obsolete builder-level `collect` regression suite is retired (approved
   reconciliation).** Because `ContextBuilder.collect` is no longer public, its
   builder-level suite (`context-builder-collection.test.ts`, CB-011/CB-012) is
   removed. Collection behaviour remains permanently covered at the engine level by
   `collection-execution.test.ts` (CB-010) — the retired suite's own "`builder.collect`
   ≡ `engine.collect`" assertion confirms the overlap, so **no behaviour coverage is
   lost**. The permanent `build(request)` pipeline regression suite is assigned to
   CB-018. CB-017 adds **no** replacement or bridge tests (behaviour tests are out of
   its scope) and moves **no** engine tests.

## Rationale

- **Composition over duplication.** CB-017 builds new behaviour purely by composing
  completed contracts and services — the engines own every decision; the Context
  Builder only sequences them. This is the payoff of the CB-007/CB-010 and
  CB-013/CB-016 stage split.
- **Smallest coherent public surface.** A single `build` entry point that always runs
  the highest-level implemented pipeline means callers never change as stages are
  added (Assembly at M4 extends `build` without touching its signature). Keeping
  `collect` public alongside `build` would contradict "single public entry point" and
  expose an intermediate stage operation the architecture says is internal.
- **Regression strategy evolves with the public API.** A regression suite targeting a
  removed public method cannot "remain green" and should not be preserved by
  retargeting it to the engine (that would duplicate the CB-010 suite, violating the
  project's no-duplicated-logic rule). Retiring it and assigning the builder-level
  `build` suite to CB-018 keeps each task's scope clean and the milestone fully
  covered on completion.

## Consequences

- The Context Builder is operational end-to-end through Selection: `build(request)`
  returns a deterministic, deeply-frozen `SelectionResult` for a given request and
  registry.
- The public API stays coherent: one orchestration service, one `build` entry point,
  no duplicate factories, no exposed stage operations.
- Test count moves 135 → 123 with the retired suite; CB-018 restores and extends
  builder-level coverage through `build(request)`. No coverage of existing behaviour
  is lost in the interim — `build` is new behaviour whose permanent tests are, by the
  frozen plan, CB-018's responsibility.
- CB-018 is fully unblocked: it can exercise `build(request)` and assert it matches
  direct `SelectionEngine.select(CollectionEngine.collect(request))` execution.

## Alternatives Considered

### Keep `collect` public alongside `build`

Rejected. The architecture mandates a single public entry point ("only `build(request)`
is public on the Context Builder") and the prompt forbids additional public methods.
A public `collect` would also expose a stage operation the architecture keeps internal.

### Preserve the CB-011/CB-012 suite by retargeting it to `CollectionEngine.collect`

Rejected. It would near-duplicate `collection-execution.test.ts` (CB-010), violating
the "no duplicated logic" rule, and would misrepresent an engine test as a builder
test. The collection coverage it provided already exists at the engine level.

### Add a minimal `build` bridge test in CB-017 to keep builder-level coverage continuous

Rejected under scope: CB-017 excludes behaviour tests, and CB-018 is the designated
owner of the `build(request)` pipeline suite. A temporary bridge test would create
churn CB-018 must undo.

### Selected Option

Compose both engines once at construction; expose a single `build(request)` that
sequences `collect` then `select` and returns the `SelectionResult` unchanged; remove
the superseded public `collect`; retire the obsolete builder-level `collect`
regression suite and leave permanent `build` testing to CB-018.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 123 passing across 10 files (135 − 12 with the retired builder-level
  `collect` suite; CB-017 adds no behaviour tests, per scope — those are CB-018;
  all other existing tests remain green).
- `npm run build` — passes; emits the updated
  `dist/context-builder/createContextBuilder.js`.
- Pipeline additionally exercised with a throwaway script (out-of-order ids, an exact
  cross-provider duplicate, and a failing provider): `build` returned `selectedItems`
  in canonical id order with the duplicate eliminated to `excludedItems`, output
  identical to a manual two-engine composition, metadata carried forward, output
  deeply frozen and identical across runs, with no public `collect` method. Script
  removed after verification.

## Future Review

- Revisit at CB-018 when the permanent `build(request)` pipeline regression suite is
  authored — confirm it validates pipeline orchestration, stage independence,
  determinism and immutability through the public entry point only.
- Revisit at M4 when Assembly extends `build` to return a Context Package — confirm the
  single public entry point absorbs the new stage without a signature change.

## Related Documents

Architecture

- ARCH-001, PIPELINE-ARCHITECTURE.md (§Pipeline Ownership, §Public Entry Point,
  §Stage Operations, §Pipeline Contracts, §Deterministic Behaviour)

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-010 (`CollectionEngine.collect`, composed), CB-011 (Context Builder integration,
  entry point superseded here), CB-013/CB-016 (`SelectionEngine.select`, composed),
  CB-014 (`SelectionResult`, returned unchanged), CB-017 (this task), CB-018 (permanent
  `build(request)` pipeline regression suite, enabled and assigned here)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *A regression suite is coupled to the public surface it
exercises; when an approved API evolution removes that surface, the suite migrates with
it rather than being preserved in place.* Retargeting a suite to a lower layer to keep
it "green" duplicates coverage that already exists there and misrepresents what is being
tested; the honest move is to retire coverage of the removed surface (verifying the
lower layer already guarantees the underlying behaviour) and assign the new surface's
permanent tests to the task that owns it. Recorded as a recommendation only; no AJS
document is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-09 | 1.0     | Decision created |
