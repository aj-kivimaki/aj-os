# SPEC-003 — Implementation Milestones

> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Specification:** SPEC-003
>
> **Status:** Milestone 1 (Foundation & Contracts) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-15). Milestone 2 (Session Change Collection) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-16). Milestone 3 (Knowledge Extraction) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-16). Milestone 4 (Candidate Generation & Review Store) task breakdown (EOS-301..303) **PLANNING-FROZEN** by the reviewer (AJ) on 2026-07-16; EOS-D6 accepted (domain-aware Review Store API). Implementation may begin with EOS-301 under the AJS-007 cycle.

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
| M1 | Foundation & Contracts | Module, immutable contracts, and the analyzer/trigger/notification seams | ✅ |
| M2 | Session Change Collection | Git changes collected deterministically behind the analyzer registry | ✅ |
| M3 | Knowledge Extraction | Reusable knowledge extracted from changes via the injected text-generation port | ✅ |
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

- [x] All EOS-001..EOS-007 completed.
- [x] Contract tests passing.
- [x] Documentation updated (README, PIPELINE-ARCHITECTURE).
- [x] Freeze Review completed; Milestone Freeze declared by the reviewer.
      _(Freeze Review performed and **Milestone 1 Freeze declared by the reviewer
      (AJ) on 2026-07-15** — all six criteria satisfied: tasks complete, contracts
      aligned with the frozen plan, documentation synchronized, public API minimal
      and intentional, no architectural drift, Definition of Done met.)_

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
| EOS-101 | Collection Execution Stage (analyzer-agnostic; partial collection, deterministic ordering → `ChangeSet`) | ✅ |
| EOS-102 | Git Port & GitChangeAnalyzer (injectable read-only `GitPort`, first concrete analyzer; no real git in unit tests) | ✅ |
| EOS-103 | Integration & Behaviour Tests (real `GitPort` adapter, end-to-end wiring, determinism, partial collection) | ✅ |

_Task breakdown **PLANNING-FROZEN** by the reviewer (AJ) on 2026-07-15. All M2
tasks (EOS-101..103) implemented, reviewed, and committed. **M2 is
implementation-complete and awaiting the Freeze Review.**_

## Dependencies

### Requires
- M1 contracts and analyzer registry

### Enables
- Milestone M3 (extraction consumes `ChangeSet`)

## Validation

- The same repository state and configuration always produce the same
  `ChangeSet`, including deterministic change and error ordering.

## Definition of Done

- [x] Git analyzer operational behind the registry.
- [x] Partial collection with deterministic errors.
- [x] Behaviour tests passing.
- [x] Freeze Review completed. _(**Milestone 2 Freeze declared by the reviewer
      (AJ) on 2026-07-16.** Objectives satisfied — deterministic collection
      execution, correct partial collection, git analyzer behind the read-only
      `GitPort`, minimal policy-free adapter, integration tests validating the full
      pipeline, no architectural drift. DoD met.)_

## Future Hardening (reviewer-accepted deferral)

