# SPEC-002 Milestone 4 — Retrospective

> **Milestone:** M4 — Context Assembly (CB-019 → CB-024)
> **Outcome:** PASS WITH REQUIRED CORRECTIONS — documentation synchronized after the
> Freeze Review; **Milestone Freeze declared** by the reviewer on 2026-07-10.
> **Date:** 2026-07-10
>
> Milestone retrospectives **accumulate**. This document is the Milestone 4
> retrospective; the Milestone 1, 2 and 3 retrospectives are preserved separately in
> `RETROSPECTIVE.md`, `RETROSPECTIVE-M2.md` and `RETROSPECTIVE-M3.md`.

---

## Summary

Milestone 4 delivered the Context Builder's third platform *behaviour*: deterministic
Context Assembly. On the frozen M1/M2/M3 foundation it added the Assembly Engine
service boundary (CB-019), the section-composition strategy (CB-020), the assembly
inputs & metadata composition (CB-021), deterministic assembly —
`AssemblyEngine.assemble` (CB-022), the full-pipeline integration —
`ContextBuilder.build(request)` returning a `ContextPackage` (CB-023), and the
permanent Assembly behaviour tests (CB-024). The suite grew from 160 → 205 tests
across 15 files.

The Context Builder now runs Collection → Selection → **Assembly** end-to-end through
the single public entry point `build(request)`, which composes all three owned engines
once at construction, invokes `collect` → `select` → `assemble`, and returns an
immutable `ContextPackage` (AJS-002 Appendix B) unchanged. Assembly is **structural
composition only**: it partitions the ordered `selectedItems` into knowledge-derived
Appendix B sections via a total, purely structural `source.type → kind` mapping
(CB-020), always emits the four Reviewer-Decision-A sections present-but-empty,
composes metadata from reused provenance plus an injected `generatedAt` and two
single-sourced version constants (CB-021), and builds the package **through**
`parseContextPackage()` so structural invariants, referential integrity and the
deep-freeze hold by construction. No rendering, explainability computation, semantic
validation or profiles were implemented — by design (AD-003, AD-009).

The one platform-surface change was the **pre-approved CB-017 return-type advance**:
`build(request)` now returns `ContextPackage` rather than `SelectionResult`. The
`build` **input** signature is unchanged — the timestamp source is injected at
construction as an optional, backward-compatible third `createContextBuilder`
argument (`now: () => string`). No frozen M1/M2/M3 platform contract was modified:
the configuration, Context Package, provider, registry, collection and selection
contracts are all unchanged.

Validation at freeze review: `npm run typecheck`, `npm run build`, and `npm test`
(205 passing across 15 files) all green.

---

## What worked well

- **Contract-first held for the fourth milestone running.** The output contract
  (`ContextPackage`, CB-003) was frozen back in M1; Assembly *populated* it rather
  than designing anything new. CB-019 introduced **no new data contract** — its
  output is the existing frozen package — mirroring how CB-013 opened M3 with a pure
  boundary.
- **Two decision gates before the behaviour task.** M3 proved the spec→execution
  split once (CB-015 policy → CB-016 execution). M4 scaled it to **two** reviewer-
  approved decision tasks — the section-composition strategy (CB-020) and the inputs
  & metadata composition (CB-021) — landing before a single line of `assemble` was
  written (CB-022). The two most consequential structural choices were frozen and
  reviewed *before* implementation, so CB-022 was pure realization.
- **Determinism by construction via an injected clock.** Time — the only
  non-provenance value in the package — enters as an explicit input, not an ambient
  `Date.now()`. Injecting the timestamp source at construction (`now`) and passing it
  through `assemble` kept the stage a pure function of its inputs, so determinism is
  provable by **full-package deep-equality** (nothing has to be masked) and a fixed
  injected clock makes `build` fully reproducible.
- **Construct-through-contract gave immutability and integrity for free.** Building the
  package solely via `parseContextPackage()` means unique ids/kinds, referential
  integrity, and the deep-freeze all hold by construction (RC-1) — no ad-hoc object,
  no separate post-hoc validation pass (AD-008).
- **Pre-resolved open architecture questions are calmer than emergent ones.** Reviewer
  Decision A (four always-empty sections) and Reviewer Decision B (injected timestamp)
  were settled during planning. This is the M3 lesson ("pre-approved is calmer")
  applied to *open architectural questions* rather than an API evolution.
- **Public-API-only tests again (CB-024).** The `source.type → kind` mapping, the
  `kind → title` table, and the `CONTEXT_VERSION` constant are all module-private;
  every guarantee is asserted through `assemble`/`build`/`parseContextPackage` output.
  The test even re-declares the expected mapping *in the test* so it pins the
  observable contract independently of the implementation.
