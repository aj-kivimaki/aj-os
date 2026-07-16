# SPEC-003 — End-of-Session Workflow

> **Implementation Package:** SPEC-003
>
> **Status:** M1–M4 **COMPLETE and FROZEN** (reviewer: AJ, 2026-07-16) — Milestone 5 (Review Package Projection, Orchestration & CLI) is the next target
>
> **Phase:** Phase 2 — Core Knowledge Platform
>
> **Related Specification:** SPEC-003
>
> **Owner / Author:** AJ · **Planning reviewer (freeze ratified by):** AJ, 2026-07-15

---

# Purpose

This implementation delivers the **self-improvement mechanism** of AJ-OS.

The End-of-Session Workflow turns a finished coding session into **candidate
knowledge** and a **review package**, so the Handbook can evolve from real work
without a human hand-writing documentation. It is the front half of the
knowledge loop: it *captures*, and hands off to human review (SPEC-004).

Per SPEC-003 it must **never** modify canonical knowledge, publish to the wiki,
or approve its own output. It proposes; humans approve.

---

# Implementation Objective

Implement the End-of-Session Workflow according to **SPEC-003**, satisfying its
acceptance criteria while adhering to:

- ARCH-001, ARCH-002, ADR-002 (version control belongs to orchestration)
- AJS-004 (agent specification), AJS-005 (workflow orchestration), AJS-006
  (knowledge governance), AJS-007 (engineering lifecycle)

If implementation reveals deficiencies in those documents, implementation pauses
while the architecture is reviewed through the ADR process. Implementation must
never intentionally diverge from the approved architecture.

---

# Overview

The workflow is a **capture pipeline with pluggable seams**:

```
Trigger → Session → Analyzers → Change Set → Knowledge Extraction
       → Candidate Generation → Review Store (persist canonical)
       → Review Package projection → Notification → Session Report
```

`CandidateKnowledge[]` is the **canonical output** (the SPEC-003→SPEC-004
boundary contract); the `ReviewPackage` markdown is a **human-readable projection
rendered from it**. Extraction is the only non-deterministic stage and is
isolated behind an injected text-generation port so everything around it is
deterministic and testable.

**v1 is a validated vertical slice, not the full spec.** It implements the core
end-to-end path (`aj session end` → collect git changes → extract → generate
candidates → write the review package) and designs the analyzer, trigger, and
notification seams so additional analyzers, triggers, and notifiers plug in later
**without changing the orchestration**. v1 performs **no git commit and no wiki
generation** — those side effects are deferred until the capture pipeline is
proven (see *Not Included*).

See:

- [architecture/PIPELINE-ARCHITECTURE.md](architecture/PIPELINE-ARCHITECTURE.md) — target design
- [docs/architecture/CONTRACTS.md](../../../docs/architecture/CONTRACTS.md) — the SPEC-003 → SPEC-004 boundary

---

# Scope

## Included (v1)

- End-of-Session module (`src/end-of-session/`) and public entry point
- Contracts: `SessionContext`, `Session`, `SessionChange`/`ChangeSet`,
  `CandidateKnowledge`, `ReviewPackage`, `SessionReport`
- `Analyzer` port + registry (extensibility seam) with one analyzer: Git changes
- Knowledge Extraction via the existing `TextGenerator` port + Zod validation
- Candidate generation (canonical structured output)
- Review Store — filesystem, path-guarded, writes to
  `<vault>/knowledge-review/pending/<session-id>/`
- Review Package projection (human-readable markdown from candidates)
- `TriggerSource` seam (manual trigger only) and `NotificationPort` (no-op)
- Composition root `createEndOfSessionWorkflow` and the `aj session end` command
- Execution logging (`SessionReport`)

## Not Included (deferred to later milestones / specs)

- **Git commits and wiki generation** (orchestration side effects — ADR-002/
  AJS-005 §7; deferred until the capture pipeline is validated)
- Documentation Analyzer, and other analyzers beyond Git changes
- Additional triggers (git hook, scheduled, IDE, webhook/n8n)
- Real notifications (Slack/email/desktop)
- Playbooks, suggested-doc-updates, and automation-ideas as first-class outputs
- Handbook duplicate-detection / comparison — owned by **SPEC-004** (avoids
  duplicating the `IdentityResolver` responsibility)
- Any modification of canonical Handbook content (permanently out of scope)

---

# References

## Architecture

- ARCH-001, ARCH-002
- ADR-002 (version control belongs to orchestration)
- docs/architecture/CONTRACTS.md (inter-spec boundaries)

## Standards

- AJS-004, AJS-005, AJS-006, AJS-007

## Specifications

- SPEC-003 (this), SPEC-004 (downstream consumer), SPEC-002 (optional input)

---

# Dependencies

## Required

