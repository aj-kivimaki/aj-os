# End-of-Session Workflow

> **Specification:** SPEC-003 — End-of-Session Workflow
> **Standards:** AJS-004, AJS-007
> **Status:** **COMPLETE — all five milestones frozen** (reviewer: AJ; M1 2026-07-15,
> M2–M4 2026-07-16, M5 2026-07-17). The v1 vertical slice is operational: `aj session
> end` collects a session's git changes, extracts reusable knowledge, generates
> canonical candidates, persists them, renders the review package, and reports.
> **Changes now follow the AJS-007 Frozen Plan Change Proposal process (§7.2).**

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

**SPEC-003 is complete. All five milestones are frozen** and the v1 capture pipeline
runs end to end via `aj session end`. The module exposes its immutable, deep-frozen,
Zod-validated contracts, its extensibility seams, and every pipeline stage through
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

Beyond the contracts above, every stage is implemented and frozen:

- **Collection** (EOS-101..103, M2) — `collectChanges` and the `GitChangeAnalyzer`
  behind a read-only `GitPort`. Partial by design: one analyzer failing never aborts
  the run — it contributes either changes or an `AnalyzerError`.
- **Extraction** (EOS-201..202, M3) — `createKnowledgeExtractor` over an injected
  `TextGenerator`. **The one non-deterministic seam**, isolated behind a port so
  every other stage stays deterministic and stub-testable.
- **Generation & persistence** (EOS-301..303, M4) — `createCandidateGenerator`
  (deterministic 1:1 mapping) and `createFilesystemReviewStore` (EOS-D6).
- **Projection, orchestration & CLI** (EOS-401..411, M5) —
  `createReviewPackageProjector`, `buildSessionReport`, `createSessionWorkflow`,
  `createEndOfSessionWorkflow` (EOS-D9), and `aj session end`.

| Milestone | Focus                                                          | Status |
| --------- | -------------------------------------------------------------- | ------ |
| M1        | Foundation & contracts; analyzer/trigger/notification seams    | ✅ Frozen 2026-07-15 |
| M2        | Session change collection (Git analyzer → `ChangeSet`)         | ✅ Frozen 2026-07-16 |
| M3        | Knowledge extraction (injected `TextGenerator` port)           | ✅ Frozen 2026-07-16 |
| M4        | Candidate generation & review store                            | ✅ Frozen 2026-07-16 |
| M5        | Review package projection, orchestration & `aj session end`    | ✅ Frozen 2026-07-17 |

## What this module does not do — permanently, not yet

- **No git write.** Version control belongs to orchestration (**ADR-002**, AJS-005
  §7), and that layer does not exist yet — so **no component commits**. Verified by
  grep and at runtime.
- **No wiki generation.** Deferred; the capture pipeline never invokes the
  generator.
- **Never modifies canonical knowledge.** Every write lands beneath
  `<handbook>/<reviewPath>/pending/<session-id>/`, enforced at the store's boundary
  rather than by convention. **This one is permanent.**

## References

- `docs/specifications/SPEC-003-End-of-Session-Workflow.md`
- `implementation/phase-2-core-platform/spec-003-end-of-session/`
