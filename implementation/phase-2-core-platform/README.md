# Phase 2 — Core Knowledge Platform

Build the reusable platform according to the approved architecture (ARCH-001,
ARCH-002) and specifications.

---

## Delivered

### Context Builder (SPEC-002)

Deterministic Collection → Selection → Assembly, returning an immutable
`ContextPackage` via `ContextBuilder.build(request)`. This is the most
thoroughly tracked implementation in the repository.

- Detailed record: [spec-002-context-builder/](spec-002-context-builder/)
  (milestones, tasks CB-001–CB-024, decisions, retrospectives).
- Code: `src/context-builder/`.
- Shipped in **Platform v2.0.0** (see [CHANGELOG](../../CHANGELOG.md)).

### Knowledge Platform pipeline (SPEC-005 / SPEC-006 / SPEC-007)

The sources → wiki engine described in **ARCH-002**: Source Connector
(SPEC-006), Wiki Store (SPEC-007), and the Wiki Generator (SPEC-005) with its
Knowledge Compiler, Identity Resolvers (ADR-005/006), Wiki Renderer, and Merge
Engine.

- Code: `src/ingestion/` and `src/knowledge/`.
- Status: **implemented, tested, and wired end to end** via **`aj wiki build`**
  (`src/cli/commands/wiki.ts`), which composes the pipeline through the Knowledge
  Platform composition root (`src/knowledge/composition/`) and runs
  `WikiGenerator.run()`. The generator writes the `index.md` corpus catalog that
  `aj ask` retrieves from, closing the producer → consumer loop.
- This pipeline does not have a task-by-task folder here; its authoritative
  record is SPEC-005/006/007, ADR-002–006, the [CHANGELOG](../../CHANGELOG.md),
  and git history.

---

## Supporting platform capabilities

Established by building the first product (Knowledge Assistant) on the platform,
each an independent single-purpose service under `src/platform/`: Configuration,
Handbook, Retrieval, Prompt Renderer, and AI Client.

---

## Completed Phase 2 work

- **Knowledge Platform pipeline wired** to `aj wiki build` (see above).
- **End-of-Session Workflow (SPEC-003)** — **complete; all five milestones frozen**
  (reviewer: AJ, 2026-07-15 → 2026-07-17) and merged. `aj session end` captures
  candidate knowledge for review. Detailed record:
  [spec-003-end-of-session/](spec-003-end-of-session/). v1 is **capture-only**:
  git-commit ownership is deferred beyond v1 per **ADR-002** — version control
  belongs to orchestration, and that layer does not exist yet, so **no component
  performs it**.

## Remaining Phase 2 work

- Knowledge Review Workflow (SPEC-004).
- Further Context Builder capabilities — Explainability & Profiles (M5),
  Optimization (M6).
