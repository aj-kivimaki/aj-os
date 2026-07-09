# Decision: CB-021 Assembly Inputs & Metadata Composition

> **Task:** CB-021 — Assembly Inputs & Metadata Composition
> **Date:** 2026-07-10
> **Status:** Accepted — reviewer-approved planning gate before CB-022.

---

## Context

CB-021 fixes the complete deterministic **input set** to Assembly's `assemble`
operation and the **metadata composition** rule for the `ContextPackage`
(AD-006, AD-007). It builds directly on the section-composition model already
fixed by CB-020, and completes the pair of Assembly decision tasks that CB-022
will realize as executable behaviour.

This is a **decision task**: it specifies and records the rule; it constructs no
`ContextPackage`, implements no `assemble`, and adds no code or tests. This
mirrors the CB-015 (Selection Policy) → CB-016 (execution) split and the CB-020
(section strategy) → CB-022 (execution) split. The executable metadata
composition lands in CB-022; construction-time injection is wired into `build`
in CB-023.

The decision is bounded by the frozen architecture and the frozen contracts:

- **AD-006 / AD-007** — Assembly composes package metadata deterministically; the
  package is a pure function of its inputs.
- **AJS-007 §6.1 / RC-3 (Determinism by Construction)** — determinism is achieved
  by construction, not by test: no ambient clock, randomness, or external state
  may enter Assembly.
- **CB-019** — the Assembly Engine holds **nothing** at construction
  (`createAssemblyEngine()` takes no arguments); every runtime input arrives at
  the `assemble` call. This decision must preserve that boundary.
- **CB-003** — the `contextPackageMetadataSchema` and `ContextPackageMetadata`
  type are **frozen**. This decision defines nothing new; it maps single sources
  onto the existing frozen fields.
- **CB-014** — `SelectionResult` carries ordered `selectedItems` and provenance
  `metadata`; that `metadata` is the CB-004 `KnowledgeRequest`
  (`{ project, task, branch?, commit?, issue? }`), reused wholesale.
- **CB-002 / identity constant** — `CONTEXT_BUILDER.version` is the single source
  of the Context Builder's own version.

### Naming note (frozen contract wins)

The CB-021 task text uses snake_case labels (`generated_at`, `context_version`,
`context_builder_version`) as **conceptual** wording. The canonical, frozen
`ContextPackageMetadata` contract (CB-003) uses **camelCase** field names. This
decision records the rule against the frozen camelCase fields; the snake_case
planning terminology does not override the frozen contract. (Reviewer-approved,
2026-07-10.)

---

## Decision

### 1. The complete `assemble` input set

`assemble` takes exactly two explicit inputs and reads no ambient state:

1. **`selectionResult: SelectionResult`** (CB-014) — the ordered `selectedItems`
   and the provenance `metadata` the selection answered.
2. **An injected `generatedAt` timestamp** (Reviewer Decision B) — a
   caller-supplied ISO-8601 timestamp string, injected at Context Builder
   construction time and passed through to `assemble` as an explicit argument.

No other input exists. Version constants (§2) are module-level identity constants,
not runtime inputs. This is the complete, closed input set; CB-022 introduces the
`assemble` signature that realizes it, and CB-023 wires the construction-time
injection of `generatedAt` into `build`.

**Boundary preservation (CB-019).** Keeping `generatedAt` an explicit `assemble`
argument — rather than a value the engine holds — keeps `createAssemblyEngine()`
construction-dependency-free and the engine stateless. The engine never reads a
clock; the timestamp flows through the call.

### 2. `ContextPackage.metadata` composition and field ownership

Every field of the frozen `contextPackageMetadataSchema` (CB-003) has exactly one
deterministic source:

| Metadata field (frozen, CB-003) | Type (frozen) | Single source |
| ------------------------------- | ------------- | ------------- |
| `project`                       | `string` (min 1) | `SelectionResult.metadata.project` (CB-014 provenance) |
| `task`                          | `string` (min 1) | `SelectionResult.metadata.task` |
| `branch?`                       | `string` (min 1), optional | `SelectionResult.metadata.branch` (optional; present iff provided) |
| `commit?`                       | `string` (min 1), optional | `SelectionResult.metadata.commit` (optional; present iff provided) |
| `generatedAt`                   | ISO-8601 datetime string | the injected `generatedAt` input (Decision B) — construction-time injection, **no ambient clock** |
| `contextBuilderVersion`         | `string` (min 1) | `CONTEXT_BUILDER.version` (the single identity constant) |
| `contextVersion`                | `string` (min 1) | one fixed canonical contract-version constant (**ownership fixed here; the constant is introduced in CB-022** — see §3) |

The rule is:

- **Provenance is reused, not recomputed** (Compose Contracts). `project`, `task`,
  `branch?`, `commit?` flow unchanged from `SelectionResult.metadata`. Optional
  fields are carried through exactly: present in the package metadata **iff**
  present in the provenance; never defaulted, inferred, or fabricated.
- **`generatedAt` is injected** (Decision B / RC-3). It is a pure input, so
  identical inputs — including the injected timestamp — yield an identical
  package. The frozen schema types it as `z.iso.datetime()`, so the injected
  value is an ISO-8601 timestamp **string**.
