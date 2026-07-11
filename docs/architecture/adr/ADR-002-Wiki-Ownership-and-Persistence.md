# ADR-002 — Wiki Ownership, Location, and Persistence

**Status:** Accepted

**Date:** 2026-07-11

**Supersedes (in part):** ARCH-001 §3, AJS-003 §3 and Domain 3, SPEC-005 §21

**Decision Makers**

- AJ
- Claude (Architecture Partner)

---

# Context

ARCH-001 froze the AJ-OS architecture as the implementation baseline and
required that significant changes be recorded as new ADRs.

Before implementing SPEC-005 (Wiki Generator), a review of the
Handbook ↔ AJ-OS relationship surfaced three architectural questions the
frozen baseline answered inconsistently or not at all:

1. **Location vs. ownership.** The LLM Wiki physically lives inside the
   Handbook vault, but nothing owned its production. The baseline treated
   "Handbook" as a single monolithic source of truth without separating
   the curated *sources* from the generated *wiki*.

2. **Disposable vs. persistent.** ARCH-001 §3, AJS-003 §3, and SPEC-005
   §21 declared the wiki a *disposable, deterministically regenerable*
   artifact. This conflicts with the LLM Wiki pattern the wiki actually
   follows: an incrementally maintained knowledge layer that **compounds
   over time**. LLM-based compilation (entity extraction, cross-linking,
   contradiction resolution) is not a pure deterministic function of the
   sources, so regenerating from scratch is lossy and non-deterministic.

3. **Coupling.** AJ-OS consumed the wiki through two independent
   filesystem paths, hard-coded to "Handbook", with the producer contract
   (`handbook/wiki/CLAUDE.md`) living in a different repository from the
   consumer that parses its output.

---

# Decision

## 1. Ownership is separated from location

- The **wiki artifact stays inside the Handbook vault** (`handbook/wiki/`)
  so it remains part of the personal knowledge base and browsable in
  Obsidian, with provenance links resolving against the sources.
- **AJ-OS is the sole producer** of the wiki. It owns SPEC-005, all
  prompts, schemas, and maintenance logic. Handbook hosts the artifact but
  contains no compiler logic.
- The wiki is **generator-owned**: humans edit *sources*, never `wiki/`.

## 2. The wiki is persistent but recoverable

- The wiki is a **persistent, incrementally-maintained, versioned
  artifact**. It is committed, not disposable.
- The **Handbook remains the single source of truth**: no *canonical*
  knowledge exists only in the wiki.
- **Full regeneration remains a supported recovery/bootstrap path**, but
  it is lossy and non-deterministic and is therefore not a routine
  operation. Normal maintenance is incremental (INGEST/LINT).

This amends "Generated artifacts are disposable" to **"Generated
artifacts are derived; some are disposable, the wiki is persistent but
recoverable."**

## 3. The generator is source- and destination-agnostic

- The Wiki Generator knows nothing about "Handbook." It accepts
  configurable **sources** (via Source Connectors) and a **destination**
  (via the Wiki Store).
- Today: sources = `handbook/foundation/`, `handbook/library/`;
  destination = `handbook/wiki/`. Future sources (Notion, Git, Jira) are
  added as new connectors without changing the generator.

## 4. Version control belongs to orchestration, not the engine

- The Wiki Generator and Wiki Store **never call git**. The Wiki Store is
  persistence-only.
- Whether and when to commit is decided by the **orchestration layer**
  (SPEC-003 End-of-Session Workflow, n8n, or a CLI command), enabling
  batching, experimentation, and review-before-commit without changing the
  compiler.

---

# Rationale

- Physical location and production ownership are separable concerns.
  Keeping the wiki in the vault preserves Obsidian browsing and live
  provenance links; making AJ-OS the sole writer makes maintenance
  code — testable, schedulable, reusable.
- An LLM Wiki accumulates integration decisions and history that are not
  recoverable from current sources alone. Persisting it protects that
  emergent state; retaining a recovery-rebuild path preserves the safety
  of "Handbook is the source of truth."
- Source-agnosticism keeps the compiler stable as new knowledge backends
  are added and is required immediately for testability (tests point at a
  fixture vault, never the real one).
- Separating git from the engine keeps single-responsibility boundaries
  and lets commit policy vary per workflow.

---

# Consequences

**Positive**

- Clean, coherent boundary between Handbook (sources + hosted artifact)
  and AJ-OS (sole producer + engine).
- The producer contract and the consumer parser now live in one
  repository (AJ-OS) and evolve together.
- The wiki's accumulated knowledge is protected as persistent state.

**Trade-offs / new seams**

- AJ-OS writes into a repository it does not version. This introduces the
  need for explicit destination configuration, path guards, a
  `destination ∉ sources` validation, and generator-provenance stamping
  for cross-repo reproducibility. These are addressed in ARCH-002 and
  SPEC-005/006/007.
- "Regenerable" is downgraded from a routine guarantee to a
  recovery/bootstrap capability.

---

# Affected Documents

- **ARCH-001** — §3 principle amended; §6 pipeline and §9 specifications
  updated to reference Source Connector and Wiki Store.
- **AJS-003** — §3 and Domain 3 amended: the LLM Wiki is persistent but
  recoverable, hosted in Handbook, produced by AJ-OS.
- **AJS-005** — orchestration owns version control; the generator/store
  never commit.
- **SPEC-005** — rewritten to the model defined here.
- **ARCH-002** (new), **SPEC-006** (new), **SPEC-007** (new) — introduced
  to specify the knowledge platform, Source Connector, and Wiki Store.

---

# Related Documents

- ARCH-001 — AJ-OS Platform Architecture
- ARCH-002 — Knowledge Platform Architecture
- AJS-003 — Knowledge Standard
- AJS-005 — Workflow Orchestration Standard
- AJS-006 — Knowledge Governance Standard
- SPEC-005 — Wiki Generator Agent
- SPEC-006 — Source Connector
- SPEC-007 — Wiki Store
