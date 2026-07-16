# SPEC-003 — Implementation Milestones

> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Specification:** SPEC-003
>
> **Status:** Milestone 1 (Foundation & Contracts) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-15). Milestone 2 (Session Change Collection) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-16). Milestone 3 (Knowledge Extraction) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-16). Milestone 4 (Candidate Generation & Review Store) **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-16) — EOS-301..303 implemented, reviewed, and committed; EOS-D6 accepted (domain-aware Review Store API). Milestone 5 (Review Package Projection, Orchestration & CLI) — **task breakdown PLANNING-FROZEN by the reviewer (AJ) on 2026-07-16** (EOS-401..409, plus **EOS-410** added by the approved EOS-D10 FPCP). EOS-D7, EOS-D8, EOS-D9, and EOS-D10 accepted; the **Orchestrator Invariant** (EOS-406) and **Report Builder Invariant** (EOS-405) recorded at the reviewer's requirement. **In progress: EOS-401, 402, 403, 404, 405, and 410 are complete; EOS-406 is next**, then EOS-407 → EOS-408 → EOS-409 — see [Milestone M5](#milestone-m5--review-package-projection-orchestration--cli).

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
| M4 | Candidate Generation & Review Store | Canonical `CandidateKnowledge` generated and persisted to the review store | ✅ |
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
| EOS-303 | Review-path configuration (`AjConfig.handbook.reviewPath`, default `knowledge-review`, mirroring `generatedWikiPath`) | ✅ |

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

- [x] Candidate generation deterministic and provenance-complete.
- [x] Review store writes to `knowledge-review/pending/<session-id>/`.
- [x] Canonical content provably untouched.
- [x] Behaviour tests passing.
- [x] Freeze Review completed. _(**Milestone 4 Freeze declared by the reviewer
      (AJ) on 2026-07-16.** Objectives satisfied — candidate generation deterministic
      and provenance-complete, preserving the one-to-one mapping invariant;
      `CandidateKnowledge` remains the canonical cross-spec boundary; the Review Store
      persists artifacts (one JSON file per candidate + `SessionReport` + `log.md`)
      without introducing workflow logic and only beneath the approved
      `knowledge-review/pending/<session-id>/` location; configuration extended
      consistently with the `generatedWikiPath` pattern; no architectural drift. DoD
      met.)_

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
| EOS-401 | Git state seam (`GitPort` gains read-only `head`/`dirty`/`branch` + adapter) — **extends the M2-frozen port** | ✅ |
| EOS-402 | Session Factory (`SessionContext` → identified `Session`: opaque id, `gitState`, range construction) | ✅ |
| EOS-403 | Review Package Projector (canonical candidates + `Session` → `ReviewPackage`; pure, deterministic) | ✅ |
| EOS-404 | Review Store `saveReviewPackage` (`pending/<id>/review-package.md`) — **extends the M4-frozen EOS-D6 surface** | ✅ |
| EOS-405 | Session Report Builder (run facts → `SessionReport`; outcome policy, `logEntry`) | ✅ |
| EOS-410 | Session notes → extraction prompt (**[EOS-D10](decisions/EOS-D10-session-notes-into-extraction.md) FPCP, approved**) — **ran before EOS-406** | ✅ |
| EOS-406 | Workflow Orchestrator (`createSessionWorkflow` → the frozen `run(context)` entry point) | ⬜ |
| EOS-407 | Composition Root (`createEndOfSessionWorkflow(config, deps)`, mirroring `createKnowledgePipeline`) | ⬜ |
| EOS-408 | `aj session end` command (`--since <ref>`, `--notes`), modeled on `wiki build` | ⬜ |
| EOS-409 | Integration & Acceptance tests (fixture repo + fixture vault + stub generator; SPEC-003 §19) | ⬜ |