- **Versions are single-sourced.** The two distinct version fields resolve to two
  distinct single sources: `contextBuilderVersion ← CONTEXT_BUILDER.version` (the
  producing agent's version) and `contextVersion ←` one fixed canonical
  contract-version constant (the contract the package conforms to). These are not
  interchangeable and are never derived from each other.

### 3. Single canonical source of `contextVersion` (ownership only)

`contextVersion` **shall have a single canonical source** — one fixed
contract-version constant, referenced by Assembly and never inlined at more than
one site. This decision establishes **ownership only**. The constant itself
(its exact name, value, and module placement) is **introduced during CB-022** as
an implementation detail of the executable metadata composition. CB-021 fixes
that the source is single and canonical; it introduces no constant and no code.
(Reviewer-approved, 2026-07-10.)

### 4. `KnowledgeRequest.issue` is intentionally dropped

`SelectionResult.metadata` is the CB-004 `KnowledgeRequest`, which includes an
optional `issue` field. The frozen `ContextPackageMetadata` (CB-003) has **no
`issue` field** and is `.strict()`. Therefore `issue` has no metadata home and is
**intentionally dropped at assembly**. This is a deliberate, recorded decision,
not an omission: Assembly copies only the four provenance fields the frozen
contract declares (`project`, `task`, `branch?`, `commit?`) and lets `issue`
fall away. No frozen contract is changed to accommodate it.

### 5. Determinism by construction (RC-3)

The composed metadata is a **pure function of the two explicit inputs**. Assembly
reads no clock, no randomness, no environment, and no external state. Every field
is either reused from `SelectionResult.metadata`, taken from the injected
`generatedAt`, or read from a fixed module-level constant. Identical inputs
therefore always produce identical metadata — determinism holds by construction,
not by test (AJS-007 §6.1).

---

## Rationale

- **Explicit injection over ambient state.** Making `generatedAt` an explicit
  `assemble` input is the mechanism that keeps Assembly pure (RC-3) while leaving
  the CB-019 boundary intact: the engine stays construction-dependency-free and
  stateless, and the only non-provenance value — time — enters as data, not as a
  side effect. This is why Decision B injects at construction and passes through
  `assemble`, rather than letting the engine read `Date.now()`.
- **Reuse provenance, don't recompute it.** The request provenance already flowed
  through Collection (CB-009) and Selection (CB-014) unchanged. Copying it into
  the package metadata (rather than recomputing or re-deriving it) guarantees it
  can never drift from the request the pipeline actually answered, and keeps the
  pipeline single-sourced.
- **Two versions, two sources.** Conflating `contextBuilderVersion` and
  `contextVersion` would couple the producing agent's release version to the
  contract's version. They answer different questions ("what produced this?" vs.
  "what shape is this?"), so they are single-sourced separately. This also closes
  the M1/M2/M3 deferred version-sourcing item.
- **Absence over invention.** `issue` is dropped rather than shoehorned into an
  unrelated field or used to justify a frozen-contract change. The frozen
  `.strict()` metadata contract defines the exact metadata surface; Assembly
  honours it exactly.

---

## Consequences

- CB-022 implements this exact composition inside `assemble`, constructing the
  package through the frozen `parseContextPackage()` contract (CB-003), and
  introduces the single canonical `contextVersion` constant whose ownership is
  fixed here.
- CB-023 wires the construction-time injection of `generatedAt` into
  `build(request)`.
- CB-024 protects the composition with permanent tests, including determinism
  (identical inputs → deep-equal package) and the `issue`-drop.
- The `assemble` input set is now closed: `SelectionResult` + injected
  `generatedAt`. No later Assembly task may add an ambient input without a Frozen
  Plan Change Proposal.

## Scope / Non-Goals

- No `assemble` implementation and no `ContextPackage` construction (CB-022).
- No section-composition rule (owned by CB-020).
- No wiring of construction-time injection into `build` (CB-023).
- No rendering, semantic validation, explainability computation, or profiles
  (AD-009).
- No new constant and no code of any kind; the `contextVersion` constant is
  introduced in CB-022.
- No modification of any frozen contract or of the frozen Planning Package.

## Follow-up (non-blocking, flagged at freeze)

Align **AD-006 / AD-007** wording to the injected-metadata model (construction-time
injected `generatedAt`; the closed two-input `assemble` set). This is a
non-blocking documentation follow-up on frozen architecture text and is **not**
performed by CB-021; it is recorded here so it is not lost.

## References

SPEC-002 · AJS-002 (Appendix B v1.0) · AJS-007 §6.1 (Determinism by Construction) ·
PIPELINE-ARCHITECTURE.md · M4 Planning Package · AD-006, AD-007 · Reviewer
Decision B · RC-3 · CB-003 (`ContextPackageMetadata`, frozen) · CB-014
(`SelectionResult` provenance) · CB-002 / `CONTEXT_BUILDER.version` · CB-019
(Assembly Engine boundary) · CB-020 (section composition).

## Change Log

| Date       | Version | Description                                              |
| ---------- | ------- | -------------------------------------------------------- |
| 2026-07-10 | 1.0     | Initial decision recorded and reviewer-approved (planning gate): closed two-input `assemble` set (`SelectionResult` + injected `generatedAt`); per-field single sources over the frozen camelCase `ContextPackageMetadata`; `contextVersion` single-source ownership fixed (constant introduced in CB-022); `issue` intentionally dropped; determinism by construction (RC-3). No code, no frozen contract changed. |
