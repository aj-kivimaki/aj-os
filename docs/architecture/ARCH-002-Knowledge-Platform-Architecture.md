# ARCH-002 — Knowledge Platform Architecture

**Architecture ID:** ARCH-002\
**Version:** 1.0\
**Status:** Draft\
**Owner:** AJ-OS\
**Related Architecture:** ARCH-001\
**Related Standards:** AJS-002, AJS-003, AJS-005, AJS-006\
**Related Specifications:** SPEC-002, SPEC-005, SPEC-006, SPEC-007\
**Related Decisions:** ADR-002, ADR-003, ADR-004, ADR-005

---

# 1. Purpose

Describe the internal architecture of the AJ-OS **knowledge platform**:
how curated source material becomes a maintained LLM Wiki, how that wiki
is retrieved and assembled into context, and how agents and automations
consume it.

ARCH-001 is the platform map. ARCH-002 is the detailed architecture of its
Knowledge Layer.

---

# 2. Scope

Covers the path from **sources** to **knowledge outputs**:

```
Sources → Ingestion → Wiki Maintenance → Persistence → Retrieval → Context → Agents / Automations
```

Out of scope: the business modules, the legacy Notion synchronization, and
the internal design of individual agents (see AJS-004 and their SPECs).

---

# 3. Architecture Overview

```text
┌─ SOURCES (Handbook vault) ─────────────────────────────────┐
│  foundation/   library/        (curated, human-authored)   │
└───────────────┬────────────────────────────────────────────┘
                │  Source Connector (SPEC-006)
                │  → normalized SourceRecord
┌───────────────▼──────────── AJ-OS ENGINE ──────────────────┐
│  Wiki Generator (SPEC-005)                                 │
│    INGEST · LINT  — incremental, headless                  │
│        │  writes via                                       │
│        ▼                                                   │
│  Wiki Store (SPEC-007)  — persistence only, no git         │
│  Retrieval (AJS-002 / v0.1 keyword → BM25 → embeddings)    │
│  Context Builder (SPEC-002)  Collection → Selection → Assembly │
└───────────────┬────────────────────────────────────────────┘
                │  writes destination
┌───────────────▼─── DESTINATION (Handbook vault) ───────────┐
│  wiki/   — persistent, generator-owned, Obsidian-browsable │
└───────────────┬────────────────────────────────────────────┘
                │  consumed by
┌───────────────▼─── INTERFACES & OUTPUTS ───────────────────┐
│  Agents (Q&A, inbox) · MCP (future) · Portfolio emitter    │
│  Orchestration (SPEC-003 / n8n / CLI) → git commit         │
└────────────────────────────────────────────────────────────┘
```

---

# 4. Components and Responsibilities

| Component | Responsibility | Contract |
|---|---|---|
| **Source Connector** | Enumerate and read documents from a backend; normalize each into a `SourceRecord`. | SPEC-006 |
| **Wiki Generator** | Orchestrate the pipeline (INGEST/RECONCILE/LINT). Owns no location or git knowledge. | SPEC-005 |
| **Knowledge Compiler** | Extract renderer-agnostic structured knowledge from a source (no Markdown). | SPEC-005 §22, ADR-005 |
| **Identity Resolver** | Map each candidate entity/concept to a canonical identity (existing page or new). | ADR-005 |
| **Wiki Renderer** | Render Markdown pages from the extraction using canonical identities. | SPEC-005 §22, ADR-005 |
| **Merge Engine** | Enrich an existing page with a new contribution. | ADR-004 |
| **Wiki Store** | Read and write wiki pages. Persistence only; no git. | SPEC-007 |
| **Retrieval** | Select candidate wiki pages for a query. Interface stable across implementations. | AJS-002 |
| **Context Builder** | Assemble retrieved knowledge into a deterministic Context Package. | SPEC-002 |
| **Agents** | Consume context to answer questions or capture inbox notes. | AJS-004 |
| **Orchestration** | Trigger the generator; decide whether/when to commit. | AJS-005, SPEC-003 |

Boundary responsibilities between Handbook and AJ-OS are defined in
§6 and ADR-002.

---

# 5. Invariants

These MUST hold across all implementations:

1. **Handbook is the single source of truth.** No canonical knowledge
   exists only in the wiki.
2. **The wiki is generator-owned.** Humans edit sources, never `wiki/`.
   Hand-edits are surfaced by LINT (hash drift), not silently preserved.
3. **The wiki is persistent but recoverable.** It is committed and
   incrementally maintained; full regeneration is a lossy recovery path,
   not routine (ADR-002).
4. **The compiler is source-agnostic.** Compilation logic branches only on
   normalized `SourceRecord`s, never on source type. All backend specifics
   resolve inside the connector.
5. **No git in the engine.** The Generator and Wiki Store never commit;
   version control is an orchestration concern.
6. **`destination ∉ sources`.** Configuration must reject any overlap to
   prevent the generator ingesting its own output.
7. **Single ingress / single egress.** Sources are read through one Source
   Connector interface; the wiki is read and written through one Wiki Store
   interface. No component reads raw paths directly.
