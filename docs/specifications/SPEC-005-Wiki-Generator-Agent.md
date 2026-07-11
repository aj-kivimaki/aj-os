# SPEC-005 — Wiki Generator Agent

**Specification ID:** SPEC-005 **Version:** 2.0 **Status:** Draft
**Owner:** AJ-OS **Related Standards:** AJS-002, AJS-003, AJS-004,
AJS-005, AJS-006 **Related Specifications:** SPEC-002, SPEC-003, SPEC-006,
SPEC-007 **Related Architecture:** ARCH-002 **Related Decisions:** ADR-002
**Last Updated:** 2026-07-11

> **v2.0 note:** This specification was rewritten under ADR-002. The wiki
> is now a **persistent but recoverable** artifact (not disposable), the
> generator is **source- and destination-agnostic**, and **version control
> is an orchestration concern** — the generator never commits.

---

# 1. Overview

## Purpose

Maintain the LLM Wiki: an incrementally-compiled, interlinked knowledge
layer derived from curated sources and optimized for retrieval by the
Context Builder.

## Scope

Begins with normalized `SourceRecord`s (produced by Source Connectors,
SPEC-006) and ends with an updated wiki persisted through the Wiki Store
(SPEC-007). Covers the **INGEST**, **RECONCILE**, and **LINT** operations.

The wiki is an incrementally-maintained knowledge artifact, **not a mirror
of the current source set**: removing a source does not remove the
knowledge derived from it (ADR-002).

## Goals

- Keep the wiki current with its sources through **incremental** updates.
- Produce AI-friendly, interlinked knowledge pages with provenance.
- Detect and surface contradictions rather than silently overwriting.
- Operate headless and idempotently.
- Remain independent of any specific source backend or destination store.

## Non-Goals

- Edit source (Handbook) content or create new canonical knowledge.
- Review what enters the Handbook (that is SPEC-004).
- Perform version control / git operations (that is orchestration,
  AJS-005).
- **Autonomously delete wiki pages.** Removal is *proposed*, never
  performed headless; page deletion is an orchestration/human action
  (§9, §10).
- Know about "Handbook" specifically — sources and destination are
  configuration.

---

# 2. Functional Requirements

The agent SHALL:

1. Accept a set of normalized `SourceRecord`s from one or more Source
   Connectors.
2. Detect changed/new/removed sources by **content hash**; skip unchanged
   sources (idempotency).
3. **INGEST** added/modified sources: compile their knowledge into wiki
   pages (`sources/`, `entities/`, `concepts/`) and update `index.md`,
   `overview.md`.
4. Build and maintain cross-references (`[[wikilinks]]`) and provenance:
   every generated page records **all** contributing source IDs in its
   frontmatter.
5. Maintain a **reverse index** (source ID → contributing pages) so a
   changed or removed source re-evaluates only affected pages, not the
   whole wiki. The index is generator-owned state persisted via the Store.
6. **RECONCILE** removed (or moved) sources: use the reverse index to
   locate affected pages and re-evaluate each per ADR-003 — mark **stale**
   (partial orphan, or synthesized page whose source changed), and emit a
   removal **proposal** for **fully-orphaned** pages. Never auto-rewrite
   synthesized pages; never delete headless; keep provenance sticky.
7. Surface conflicts with prior wiki content as warnings; never silently
   overwrite accumulated knowledge.
8. **LINT**: detect contradictions, orphans, stale claims, and wiki pages
   whose hash drifted from the last generated state (accidental
   hand-edits).
9. Write all output exclusively through the Wiki Store (SPEC-007).
10. Append a provenance-stamped entry to the generation log per run.

---

# 3. Non-Functional Requirements

- **Incremental** — normal operation updates only changed knowledge.
- **Idempotent** — re-running with unchanged sources is a no-op.
- **Recoverable** — supports a full rebuild as a bootstrap/recovery path;
  this is lossy and non-deterministic and is not the routine mode
  (ADR-002).
- **Persistent** — the wiki is durable accumulated state, not a disposable
  build artifact.
- **Explainable / Observable** — every run is logged and diff-reviewable.
- **Source-agnostic / Destination-agnostic** — no coupling to a specific
  backend or store.
- **Model-agnostic** — no dependency on a specific LLM provider.

---

# 4. User Stories

- As AJ, I want my curated knowledge continuously compiled into a wiki I
  can browse in Obsidian, without maintaining it by hand.
- As the Context Builder, I want an interlinked, retrieval-optimized wiki
  with stable provenance.
- As AJ-OS, I want source changes reflected in the wiki automatically,
  incrementally, and idempotently.

---

# 5. Architecture Overview

