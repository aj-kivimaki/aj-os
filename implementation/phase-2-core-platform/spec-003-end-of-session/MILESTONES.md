# SPEC-003 — Implementation Milestones

> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Specification:** SPEC-003
>
> **Status:** Milestone 1 planning **FROZEN** (reviewer: AJ, 2026-07-15) — ready to implement (EOS-001)

---

# Purpose

This document breaks the End-of-Session Workflow into independently deliverable
milestones. Each milestone:

- delivers usable, testable functionality;
- maps to a single pipeline stage (single responsibility);
- communicates with adjacent stages only through immutable contracts;
- leaves the platform buildable and testable.

The milestones prioritize a **validated vertical slice** over implementing every
agent in SPEC-003. Extensibility seams (analyzers, triggers, notifications) are
established in M1 so later capabilities are additive.

---

# Milestone Overview

| Milestone | Name | Goal | Status |
| --------- | ---- | ---- | ------ |
| M1 | Foundation & Contracts | Module, immutable contracts, and the analyzer/trigger/notification seams | ⬜ |
| M2 | Session Change Collection | Git changes collected deterministically behind the analyzer registry | ⬜ |
| M3 | Knowledge Extraction | Reusable knowledge extracted from changes via the injected text-generation port | ⬜ |
| M4 | Candidate Generation & Review Store | Canonical `CandidateKnowledge` generated and persisted to the review store | ⬜ |
| M5 | Review Package Projection, Orchestration & CLI | Human-readable projection + `createEndOfSessionWorkflow` + `aj session end` | ⬜ |

---

# Implementation Sequence

```text
M1 Foundation & Contracts
      ↓
M2 Session Change Collection
      ↓
M3 Knowledge Extraction
      ↓
M4 Candidate Generation & Review Store
      ↓
M5 Review Package Projection, Orchestration & CLI
```

Every completed milestone leaves the End-of-Session module in a working, testable
state.

---

# Milestone M1 — Foundation & Contracts

## Objective

Establish the End-of-Session module, its **immutable contracts**, and the
**extensibility seams** (analyzer registry, trigger source, notification port).
No behavior — no git access, no LLM calls, no persistence. This milestone defines
*what* the workflow exchanges, not *how* it produces it.

## Deliverables

- `src/end-of-session/` module + public entry point (`index.ts`)
- `SessionContext` (inputs) and first-class `Session` contracts (EOS-D3)
- `CandidateKnowledge` contract — the canonical SPEC-003→004 boundary (EOS-D1/D4)
- `ReviewPackage` (projection) and `SessionReport` contracts
- `SessionChange` / `ChangeSet` (analyzer output) contracts
- `Analyzer` port + registry (extensibility seam)
- `TriggerSource` seam (manual) and `NotificationPort` (no-op)
- Contract testing foundation

## Task Progress

| Task | Description | Status |
|------|-------------|--------|
| EOS-001 | Establish End-of-Session module & scaffold | ✅ |
| EOS-002 | `SessionContext` & first-class `Session` contracts | ✅ |
| EOS-003 | `CandidateKnowledge` published boundary contract | ✅ |
| EOS-004 | `ReviewPackage` (projection) & `SessionReport` contracts | ✅ |
| EOS-005 | `SessionChange`/`ChangeSet` + `Analyzer` port & registry | ✅ |
| EOS-006 | `TriggerSource` (manual) & `NotificationPort` (no-op) seams | ✅ |
| EOS-007 | Contract testing foundation | ✅ |

## Dependencies

### Requires
- SPEC-003, CONTRACTS.md, and the EOS-D1..D5 decisions (all complete)

### Enables
- Milestone M2 (analyzers produce `ChangeSet`)

## Validation

- Contracts validate valid inputs and reject invalid ones (Zod), and are deeply
  immutable (deep-freeze), tested through the public surface only.
- `npm run typecheck`, `npm run build`, `npm test` green.

## Definition of Done