- **`createGitPort` `execFile` `maxBuffer`.** The adapter uses Node's default
  1 MB `execFile` `maxBuffer`; an extremely large `git diff --name-status` could
  exceed it, which degrades **correctly** into a recoverable `AnalyzerError`
  (partial collection). The reviewer **accepted the current implementation** at
  the M2 Freeze (2026-07-16) and recorded this as a **future hardening
  consideration**, consistent with M2's minimal-adapter philosophy — not expanded
  now. See EOS-103 and [Deferred (post-v1)](#deferred-post-v1).

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
| EOS-201 | `KnowledgeExtraction` contract, schema & parser (immutable internal contract, `ExtractionError`, fence-strip/validate/deep-freeze `parseExtractionResponse`) | ✅ |
| EOS-202 | Knowledge Extractor stage (EOS-local `TextGenerator` port, deterministic `buildExtractionPrompt`, `createKnowledgeExtractor` wiring; stub-driven behaviour/determinism tests) | ✅ |

_Task breakdown **PLANNING-FROZEN** by the reviewer (AJ) on 2026-07-16 —
decomposed into EOS-201 (extraction contract + parser) and EOS-202 (extractor stage
behind the injected `TextGenerator` port), following the same per-milestone
planning used for M1/M2. No separate integration/tests task is warranted: unlike M2
(which introduced the real `GitPort` adapter in EOS-103), M3 has no new production
adapter — the platform `AIClient` already satisfies the port and is stubbed in
tests — so behaviour and determinism tests live with the extractor they validate
(EOS-202), mirroring the compiler._

_The reviewer approved: the two-task decomposition; keeping `TextGenerator` local
to SPEC-003; `parseExtractionResponse` owning fence-stripping, JSON parsing,
validation, and immutability; and treating `KnowledgeExtraction` as an **internal**
implementation contract, not a cross-spec boundary. Before freezing, the reviewer
required — and EOS-202 now records — an explicit **Extractor Invariant**: the
Knowledge Extractor performs **orchestration and structural validation only**; it
must not classify, deduplicate, merge, score, or otherwise interpret extracted
knowledge beyond validating the contract (those responsibilities remain outside
M3). The reviewer judged **no EOS-D6 warranted** — the port ownership follows the
existing architectural pattern and records no genuine architectural decision. The
M3 breakdown is frozen; EOS-201 may begin under the AJS-007 implementation cycle._

_M3 tasks (EOS-201, EOS-202) implemented, reviewed, and committed under the AJS-007
cycle. **Milestone 3 Freeze declared by the reviewer (AJ) on 2026-07-16.** M3 is
frozen; changes to M3 now follow the AJS-007 Frozen Plan Change Proposal process._

## Dependencies

### Requires
- M1 contracts, M2 `ChangeSet`

### Enables
- Milestone M4 (candidate generation consumes the extraction)

## Validation

- With a fixed stubbed generator, identical `ChangeSet`s yield deep-equal
  extractions; invalid model output is rejected by the schema.

## Definition of Done

- [x] Extractor operational behind the injected port.
- [x] Schema validation enforced.
- [x] Behaviour tests passing.
- [x] Freeze Review completed. _(**Milestone 3 Freeze declared by the reviewer
      (AJ) on 2026-07-16.** Objectives satisfied — the `KnowledgeExtraction` contract
      implemented; parsing, validation, and immutability established; the Knowledge
      Extractor kept a simple orchestrator; non-determinism correctly isolated behind
      the injected `TextGenerator`; deterministic prompt construction;
      provider-independent behaviour tests; no architectural drift. DoD met.)_

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
| EOS-301 | Candidate Generator (deterministic `KnowledgeExtraction` → canonical `CandidateKnowledge[]`: authoritative kind, `session:<id>:<n>` identity, complete provenance; injected clock; Candidate Generation Invariant) | ✅ |
| EOS-302 | Review Store (`ReviewStore` + `createFilesystemReviewStore`: persistence-only, path-guarded, non-canonical destination guard, per-session layout writing candidates JSON + `SessionReport` + `log.md`; no git) | ✅ |
| EOS-303 | Review-path configuration (`AjConfig.handbook.reviewPath`, default `knowledge-review`, mirroring `generatedWikiPath`) | ⬜ |

_Task breakdown **PLANNING-FROZEN** by the reviewer (AJ) on 2026-07-16, following the
same per-milestone planning approved for M1–M3. Decomposed into three low-coupling,
independently reviewable tasks: EOS-301 (pure deterministic candidate generation),
EOS-302 (persistence-only review store), and EOS-303 (the `reviewPath` platform config
knob). M4 objective/deliverables unchanged (within the frozen plan). No separate
integration/tests task: each stage's behaviour tests live with it (the M3 precedent —
EOS-302 uses temp dirs, no real vault), and end-to-end integration is M5's acceptance
test (the two M4 stages are wired together only in M5 composition)._

_Reviewer-ratified decisions: (1) the **Review Store exposes a domain-aware API**
(`saveCandidates`/`saveReport`/`appendLog`/`locate`) rather than a semantics-free
path-keyed surface — recorded as **[EOS-D6](decisions/EOS-D6-review-store-domain-api.md)**,
establishing the long-term SPEC-003 → SPEC-004 filesystem boundary; (2) candidates
persisted as **one canonical JSON file per candidate**; (3) **kind classification is a
validated pass-through** (v1); (4) **`related` initialized empty** (v1); (5) the
**non-canonical destination guard runs at Review Store construction**. Per the
reviewer's requirement before freeze, the **Candidate Generation Invariant** (EOS-301)
was strengthened to state it explicitly: candidate generation is a **deterministic
one-to-one structural mapping** — each `KnowledgeExtraction` finding produces exactly
one `CandidateKnowledge`; the generator must not merge, split, reorder, invent, or
remove findings. The M4 breakdown is frozen; **EOS-301 may begin under the AJS-007
implementation cycle.**_

## Dependencies

