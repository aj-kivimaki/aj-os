# SPEC-002 Milestone 1 — Retrospective

> **Milestone:** M1 — Foundation (CB-001 → CB-006)
> **Outcome:** PASS WITH MINOR CORRECTIONS — frozen after documentation corrections.
> **Date:** 2026-07-08

---

## Summary

Milestone 1 delivered the Context Builder's foundation: the module boundary,
the public configuration contract and factory, the Context Package contract
(AJS-002 Appendix B), the Knowledge Provider contracts, the Provider Registry,
and a permanent contract-testing foundation (63 tests). No collection, ranking,
assembly or explainability *behaviour* was implemented — by design.

Validation at freeze: `npm run typecheck`, `npm run build`, and `npm test`
(63 passing) all green; `dist/` contains no test artifacts.

---

## What worked well

- **Contracts before behaviour.** Reifying AJS-002 Appendix B as an immutable,
  serialization-independent contract *first* gives every later milestone a
  stable target to populate rather than redesign.
- **Composition across contracts.** `KnowledgeItem.source` reuses CB-003's
  `SourceReference`, so the citable-source shape flows provider → package
  unchanged. One model, not two.
- **Executable principles.** "Explainable" and "self-contained" became validated
  invariants (unique ids, unique section kinds, referential integrity) instead of
  documentation. These also produced the strongest negative test cases.
- **Types inferred from schemas.** Runtime (Zod) and compile-time contracts
  cannot drift; `.strict()` turns "explicit" into a runtime guarantee.
- **Public-entry-only tests.** Every test imports from `index.js`, making
  "test contracts, not internals" a structural property.
- **Scope discipline.** No M2+ code appeared early; the stated over-engineering
  risk did not materialize.

## Engineering discoveries

- **`rootDir` and a test folder collide by default.** With `rootDir: ./src`, any
  `.ts` outside `src` breaks `tsc`. Scoping the compiler (`include: ["src"]`) and
  delegating test transform to Vitest is the clean split — build owns shipped
  code, runner owns tests. (Anticipated in CB-001, resolved in CB-006.)
- **Deep-freeze needs deep tests.** Asserting `Object.isFrozen` on nested
  arrays/objects is what actually protects the deep-freeze contract.
- **"Metadata bag" is a trap.** A generic provider `metadata` field would have
  smuggled provider-specific data back into a provider-agnostic contract.
  Explicit, stable fields kept it clean.
- **Not every module needs a `schema.ts`.** A service that composes an existing
  contract (the registry) adds no new data shape; a schema file would be ceremony.

## Process improvements

- **A shared immutability utility is overdue.** `deepFreeze` is duplicated in
  `package/` and `providers/`, and `DeepReadonly` is imported cross-module from
  an internal file. Deferred (correctly) to avoid churning reviewed code, but it
  should be an explicit early task in a future milestone rather than lingering
  debt. Recommend an internal `context-builder/internal/immutable.ts`.
- **Keep top-level status docs in the task's Definition of Done.** README/ROADMAP
  drifted (CB-006 shown incomplete after completion) because updating them was
  not part of each task's closeout. Add "top-level README/ROADMAP reflects
  milestone status" to the milestone-completion checklist.
- **Normalize task status vocabulary.** CB-001–006 used "Planned"/"Implemented"/
  "Completed" inconsistently. Pick one terminal state ("Completed").

## Architectural observations

- The `providers → package → (SourceReference)` dependency is the right
  direction and should be preserved: input contracts may depend on the output
  contract's shared vocabulary, never the reverse.
- The contract surface is minimal and immutable; future behaviour populates
  these structures without redefining them — the intended platform-maturity
  layering (Contracts → Services → Behaviour → Consumers) holds.

## Reusable implementation patterns

- **Factory + frozen plain handle** (`createX() → Object.freeze({...})`) — no
  exported classes; consumers never instantiate internals.
- **Schema-derived types + `.strict()` + parse-and-freeze** as the standard
  contract idiom for every AJ-OS data contract.
- **Public-entry-only contract tests** as the reference test structure for future
  platform services.
- **`kind`-tagged ordered sections with opaque `content`** — defers rendering
  while keeping the contract portable.

## Deferred improvements (recommended future tasks)

1. Extract a single internal deep-freeze / `DeepReadonly` utility (removes the
   only real duplication). — **Deferred.** Recommend an early cleanup task in a
   future milestone.
2. ~~Add `owner` to the `CONTEXT_BUILDER` identity constant (full AJS-004
   metadata).~~ — **Done during freeze.**
3. Single source for the Context Builder version (identity constant vs package
   `contextBuilderVersion`). — **Deferred.** Revisit when assembly lands (M4).
4. Standards cleanup: reconcile the AJS-002 body's 11-section list with
   Appendix B's 12 sections. — **Deferred.** Standards pass, outside the freeze.
5. ~~CHANGELOG `[Unreleased]`: add a Context Builder foundation entry.~~
   — **Done during freeze.**

## Recommendations for future specifications

- Continue delivering **contract-first, behaviour-later** milestones; it kept M1
  small, testable, and freeze-ready.
- Make "top-level status docs updated" and "shared utilities not duplicated"
  explicit checklist items in each milestone's Definition of Done.
- Preserve the public-entry-only test convention as a platform-wide standard.
