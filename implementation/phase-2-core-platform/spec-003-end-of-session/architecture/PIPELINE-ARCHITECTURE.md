# Pipeline Architecture — End-of-Session Workflow

Status: Living Architecture

This document describes the target architecture of SPEC-003. It is updated as
milestones are planned and implemented. It does not replace ADRs or the
architecture-review decisions in `decisions/`, which explain *why* individual
choices were made.

**Implementation status.** Milestones **M1–M4 are complete**. M1 (Foundation &
Contracts) established the immutable contracts (`SessionContext`, `Session`,
`CandidateKnowledge`, `ReviewPackage`, `SessionReport`, `SessionChange`,
`AnalyzerError`, `ChangeSet`) and the extensibility seams (`Analyzer` port +
registry, `TriggerSource`, `NotificationPort`). M2 (Session Change Collection)
implemented the **Collection** stage — `collectChanges` execution + the
`GitChangeAnalyzer` behind a read-only `GitPort` — producing a `ChangeSet`. M3
(Knowledge Extraction) implemented the **Extraction** stage: the
`KnowledgeExtraction` contract (`parseExtractionResponse`) and the
`KnowledgeExtractor` behind the injected `TextGenerator` port (the pipeline's one
non-deterministic seam). M4 (Candidate Generation & Review Store) implemented the
**Candidate Generation** stage (`createCandidateGenerator` — the deterministic,
one-to-one map from `KnowledgeExtraction` to canonical `CandidateKnowledge[]`) and
the **Persistence** stage (`createFilesystemReviewStore` — the domain-aware,
persistence-only Review Store writing to `knowledge-review/pending/<session-id>/`;
EOS-D6), plus the `AjConfig.handbook.reviewPath` config. The remaining stage
*behaviors* (review-package projection, composition root, CLI) are **not yet
implemented** — they arrive in M5.

## Overview

The End-of-Session Workflow is a **capture pipeline**: it transforms a finished
coding session into candidate knowledge for human review. Each stage has a single
responsibility and communicates with the next only through immutable contracts.
No stage depends on another stage's internals. Future capabilities extend the
pipeline by **registering new pluggable units** (analyzers, triggers, notifiers)
rather than modifying existing stages.

Unlike the SPEC-002 Context Builder — a fully deterministic pipeline — this
workflow contains exactly **one non-deterministic seam** (knowledge extraction
via a text-generation model). That seam is isolated behind an injected port so
every surrounding stage is deterministic and testable.

---

# Pipeline

```text
TriggerSource (manual in v1)
      │  SessionContext
      ▼
Session  (identified run — stable id + metadata)
      │
      ▼
Analyzer Registry ──► [ GitChangeAnalyzer ]  (+ future analyzers)
      │  ChangeSet (changes + errors)
      ▼
Knowledge Extractor ──► TextGenerator port  ◄── the one non-deterministic seam
      │  KnowledgeExtraction (validated)
      ▼
Candidate Generator
      │  CandidateKnowledge[]   ◄── CANONICAL OUTPUT (SPEC-003 → SPEC-004)
      ├──────────────────────────────► Review Store  (persist canonical + report)
      ▼
Review Package Projector
      │  ReviewPackage (human-readable markdown projection)
      ▼
NotificationPort (no-op in v1)
      │
      ▼
SessionReport (execution log)
```

The **canonical artifact is `CandidateKnowledge[]`**. `ReviewPackage` is a
deterministic projection of it (EOS-D4); it is never read back as data.

---

# Stage Responsibilities

## Trigger

Determines *when* a session ends and produces a `SessionContext`. v1 implements
the **manual** trigger (`aj session end`). Git-hook, scheduled, IDE, and n8n
triggers are additional `TriggerSource` implementations added later without
changing downstream stages.

## Session

Turns a `SessionContext` into an identified `Session` with a **stable opaque id**
and metadata (`startedAt`, `endedAt`, `trigger`, `gitState`, `branch`). Identity
is independent of the trigger source (EOS-D3), so provenance stays stable as new
triggers appear.

## Collection (Analyzers)

Determines *what changed* in the session. The `Analyzer` registry runs every
registered analyzer and aggregates results into a `ChangeSet`.

- Produces: `ChangeSet` (a set of `SessionChange` + `AnalyzerError`).
- Partial and deterministic: one analyzer failing never aborts collection; it
  contributes an `AnalyzerError` instead.
- v1 registers exactly one analyzer: `GitChangeAnalyzer`.
- Does not: extract knowledge, generate candidates, or persist anything.

## Extraction

Identifies *reusable knowledge* in the `ChangeSet` using the injected
`TextGenerator` port and a Zod-validated schema.

- Produces: `KnowledgeExtraction` (validated structured findings).
- The **only** non-deterministic stage; content comes from the model, structure
  is validated and deterministic.
- Does not: decide candidate identity, compare against the Handbook, or persist.

