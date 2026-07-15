# End-of-Session Workflow

> **Specification:** SPEC-003 — End-of-Session Workflow
> **Standards:** AJS-004, AJS-007
> **Status:** Milestone M1 — Foundation & Contracts **complete** (EOS-001..EOS-007).
> The module's immutable contracts and its analyzer/trigger/notification seams are
> in place and tested through the public surface. No behavior yet — collection,
> extraction, generation, persistence, projection, and the `aj session end` CLI
> arrive in M2–M5.

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
composition root `createEndOfSessionWorkflow(config, deps)`, wired in Milestone M5 —
so `run` and the composition root do not exist yet.

Until then, `index.ts` re-exports the module's **contracts and seams** as they land.
Internal stages are private and are re-exported from `index.ts` only as they are
implemented. Consumers import from the module entry point (or the narrow `contracts/`
barrel), not from internal files. The published boundary contract
`CandidateKnowledge` is owned by this module under `contracts/` (EOS-D1) so SPEC-004
can import it without pulling in services.

## Status

**Milestone M1 (Foundation & Contracts) is complete.** The module exposes its
immutable, deep-frozen, Zod-validated contracts and its extensibility seams through
the public surface:

- **Session** (EOS-002) — `SessionContext` (input) and first-class `Session`
  (identity + metadata); `parseSessionContext` / `parseSession`.
- **CandidateKnowledge** (EOS-003) — the canonical SPEC-003 → SPEC-004 boundary
  contract (EOS-D1/D4); `parseCandidateKnowledge`.
- **Workflow outputs** (EOS-004) — `ReviewPackage` (the derived projection, EOS-D4)
  and `SessionReport` (the §16 execution log); `parseReviewPackage` /
  `parseSessionReport`.
- **Analyzer stage** (EOS-005) — `SessionChange` / `AnalyzerError` / `ChangeSet`
  contracts, the `Analyzer` port, and `createAnalyzerRegistry` (registration +
  lookup only, no execution).
- **Seams** (EOS-006) — `createManualTriggerSource` (`TriggerSource`) and
  `createNoopNotificationPort` (`NotificationPort`).
- **Testing foundation** (EOS-007) — permanent public-surface suites plus a
  module-wide foundation guarding the public API surface and public-surface-only
  imports.

No behavior exists yet — no git access, LLM calls, persistence, projection
rendering, or CLI. Functionality arrives incrementally through the SPEC-003
milestones:

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
