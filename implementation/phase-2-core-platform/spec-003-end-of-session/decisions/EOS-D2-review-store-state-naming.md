# EOS-D2 — Review Store Naming Reflects Governance State

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-004 (contracts), M4 (store implementation)
>
> **Date:** 2026-07-15

---

# Purpose

SPEC-003 must write its output somewhere, but the spec only says "review package
location" (§17). This decision fixes the location and — importantly — its
**naming convention**, so the storage describes a *business state* rather than an
implementation mechanism.

---

# Context

- The initial plan proposed `knowledge-review/queue/`. `queue/` names a data
  structure, not a domain state.
- AJS-006 defines the knowledge lifecycle: Raw → Captured → **Candidate** →
  Reviewed → Approved → Canonical → Published → Archived. SPEC-003's output is in
  the **Candidate** state ("AI or human proposes reusable knowledge; awaiting
  review").
- The vault already uses domain-oriented top-level names (`foundation/`,
  `library/`, `wiki/`, `workspace/inbox/`). A new area should match that style.
- The location must be **non-canonical** and distinct from Inbox (raw capture)
  and from canonical content.

---

# Decision

1. **Location:** `<handbook-vault>/knowledge-review/pending/<session-id>/`.
2. **`knowledge-review/`** is the area (mirrors SPEC-004's domain, "Knowledge
   Review Workflow"); **`pending/`** is the state subfolder, naming the business
   state ("pending review") rather than a mechanism.
3. **Config:** add `AjConfig.handbook.reviewPath` (default `"knowledge-review"`),
   resolved relative to the handbook path — the same convention as
   `generatedWikiPath`. SPEC-003 writes under `<reviewPath>/pending/`.
4. **State subfolders are reserved for the lifecycle.** SPEC-003 owns `pending/`.
   Later states (e.g. `reviewed/`, `archived/`) are SPEC-004's to introduce under
   the same `knowledge-review/` root; SPEC-003 does not create them.

---

# Rationale

- **Ages better.** State-named storage survives implementation changes; `queue/`
  would misdescribe the data the moment the mechanism changed.
- **Domain alignment.** `pending` maps directly onto the AJS-006 `Candidate`
  state and reads naturally next to SPEC-004's review workflow.
- **Consistency.** `reviewPath` mirrors `generatedWikiPath`, so config and path
  resolution follow an existing pattern.
- **Extensible.** A single `knowledge-review/` root with state subfolders gives
  SPEC-004 a natural place to move items as they change state, without a second
  storage area.

---

# Alternatives Considered

## Option A — `knowledge-review/queue/`

Pros
- Suggests FIFO processing order.

Cons
- Names a mechanism, not a state; misleads once processing isn't a queue;
  inconsistent with the vault's domain-oriented naming.

Rejected.

## Option B — `review/pending/`

Pros
- Terse.

Cons
- `review/` is ambiguous (review of what?); `knowledge-review/` ties it to the
  SPEC-004 domain and the knowledge lifecycle.

Rejected in favor of the more specific area name.

## Selected Option

**`knowledge-review/pending/`** — domain area + business state.

---

# Consequences

## Positive
- Storage layout is self-describing and lifecycle-aligned.
- SPEC-004 inherits a clean root to manage subsequent states.

## Trade-offs
- Introduces one more top-level vault directory. Accepted — it is non-canonical
  and clearly scoped.

---

# Impact

## Affected Tasks
- EOS-004 (store contract references the path convention), M4 (store impl + config).

## Affected Components
- `AjConfig` (`src/platform/config/types.ts`), the Review Store (M4).

## Documentation Requiring Updates
- README, MILESTONES (M4), CONTRACTS.md (write location), `.env.example`/config
  example if a default surfaces there.

---

# Validation

- M4 writes to `knowledge-review/pending/<session-id>/`; a store test asserts the
  destination is non-canonical (`∉ foundation/, library/, wiki/`) and path-guarded.

---

# Future Review

- Revisit when SPEC-004 defines its post-review state transitions, to confirm the
  `knowledge-review/` root accommodates them without a second area.

---

# Related Documents

Standards
- AJS-006 (lifecycle states)

Specifications
- SPEC-003 §17, SPEC-004

Implementation Tasks
- EOS-004, M4 tasks

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.0 | Decision created — `knowledge-review/pending/`, `reviewPath` config. |
