# EOS-D4 — CandidateKnowledge Is Canonical; ReviewPackage Is a Projection

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-003, EOS-004, M4, M5
>
> **Date:** 2026-07-15

---

# Purpose

SPEC-003 §8 lists both a "Review Package" and "Candidate Handbook Entries /
Candidate Wiki Publications" as outputs, without saying which is authoritative.
This decision makes that explicit: the structured candidates are canonical, and
the review package is a human-readable rendering of them.

---

# Context

- SPEC-004 (the consumer) must **group, deduplicate, and compare** candidates
  against the Handbook (SPEC-004 §2). Doing that against parsed markdown is fragile;
  doing it against structured data is robust.
- AJ-OS already follows a canonical-vs-projection split in the Knowledge Platform:
  the Wiki Generator's structured extraction is canonical and Markdown is a
  rendered projection (ARCH-002; the renderer produces pages from validated
  extraction). Generated artifacts are "derived" (AJS-006 §2).
- If the markdown review package were primary, its rendering choices would leak
  into the SPEC-003→004 contract and every consumer would have to parse prose.

---

# Decision

1. **`CandidateKnowledge[]` is the canonical output** of SPEC-003 — the durable
   artifact persisted to the review store and the primary SPEC-003→004 contract.
2. **`ReviewPackage` is a projection** — a deterministic, human-readable markdown
   view rendered *from* `CandidateKnowledge[]` + `Session`. It is non-canonical,
   never parsed back as data, and regenerable at any time from the candidates.
3. **Pipeline ordering follows from this:** candidate generation (M4) produces and
   persists the canonical candidates *before* the projection (M5) renders the
   package. The "Review Package Builder" agent of the spec becomes a **projector**.
4. **`SessionReport`** is likewise a structured, canonical execution log persisted
   alongside the candidates.

---

# Rationale

- **Cleaner downstream.** SPEC-004 consumes structured candidates, not markdown —
  grouping/dedup/comparison operate on fields, not text.
- **Consistency with the platform.** Mirrors the wiki's structured-canonical /
  markdown-projection model; keeps AJ-OS coherent.
- **Regenerable projection.** The package can be re-rendered (different formats,
  future review UIs) without touching the source of truth.
- **Contract stability.** The SPEC-003→004 boundary is defined by candidate
  *fields*, insulated from presentation changes.

---

# Alternatives Considered

## Option A — ReviewPackage is the primary artifact; candidates embedded in it

Pros
- One artifact to produce.

Cons
- Forces SPEC-004 to parse markdown; couples the boundary to rendering; breaks the
  platform's canonical-vs-derived convention.

Rejected.

## Option B — Candidates canonical; package a rendered projection (selected)

Pros
- Structured boundary; robust downstream; regenerable; platform-consistent.

Cons
- Requires a distinct projection step. Accepted — it is a thin, deterministic
  renderer (M5).

## Selected Option

Option B.

---

# Consequences

## Positive
- SPEC-004 integrates against stable structured data.
- Presentation can evolve (formats, UI) without contract change.
- Determinism: the projection is a pure function of canonical inputs.

## Trade-offs
- Two artifacts to keep consistent. Mitigation: the package is *derived*, so
  consistency is guaranteed by construction (rendered from the candidates each run).

---

# Impact

## Affected Tasks
- EOS-003 (candidate contract as canonical), EOS-004 (`ReviewPackage` typed as a
  projection + `SessionReport`), M4 (persist canonical), M5 (render projection).

## Affected Components
- `src/end-of-session/contracts/`, the Review Package Projector (M5), Review Store
  (M4).

## Documentation Requiring Updates
- PIPELINE-ARCHITECTURE (canonical-vs-projection), CONTRACTS.md (kinds).

---

# Validation

- M5: given fixed `CandidateKnowledge[]` + `Session`, the projector yields a
  deep-equal markdown package (pure/deterministic); the store retains the
  structured candidates as the source of truth.

---

# Future Review

- Revisit if a review UI (beyond markdown) is introduced — it becomes another
  projection of the same canonical candidates, confirming the model.

---

# Related Documents

Architecture
- ARCH-002 (structured-canonical / rendered-projection), ADR-002

Standards
- AJS-006 §2 (generated artifacts are derived)

Specifications
- SPEC-003 §8, SPEC-004 §2/§7

Implementation Tasks
- EOS-003, EOS-004, M4, M5

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.0 | Decision created — candidates canonical, review package projection. |