- **Scope discipline held a fourth time.** Assembly renders nothing, computes no
  explainability, and is profile-inert — enforced by explicit scope-negative
  assertions so an excluded capability cannot silently appear.

## What surprised us

- **A purely structural rule leaves two section kinds unreachable — and that was the
  right answer.** `files-likely-to-change` and `risks-and-edge-cases` cannot be
  derived from `source.type` without semantic evaluation, which RC-4 forbids. Rather
  than forcing empty sections or guessing, CB-020 chose **absence over invention**:
  they simply do not appear in M4 output, and the mapping stays total and honest.
- **Two construction details the planning decisions deliberately left open surfaced
  during CB-022.** The frozen `ContextSection` requires a non-empty `title`, but
  CB-020 fixed only the section `kind`; and CB-021 fixed *ownership* of `contextVersion`
  but not the constant itself. Both were resolved with a small, reviewer-approved
  decision record (`decisions/CB-022-deterministic-assembly.md`) — bounded, structural,
  no frozen-contract impact — rather than an improvised choice in code.
- **A completed task can still be an unsynchronized task.** CB-024's *deliverables*
  (two behaviour suites, 205 green) existed and were already referenced as done by both
  the module and tests READMEs — yet its own task document was still `Status: Planned`
  with every DoD box unchecked and no completion change-log entry. A new failure mode
  relative to M3's repo-root drift: the gap was in *task-tracking hygiene*, not
  content, and was caught at the Freeze Review.

## Engineering discoveries

- **Construct-through-contract makes the assembler unable to drift from the contract.**
  Because the only constructor is `parseContextPackage()`, an assembly bug that
  produced a duplicate kind or a dangling reference would fail at construction, not
  slip into output. The contract validates its own producer.
- **Referential integrity is cheapest when both sides derive from one source.** Section
  `referenceIds` and the package `references` are both drawn from the same selected
  items' `source`s under the same de-duplication rule, so a `referenceId` can never
  point at a missing reference — integrity by construction, no cross-check needed.
- **Injecting time at construction keeps the public input signature stable *and* the
  stage pure.** Adding `generatedAt` as a `build` *parameter* would have churned the
  public entry point; letting the engine read a clock would have broken purity. The
  optional construction-time `now` factory threads both needles — backward-compatible
  and deterministic.
- **Totality over a frozen enum is what makes the mapping safe.** Because
  `source.type → kind` is total over all nine `REFERENCE_TYPES`, `assemble` has a
  defined home for every possible item and needs no fallback branch; the frozen enum
  bounds the mapping's completeness.
- **Immutability-by-divergence carried over from M3.** Feeding out-of-canonical-order
  items and asserting the frozen input is untouched while the output preserves that
  exact given order proves Assembly copies-and-composes without mutating upstream —
  stronger than an `Object.isFrozen` check alone.

## Process improvements

- **Task-completion hygiene should be an explicit freeze-review check, not an assumed
  one.** The M3 retrospective added repo-root doc-sync to the freeze checklist; that
  worked (see below). M4 exposed the *next* gap: a task whose deliverables are done but
  whose own status/DoD/change-log are not. **Recommendation:** add a named freeze-review
  line — *"every task in the milestone shows `Status: Done`, a fully checked Definition
  of Done, and a completion change-log entry"* — so per-task closure is a verified gate
  rather than an assumption. This was corrected during synchronization (C1 below).
- **The M3 repo-root doc-sync recommendation paid off.** CB-024 §10 explicitly named
  `README.md`, `ROADMAP.md` and `CHANGELOG.md` as freeze-sync items. So the (recurring
  M1/M2/M3) repo-root drift was *anticipated and scheduled* this time rather than
  discovered at the gate — the named checklist item did its job. Keep it.
- **Mid-implementation structural decisions have a home.** The two CB-022 construction
  details were captured in a dedicated decision record before implementation, keeping
  the decision-record discipline intact as the milestone's structural surface grew.

## Reusable engineering principles

1. **Construct through the frozen contract, never an ad-hoc object.** Building via
   `parseContextPackage()` makes structural invariants, referential integrity and
   immutability hold by construction. (CB-022)
2. **Achieve determinism by construction: inject time as an explicit input, don't read
   an ambient clock.** Inject at construction, pass it through the stage, keep the stage
   pure. (CB-021 / CB-023)
3. **A total mapping over a frozen enum guarantees every input has a defined home** and
   removes the need for a fallback branch. (CB-020)
4. **Derive linked structures from one shared source** so referential integrity holds by
   construction. (CB-020 / CB-022)
