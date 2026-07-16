# EOS-D6 — Review Store Exposes a Domain-Aware API

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-302 (Review Store), EOS-301 (produces the persisted candidates), M5 (composition calls the store)
>
> **Date:** 2026-07-16

---

# Purpose

The Review Store is the SPEC-003 → SPEC-004 **filesystem boundary**: it is where
captured `CandidateKnowledge[]` and the `SessionReport` are durably written for the
human review gate. The store's *interface* — the operations it exposes and what it
understands about what it stores — is a long-term architectural boundary that SPEC-004
and every future writer inherit. This decision fixes that interface shape so it does
not churn once SPEC-004 begins reading the store.

---

# Context

- The platform has an established persistence precedent: **`WikiStore`** is
  deliberately **semantics-free** — a path-keyed Markdown blob store (`write(path,
  content)`, `read`, `list`, `appendLog`) that "does not parse frontmatter or
  understand page structure." Layout and serialization live in the *caller* (the Wiki
  Generator / renderer), not the store.
- SPEC-003, by contrast, defines the Persistence *stage* as a domain responsibility:
  it "writes the **canonical candidates** and the **`SessionReport`**" to
  `knowledge-review/pending/<session-id>/` (PIPELINE-ARCHITECTURE; SPEC-003 §13/§16).
  There is exactly **one** consumer of this store and exactly **one** layout.
- Two shapes were considered at M4 planning (flagged in EOS-302):
  1. a **semantics-free** path-keyed store (the `WikiStore` model) plus a separate
     layout/writer module that maps candidates/report → paths; or
  2. a **domain-aware** store that owns the layout and serialization behind operations
     named for the SPEC-003 artifacts.
- The concern the boundary must settle: where does *knowledge of the review layout*
  live — in the store, or in a caller/writer — and which choice keeps SPEC-004's
  contract with the store stable.

---

# Decision

1. **The Review Store exposes a domain-aware API.** The `ReviewStore` interface is
   defined in terms of the SPEC-003 artifacts, not generic blobs:
   - `saveCandidates(sessionId, candidates: CandidateKnowledge[]): Promise<void>`
   - `saveReport(sessionId, report: SessionReport): Promise<void>`
   - `appendLog(sessionId, entry: string): Promise<void>`
   - `locate(): Promise<ReviewLocation>`
2. **The store owns the per-session layout and serialization.** It writes
   `pending/<session-id>/candidates/<candidate-id>.json`, `report.json`, and `log.md`,
   and serializes the contracts to canonical JSON. Callers name a session and hand over
   contracts; they do not compose paths or serialize.
3. **The domain surface does not weaken any persistence guarantee.** The store remains
   **persistence-only** (never git — ADR-002 §4 / AJS-005 §7), **destination-scoped and
   path-guarded** (lexical + symlink escape, plus a validated `sessionId`), and it
   validates its destination is **non-canonical** at construction (EOS-302). It does not
   interpret candidate *content* (no dedupe, no review semantics) — "domain-aware" means
   it knows the *artifacts and layout*, not that it reasons about the knowledge.
4. **No separate generic store + writer module is introduced.** With one consumer and
   one layout, a semantics-free store plus a layout module would be an abstraction
   without a second client — premature per the implementation playbook.

---

# Rationale

- **Cohesion with the stage responsibility.** SPEC-003 assigns "write the candidates and
  the report" to this stage; a domain API places that responsibility *in* the stage
  rather than splitting it across a dumb store and an external writer.
- **A stable boundary for SPEC-004.** SPEC-004 reads a well-known layout. Encoding that
  layout once, inside the store, means the layout has a single owner and SPEC-004
  depends on a named contract (`saveCandidates`/`saveReport` and their file tree) rather
  than on a convention re-implemented by each writer.
- **Clean composition (M5).** `createEndOfSessionWorkflow` calls
  `store.saveCandidates(...)` / `store.saveReport(...)` — no path composition or JSON
  wrangling at the call site.
- **No premature generality.** One consumer, one layout: the domain store is the
  smallest thing that is correct. Promotion to a generic store is a future option only
  if a second, differently-shaped consumer appears — a promotion, not a fix (the same
  reasoning that kept `TextGenerator` local in M3).
- **Divergence from `WikiStore` is intentional and bounded.** The generic `WikiStore`
  serves many page shapes authored by a renderer; the Review Store serves two fixed
  contracts with one layout. Different problem, different shape — the persistence
  *guarantees* (no git, path-guarded, scoped) are identical; only the *surface* differs.