## Candidate Generation

Maps the extraction into **canonical `CandidateKnowledge[]`** — provenance-
complete, immutable, governance state `candidate` (AJS-006).

- Produces: `CandidateKnowledge[]` (the boundary contract) — deterministic given
  the extraction.
- Does not: deduplicate against the Handbook (that is SPEC-004's responsibility),
  approve, publish, or commit.

## Persistence (Review Store)

Writes the canonical candidates and the `SessionReport` to
`<vault>/knowledge-review/pending/<session-id>/`.

- Persistence-only; **never calls git** (ADR-002 §4, AJS-005 §7).
- Destination validated non-canonical (`∉ foundation/, library/, wiki/`) and
  path-escape guarded.
- Exposes `appendLog` for the execution log (WikiStore precedent).

## Projection (Review Package)

Renders the human-readable `ReviewPackage` markdown **from** the canonical
candidates + `Session`. A presentation concern: deterministic, derived, and never
the source of truth.

## Notification

Announces completion. v1 uses a **no-op** `NotificationPort`; real notifiers are
later implementations of the same port.

## Observability (Session Report)

Records trigger, duration, files analyzed, candidates produced, errors, and
result (SPEC-003 §16). Returned by the workflow and persisted with the candidates.

---

# Pipeline Ownership

```text
EndOfSessionWorkflow
    ├── TriggerSource        (manual)
    ├── AnalyzerRegistry ──► Analyzer[] (GitChangeAnalyzer)
    ├── KnowledgeExtractor ──► TextGenerator (port)
    ├── CandidateGenerator
    ├── ReviewStore          (persistence, no git)
    ├── ReviewPackageProjector
    └── NotificationPort     (no-op)
```

Everything is assembled in one place — the composition root
`createEndOfSessionWorkflow(config, deps)` (modeled on
`createKnowledgePipeline`). It returns `{ workflow, store }`. The workflow's
single public entry point is `run(context)` returning a `SessionReport`. Stages
are internal; only `run` is public.

## Public Entry Point

```text
run(context: SessionContext) : Promise<SessionReport>
```

`run` always executes the highest-level implemented pipeline. Adding a later
stage or analyzer does not change the entry point — callers always invoke `run`.

---

# Pipeline Contracts

```text
SessionContext
      ↓
Session
      ↓
ChangeSet
      ↓
KnowledgeExtraction
      ↓
CandidateKnowledge[]        ← canonical, crosses the SPEC-003 → SPEC-004 boundary
      ↓ (projection)
ReviewPackage
      +
SessionReport
```

Contracts are immutable and provenance-preserving. `ChangeSet`,
`KnowledgeExtraction`, and `SessionContext` are internal pipeline contracts;
`CandidateKnowledge`, `ReviewPackage`, and `SessionReport` are the workflow's
outputs. See [docs/architecture/CONTRACTS.md](../../../../docs/architecture/CONTRACTS.md).

---

# Architectural Principles

## Single Responsibility
Each stage performs exactly one responsibility; the six SPEC-003 "agents" collapse
onto these stages, with Documentation Analyzer and Notification realized as
pluggable units rather than always-on stages.

## Immutable Boundaries
Stages communicate only through immutable contracts; no stage reads another's
internals.

## Determinism by Construction
Every stage except Extraction is deterministic. Extraction's non-determinism is
confined to the injected `TextGenerator`; tests stub it and assert on structure.

## Canonical over Projection
`CandidateKnowledge[]` is canonical; `ReviewPackage` is a derived projection
(EOS-D4). Downstream systems consume the structured data, not the markdown.

## No Side Effects in the Engine
The pipeline writes only to the non-canonical review store. Git commits and wiki
generation are orchestration side effects, deferred out of v1 (ADR-002,
AJS-005 §7).

## Extensibility
New analyzers, triggers, and notifiers are registered, not woven in. The
orchestration and contracts are unchanged when they are added.

---

# Milestone Mapping

```text
M1  Contracts + seams (Session, ChangeSet, CandidateKnowledge, ReviewPackage,
    SessionReport, Analyzer/Trigger/Notification ports)
M2  Analyzer Registry + GitChangeAnalyzer            → ChangeSet
M3  Knowledge Extractor (TextGenerator port)         → KnowledgeExtraction
M4  Candidate Generator + Review Store               → CandidateKnowledge[] (persisted)
M5  Review Package Projector + composition root + CLI → ReviewPackage + SessionReport
```

---

# Integration Check

Before freezing any milestone that introduces a new stage, verify:

- the new stage has exactly one responsibility;
- it communicates only through immutable contracts;
- previous stages require no modification;
- the public `run(context)` entry point does not change;
- no git or wiki side effect enters the pipeline.

If a public contract must evolve, implementation pauses until the change is
reviewed and approved (AJS-007 *Frozen Plan Change Proposal*).
