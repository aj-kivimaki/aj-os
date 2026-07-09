# Decision: CB-022 Deterministic Assembly — Construction Details

> **Task:** CB-022 — Deterministic Assembly
> **Date:** 2026-07-10
> **Status:** Accepted — reviewer-approved before implementation.

---

## Context

CB-022 implements the deterministic `assemble` stage as executable behaviour,
realizing the frozen CB-020 section-composition strategy and the frozen CB-021
inputs & metadata composition, and constructing the `ContextPackage` **through**
`parseContextPackage()` (CB-003). Two construction details were deliberately left
open by the planning decisions and are fixed here, both **reviewer-approved before
implementation** (2026-07-10). Neither modifies a frozen contract or the Planning
Package; both are purely structural and deterministic (RC-4, AD-007).

---

## Decision

### 1. Section titles — canonical Appendix B display names, keyed by `kind`

The frozen `ContextSection` contract (CB-003) requires a non-empty `title`, but
CB-020 fixes only the section `kind`, not its title. Assembly therefore needs a
title source. **The `title` is the canonical AJS-002 Appendix B display name for
the section, selected by a fixed `kind → title` mapping:**

| `kind` (CB-003 `SECTION_KINDS`)     | `title` (AJS-002 Appendix B)        |
| ----------------------------------- | ----------------------------------- |
| `objective`                         | `Objective`                         |
| `success-criteria`                  | `Success Criteria`                  |
| `constraints`                       | `Constraints`                       |
| `relevant-architecture`             | `Relevant Architecture`             |
| `coding-standards`                  | `Coding Standards`                  |
| `related-documentation`             | `Related Documentation`             |
| `handbook-references`               | `Handbook References`               |
| `wiki-references`                   | `Wiki References`                   |
| `files-likely-to-change`            | `Files Likely to Change`            |
| `existing-implementation-patterns`  | `Existing Implementation Patterns`  |
| `risks-and-edge-cases`              | `Risks & Edge Cases`                |
| `open-questions`                    | `Open Questions`                    |

The mapping is **total** over `SECTION_KINDS`, keyed **only** on `kind`, and
invents no content. It is purely structural (no `content` inspection, no semantic
evaluation — RC-4) and deterministic. Titles are display names, not rendering:
Assembly still does not render (AD-003). The mapping is complete for all 12 kinds
even though only six knowledge-derived kinds plus the four Reviewer Decision A
kinds can appear in M4 output (CB-020), so the source stays correct if a future
structural rule populates the remaining kinds.

### 2. The single canonical `contextVersion` constant

CB-021 §3 fixed that `contextVersion` has a **single canonical source** and
delegated the constant's name, value and placement to CB-022. This decision fixes:

- **Name:** `CONTEXT_VERSION`.
- **Value:** `"1.0"` — the version of the Context Package **contract** (CB-003),
  which conforms to **AJS-002 Appendix B v1.0**.
- **Placement:** the Assembly implementation module
  (`src/context-builder/assembly/assembleContext.ts`), referenced by Assembly's
  metadata composition and **inlined at no other site**. Placing it in the Assembly
  module (rather than the `package/` contract module) keeps the frozen CB-003
  contract files untouched, exactly as CB-021 §3 anticipated ("introduced during
  CB-022 as an implementation detail of the executable metadata composition").

`CONTEXT_VERSION` is deliberately distinct from `CONTEXT_BUILDER.version`
(`"0.1.0"`, the producing agent's release version, sourced into
`contextBuilderVersion`). Per CB-021 §2 the two version fields answer different
questions ("what shape is this?" vs. "what produced this?") and are never derived
from each other.

---

## Rationale

- **Titles from Appendix B keep the boundary structural.** AD-004 makes Appendix B
  the canonical logical structure; its section names are the natural, deterministic
  title source. Keying on `kind` (never `content`) keeps Assembly free of semantic
  judgment (RC-4) and requires no derived state.
- **A single `CONTEXT_VERSION` constant honours single-sourcing.** One module-level
  constant, referenced once, satisfies CB-021's "single and canonical" requirement
  and cannot drift. Scoping it to the Assembly module avoids touching the frozen
  package contract while keeping the constant where the composition that uses it
  lives.
- **`"1.0"` matches the contract's declared version.** The Context Package contract
  is AJS-002 Appendix B **v1.0**; the constant records that, not the agent's release
  version.

---

## Consequences

- CB-024 protects both details with permanent tests: section titles equal the
  Appendix B names, and `metadata.contextVersion === "1.0"` (distinct from
  `contextBuilderVersion`).
- A future contract revision bumps `CONTEXT_VERSION` at its single site; a future
  structural rule that populates additional section kinds already has a defined
  title via the total `kind → title` mapping.

## Scope / Non-Goals

- No change to the CB-020 section strategy or the CB-021 metadata composition —
  both are realized exactly as frozen.
- No rendering, semantic validation, explainability computation, `build`
  integration, optimization, or permanent tests (owned by CB-023/CB-024/AD-009).
- No modification of any frozen contract or of the frozen Planning Package.

## References

SPEC-002 · AJS-002 (Appendix B v1.0) · AJS-007 §6.1 · PIPELINE-ARCHITECTURE.md
§Assembly · M4 Planning Package · AD-002, AD-003, AD-004, AD-007, AD-008, AD-009 ·
RC-1, RC-2, RC-3, RC-4, RC-6 · CB-003 (`ContextSection`, `parseContextPackage`,
`SECTION_KINDS`) · CB-004 (`REFERENCE_TYPES`) · CB-014 (`SelectionResult`) · CB-020
(section composition) · CB-021 (inputs & metadata; `contextVersion` ownership) ·
CB-002 / `CONTEXT_BUILDER.version`.

## Change Log

| Date       | Version | Description                                                      |
| ---------- | ------- | ---------------------------------------------------------------- |
| 2026-07-10 | 1.0     | Initial decision recorded (reviewer-approved before implementation): section titles are the canonical Appendix B display names keyed by `kind`; the single canonical `contextVersion` source is `CONTEXT_VERSION = "1.0"`, placed in the Assembly module. No frozen contract or Planning Package changed. |