- Approved standards and SPEC-003
- A git repository (the session's source of change)
- A Handbook vault (the review-store destination), via `AjConfig.handbook`
- The platform `TextGenerator` port / `AIClient` (`src/platform/ai/`)

## Reused platform capabilities

- `ConfigService` / `AjConfig` (`src/platform/config/`) — extended with a review path
- `TextGenerator` port + `parseExtraction`/Zod pattern (`src/knowledge/compiler/`)
- Filesystem store + `appendLog` pattern (`src/knowledge/wiki-store/`)
- Vault path guards (`src/handbook/paths.ts`)
- Thin-CLI + composition-root patterns (`src/cli/commands/wiki.ts`,
  `src/knowledge/composition/createKnowledgePipeline.ts`)

## Future integrations

- Documentation / Lessons-Learned / IDE-timeline analyzers
- Git-hook, scheduled, and n8n triggers
- SPEC-004 (reads the review store)

---

# Deliverables

This implementation is complete (for its planned milestones) when the following exist:

- [ ] End-of-Session module with immutable contracts and contract tests
- [ ] Git change collection behind the analyzer registry
- [ ] Deterministic-structure knowledge extraction (content behind the injected port)
- [ ] Canonical `CandidateKnowledge` generation persisted to the review store
- [ ] `ReviewPackage` projection + `SessionReport`
- [ ] `createEndOfSessionWorkflow` composition root and `aj session end` command
- [ ] Automated tests (unit, integration, acceptance) green

---

# Implementation Strategy

Incremental, milestone-based, **contract-first**, following the AJS-007 lifecycle
(Planning → Planning Review → Planning Freeze → Implementation → Freeze Review →
Milestone Freeze → Retrospective) per milestone. Each milestone leaves the
platform buildable and testable; tests validate only the public surface (import
from `index`), never internals. Determinism by construction: the LLM boundary is
the single non-deterministic seam and is stubbed in tests.

**Task prefix:** `EOS-###` (tasks). Architecture-review decisions from the
planning review use an `EOS-D#` prefix to distinguish them from task-numbered
decisions.

---

# Milestone Progress

| Milestone | Description | Status |
| --------- | ----------- | ------ |
| M1 | Foundation & Contracts | ✅ |
| M2 | Session Change Collection | ✅ |
| M3 | Knowledge Extraction | ✅ |
| M4 | Candidate Generation & Review Store | ✅ |
| M5 | Review Package Projection, Orchestration & CLI | ⬜ |

See: [MILESTONES.md](MILESTONES.md)

---

# Directory Structure

```text
spec-003-end-of-session/
  README.md
  MILESTONES.md
  architecture/PIPELINE-ARCHITECTURE.md
  decisions/          EOS-D1..EOS-D9 (planning-review decisions)
  tasks/              EOS-001..007 (M1), EOS-101..103 (M2), EOS-201..202 (M3), EOS-301..303 (M4),
                      EOS-401..409 (M5, planning-frozen)
  retrospectives/     (added at each Milestone Freeze)
```

---

# Implementation Status

- ✅ Specification reviewed (design review + gap analysis complete).
- ✅ Architecture-review refinements decided (EOS-D1..EOS-D5), all **Accepted**.
- ✅ Inter-spec contract boundary documented (docs/architecture/CONTRACTS.md).
- ✅ Milestone roadmap defined (M1–M5).
- ✅ Milestone 1 task breakdown authored (EOS-001..EOS-007).
- ✅ **Planning review completed and Planning Freeze ratified by the reviewer
  (AJ) on 2026-07-15.** The plan is frozen; implementation may begin with
  Milestone 1 (EOS-001).
- ✅ M1–M3 implemented, reviewer-frozen, and merged (EOS-001..007, EOS-101..103,
  EOS-201..202).
- ✅ M4 (Candidate Generation & Review Store) **COMPLETE and FROZEN** (AJ,
  2026-07-16): EOS-301 Candidate Generator, EOS-302 Review Store, EOS-303
  `reviewPath` config — implemented, reviewed, and committed. **EOS-D6 Accepted**
  (domain-aware Review Store API).
- ⬜ M5 (Projection, Orchestration & CLI) — **task breakdown EOS-401..409
  PLANNING-FROZEN by the reviewer (AJ) on 2026-07-16.** Three decisions accepted:
  **EOS-D7** (extend the existing `GitPort` — closing the gap that left no
  `Session` constructible), **EOS-D8** (the Review Store gains
  `saveReviewPackage`, so it owns every file in the session directory), and
  **EOS-D9** (the composition root exposes the `TriggerSource`; session
  construction and git stay out of the CLI). An explicit **Orchestrator
  Invariant** was recorded in EOS-406 at the reviewer's requirement. Implementation
  may begin with **EOS-401**. See
  [MILESTONES.md](MILESTONES.md#milestone-m5--review-package-projection-orchestration--cli).

> **Frozen-plan discipline (AJS-007).** From the freeze onward, changes to the
> frozen plan — contracts, milestone structure, or scope — follow the AJS-007
> *Frozen Plan Change Proposal* process, not direct edits. Spec-hygiene updates to
> the SPEC-003 Draft are tracked as deferred work in
> [implementation/backlog/SPEC-003-specification-hygiene.md](../../backlog/SPEC-003-specification-hygiene.md).

---

# Risks

- **Candidate contract churn.** `CandidateKnowledge` is the durable SPEC-003↔004
  interface; getting it wrong forces rework downstream. Mitigation: define and
  freeze it deliberately in M1 (EOS-003), reviewer ≠ author (AJS-007 §5).
- **Non-determinism from the LLM.** Mitigation: isolate behind the `TextGenerator`
  port; assert structure, not prose; stub in tests.
- **Scope creep toward the full 6-agent spec.** Mitigation: strict v1 scope; seams
  make later agents additive.
- **Structural divergence from SPEC-002.** SPEC-003 is a workflow, not a
  deterministic pipeline; expect to exercise AJS-007's *Frozen Plan Change
  Proposal* and *Tailoring* mechanisms and record divergences as decisions.

---

# Open Questions

Resolved during planning review (recorded in `decisions/`):

- **Where does `CandidateKnowledge` live?** — Resolved (EOS-D1): producer-owned in
  SPEC-003, published as a boundary contract in CONTRACTS.md; not a temporary home.
- **How is the review location named?** — Resolved (EOS-D2):
  `knowledge-review/pending/` (business state, not `queue/`).
- **Is a session identified by timestamp+branch?** — Resolved (EOS-D3): a
  first-class `Session` with a stable opaque id; trigger/branch are metadata.
- **Is the review package the primary artifact?** — Resolved (EOS-D4): no —
  `CandidateKnowledge[]` is canonical; the package is a projection.
- **Does CONTRACTS.md belong in SPEC-003?** — Resolved (EOS-D5): no —
  architecture-level at `docs/architecture/CONTRACTS.md`.

Remaining (to resolve within the milestone that needs them):

- **Session change range** — working-tree vs. staged vs. commit range. Proposed
  resolution in **EOS-402** (M5): `range = "HEAD"` by default (which makes
  `git diff … HEAD` report uncommitted + staged, the EOS-002/M2 proposal) and
  `range = "<ref>..HEAD"` with `--since <ref>`. Range construction sits in the
  Session factory, where EOS-102 deferred it. _Pending the M5 Planning Review._
- **`Session.startedAt` when session start is unobservable** — new at M5
  planning. A manual trigger observes only that the session *ended*. Proposed in
  **EOS-402**: `startedAt = endedAt =` the trigger instant for v1, documented
  explicitly; deriving it from the range's base commit is recorded as a future
  enhancement. _Pending the M5 Planning Review._
- **Candidate id scheme** — ✅ Resolved: `session:<id>:<n>` (documented in the EOS-003
  contract; generation in EOS-301).
- **Review-store layout** — ✅ Resolved (M4 Planning Freeze): one directory per session,
  `pending/<session-id>/` with `candidates/<id>.json` (canonical JSON, one file per
  candidate) + `report.json` + `log.md`; `review-package.md` added by the M5 projector.
  Domain-aware store API recorded as EOS-D6.
- **Spec hygiene** — the SPEC-003 Draft does not yet reflect the agreed decisions
  (SPEC-004 cross-reference, `aj session end`, storage location, v1 scope,
  canonical-vs-projection, first-class Session). Tracked as disciplined deferred
  updates in
  [implementation/backlog/SPEC-003-specification-hygiene.md](../../backlog/SPEC-003-specification-hygiene.md)
  (non-blocking for M1).

---

# Success Criteria

This implementation succeeds when:

- SPEC-003 acceptance criteria (session summary, candidate entries, wiki-
  publication candidates, review package, canonical unchanged, logs) are
  satisfied for the v1 scope;
- `aj session end` produces candidates + a review package deterministically in
  structure;
- canonical vault content is provably untouched;
- analyzers/triggers/notifiers are extensible without changing orchestration;
- tests pass; the review store is consumable by SPEC-004.

---

# Definition of Done

- [ ] All planned milestones completed and frozen.
- [ ] All implementation tasks completed.
- [ ] Tests passing (unit, integration, acceptance).
- [ ] Documentation updated and synchronized at each freeze.
- [ ] SPEC-003 acceptance criteria satisfied for v1 scope.
- [ ] Code reviewed.
- [ ] Merged into main.

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.1 | **Planning review completed and Planning Freeze ratified by the reviewer (AJ).** All EOS-D1..D5 decisions Accepted. Spec-hygiene updates to the SPEC-003 Draft recorded as deferred work (`implementation/backlog/SPEC-003-specification-hygiene.md`). ADR-007 intentionally deferred. Status set to frozen; Milestone 1 (EOS-001) may begin. From here, plan changes follow the AJS-007 Frozen Plan Change Proposal process. |
| 2026-07-15 | 1.0 | Implementation package created. Design review, M1–M5 roadmap, planning-review decisions (EOS-D1..D5), inter-spec CONTRACTS.md, and Milestone 1 task breakdown (EOS-001..007) authored. Milestone 1 planning frozen; ready to implement. |

---

> **Engineering Rule**
>
> The End-of-Session Workflow captures knowledge; it never promotes it.
> Automation proposes, humans approve. Keep git and wiki generation out of the
> capture pipeline — they are orchestration side effects owned by later work.