- [ ] All EOS-001..EOS-007 completed.
- [ ] Contract tests passing.
- [ ] Documentation updated (README, PIPELINE-ARCHITECTURE).
- [ ] Freeze Review completed; Milestone Freeze declared by the reviewer.

---

# Milestone M2 — Session Change Collection

## Objective

Collect the session's project changes deterministically. Implement the **Git
change analyzer** behind the M1 `Analyzer` registry, producing a `ChangeSet`.
Collection is **partial with deterministic error reporting**: one analyzer
failing never aborts the workflow — the analyzer contributes either
`SessionChange`s or an `AnalyzerError`, and the `ChangeSet` carries both (mirrors
the SPEC-002 Collection model).

## Deliverables

- `GitChangeAnalyzer` (behind a small injectable git port for testability)
- Analyzer registry execution → `ChangeSet` (changes + errors)
- Deterministic change ordering
- Behaviour tests using fixture repos (no real git in unit tests)

## Task Progress

| Task | Description | Status |
|------|-------------|--------|
| EOS-101 | (defined at M2 planning) | ⬜ |

## Dependencies

### Requires
- M1 contracts and analyzer registry

### Enables
- Milestone M3 (extraction consumes `ChangeSet`)

## Validation

- The same repository state and configuration always produce the same
  `ChangeSet`, including deterministic change and error ordering.

## Definition of Done

- [ ] Git analyzer operational behind the registry.
- [ ] Partial collection with deterministic errors.
- [ ] Behaviour tests passing.
- [ ] Freeze Review completed.

---

# Milestone M3 — Knowledge Extraction

## Objective

Extract reusable knowledge from the `ChangeSet` using the injected
`TextGenerator` port and a Zod-validated extraction schema (reusing the
`src/knowledge/compiler/extraction.ts` pattern). Deterministic *structure*;
non-deterministic *content* is isolated behind the port and stubbed in tests.

## Deliverables

- `KnowledgeExtractor` (consumes `ChangeSet`, emits a validated extraction)
- Extraction schema + parser (fenced-JSON strip + `safeParse`)
- Behaviour tests with a stub `TextGenerator`

## Task Progress

| Task | Description | Status |
|------|-------------|--------|
| EOS-201 | (defined at M3 planning) | ⬜ |

## Dependencies

### Requires
- M1 contracts, M2 `ChangeSet`

### Enables
- Milestone M4 (candidate generation consumes the extraction)

## Validation

- With a fixed stubbed generator, identical `ChangeSet`s yield deep-equal
  extractions; invalid model output is rejected by the schema.

## Definition of Done

- [ ] Extractor operational behind the injected port.
- [ ] Schema validation enforced.
- [ ] Behaviour tests passing.
- [ ] Freeze Review completed.

---

# Milestone M4 — Candidate Generation & Review Store

## Objective

Transform the extraction into **canonical `CandidateKnowledge[]`** (deterministic
structure, provenance-complete) and persist it, plus the `SessionReport`, to the
**Review Store** at `<vault>/knowledge-review/pending/<session-id>/`. The store
is persistence-only and **never calls git** (ADR-002/AJS-005 §7); its destination
is validated to be non-canonical.

## Deliverables

- Candidate Generator (extraction → immutable `CandidateKnowledge[]`)
- `ReviewStore` contract + filesystem implementation (path-guarded, `appendLog`)
- Review-path config (`AjConfig.handbook.reviewPath`, default `knowledge-review`)
- Deterministic persistence (one directory per session)
- Behaviour tests using temp dirs + injected clock

## Task Progress

| Task | Description | Status |
|------|-------------|--------|
| EOS-301 | (defined at M4 planning) | ⬜ |

## Dependencies

### Requires
- M1 contracts, M3 extraction

### Enables
- Milestone M5 (projection + orchestration), and SPEC-004 (consumes the store)

## Validation

- Same extraction ⇒ deep-equal candidates and store layout.
- Destination validated `∉ {foundation/, library/, wiki/}`; path-escape guarded.

## Definition of Done

