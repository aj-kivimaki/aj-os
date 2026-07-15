# EOS-D5 — Introduce a Cross-Specification CONTRACTS Document

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** — (documentation; precedes tasks)
>
> **Date:** 2026-07-15

---

# Purpose

AJ-OS is becoming a pipeline of independently specified systems (SPEC-002…007).
The interfaces *between* specifications were implied by ARCH-001's loop diagram
and scattered across individual specs, but never named in one place. This
decision introduces a document that maps those boundaries — and fixes *where* it
lives.

---

# Context

- SPEC-003 defines new outputs (`CandidateKnowledge`, `ReviewPackage`,
  `SessionReport`) consumed by SPEC-004; SPEC-004 feeds the Handbook, which feeds
  SPEC-005. These are cross-cutting boundaries, not SPEC-003-internal details.
- Putting a contracts map inside SPEC-003's implementation folder would force
  SPEC-004/005 to read SPEC-003's package to understand shared boundaries — the
  wrong dependency.
- The implementation playbook and ADR-001 treat architecture as frozen: new
  *architecture* is created via ADRs, and Claude must not redesign it unilaterally.
  A **descriptive** map of already-decided boundaries is documentation, not a
  redesign.

---

# Decision

1. **Create `docs/architecture/CONTRACTS.md`** — an architecture-level, living
   reference that maps producer → consumer boundaries across the specs and records
   the boundary invariants (immutability, provenance, canonical-vs-projection,
   propose-not-approve, no-git-in-engines, non-canonical write locations).
2. **It is descriptive, not prescriptive.** It documents boundaries the SPECs and
   ARCH-001 already establish; it does not invent new architecture and does not
   supersede ARCH-001/002 or any ADR. Where it and a SPEC disagree, the SPEC wins.
3. **It states the ownership convention** already in force: the producing
   specification owns its output contracts; consumers import them (EOS-D1).
4. **It is not placed inside SPEC-003 documentation** — it is higher-level.
   SPEC-003's package references it.
5. **The frozen ARCH files are not edited.** CONTRACTS.md references ARCH-001/002;
   it does not modify them.

---

# Rationale

- **Right altitude.** Cross-spec boundaries are an architecture concern; a shared
  document avoids duplicating (and desynchronizing) the boundary in each spec.
- **Respects the freeze.** Documenting existing boundaries is not redesigning
  architecture; keeping the doc descriptive and leaving ARCH/ADR untouched stays
  within the implementation playbook's guardrails.
- **Scales with the pipeline.** As specs are added, one register shows how a
  change to one system's output is a change to another's input.

---

# Alternatives Considered

## Option A — Put contracts inside `spec-003-end-of-session/`

Pros
- Co-located with the producer.

Cons
- Forces SPEC-004/005 to depend on SPEC-003's folder for shared boundaries; wrong
  scope; would be duplicated when SPEC-004's package documents the same seam.

Rejected.

## Option B — Author a new ADR instead of a reference doc

Pros
- Formal architectural ratification.

Cons
- An ADR records a *decision*; the boundary *register* is living reference
  material that changes as specs are added — a poor fit for an immutable ADR. The
  decision itself is recorded here (EOS-D5).

Rejected as the primary artifact; see Future Review for optional ratification.

## Selected Option

**Option C (selected)** — a living `docs/architecture/CONTRACTS.md`, descriptive,
referencing (not editing) the frozen ARCH/ADR set; the decision recorded here.

---

# Consequences

## Positive
- One authoritative boundary map; clearer reasoning about cross-spec changes.
- SPEC-004/005 planning can reference it directly.

## Trade-offs
- A new architecture-level doc to keep synchronized as specs evolve. Mitigation:
  it is a thin register; updated at each spec's freeze.
- It sits in `docs/architecture/` without being an ARCH-### or ADR. Accepted — it
  is explicitly a reference, and its authority is subordinate to the SPECs/ADRs.

---

# Impact

## Affected Tasks
- None directly (documentation). Informs EOS-003 (boundary contract).

## Affected Components
- `docs/architecture/CONTRACTS.md` (new).

## Documentation Requiring Updates
- SPEC-003 README / PIPELINE-ARCHITECTURE reference it. (ARCH-001 is **not**
  edited; a future ADR may cross-link it if AJ chooses — see Future Review.)

---

# Validation

- CONTRACTS.md exists, lists the SPEC-003 outputs as the SPEC-003→004 boundary,
  and is referenced from the SPEC-003 package. Reviewed by AJ during the planning
  freeze.

---

# Future Review

- **Optional ratification:** if AJ wants the "producer owns the boundary contract"
  convention and the CONTRACTS register to be *normative* architecture (not just
  reference), record an ADR (e.g. ADR-007) that adopts them and cross-links
  CONTRACTS.md. Not required for SPEC-003 to proceed.
- Update the register when SPEC-004/005 boundaries are implemented.

---

# Related Documents

Architecture
- ARCH-001, ARCH-002, ADR-001 (architecture freeze), ADR-002

Specifications
- SPEC-002, SPEC-003, SPEC-004, SPEC-005, SPEC-006, SPEC-007

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.0 | Decision created — introduce docs/architecture/CONTRACTS.md (descriptive, architecture-level). |
