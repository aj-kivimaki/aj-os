# Deferred — SPEC-003 Specification Hygiene

> **Status:** Deferred (non-blocking) · **Raised:** 2026-07-15 (SPEC-003 planning freeze)
>
> **Owner:** AJ · **Applies to:** `docs/specifications/SPEC-003-End-of-Session-Workflow.md` (Draft)

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

- [ ] **Related Specifications — add SPEC-004.** The frontmatter lists SPEC-000,
  SPEC-002 but omits SPEC-004, its direct downstream consumer. *(Ref: CONTRACTS.md)*
- [ ] **CLI entry point.** The spec names no command though it lists "Manual" and
  "IDE command" triggers. Document **`aj session end`** (with `--since <ref>`,
  `--notes`) under §6 Triggers / §13 Interfaces. *(Ref: EOS-006, M5)*
- [ ] **Review storage location.** §17 says only "Review package location." Record
  the concrete, non-canonical location
  **`<handbook-vault>/knowledge-review/pending/<session-id>/`** and the
  `AjConfig.handbook.reviewPath` config (default `knowledge-review`). *(Ref: EOS-D2)*
- [ ] **Agreed v1 scope.** Add a scope/status note: v1 is a **capture-only vertical
  slice** — one Git analyzer, manual trigger, no-op notification; **no git commit
  and no wiki generation** (deferred); analyzers/triggers/notifiers are pluggable
  seams. Note that the roadmap's "owns git commits" role is deferred beyond v1.
  *(Ref: package README §Scope)*
- [ ] **Canonical output vs. projection.** Clarify §8 Outputs: **`CandidateKnowledge`
  is the canonical machine-readable output**; the **`ReviewPackage` is a
  deterministic human-readable projection** rendered from it; SPEC-004 consumes the
  structured candidates, not markdown. *(Ref: EOS-D4)*
- [ ] **First-class Session.** Note that a **Session** is a first-class object with
  a **stable opaque id**; trigger, branch, and git state are metadata (not
  identity). Relates to §7 Inputs and §12 State Model. *(Ref: EOS-D3)*
- [ ] **Boundary contract reference.** Reference `docs/architecture/CONTRACTS.md`
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
| 2026-07-15 | 1.0 | Raised at SPEC-003 planning freeze; deferred spec-hygiene updates recorded. |