_Task breakdown **PLANNING-FROZEN by the reviewer (AJ) on 2026-07-16**, following the same
per-milestone planning used for M1–M4. Nine low-coupling, independently reviewable tasks
composing the frozen M1–M4 stages rather than redesigning them. Sequencing: EOS-401 → EOS-402; EOS-403,
EOS-404, EOS-405 independent; EOS-406 requires 402–405; EOS-407 requires 406; EOS-408
requires 407; EOS-409 last. A dedicated integration/acceptance task **is** warranted here
(unlike M3/M4): M5 introduces the pipeline's first end-to-end path and owns the SPEC-003
§18/§19 acceptance proof — the deferral M4 planning recorded ("end-to-end integration is
M5's acceptance test")._

### Two frozen-plan gaps found at M5 planning — both resolved (AJS-007 §7.2)

M5 planning surfaced **two gaps between the frozen plan and the delivered code**. Both were
additive, both were required for M5 to exist at all, and both were **ratified by the reviewer
(AJ) at the M5 Planning Review on 2026-07-16**:

1. **The git state seam was missing (EOS-401).** `Session.gitState` requires `head`/`dirty`
   and `Session.branch` is required, but M2's `GitPort` exposes only `changes(range)` —
   EOS-002 recorded this git access as M2's job, and M2 delivered only what the analyzer
   needed. **No `Session` was constructible**, and none was constructed in production.
   **Resolved: [EOS-D7](decisions/EOS-D7-git-port-extension.md)** — extend the existing
   read-only seam; no second git abstraction.
2. **The `ReviewPackage` had nowhere to be written (EOS-404).** EOS-302 anticipated
   `review-package.md` in the session directory, but EOS-D6 froze the store at four
   operations, and the anticipated mechanism ("the projector writes it") contradicted EOS-D6's
   store-owns-the-layout holding, bypassed the store's path guards, and would have cost the
   projector its purity. **Resolved:
   [EOS-D8](decisions/EOS-D8-review-store-save-review-package.md)** — add
   `saveReviewPackage`; the store owns every file in the session directory. Extends EOS-D6
   rather than revising it.

### Decisions ratified at the M5 Planning Review (AJ, 2026-07-16)

| # | Decision | Task | Outcome |
|---|----------|------|---------|
| 1 | Extend `GitPort` vs. a separate `GitStatePort` (**frozen M2 contract**) | EOS-401 | **Ratified: extend** — one seam for read-only git access → **[EOS-D7](decisions/EOS-D7-git-port-extension.md)** |
| 2 | `ReviewStore.saveReviewPackage` vs. the projector writing the file (**frozen M4 surface**) | EOS-404 | **Ratified: store operation** — EOS-D6 consistency → **[EOS-D8](decisions/EOS-D8-review-store-save-review-package.md)** (extends EOS-D6) |
| 3 | Who invokes the `TriggerSource`; the composition root's return shape | EOS-407 | **Ratified: expose the trigger** — `{ workflow, store, trigger }`; session construction stays out of the CLI → **[EOS-D9](decisions/EOS-D9-trigger-exposed-from-composition-root.md)** |
| 4 | `Session.startedAt` semantics when session start is unobservable | EOS-402 | Ratified as proposed — `startedAt = endedAt =` trigger instant for v1; documented |
| 5 | Fatal stage failure ⇒ persisted `failed` report vs. a throw | EOS-406 | Ratified as proposed — persisted `failed` report (§19 "Logs recorded"); reject only if the store is unwritable |
| 6 | `ReviewPackage.summary` derivation | EOS-403 | **Explicitly ratified** — must remain derivable from **canonical persisted data**, never from transient `KnowledgeExtraction` output (EOS-D4) |
| 7 | Session id generator (EOS-D3 deferred it to M5) | EOS-402 | Ratified as proposed — `randomUUID` |
| 8 | Report times the **run**, not the session (same field names, different windows) | EOS-405 | Ratified as proposed — split confirmed; documented in both contracts |
| 9 | `project`/`repository` resolution (no config key exists) | EOS-407 | Ratified as proposed — `repositoryPath` + basename; no speculative `AjConfig` key |
| 10 | Exit code on a `failed` run | EOS-408 | Ratified as proposed — `exitCode = 1` on `failed`; `partial` stays 0 |

**Reviewer-required before freeze — the Orchestrator Invariant (EOS-406).** The reviewer
required an explicit, frozen **[Orchestrator Invariant](tasks/EOS-406.md#orchestrator-invariant)**
as a condition of the Planning Freeze. Recorded in EOS-406 v1.1: the orchestrator **owns
sequencing only** — it **may** invoke stages, propagate results unmodified, and coordinate
execution; it **must not** perform transformations, duplicate stage logic, introduce business
rules, or bypass the existing adapters. If a rule wants to live in the orchestrator, a stage
is missing. It joins the module's other frozen invariants (Extractor — EOS-202; Candidate
Generation — EOS-301; Persistence — EOS-302), is enforced by shape where possible, and is an
explicit acceptance criterion verified at code review.

**The reviewer also explicitly ratified** that `ReviewPackage.summary` must remain derivable
from canonical persisted data (never transient extraction output) and that the **projector
must remain a pure projection** — the property EOS-D8 exists to protect.

### Resolved during M5 implementation

- **[EOS-D10](decisions/EOS-D10-session-notes-into-extraction.md) — APPROVED (reviewer: AJ,
  2026-07-16).** A **Frozen Plan Change Proposal** (AJS-007 §7.2) raised after EOS-402
  confirmed that `SessionContext.sessionNotes` reaches no consumer, so EOS-408's `--notes`
  would have silently discarded the engineer's notes — the one input a diff cannot convey.
  Approved on the grounds that it "restores an intended input to knowledge extraction without
  introducing new architectural concepts or changing existing boundaries". Authorizes one
  optional `sessionNotes?: string` on `KnowledgeExtractor.extract` / `buildExtractionPrompt`
  (verbatim; inert when absent), implemented by **[EOS-410](tasks/EOS-410.md)** — **sequenced
  before EOS-406**. **`--notes` stays** in EOS-408. Two reviewer conditions are acceptance
  criteria in EOS-410: **byte-identical when absent** (existing M3 tests must pass
  *unmodified*) and the **Extractor Invariant unchanged** (not reworded, not relaxed — the
  extractor stays a courier and never reads the notes' content). This is the project's **first
  FPCP**, and the mechanism worked as designed: the gap was found in implementation, raised
  rather than absorbed, scoped narrowly, and approved before any dependent work began.
- **The Review Store's duplicated write logic — reviewer-ruled: leave unchanged for
  SPEC-003.** EOS-404 raised that three write operations now repeat `sessionPath` → `mkdir` →
  `writeFile`, and that a `writeSessionFile` helper would make the store's symmetry structural
  rather than conventional. The reviewer (AJ, 2026-07-16) ruled that **modifying the
  already-frozen M4 implementation is not justified by the current milestone** — a Frozen
  Milestone is built upon, not modified (AJS-007 §4.7). The duplication stands; the helper is
  not applied. No action during M5.
- **The shared git seam's location — reviewer-ruled: leave unchanged for SPEC-003.** EOS-402
  raised that `GitPort` lives at `src/end-of-session/analyzers/git/` while serving both the
  analyzer and the Session factory, which reads against EOS-D7's "the seam is not any one
  consumer's reads". The reviewer (AJ, 2026-07-16) ruled the physical location **stays as-is
  for SPEC-003** and is reconsidered **after the specification is complete**, if it still
  appears to violate the architecture. No action during M5.

_Possible task-merge candidates, noted for the reviewer: EOS-401+402 (both serve "produce an
identified Session"; kept apart because the frozen-contract change deserves isolated review
and the two have different test strategies — fixture repo vs. stub port), and EOS-403+404
(render + persist; kept apart on single-responsibility grounds and because EOS-404 touches a
frozen surface)._

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
| 2026-07-16 | 1.25 | **EOS-410 (session notes → extraction prompt) complete** — the approved **EOS-D10** amendment, implemented as a narrowly scoped compatibility change: one optional `sessionNotes?: string` on `buildExtractionPrompt` and `KnowledgeExtractor.extract`, rendered **verbatim** in a labelled section under a **conditional** system rule framing notes as context rather than instructions. `--notes` now reaches the model. **The byte-identical guarantee was PROVEN, not asserted**: the pre-amendment prompt was rendered from the built module and hashed *before* any edit (`07bda1107e3159c0…`), and the post-change render produced the **identical SHA-256** for both `system` and `user` — re-proven after the review refactor touched that path. The reviewer's corroborating proof holds too: **every existing M3 test passes unmodified** (additions-only diff). Present-notes case verified: system = original + rule only, and removing the section restores the user prompt byte-for-byte. **Extractor Invariant unchanged** — `sessionNotes` appears only in the parameter list and the prompt string, and a test proves the parsed extraction is identical with and without notes. **Conflict resolved and recorded:** EOS-410's own frozen text said blank/whitespace notes are treated as *absent*, which the reviewer's criterion ("no interpretation, branching, preprocessing, or heuristics based on note content") rules out — a blank check is `trim()` plus a length test. Implemented **presence = value-supplied**; the task text is struck through and annotated, and the case is nearly unreachable anyway (`sessionNotes` is `.min(1)`). 12 tests added; suite **631 / 53** green; no public-surface growth (drift-guard **23**). High-effort review: presence was **decided twice** (renderer vs. system rule), risking a section with no rule framing it — fixed with a single `notesParts()` deriving both halves from one decision. **That is the third instance of one shape in three consecutive stages** (`summaryFor` → `durationFor` → presence): *one decision derived twice*. Worth watching in EOS-406, which handles every stage's output at once. **NEXT: EOS-406 (Workflow Orchestrator).** |
| 2026-07-16 | 1.24 | **EOS-405 (Session Report Builder) complete** — `buildSessionReport(facts)` assembles the SPEC-003 §16 execution log: a plain function owning no dependency, with the run window as an input rather than a clock read. **Reviewer-required Report Builder Invariant recorded and frozen before implementation** — *a pure projection over existing pipeline outputs*: no new observation, no git, no filesystem, no regenerated information, no logic duplicated from an earlier stage. **Verified by shape**, not vigilance: the module's only non-type import is `parseSessionReport`, and nothing else in the codebase computes `durationMs`/`filesAnalyzed`/`candidatesProduced`. Outcome policy as ratified (fatal ⇒ `failed`; any error ⇒ `partial`; else `completed`; **zero candidates + no errors ⇒ `completed`**), and a **failed run still yields a valid report** — the report is how a failure stays observable. **Clarification recorded:** EOS-405's planning text described `partial` as requiring produced candidates, leaving errors-with-zero-candidates undefined; the **M1-frozen contract** defines it on errors alone and governs — implemented accordingly, pinned by a test. 23 tests; drift-guard **23**; suite **619 / 53** green. High-effort review: 3 findings, all fixed — most notably **`durationFor` computed twice** (structured field vs. `logEntry`), *the same defect EOS-403 hit with `summaryFor`* one stage earlier: fixed structurally by deriving `logEntry` from the assembled fields so divergence is unrepresentable. Also: the explicit test typecheck caught an `exactOptionalPropertyTypes` error **invisible to `npm run typecheck`** (tests are outside its scope). **NEXT: EOS-410** (session notes → prompt, per the approved EOS-D10), then EOS-406. |
| 2026-07-16 | 1.23 | **EOS-404 (`saveReviewPackage`) complete** — the Review Store gains its fifth operation (**EOS-D8**), in the same shape as `saveReport` and reusing every EOS-302 guard unchanged; the session directory is now **wholly store-owned**: `candidates/<id>.json` + `report.json` + `review-package.md` + `log.md`. `reviewPackage.markdown` is written **verbatim** — the *symmetric* choice rather than an exception to the store's JSON convention, since the store renders each artifact into the form its contract defines, and a `ReviewPackage` **is** markdown (EOS-D4), making serialization the identity. Per the reviewer's direction the projector owns projection and the store owns persistence; neither takes the other's job. The four existing operations and their tests are **untouched** (the additivity proof); the exact-surface test is deliberately re-pinned to five; drift-guard manifest unchanged at **22** (no new public operation). Projector → store driven end-to-end against a temp destination. Suite **596 / 52** green. High-effort review: 3 findings — `review-package.md` lacked a trailing newline, **fixed in the projector** rather than the store (adding one here would make persistence responsible for content — the boundary held where it was inconvenient); a `writeSessionFile` DRY helper **declined** because it would modify **frozen M4 internals** beyond what EOS-D8 authorized (raised for the reviewer); a test fixture's inert fields clarified. No `ReviewStore` stubs exist today — **EOS-406 will be the first to stub it** and must re-run the EOS-401 stub-drift check (`npm run typecheck` cannot see `tests/`). **NEXT: EOS-405 (Session Report Builder).** |
| 2026-07-16 | 1.22 | **EOS-D10 APPROVED by the reviewer (AJ) — the project's first Frozen Plan Change Proposal, and EOS-403 approved.** The FPCP passed on the grounds that it "restores an intended input to knowledge extraction without introducing new architectural concepts or changing existing boundaries". **[EOS-410](tasks/EOS-410.md) authored and Planning-Frozen**, added to the M5 task table **before EOS-406**: threads one optional `sessionNotes?: string` from `extract` into the prompt, rendered verbatim under a system rule framing notes as context rather than instructions. **`--notes` stays in EOS-408.** Both reviewer conditions are recorded as EOS-410 acceptance criteria: **byte-identical when absent** (existing M3 tests must pass **unmodified** — a test needing an edit means the change is wrong) and the **Extractor Invariant unchanged** (not reworded, not relaxed; `sessionNotes` may appear only in prompt construction, never in parsing or control flow). EOS-410's one sharp edge is recorded: the system rule must be **conditional**, since an unconditional rule would change `system` for every call and break the byte-identical criterion. EOS-403 approved — the regenerability guarantee holds and the `ReviewPackage` derives exclusively from canonical persisted artifacts. Docs synchronized (EOS-202, PIPELINE-ARCHITECTURE, EOS-406/408). **NEXT: EOS-404**, then EOS-405 → EOS-410 → EOS-406 → EOS-408 → EOS-409. |
| 2026-07-16 | 1.21 | **EOS-403 (Review Package Projector) complete** — `createReviewPackageProjector()` renders the human-readable `ReviewPackage` from canonical candidates + `Session`: a pure, dependency-free stage with `generatedAt` as an input rather than a clock read. **`summary` derives from canonical data only** (the reviewer's explicit ratification): the model's prose summary on the unpersisted `KnowledgeExtraction` is never touched, and a test proves EOS-D4's regenerability by rebuilding a deep-equal package from re-parsed candidates. Every candidate renders in canonical order with its provenance; the empty session is a valid review, not an error. 22 tests asserting **presence, order, and derivation — never prose** (the layout stays free; nothing parses it), plus a by-eye read of the rendered artifact. Public surface +1; drift-guard **22**; suite **590 / 52** green. High-effort review: 6 findings, 4 fixed — `summaryFor` computed twice (field/body could diverge); a newline in a model-authored `title` broke its `###` heading (flattened in the heading only — presentation, not interpretation); a vacuous `toContain("no")` assertion ("no" hides inside "knowledge"); and a no-op spread in a test. 2 accepted with notes (`SHORT_HEAD_LENGTH` duplicated across two stages; factory-vs-function convention now documented — the projector is *injected* as a replaceable stage per EOS-D4, `buildSessionReport` is called directly). **NEXT: EOS-404 (`saveReviewPackage`).** |
| 2026-07-16 | 1.20 | **EOS-402 approved by the reviewer (AJ)** — the detached-HEAD split is as intended: the port reports reality, the factory applies domain policy, the `Session` stays complete. Two EOS-402 findings ruled on: (1) the **`--notes` gap warrants a focused FPCP** — the reviewer confirmed SPEC-003's intent that session notes are an input to knowledge extraction carrying information git cannot convey, and directed that they must **not** be silently discarded in v1; **[EOS-D10](decisions/EOS-D10-session-notes-into-extraction.md) authored and PROPOSED** (narrow: one optional `sessionNotes?: string` on `extract`/`buildExtractionPrompt`, verbatim, inert when absent; one new task **EOS-410 before EOS-406**; no new stage/contract/port/field; Extractor Invariant preserved) — **awaiting review; not implemented**. (2) The **git seam's location stays unchanged for SPEC-003**, reconsidered after the specification is complete if it still appears to violate the architecture. EOS-403 proceeds — it is independent of both. |
| 2026-07-16 | 1.19 | **EOS-402 (Session Factory) complete** — `createSessionFactory` mints the opaque id (`randomUUID`), observes `head`/`dirty`/`branch` through the EOS-D7 seam in one `Promise.all`, constructs the range (`HEAD` default / `<ref>..HEAD`), records the trigger instant once (`startedAt === endedAt`), and validates through `parseSession`. **Branch Policy ratified and implemented** (reviewer: AJ): a detached HEAD is **captured, not refused** — `branch` becomes `detached@<short-head>` from the already-observed head, `Session.branch` stays **required and non-empty**, and nullable branch handling **stops at this stage** rather than propagating into candidates, projection, report, or SPEC-004. The reviewer also approved EOS-401's `Promise<string \| null>` port signature (the port reports git's actual state; the factory applies the policy). Public surface +1; drift-guard manifest **21**; suite **568 / 51** green. High-effort review: 5 findings — 2 fixed, 1 accepted with a note, **2 raised**: (a) **`SessionContext`'s request fields reach no consumer** — `sessionNotes`/`taskId`/`contextPackageRef`/`commitMessage` have no reader anywhere (the M3 extractor takes only `ChangeSet`), so **EOS-408's planned `--notes` would silently drop the engineer's notes** — lands on EOS-406/408 and would need an FPCP to reach the model; (b) the shared git seam still lives under `analyzers/`, contradicting EOS-D7's "the seam is not any one consumer's" (a move touches M2-frozen paths — deliberate decision, not a drive-by). **NEXT: EOS-403 (Review Package Projector).** |
| 2026-07-16 | 1.18 | **EOS-401 (Git state seam) complete** — the first M5 task, implemented and reviewed under the AJS-007 cycle. `GitPort` gained read-only `head`/`dirty`/`branch` (EOS-D7), implemented in `createGitPort`; `changes(range)`, the analyzer, and collection untouched (M2 suites green unmodified — the proof the extension is additive). **A `Session` is now constructible for the first time.** New suite (14 tests, real git over disposable fixture repos) incl. an explicit read-only proof; no public-surface growth; full suite **548 / 50** green. High-effort review found **2 real defects, both fixed**: the extension had silently broken two M2 `GitPort` stubs into type errors that no check could see (`tsconfig` scopes typechecking to `src`), fixed by giving the stubs throwing state reads — which converts EOS-D7's accepted interface-segregation cost into an enforced guarantee; and `branch()` returned the literal `"HEAD"` when detached, a non-empty value that would satisfy `Session.branch`'s `.min(1)` and record a non-existent branch, fixed via `git branch --show-current` and a **`Promise<string \| null>`** signature. **Deviation recorded for ratification** (EOS-D7 v1.1): the decision documented `branch(): Promise<string>`; substance unchanged, but **EOS-402 must now decide what a detached session's required non-empty `branch` records**. |
| 2026-07-16 | 1.17 | **M5 Planning Freeze ratified by the reviewer (AJ).** M5 Planning Review passed; the EOS-401..409 breakdown is approved. Reviewer ratified three architectural decisions, all now recorded: **[EOS-D7](decisions/EOS-D7-git-port-extension.md)** — extend the existing `GitPort` rather than introduce a second git abstraction (closing the "no `Session` is constructible" gap; `changes(range)` and every M2 guarantee untouched); **[EOS-D8](decisions/EOS-D8-review-store-save-review-package.md)** — extend the Review Store with a domain-level `saveReviewPackage`, so the store owns every file in the session directory (extends EOS-D6 rather than revising it; keeps the projector pure and every write path-guarded); **[EOS-D9](decisions/EOS-D9-trigger-exposed-from-composition-root.md)** — the composition root exposes the `TriggerSource` (`{ workflow, store, trigger }`), keeping session construction and git access out of the CLI while `run(context)` stays frozen. The reviewer also explicitly ratified that **`ReviewPackage.summary` must remain derivable from canonical persisted data** (never transient `KnowledgeExtraction` output) and that the **projector must remain a pure projection**. Per the reviewer's requirement before freeze, an explicit **Orchestrator Invariant** was recorded in EOS-406: the orchestrator **owns sequencing only** — it may invoke stages, propagate results unmodified, and coordinate execution; it must **not** perform transformations, duplicate stage logic, introduce business rules, or bypass the existing adapters (if a rule wants to live there, a stage is missing). It joins the Extractor, Candidate Generation, and Persistence Invariants, and is an acceptance criterion verified at code review. The seven remaining tabled decisions are ratified as proposed. PIPELINE-ARCHITECTURE updated for the EOS-D9 return shape. The M5 breakdown is frozen; **EOS-401 may begin under the AJS-007 implementation cycle.** |
| 2026-07-16 | 1.16 | **M5 (Review Package Projection, Orchestration & CLI) task breakdown authored** — decomposed into **EOS-401..409**: EOS-401 (git state seam — `GitPort` gains read-only `head`/`dirty`/`branch`), EOS-402 (Session Factory — opaque id, `gitState`, range construction), EOS-403 (Review Package Projector — pure, deterministic, canonical-derived), EOS-404 (Review Store `saveReviewPackage`), EOS-405 (Session Report Builder — outcome policy + `logEntry`), EOS-406 (Workflow Orchestrator — the frozen `run(context)` entry point), EOS-407 (Composition Root, mirroring `createKnowledgePipeline`), EOS-408 (`aj session end`), EOS-409 (Integration & Acceptance — the v1 vertical-slice proof incl. the canonical-unchanged byte-identical snapshot). Nine low-coupling, independently reviewable tasks **composing** the frozen M1–M4 stages; M5 objective/deliverables unchanged (within the frozen plan). **Planning surfaced two frozen-plan gaps requiring AJS-007 §7.2 ratification**: (1) **no `Session` is constructible today** — M2's `GitPort` exposes only `changes(range)`, though `Session.gitState.head`/`dirty` and `branch` are required and EOS-002 recorded that access as M2's (→ EOS-401, possible **EOS-D7**); (2) the **`ReviewPackage` has nowhere to be written** — EOS-302 anticipated `review-package.md` but EOS-D6 froze the store at four operations, and "the projector writes it" contradicts EOS-D6's store-owns-the-layout holding and bypasses the path guards (→ EOS-404, possible **EOS-D8**). A third decision — who invokes the `TriggerSource`, and whether the composition root's frozen `{ workflow, store }` return extends to include it (→ EOS-407, possible **EOS-D9**) — plus seven smaller decisions are tabled for the review. **Pending M5 Planning Review + Planning Freeze** before EOS-401 implementation. |
| 2026-07-16 | 1.15 | **Milestone 4 (Candidate Generation & Review Store) Freeze declared by the reviewer (AJ).** Freeze Review passed: candidate generation deterministic and provenance-complete, preserving the one-to-one mapping invariant (each finding → exactly one candidate; no merge/split/reorder/invent/remove); `CandidateKnowledge` remains the canonical SPEC-003 → SPEC-004 boundary; the Review Store persists artifacts (one JSON file per candidate + `SessionReport` + `log.md`) without introducing workflow logic and writes only beneath the approved `knowledge-review/pending/<session-id>/` location; configuration extended consistently with the `generatedWikiPath` pattern; no architectural drift — M4 Definition of Done fully satisfied. M4 is frozen; changes now follow the AJS-007 Frozen Plan Change Proposal process. Next: **M5 (Review Package Projection, Orchestration & CLI)**, beginning with M5 planning (EOS-4xx decomposition → Planning Review → Planning Freeze). |
| 2026-07-16 | 1.14 | **M4 implementation complete — EOS-301..303 all done**, each independently code-reviewed and committed. EOS-301 (Candidate Generator: deterministic `KnowledgeExtraction` → canonical `CandidateKnowledge[]`, one-to-one order-preserving mapping via `parseCandidateKnowledge`, authoritative kind, `session:<id>:<n>` identity, complete provenance behind an injected clock, frozen output). EOS-302 (Review Store: `ReviewStore` + `createFilesystemReviewStore`, persistence-only + path-guarded + non-canonical-destination guard, per-session layout `candidates/<id>.json` + `report.json` + `log.md`, no git, no interpretation). EOS-303 (`AjConfig.handbook.reviewPath` default `knowledge-review`, mirroring `generatedWikiPath`). Public surface grew by 4 operations (`createCandidateGenerator`, `createFilesystemReviewStore`, `ReviewStoreError`; config unchanged surface). End-of-Session suite **17 files / 190 tests**; full platform suite **533 / 49**, all green. M4 Integration Check satisfied — both new stages deterministic, immutable contracts, no git/wiki side effect, `run` entry point unchanged. **Pending the M4 Freeze Review.** |
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