---

# Alternatives Considered

## Option A — Semantics-free path-keyed store (the `WikiStore` model) + layout module

Description: a generic `write(path, content)` / `appendLog` store, with a separate
module composing `pending/<id>/candidates/<id>.json` etc. and serializing.

Pros
- Maximal store reuse; identical to the existing `WikiStore`.
- The store stays trivially simple and fully domain-agnostic.

Cons
- Splits one responsibility ("persist the review artifacts") across two modules for a
  single consumer and a single layout — an abstraction with no second client.
- The layout becomes an unowned convention duplicated by every writer; SPEC-004's
  contract with the store is implicit rather than named.
- Pushes serialization/path composition into orchestration (M5), muddying the
  composition root.

Rejected: premature generality; weaker boundary for SPEC-004.

## Option B (selected) — Domain-aware Review Store

Description: `saveCandidates` / `saveReport` / `appendLog` / `locate`, store-owned layout
and JSON serialization, persistence-only and path-guarded.

Selected — cohesive with the SPEC-003 stage, a named and stable boundary for SPEC-004,
and the smallest correct surface for one consumer.

---

# Consequences

## Positive

- Single owner of the review layout; SPEC-004 depends on a named contract.
- Cohesive persistence stage; clean M5 call sites.
- All `WikiStore` persistence guarantees preserved (no git, scoped, path-guarded), plus
  a non-canonical destination guard.

## Trade-offs

- The Review Store and `WikiStore` are **two different store shapes** in the codebase
  (semantics-free vs. domain-aware). Accepted: they solve different problems; unifying
  them now would over-generalize. Revisit only if a second review-area consumer with a
  different layout appears.
- SPEC-004 couples to the domain API surface (`saveCandidates`/`saveReport` + the file
  tree). This is the correct consumer → producer direction and is exactly the boundary
  we intend to keep stable.

---

# Impact

## Affected Tasks

- EOS-302 (implements the domain-aware `ReviewStore` + `createFilesystemReviewStore`).
- EOS-301 (produces the `CandidateKnowledge[]` the store persists).
- M5 (composition calls `saveCandidates`/`saveReport`; the projector writes
  `review-package.md` into the same session directory).

## Affected Components

- `src/end-of-session/store/` (new): `ReviewStore.ts`, `FilesystemReviewStore.ts`.

## Documentation Requiring Updates

- MILESTONES (M4), EOS-302, PIPELINE-ARCHITECTURE (Persistence stage surface),
  CONTRACTS.md (the persisted boundary, when SPEC-004 begins).

---

# Validation

- EOS-302 implements the four domain operations, the per-session JSON layout, the
  non-canonical construction guard, and the path guards; behaviour tests (temp dirs)
  assert round-trip via `parseCandidateKnowledge` / `parseSessionReport`, deterministic
  layout, and that no git is invoked.
- Revisited when SPEC-004 begins: confirm it reads the store through the domain layout
  without needing a store-shape change.

---

# Future Review

- Revisit **only if** a second consumer of the review area appears with a different
  layout or artifact set, at which point extracting a generic path-keyed core beneath the
  domain API may be justified — a promotion, not a fix.

---

# Related Documents

Architecture
- ARCH-001 §5, ARCH-002 §5, PIPELINE-ARCHITECTURE.md (Persistence stage),
  docs/architecture/CONTRACTS.md (boundary invariants 5 & 6)

Standards
- AJS-004 (single responsibility), AJS-005 §7 (no VCS in an engine), AJS-006 (traceability)

Decisions
- EOS-D2 (review location + `reviewPath`), EOS-D4 (canonical structured data vs. projection)

Specifications
- SPEC-003 §13/§16/§17, SPEC-004 (consumer)

Implementation Tasks
- EOS-302, EOS-301, M5 tasks

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-16 | 1.0 | Decision created and **Accepted** at the M4 Planning Review (reviewer: AJ). The Review Store exposes a domain-aware API (`saveCandidates`/`saveReport`/`appendLog`/`locate`) and owns the per-session JSON layout, diverging intentionally from the semantics-free `WikiStore`; persistence-only and path-guarded guarantees preserved. Establishes the long-term SPEC-003 → SPEC-004 filesystem boundary shape. |