8. **The wiki is not a mirror of the sources.** Removing a source does not
   remove derived knowledge; removal triggers RECONCILE (ADR-003), and
   pages are never deleted headless — they are marked `stale`, and a removal
   is *proposed* only for fully-orphaned pages. Synthesized pages are never
   auto-rewritten headless.
9. **Provenance is mandatory.** Every generated page records all
   contributing source IDs, and the generator maintains a reverse index
   (source ID → pages) so changed/removed sources re-evaluate only the
   affected pages. MERGE only widens provenance (monotonic); RECONCILE keeps
   removed ids sticky (ADR-004, ADR-003).
10. **Source identity is stable and namespaced.** A `SourceRecord.id` is
    stable across content edits and globally namespaced by connector;
    `hash` is a separate change signal.
11. **Merge enriches, never replaces.** When a new source touches an
    existing entity/concept page, the merged page is richer than before;
    human-owned regions are never rewritten; the Wiki is the sole knowledge
    artifact — no separate claim store (ADR-004).

---

# 6. Handbook ↔ AJ-OS Boundary

```
Handbook (knowledge vault)          AJ-OS (knowledge engine)
──────────────────────────          ────────────────────────
Owns curated sources:               Sole producer of the wiki:
  foundation/  library/               Wiki Generator (SPEC-005)
Hosts the artifact:                   Source Connector (SPEC-006)
  wiki/  (browsable in Obsidian)      Wiki Store (SPEC-007)
Owns NO compiler logic              Retrieval, Context, Agents
Human capture zone:                 Never hardcodes "Handbook":
  workspace/inbox/                    sources + destination are config
```

- Handbook is a **content contract**: structured Markdown under
  `foundation/` and `library/`; `wiki/` is a write destination AJ-OS owns.
- AJ-OS writes into a repository it does not version; the cross-repo write
  seam is handled by explicit destination config, path guards,
  `destination ∉ sources` validation, and provenance stamping.
- Commits into the Handbook repo are performed by orchestration, never by
  the engine.

---

# 7. Knowledge Pipeline (data flow)

```text
foundation/ + library/
        │  Source Connector: enumerate + normalize (+ content hash)
        ▼
   SourceRecord[]
        │  Wiki Generator: INGEST changed records, LINT on schedule
        ▼
   wiki pages (sources/ entities/ concepts/ + index/overview/log)
        │  Wiki Store: write / appendLog  (generic path-keyed entries)
        ▼
   handbook/wiki/  (persistent)
        │  Retrieval: candidate selection
        ▼
   Context Builder: Collection → Selection → Assembly
        ▼
   Context Package → Agents / Outputs
        │  Orchestration
        ▼
   git commit (optional, batched)
```

Change detection is by **content hash**: unchanged sources are skipped, so
scheduled runs are cheap and idempotent.

---

# 8. Automation Model

- Wiki maintenance runs **headless** (no per-change human step). This is
  consistent with AJS-005 §6: human approval governs what enters the
  Handbook (sources), while wiki generation from approved sources is the
  "explicitly configured otherwise" automated case.
- Guardrails substitute for live human review of the derived artifact:
  never silently overwrite, LINT gate, hash-drift detection, provenance
  stamping, and git as an after-the-fact audit trail (produced by
  orchestration).

---

# 9. Retrieval Evolution

Retrieval sits behind a stable interface so implementations can advance
without touching callers:

1. Keyword frequency (v0.1, current).
2. BM25 / lexical ranking.
3. Embeddings / semantic search — indexing the **compiled wiki**, not raw
   sources, consistent with the LLM Wiki philosophy.

Embeddings, when added, are an additive index behind the same interface.

---

# 10. Implementation Notes

- The wiki artifact does **not** live in AJ-OS; it stays at
  `handbook/wiki/` (configured destination).
- The Knowledge Compiler lives in `src/knowledge/compiler/` (LLM extraction
  behind a port + deterministic rendering). Its compilation semantics are
  specified authoritatively in SPEC-005 §22, folding in the Handbook's
  historical `wiki/CLAUDE.md`. Prompts may be externalized to a dedicated
  prompts location later.
- The two current consumption paths (`aj.config.json → handbook.path` and
  env `HANDBOOK_PATH`) collapse into a single Source Connector + Wiki
  Store configuration.
- Concrete interface signatures for the Source Connector, Wiki Generator,
  and Wiki Store are defined as contracts in their SPECs and the
  forthcoming contracts step; this document defines their responsibilities
  and boundaries only.

---

# 11. Future Extensions

- Additional Source Connectors: Notion, Git repositories, Jira.
- Embeddings and semantic graph over the compiled wiki.
- MCP servers exposing retrieval and inbox tools.
- Additional knowledge outputs beyond the wiki (e.g. portfolio Markdown
  emitter) produced from the same pipeline.

---

# 12. Relationship to Other Documents

- **ARCH-001** — platform map; ARCH-002 details its Knowledge Layer.
- **ADR-002** — records the ownership, location, and persistence decisions
  this architecture assumes.
- **AJS-002** — context assembly rules; **AJS-003** — knowledge ownership
  and lifecycle; **AJS-005** — orchestration; **AJS-006** — governance.
- **SPEC-002** — Context Builder; **SPEC-005** — Wiki Generator;
  **SPEC-006** — Source Connector; **SPEC-007** — Wiki Store.