```text
SourceRecord[]  (from Source Connectors, SPEC-006)
        │
        ▼
Wiki Generator
        ├── Change Detector      (hash diff → added/modified/removed)
        ├── Ingestor             (INGEST: compile added/modified → pages)
        ├── Reconciler           (RECONCILE: removed/moved → re-evaluate affected pages)
        ├── Cross-reference Builder
        ├── Provenance Stamper    (frontmatter sources[] + reverse index + log entry)
        └── Linter               (LINT: contradictions, orphans, stale, drift)
                │  writes via
                ▼
        Wiki Store (SPEC-007)  →  handbook/wiki/  (persistent)
                │
                ▼
        Retrieval / Context Builder (SPEC-002)
```

The generator holds no filesystem-location or git knowledge. Location is
owned by the Wiki Store; committing is owned by orchestration.

---

# 6. Triggers

- Source change detected (headless, e.g. via n8n file-change trigger).
- Scheduled LINT / refresh.
- Manual regeneration (recovery/bootstrap).
- End-of-Session or release workflow (SPEC-003).

Triggering and post-run commit policy are owned by orchestration (AJS-005),
not by this agent.

---

# 7. Inputs

Required:

- `SourceRecord[]` (normalized; each carries id, uri, content, hash,
  metadata).
- Configuration (destination handle, prompt/schema assets, run mode).

Optional:

- Full-rebuild flag (recovery/bootstrap).
- Subset filter (changed sources only).

Validation:

- Configuration MUST satisfy `destination ∉ sources`.

---

# 8. Outputs

Primary:

- Updated wiki pages, persisted via the Wiki Store.

Secondary:

- Updated `index.md`, `overview.md`.
- Provenance-stamped `log.md` entry (generator version + schema/prompt
  hash + run id).
- LINT report (contradictions, orphans, stale claims, hash-drift).

The generator does **not** produce commits.

---

# 9. Workflow

1. Receive `SourceRecord[]` and configuration.
2. Validate configuration (`destination ∉ sources`).
3. Detect changes by content hash → classify as added / modified /
   removed.
4. INGEST added/modified sources → compile knowledge into pages.
5. RECONCILE removed/moved sources → via the reverse index, re-evaluate
   affected pages (update / mark stale / merge / propose removal).
6. Build/refresh cross-references, page provenance, and the reverse index.
7. Emit warnings on conflict (no silent overwrite).
8. Run LINT.
9. Persist changes through the Wiki Store; append the log entry.
10. Return a run report — including any removal proposals — to the caller
    (orchestration decides on deletion and commit).

---

# 10. Agent Responsibilities

- Read normalized sources (never raw backends directly).
- Compile knowledge into interlinked wiki pages.
- Maintain provenance and cross-references.
- Detect contradictions and drift.
- Write only through the Wiki Store.

Explicitly **not** responsible for: reading specific backends, choosing
where the wiki lives, or committing to version control.

---

# 11. Data Flow

```text
Sources → Source Connector → SourceRecord → Wiki Generator
       → wiki pages → Wiki Store → handbook/wiki/ → Retrieval → Context Builder
```

---

# 12. State Model

Run state:

```text
Received → Validating → DetectingChanges → Ingesting → Reconciling
        → CrossReferencing → Linting → Persisting → Reported
```

Wiki page lifecycle (ADR-003):

```text
active ⇄ stale          (RECONCILE sets/clears stale; reasons below)
active/stale → removed  (explicit orchestration/human action only — never headless)
```

Full lifecycle, staleness reasons, and the page frontmatter schema are
specified in §21 (Reconciliation & Page Lifecycle).

---

# 13. Configuration

Configurable:

- Destination store handle (SPEC-007).
- Source set (SPEC-006).
- Run mode: incremental (default) | full-rebuild (recovery).
- Prompt/schema profile.
- LINT rule set / thresholds.

---

# 14. Error Handling

Recoverable:

- Invalid or unparseable source record → skip + report.
- Conflict with existing page → warning callout, keep prior knowledge.
- Partial ingest failure → persist succeeded pages, report failures.

Fatal:

- Destination store unavailable.
- Configuration invalid (`destination ∩ sources ≠ ∅`, missing assets).

---

# 15. Logging & Observability

Record per run:

- Sources processed / skipped (by hash).
- Pages created / updated.
- Cross-references built.
- LINT results (including hash-drift/hand-edit findings).
- Generator provenance (version + schema/prompt hash + run id).
- Duration and errors.

---

# 16. Security & Permissions

Read:

- Normalized sources (via connectors).
- Configuration and prompt assets.

Write:

- Wiki destination (via the Wiki Store), path-guarded to the configured
  destination only.

MUST NOT: modify source content, write outside the destination, or perform
git operations.

---

# 17. Testing Strategy

Unit:

- Change detection (hash diff).
- INGEST page compilation.
- Cross-reference and provenance generation.
- LINT rules (including hash-drift detection).

Integration:

- Full source-set → wiki generation against a **fixture vault** (never the
  real one).
- Idempotency: second run over unchanged sources produces no writes.

Acceptance:

- Wiki updated incrementally from changed sources.
- Contradictions surfaced, not silently overwritten.
- Sources remain unchanged.
- No git operations performed by the agent.

---

# 18. Acceptance Criteria

- [ ] Incremental INGEST updates only changed knowledge.
- [ ] Unchanged sources are skipped (idempotent).
- [ ] Cross-references and provenance are maintained.
- [ ] Contradictions and hash-drift are reported by LINT.
- [ ] All writes go through the Wiki Store; none bypass it.
- [ ] The agent performs no git operations.
- [ ] Sources remain unmodified.

---

# 19. Future Enhancements

- Embedding / semantic-graph generation over the compiled wiki.
- Multiple destination profiles / multiple knowledge outputs.
- Multi-language wiki generation.
- Retrieval-quality metrics feeding LINT.

---

# 20. Notes

The Handbook remains the single source of truth. The wiki is a
**persistent but recoverable** derived artifact, maintained exclusively by
this agent and hosted in the Handbook vault (ADR-002). Full regeneration
exists as a recovery/bootstrap path only; routine maintenance is
incremental.

---

# 21. Reconciliation & Page Lifecycle (ADR-003)

RECONCILE defines the lifecycle of generated knowledge. Its behavior is
governed by ADR-003; this section is the operational specification.

## 21.1 Page statuses

Stored statuses are `active` and `stale`. `removed` is absence (no
tombstone). Absence of a `status` field means `active`.

```text
active ──(source removed / synthesized-dependent source changed)──▶ stale
stale  ──(condition resolves: source returns / page re-derived)───▶ active
stale  ──(human/orchestration acts on a removal proposal)─────────▶ removed
active ──(human/orchestration prunes directly)────────────────────▶ removed
```

RECONCILE performs only `active ⇄ stale` and emits removal proposals; it
never deletes.

## 21.2 Staleness reasons

- `source-modified` — a synthesized page's contributing source changed and
  the page was not auto-re-derived.
- `partial-orphan` — some (not all) contributing sources were removed.
- `orphaned` — all contributing sources were removed (also emits a removal
  proposal).

## 21.3 Reconciliation rules

| Page kind | Event | Action |
|---|---|---|
| 1:1 source page | source modified | INGEST re-derives → `active` |
| 1:1 source page | source removed | `stale (orphaned)` + removal proposal |
| synthesized (N:1) | a source modified | `stale (source-modified)`; **not** rewritten |
| synthesized (N:1) | some sources removed | `stale (partial-orphan)`; kept |
| synthesized (N:1) | all sources removed | `stale (orphaned)` + removal proposal |
| any | condition resolves | clear stale → `active` |

Synthesized pages are **never auto-rewritten headless**. Removal proposals
are emitted **only for fully-orphaned** pages. A rename is treated as
remove + add.

## 21.4 Provenance & the reverse index

- Page frontmatter records **all** contributing source ids (§21.5). Ids are
  **sticky**: a removed source's id is retained; liveness is computed
  against the current source set.
- The generator maintains a **reverse index** (`source id → page paths`) as
  state under `.generator/`, used to locate affected pages in O(affected).
  It is rebuildable by scanning page frontmatter (recovery).

## 21.5 Page frontmatter schema

```yaml
---
type: source | entity | concept
sources:            # all contributing source ids (sticky/historical)
  - handbook:library/foo.md
hash: <source-hash>            # for 1:1 source pages
status: active | stale         # absent ⇒ active
stale_reason: source-modified | partial-orphan | orphaned   # when stale
stale_since: <iso-timestamp>                                # when stale
generated_at: <iso-timestamp>
---
```

## 21.6 Report semantics

Per run, RECONCILE contributes to the `GenerationReport`:

- `stalePages` — pages transitioned to (or still) `stale` this run.
- `removalProposals` — `{ path, reason, orphanedSources }` for
  fully-orphaned pages. Orchestration/humans decide; the generator never
  acts on them.

## 21.7 Retrieval neutrality

`stale` is a flag and does **not** gate retrieval by itself. Down-ranking or
excluding stale pages is a retrieval-policy concern (AJS-002), decided
separately.

## 21.8 Invariants

No knowledge deleted headless; no silent overwrite of synthesized
knowledge; provenance preserved (sticky); targeted & complete via the
reverse index; deterministic & idempotent (no oscillation); reversible
staleness; never a mirror; index/provenance rebuildable; every action
reported and logged. (Full list: ADR-003.)