- [ ] Candidate generation deterministic and provenance-complete.
- [ ] Review store writes to `knowledge-review/pending/<session-id>/`.
- [ ] Canonical content provably untouched.
- [ ] Behaviour tests passing.
- [ ] Freeze Review completed.

---

# Milestone M5 — Review Package Projection, Orchestration & CLI

## Objective

Render the **human-readable `ReviewPackage`** deterministically *from* the
canonical candidates + `Session` (EOS-D4), compose the whole workflow at a single
composition root, and expose it as the thin `aj session end` command. Manual
trigger only; notification is a no-op. **No git commit, no wiki generation.**

## Deliverables

- Review Package projector (candidates + session → markdown)
- `createEndOfSessionWorkflow(config, deps)` composition root → `{ workflow, store }`
- `aj session end` command (`--since <ref>`, `--notes`) modeled on `wiki build`
- Execution logging + `SessionReport` summary output
- Integration + acceptance tests (fixture repo + fixture vault, stubbed generator)

## Task Progress

| Task | Description | Status |
|------|-------------|--------|
| EOS-401 | (defined at M5 planning) | ⬜ |

## Dependencies

### Requires
- M1–M4

### Enables
- Deferred orchestration milestone (git commit + wiki generation), SPEC-004

## Validation

- End-to-end run over a fixture repo + fixture vault writes the review store and
  returns a correct `SessionReport`.
- Acceptance: review package generated; candidates identified; canonical
  unchanged; logs recorded (SPEC-003 §18/§19).

## Definition of Done

- [ ] Projection deterministic from canonical candidates.
- [ ] Composition root + `aj session end` operational.
- [ ] Integration + acceptance tests passing.
- [ ] Freeze Review completed; **v1 vertical slice complete**.

---

# Cross-Milestone Risks

- **Overbuilding toward the full 6-agent spec.** Mitigation: strict v1 scope;
  seams keep later agents additive.
- **Candidate contract instability.** Mitigation: freeze `CandidateKnowledge`
  early (EOS-003) with a distinct reviewer.
- **LLM non-determinism leaking into tests.** Mitigation: single port, stubbed.
- **Premature side effects.** Git/wiki orchestration is explicitly deferred; do
  not introduce it inside the capture pipeline.

---

# Deferred (post-v1)

Documentation & Lessons-Learned analyzers · additional triggers (git hook /
scheduled / IDE / n8n) · real notifications · **git-commit ownership + wiki-
generator orchestration** · playbooks / suggested-doc-updates / automation-ideas
· handbook dedupe (owned by SPEC-004).

---

# Completion Criteria (v1)

- [ ] M1–M5 completed and frozen.
- [ ] Every M1 task (EOS-001..EOS-007) and each later milestone's tasks completed.
- [ ] SPEC-003 acceptance criteria satisfied for the v1 scope.
- [ ] The review store is consumable by SPEC-004.

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.2 | **M1 implementation complete — EOS-001..EOS-007 all done**, each independently reviewed and committed. Contract testing foundation (EOS-007) consolidated the immutability idiom onto a shared `firstUnfrozenPath` inspector and added module-wide foundation guards. End-of-Session suite: **98 tests / 10 files**; full platform suite **438 tests / 42 files**, all green. Pending the Milestone 1 Freeze Review. |
| 2026-07-15 | 1.1 | **Milestone 1 Planning Freeze ratified by the reviewer (AJ).** M1 (EOS-001..EOS-007) is frozen and ready to implement; M2–M5 remain planned (task breakdowns authored at each milestone's planning). Subsequent plan changes follow the AJS-007 Frozen Plan Change Proposal process. |
| 2026-07-15 | 1.0 | Milestone roadmap created (M1–M5). M1 decomposed into EOS-001..EOS-007 and planning-frozen; M2–M5 objectives/deliverables defined, task breakdowns to be authored at each milestone's planning. |

---

> **Engineering Rule**
>
> Every milestone must leave the End-of-Session Workflow in a usable, testable
> state. Milestone progress is updated after every completed task. A milestone is
> not complete until every task assigned to it is completed and validated.
