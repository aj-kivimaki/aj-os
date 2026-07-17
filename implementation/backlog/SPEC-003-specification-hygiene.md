# Deferred — SPEC-003 Specification Hygiene

> **Status:** ✅ **CLOSED** — all seven items applied 2026-07-17 under **REX-102**, as a single
> batched revision (SPEC-003 Draft **v1.0 → v1.1**). · **Raised:** 2026-07-15 (SPEC-003 planning freeze)
>
> **Owner:** AJ · **Applies to:** `docs/specifications/SPEC-003-End-of-Session-Workflow.md` (Draft)
>
> **Applied late.** These items were due *"no later than the SPEC-003 implementation Freeze Review"*
> — which occurred on 2026-07-17 with all seven still unchecked. The deadline was self-declared and
> missed, and the divergence this document existed to prevent happened anyway. Recorded as REX
> finding **F-019**; the *why* belongs to the SPEC-003 retrospective (REX-101).

---

## Purpose

The SPEC-003 planning review (see `implementation/phase-2-core-platform/spec-003-end-of-session/`)
agreed several implementation decisions that the SPEC-003 **Draft** does not yet
reflect. To avoid silent divergence between the specification and the frozen
implementation plan, these updates are recorded here as **disciplined
specification updates** to be applied to the Draft.

They are **deferred and non-blocking** — Milestone 1 (EOS-001) may begin without
them. Apply them as a batched SPEC-003 revision (bump the spec version and its
change log when applied), ideally before or at the M-that-first-exposes-each-item,
and no later than the SPEC-003 implementation Freeze Review (AJS-007 Documentation
Synchronization).

These are **specification** edits (the `docs/specifications/` Draft), distinct
from the implementation package, which is already frozen and consistent.

---

## Updates to apply to the SPEC-003 Draft

- [x] **Related Specifications — add SPEC-004.** The frontmatter lists SPEC-000,
  SPEC-002 but omits SPEC-004, its direct downstream consumer. *(Ref: CONTRACTS.md)*
- [x] **CLI entry point.** The spec names no command though it lists "Manual" and
  "IDE command" triggers. Document **`aj session end`** (with `--since <ref>`,
  `--notes`) under §6 Triggers / §13 Interfaces. *(Ref: EOS-006, M5)*
- [x] **Review storage location.** §17 says only "Review package location." Record
  the concrete, non-canonical location
  **`<handbook-vault>/knowledge-review/pending/<session-id>/`** and the
  `AjConfig.handbook.reviewPath` config (default `knowledge-review`). *(Ref: EOS-D2)*
- [x] **Agreed v1 scope.** Add a scope/status note: v1 is a **capture-only vertical
  slice** — one Git analyzer, manual trigger, no-op notification; **no git commit
  and no wiki generation** (deferred); analyzers/triggers/notifiers are pluggable
  seams. Note that the roadmap's "owns git commits" role is deferred beyond v1.
  *(Ref: package README §Scope)*
- [x] **Canonical output vs. projection.** Clarify §8 Outputs: **`CandidateKnowledge`
  is the canonical machine-readable output**; the **`ReviewPackage` is a
  deterministic human-readable projection** rendered from it; SPEC-004 consumes the
  structured candidates, not markdown. *(Ref: EOS-D4)*
- [x] **First-class Session.** Note that a **Session** is a first-class object with
  a **stable opaque id**; trigger, branch, and git state are metadata (not
  identity). Relates to §7 Inputs and §12 State Model. *(Ref: EOS-D3)*
- [x] **Boundary contract reference.** Reference `docs/architecture/CONTRACTS.md`
  as the definition of the SPEC-003 → SPEC-004 boundary, and note that
  `CandidateKnowledge` is producer-owned by SPEC-003. *(Ref: EOS-D1, EOS-D5)*

---

## Not in scope here

- Any change to the frozen implementation package (README/MILESTONES/decisions/
  tasks) — those are consistent and frozen.
- Architectural ratification of the producer-owned-contract convention as an ADR —
  intentionally **not** done yet (reviewer decision, 2026-07-15); CONTRACTS.md is
  sufficient until more specifications emerge.

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.1 | **CLOSED — all seven items applied under REX-102** as one batched revision; SPEC-003 Draft bumped **v1.0 → v1.1**. Items 2 and 3 were verified **against the code** rather than against the decision records: `--since <ref>` / `--notes <text>` confirmed at `src/cli/index.ts:54-55`, and `reviewPath` / default `knowledge-review` confirmed at `src/platform/config/ConfigService.ts:20,138`, with the session layout confirmed at `src/end-of-session/store/FilesystemReviewStore.ts:7-11`. **Item 4's roadmap half was deliberately not applied here** — this document's scope is the *specification*; the actual `docs/README.md` and `ROADMAP.md` corrections are **REX-106**'s (findings F-003/F-004), which carries a reviewer ruling this task does not. **Deviation recorded:** the instruction to bump *"the spec version and its change log"* could not be followed as written — **no specification in this repository has a Change Log section**, and SPEC-000 mandates only a `Version` field. Followed SPEC-002's v1.1 precedent (Version field only); the revision is recorded here and in the REX-102 task document instead. The absence of spec change logs is a **new finding**, recorded as **Deferred — post-REX** per the closed-inventory rule, not actioned. |
| 2026-07-15 | 1.0 | Raised at SPEC-003 planning freeze; deferred spec-hygiene updates recorded. |
