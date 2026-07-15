# End-of-Session Workflow

> **Specification:** SPEC-003 — End-of-Session Workflow
> **Standards:** AJS-004, AJS-007
> **Status:** Milestone M1 — Foundation & Contracts, **in progress**. EOS-001
> establishes the module scaffold (this task): the public barrel, the contracts
> barrel, and the test placeholder. No contracts, services, or behavior yet.

The End-of-Session Workflow is a **capture pipeline**: it turns a finished coding
session into candidate knowledge for human review. Each stage has a single
responsibility and communicates with the next only through immutable contracts; no
stage depends on another stage's internals. Future capabilities extend the pipeline
by **registering pluggable units** (analyzers, triggers, notifiers) rather than
modifying existing stages.

The pipeline writes only to the non-canonical **review store**. Git commits and
wiki generation are deferred orchestration side effects and are **out of the v1
capture slice** (ADR-002, AJS-005 §7).

```text
TriggerSource → Session → Analyzer Registry → Knowledge Extractor → Candidate
Generator → CandidateKnowledge[]  ← canonical (SPEC-003 → SPEC-004)
                                  → Review Store · Review Package · Session Report
```

See
[PIPELINE-ARCHITECTURE.md](../../implementation/phase-2-core-platform/spec-003-end-of-session/architecture/PIPELINE-ARCHITECTURE.md)
for the full stage breakdown.

## Public entry point

The module exposes a **single** public entry point, the composed workflow's:

```ts
run(context: SessionContext): Promise<SessionReport>
```

`run` always executes the highest-level implemented pipeline; adding a later stage
or analyzer does not change the entry point. The workflow is assembled at the
composition root `createEndOfSessionWorkflow(config, deps)`, wired in Milestone M5.
Until then, `index.ts` exports nothing — the barrel exports nothing that does not
yet exist.

Internal stages are private and are re-exported from `index.ts` only as they are
implemented. Consumers import from the module entry point, not from internal files.
The published boundary contract `CandidateKnowledge` is owned by this module under
`contracts/` (EOS-D1) so SPEC-004 can import it without pulling in services.

## Status

This module currently contains only its scaffold (task **EOS-001**): the public
barrel (`index.ts`), the contracts barrel (`contracts/index.ts`), and this README.
No contracts, services, analyzers, store, or CLI wiring exist yet.

Functionality arrives incrementally through the SPEC-003 milestones:

| Milestone | Focus                                                          |
| --------- | -------------------------------------------------------------- |
| M1        | Foundation & contracts; analyzer/trigger/notification seams    |
| M2        | Session change collection (Git analyzer → `ChangeSet`)         |
| M3        | Knowledge extraction (injected `TextGenerator` port)           |
| M4        | Candidate generation & review store                            |
| M5        | Review package projection, orchestration & `aj session end`    |

Subfolders (e.g. `analyzers/`, `extraction/`, `store/`, `projection/`) are created
by the tasks that introduce their code, rather than pre-created as empty
placeholders.

## References

- `docs/specifications/SPEC-003-End-of-Session-Workflow.md`
- `implementation/phase-2-core-platform/spec-003-end-of-session/`