5. **Prefer absence over invention:** don't synthesize structure a purely structural
   rule cannot justify. (CB-020)
6. **Split a hard structural choice into a reviewer-approved decision gate before the
   behaviour task** — and use more than one gate when there is more than one hard
   choice. (CB-020, CB-021 → CB-022)
7. **Keep the public input signature stable while advancing only the return type;
   extend via optional, backward-compatible construction arguments.** (CB-023)
8. **Confirm task-level closure (status + DoD + change log), not just deliverable
   existence, before declaring a milestone frozen.** (CB-024, this freeze)

## Deferred improvements (recommended future tasks)

1. **Version single-sourcing — now resolved for metadata.** The long-carried M1/M2/M3
   deferred item is closed for Assembly: `contextVersion` (contract version,
   `CONTEXT_VERSION = "1.0"`) and `contextBuilderVersion`
   (`CONTEXT_BUILDER.version`) are now single-sourced, distinct, and never derived from
   each other (CB-021 / CB-022). Recorded here as resolved.
2. **Align AD-006 / AD-007 wording to the injected-metadata model.** Flagged non-blocking
   in `decisions/CB-021-assembly-inputs-and-metadata.md`: the frozen architecture text
   predates the construction-time-injected `generatedAt` and the closed two-input
   `assemble` set. Recommend a small documentation task to reconcile the wording.
   (Recorded, not a freeze blocker.)
3. **`files-likely-to-change` and `risks-and-edge-cases` remain structurally
   unreachable.** A future profile-driven or additional deterministic structural rule
   may populate them without changing the CB-020 partition, ordering or linking rules.
   (Deferred to M5+ by design.)
4. **Extract a single internal deep-freeze / `DeepReadonly` utility.** Carried from
   M1/M2/M3. Assembly did not add a new `deepFreeze` (it reuses `parseContextPackage`'s
   deep-freeze), but the duplication across `package/`, `providers/`, `collection/*`
   and `selection/` persists. Recommend an early `context-builder/internal/immutable.ts`
   cleanup task. (Deferred; not a freeze blocker.)
5. **Two frozen M1 documents** (`tasks/CB-001.md`,
   `decisions/CB-001-scaffold-scope.md`) still list a speculative `collector/` subfolder
   in their M1-era scaffold examples. Left untouched to preserve frozen M1 history.
   Carried from M2/M3. (Recorded, not actioned.)
6. **Light consolidation of the module README** into a durable "current state" section
   plus a historical per-task log. Carried from M3. (Deferred; optional.)

## Freeze corrections applied

Documentation and process artifacts only — no implementation, no platform contract, no
architecture, no test *behaviour* changed:

- **C1 — Task closure (`tasks/CB-024.md`):** `Status: Planned → Done`, all five
  Definition-of-Done boxes checked, and a completion change-log entry added (suite
  161 → 205, public-API-only, M4 implementation complete). *(The one genuine task-
  hygiene gap found at the Freeze Review.)*
- **C2 — `MILESTONES.md`:** M4 status ⬜ → ✅ in the overview table; the M4 Definition of
  Done checked; a Related Tasks list (CB-019–CB-024) and a freeze-time scope note
  (rendering deferred, AD-003/AD-009) added; change-log entry v3.4 recording CB-024 and
  M4 completion.
- **C3 — spec package `README.md`:** "Latest Milestone" advanced M3 → M4; Milestone
  Progress table M4 ⬜ → ✅; Implementation Status updated (M3 now frozen, assembly
  deliverables listed); change-log entry v2.6; post-freeze wording refined to
  "Milestone 4 complete and frozen."
- **C4 — repository `README.md`:** added the Milestone 4 task list (CB-019–CB-024,
  complete) and updated the narrative to three platform behaviours and `build(request)`
  → immutable `ContextPackage`; next milestone M5.
- **C5 — repository `ROADMAP.md`:** added the Milestone 4 task list and completion
  status; updated the closing narrative (collects, selects **and assembles**; returns
  `ContextPackage`) and set M5 as next.
- **C6 — repository `CHANGELOG.md`:** added the Milestone 4 `Added` entry
  (CB-019–CB-024, suite 160 → 205, structural-only note) and recorded the
  `build(request)` return-type advance `SelectionResult` → `ContextPackage` under
  `Changed`.
- This Milestone 4 retrospective created (accumulating, not overwriting M1/M2/M3).

`Code reviewed`, `Changes committed`, and milestone tagging remain **reviewer-owned**
and are intentionally left open; the reviewer has directed that Git staging, commit,
tagging, and the opening of Milestone 5 be handled as separate approved steps.