### Requires
- M1 contracts (`CandidateKnowledge`, `SessionReport`), M3 extraction (`KnowledgeExtraction`)

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
· handbook dedupe (owned by SPEC-004) · **`createGitPort` `execFile` `maxBuffer`
hardening** (reviewer-accepted deferral at the M2 Freeze; large-diff resilience
beyond the graceful `AnalyzerError` fallback).

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
| 2026-07-16 | 1.13 | **M4 Planning Freeze ratified by the reviewer (AJ).** M4 Planning Review passed; the EOS-301/302/303 breakdown and its decisions are approved. Reviewer ratified: the **domain-aware Review Store API** (recorded as **EOS-D6** — the long-term SPEC-003→004 filesystem boundary), **one canonical JSON file per candidate**, **kind classification as a validated pass-through** (v1), **`related` initialized empty** (v1), and the **non-canonical destination guard at store construction**. Per the reviewer's requirement, the **Candidate Generation Invariant** was strengthened before freeze to state the property explicitly — candidate generation is a **deterministic one-to-one structural mapping**: each finding produces exactly one candidate; no merge/split/reorder/invent/remove (`candidates.length === findings.length`, order-preserving). The M4 breakdown is frozen; EOS-301 may begin under the AJS-007 implementation cycle. |
| 2026-07-16 | 1.12 | **M4 (Candidate Generation & Review Store) task breakdown authored** — decomposed into EOS-301 (deterministic Candidate Generator: `KnowledgeExtraction` → canonical `CandidateKnowledge[]` with authoritative kind, `session:<id>:<n>` identity, complete provenance, injected clock; Candidate Generation Invariant), EOS-302 (persistence-only Review Store: `ReviewStore` + `createFilesystemReviewStore`, path-guarded, non-canonical destination guard, per-session layout of candidate JSON + `SessionReport` + `log.md`, no git; Persistence Invariant), and EOS-303 (`AjConfig.handbook.reviewPath` config, mirroring `generatedWikiPath`). Three low-coupling, independently reviewable tasks; no separate integration/tests task (behaviour tests co-located per the M3 precedent; end-to-end integration is M5). Two decisions flagged for the Planning Review: the Review Store surface (domain-aware vs. semantics-free — possible **EOS-D6**) and the candidate persistence format/layout (canonical JSON, one file per candidate). M4 objective/deliverables unchanged. **Pending M4 Planning Review + Planning Freeze** before EOS-301 implementation. |
| 2026-07-16 | 1.11 | **Milestone 3 (Knowledge Extraction) Freeze declared by the reviewer (AJ).** Freeze Review passed: the `KnowledgeExtraction` contract implemented; parsing, validation, and immutability established; the Knowledge Extractor kept a simple orchestrator; non-determinism correctly isolated behind the injected `TextGenerator`; deterministic prompt construction; provider-independent behaviour tests; no architectural drift — M3 Definition of Done fully satisfied. M3 is frozen; changes now follow the AJS-007 Frozen Plan Change Proposal process. Next: **M4 (Candidate Generation & Review Store)**, beginning with M4 planning (EOS-3xx decomposition → Planning Review → Planning Freeze). |
| 2026-07-16 | 1.10 | **M3 (Knowledge Extraction) implementation complete — EOS-201..202 all done**, each independently code-reviewed and committed. EOS-201 (`KnowledgeExtraction` internal contract + `ExtractionError` + fence-strip/validate/deep-freeze `parseExtractionResponse`) and EOS-202 (Knowledge Extractor stage: EOS-local `TextGenerator` port, pure/deterministic `buildExtractionPrompt`, `createKnowledgeExtractor` wiring prompt → generate → parse; frozen handle; Extractor Invariant enforced by shape). Public surface: 4 new operations (`parseExtractionResponse`, `ExtractionError`, `createKnowledgeExtractor`, `buildExtractionPrompt`). End-of-Session suite grew to **15 files / 167 tests**; full platform suite **507 tests / 47 files**, all green. M3 Integration Check satisfied — extraction is the one non-deterministic seam, isolated behind the injected port; no git/wiki side effect, `run` entry point unchanged. **Pending the M3 Freeze Review.** |
| 2026-07-16 | 1.9 | **M3 Planning Freeze ratified by the reviewer (AJ).** M3 Planning Review passed; the EOS-201/EOS-202 breakdown and its architectural choices are approved (two-task decomposition; EOS-local `TextGenerator`; `parseExtractionResponse` owning fence-strip/parse/validate/immutability; `KnowledgeExtraction` as an internal, non-boundary contract). Per the reviewer's request, an explicit **Extractor Invariant** (orchestration + structural validation only — no classify / deduplicate / merge / score / enrich) was recorded in EOS-202 before freeze. **EOS-D6 judged unnecessary** — port ownership follows the existing pattern with no genuine decision to record. The M3 breakdown is frozen; EOS-201 may begin under the AJS-007 implementation cycle. |
| 2026-07-16 | 1.8 | **M3 (Knowledge Extraction) task breakdown authored** — decomposed into EOS-201 (`KnowledgeExtraction` contract, schema & fence-strip/validate/deep-freeze parser + `ExtractionError`) and EOS-202 (Knowledge Extractor stage: EOS-local `TextGenerator` port, deterministic `buildExtractionPrompt`, `createKnowledgeExtractor` wiring, stub-driven behaviour/determinism tests), following the same per-milestone planning approved for M1/M2. M3 objective/deliverables unchanged (within the frozen plan). No separate tests/integration task (no new production adapter in M3 — the stubbed port is the test double). Two decisions flagged for the review: port ownership (EOS-local vs. promoted `TextGenerator`, possible EOS-D6) and parser layering. **Pending M3 Planning Review + Planning Freeze** before EOS-201 implementation. |
| 2026-07-16 | 1.7 | **Milestone 2 (Session Change Collection) Freeze declared by the reviewer (AJ).** Freeze Review passed: deterministic collection execution, correct partial collection, git analyzer behind the read-only `GitPort`, a minimal policy-free adapter, integration tests validating the full pipeline, and no architectural drift — M2 Definition of Done fully satisfied. The `createGitPort` `execFile` `maxBuffer` note is **reviewer-accepted** and recorded as future hardening (not expanded now; current behavior degrades correctly into a recoverable `AnalyzerError`). M2 is frozen; changes to M2 now follow the AJS-007 Frozen Plan Change Proposal process. Next: **M3 (Knowledge Extraction)**, beginning with M3 planning (EOS-2xx decomposition → Planning Review → Planning Freeze). |
| 2026-07-16 | 1.6 | **M2 (Session Change Collection) implementation complete — EOS-101..103 all done**, each independently code-reviewed and committed. EOS-101 (`collectChanges` execution stage), EOS-102 (read-only `GitPort` + pure-translator `GitChangeAnalyzer`), EOS-103 (minimal git-backed `createGitPort` adapter + end-to-end integration/determinism/partial-collection tests over disposable fixture repos). Public surface: 14 operations. End-of-Session suite grew to **45 tests across the new files**; full platform suite **476 tests / 45 files**, all green. M2 Integration Check satisfied; no git-write/wiki side effect entered the pipeline. **Pending the M2 Freeze Review.** |
| 2026-07-15 | 1.5 | **M2 Planning Freeze ratified by the reviewer (AJ).** M2 Planning Review passed; the EOS-101..103 task breakdown and its architectural decisions are approved (direct `collectChanges` call over a speculative engine wrapper; execution-caught failures treated as recoverable; read-only `GitPort`; real git adapter in EOS-103; range construction deferred outside the analyzer). Per the reviewer's request, an explicit **execution determinism invariant** (deterministic w.r.t. registry order and analyzer outputs) was recorded in EOS-101 before freeze. The M2 breakdown is frozen; EOS-101 may begin under the AJS-007 implementation cycle. |
| 2026-07-15 | 1.4 | **M2 (Session Change Collection) task breakdown authored** — decomposed into EOS-101 (Collection Execution Stage), EOS-102 (Git Port & GitChangeAnalyzer), EOS-103 (Integration & Behaviour Tests), following the same per-milestone planning the reviewer approved. M2 objective/deliverables unchanged (within the frozen plan). **Pending M2 Planning Review + Planning Freeze** before EOS-101 implementation. |
| 2026-07-15 | 1.3 | **Milestone 1 Freeze declared by the reviewer (AJ).** Freeze Review passed all six criteria; the M1 Definition of Done is fully satisfied. M1 (Foundation & Contracts) is frozen; changes to M1 contracts now follow the AJS-007 Frozen Plan Change Proposal process. Next implementation target: **M2 — Session Change Collection**. |
| 2026-07-15 | 1.2 | **M1 implementation complete — EOS-001..EOS-007 all done**, each independently reviewed and committed. Contract testing foundation (EOS-007) consolidated the immutability idiom onto a shared `firstUnfrozenPath` inspector and added module-wide foundation guards. End-of-Session suite: **98 tests / 10 files**; full platform suite **438 tests / 42 files**, all green. Pending the Milestone 1 Freeze Review. |
| 2026-07-15 | 1.1 | **Milestone 1 Planning Freeze ratified by the reviewer (AJ).** M1 (EOS-001..EOS-007) is frozen and ready to implement; M2–M5 remain planned (task breakdowns authored at each milestone's planning). Subsequent plan changes follow the AJS-007 Frozen Plan Change Proposal process. |
| 2026-07-15 | 1.0 | Milestone roadmap created (M1–M5). M1 decomposed into EOS-001..EOS-007 and planning-frozen; M2–M5 objectives/deliverables defined, task breakdowns to be authored at each milestone's planning. |

---

> **Engineering Rule**
>
> Every milestone must leave the End-of-Session Workflow in a usable, testable
> state. Milestone progress is updated after every completed task. A milestone is
> not complete until every task assigned to it is completed and validated.
