# EOS-D3 — Session Is a First-Class Concept

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-002
>
> **Date:** 2026-07-15

---

# Purpose

Every candidate and report produced by the workflow is attributed to "a session."
This decision defines what a session *is* — a first-class contract with a stable
identity — rather than an identifier derived from incidental details.

---

# Context

- The initial plan proposed deriving a session id from `timestamp + branch`. That
  couples identity to the branch (mutable, and specific to git-based triggers) and
  to wall-clock formatting.
- SPEC-003 lists multiple triggers (manual, git commit/push, scheduled, IDE). The
  session identifier must remain stable and meaningful regardless of which trigger
  fires it.
- AJS-004 favors observable, stateless agents; SPEC-006's `SourceRecord` sets the
  precedent of a **stable id + descriptive metadata**.

---

# Decision

Introduce a first-class **`Session`** contract, distinct from the input
**`SessionContext`**:

- **`Session`** = `{ id, startedAt, endedAt, trigger, gitState, branch }`
  - `id` — a **stable, opaque** identifier generated once at session creation
    (e.g. a UUID/ULID). It is not derived from branch or timestamp.
  - `startedAt` / `endedAt` — ISO-8601 timestamps (metadata).
  - `trigger` — the `TriggerSource` kind that started the session (metadata;
    `manual` in v1).
  - `gitState` — a snapshot: head commit, dirty flag, resolved change range
    (metadata).
  - `branch` — the branch name (metadata).
- **`SessionContext`** remains the *input request* (project, repository, branch;
  optional commit, notes, task id, Context Package ref — SPEC-003 §7). The
  workflow turns a `SessionContext` into an identified `Session`.
- `CandidateKnowledge`, `ReviewPackage`, and `SessionReport` all reference
  `Session.id` for provenance.

---

# Rationale

- **Stable identity.** An opaque id decouples "which session" from "which branch/
  time," so identity survives new trigger sources and branch renames — satisfying
  the requirement that the id be stable regardless of trigger.
- **Triggers become metadata.** Modeling `trigger`/`gitState`/`branch` as fields
  means adding a git-hook or scheduled trigger changes *data*, not the identity
  model or any downstream contract.
- **Cleaner provenance.** Downstream artifacts reference one stable key; the
  review store directory (`pending/<session-id>/`) is unambiguous.
- **Precedent.** Mirrors `SourceRecord` (stable id + metadata) and AJS-004's
  observability principle.

---

# Alternatives Considered

## Option A — Derived id (`timestamp + branch`), no Session contract

Pros
- No new contract; id is human-readable.

Cons
- Identity coupled to mutable/trigger-specific details; collides across triggers;
  no home for `trigger`/`gitState` metadata.

Rejected.

## Option B — First-class `Session` with opaque id + metadata (selected)

Pros
- Stable identity; triggers/branch are metadata; clean provenance; extensible.

Cons
- One additional contract to define and freeze. Accepted — it is small and
  load-bearing.

## Selected Option

Option B.

---

# Consequences

## Positive
- Adding future triggers requires no identity or downstream contract change.
- Provenance across candidates/report/store keys on one stable id.

## Trade-offs
- Opaque ids are less human-readable than `timestamp-branch`. Mitigation:
  `startedAt`/`branch` metadata (and the directory's report) provide the
  human-facing context; the id stays stable.

---

# Impact

## Affected Tasks
- EOS-002 (`Session` + `SessionContext` contracts).

## Affected Components
- `src/end-of-session/contracts/`; provenance fields in `CandidateKnowledge`
  (EOS-003), `SessionReport` (EOS-004); the review-store key (M4).

## Documentation Requiring Updates
- PIPELINE-ARCHITECTURE (Session stage), CONTRACTS.md (Session row).

---

# Validation

- EOS-002 contract tests: a `Session` has a non-empty stable id; the same
  `SessionContext` run twice yields two distinct session ids (identity is not a
  pure function of inputs); metadata fields validate.

---

# Future Review

- Revisit when a second trigger source is implemented, to confirm `trigger`/
  `gitState` metadata fully absorb the difference with no identity change.

---

# Related Documents

Standards
- AJS-004 (observable/stateless)

Specifications
- SPEC-003 §7/§12, SPEC-006 (`SourceRecord` precedent)

Implementation Tasks
- EOS-002

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.0 | Decision created — first-class `Session` with stable opaque id. |
