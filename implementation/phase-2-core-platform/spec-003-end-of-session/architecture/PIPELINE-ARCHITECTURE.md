# Pipeline Architecture — End-of-Session Workflow

Status: Living Architecture

This document describes the target architecture of SPEC-003. It is updated as
milestones are planned and implemented. It does not replace ADRs or the
architecture-review decisions in `decisions/`, which explain *why* individual
choices were made.

**Implementation status.** **All five milestones are implemented (M1–M5); the v1 vertical
slice is complete and proven end to end.** M1 (Foundation & Contracts) established the
immutable contracts (`SessionContext`, `Session`, `CandidateKnowledge`, `ReviewPackage`,
`SessionReport`, `SessionChange`, `AnalyzerError`, `ChangeSet`) and the extensibility seams
(`Analyzer` port + registry, `TriggerSource`, `NotificationPort`). M2 implemented
**Collection** — `collectChanges` + the `GitChangeAnalyzer` behind a read-only `GitPort`. M3
implemented **Extraction** — the `KnowledgeExtraction` contract and the `KnowledgeExtractor`
behind the injected `TextGenerator` (the pipeline's one non-deterministic seam). M4
implemented **Candidate Generation** (`createCandidateGenerator`) and **Persistence**
(`createFilesystemReviewStore`; EOS-D6), plus `AjConfig.handbook.reviewPath`.

**M5 completed the pipeline** (EOS-401..411): the **Session** stage
(`createSessionFactory`, over the git seam extended by EOS-D7), the **Projection** stage
(`createReviewPackageProjector`), the **Observability** stage (`buildSessionReport`), the
**Orchestrator** (`createSessionWorkflow` — the frozen `run(context)` entry point), the
**composition root** (`createEndOfSessionWorkflow`, returning `{ workflow, store, trigger }`;
EOS-D9), and the `aj session end` command. Two approved FPCPs landed within it: **EOS-D10**
routes the engineer's session notes into the extraction prompt, and **EOS-D11** brings
untracked files into the change stream. `saveReviewPackage` (**EOS-D8**) completed the store's
ownership of the session directory.

M5 planning and implementation surfaced four gaps between this document's target design and
the delivered code, each closed by a ratified decision rather than absorbed silently: no
`Session` was constructible (**EOS-D7**); the `ReviewPackage` had nowhere to be written
(**EOS-D8**); `run(context)` had no upstream producer of its input (**EOS-D9**); session notes
and untracked files never reached capture (**EOS-D10**, **EOS-D11**).

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

`gitState` (`head`, `dirty`) and `branch` are **observed** through the read-only
git seam (EOS-D7), never asserted by the caller — provenance must record facts, not
claims. `gitState.range` is **constructed** here: `HEAD` by default (uncommitted +
staged) or `<ref>..HEAD` with `--since <ref>`. A failure to read the session's git
state is **fatal** (SPEC-003 §15): a session whose head or branch is unknown cannot
be identified.

## Collection (Analyzers)

Determines *what changed* in the session. The `Analyzer` registry runs every
registered analyzer and aggregates results into a `ChangeSet`.

- Produces: `ChangeSet` (a set of `SessionChange` + `AnalyzerError`).
- Partial and deterministic: one analyzer failing never aborts collection; it
  contributes an `AnalyzerError` instead.
- v1 registers exactly one analyzer: `GitChangeAnalyzer`.
- Does not: extract knowledge, generate candidates, or persist anything.

## Extraction

Identifies *reusable knowledge* in the `ChangeSet` — and, when the engineer
supplied them, the session's **notes** — using the injected `TextGenerator`
port and a Zod-validated schema.

- Consumes: the `ChangeSet`, plus optional `sessionNotes` (EOS-D10). Notes carry
  what a diff cannot — intent, dead ends, why an approach was abandoned — and are
  rendered into the prompt **verbatim**, as context for interpreting the changes
  rather than as instructions. The stage is inert when they are absent.
- Produces: `KnowledgeExtraction` (validated structured findings).
- The **only** non-deterministic stage; content comes from the model, structure
  is validated and deterministic.
- Does not: **read the notes** (it carries them to the model and never inspects
  them — the Extractor Invariant), decide candidate identity, compare against the
  Handbook, or persist.

## Candidate Generation

Maps the extraction into **canonical `CandidateKnowledge[]`** — provenance-
complete, immutable, governance state `candidate` (AJS-006).

- Produces: `CandidateKnowledge[]` (the boundary contract) — deterministic given
  the extraction.
- Does not: deduplicate against the Handbook (that is SPEC-004's responsibility),
  approve, publish, or commit.

## Persistence (Review Store)

Writes the canonical candidates, the `SessionReport`, and the rendered
`ReviewPackage` to `<vault>/knowledge-review/pending/<session-id>/`.

- Persistence-only; **never calls git** (ADR-002 §4, AJS-005 §7).
- Destination validated non-canonical (`∉ foundation/, library/, wiki/`) and
  path-escape guarded.
- **Domain-aware** (EOS-D6): `saveCandidates` / `saveReport` /
  **`saveReviewPackage`** (EOS-D8) / `appendLog` / `locate`. The store **owns every
  file in the session directory** — callers name a session and hand over contracts;
  they never compose paths or serialize, and no write bypasses the guards.
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
`createKnowledgePipeline`). It returns `{ workflow, store, trigger }` (EOS-D9).
The workflow's single public entry point is `run(context)` returning a
`SessionReport`. Stages are internal; only `run` is public.

**The workflow owns the trigger's *kind*, but never invokes a trigger** (EOS-D9).
Producing the `SessionContext` is upstream of the run: the composition root builds
the `TriggerSource` and exposes it, so an entry point calls
`trigger.createContext()` and then `workflow.run(context)` — and therefore needs
no git and no knowledge of how a session is identified. `trigger.trigger` is
stamped onto the `Session` (EOS-D3). Future triggers (git-hook, scheduled, IDE,
n8n) are built at the composition root; the CLI, `run`, and every downstream stage
are unchanged.

## Public Entry Point

```text
run(context: SessionContext) : Promise<SessionReport>
```

`run` always executes the highest-level implemented pipeline. Adding a later
stage or analyzer does not change the entry point — callers always invoke `run`.

The orchestrator behind `run` **owns sequencing only** (the frozen Orchestrator
Invariant, EOS-406): it may invoke stages, propagate their results unmodified, and
coordinate execution; it must not transform contracts in flight, duplicate stage
logic, introduce business rules, or bypass the adapters. If a rule wants to live in
the orchestrator, a stage is missing.

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
