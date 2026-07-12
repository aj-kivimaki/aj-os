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
- Status: **implemented at the library level and covered by tests, but not yet
  wired to a runnable orchestration entry point** — no CLI command or service
  currently invokes `WikiGenerator.run()`. Wiring it up is the top item in the
  [ROADMAP](../../ROADMAP.md).
- This pipeline does not have a task-by-task folder here; its authoritative
  record is SPEC-005/006/007, ADR-002–006, the [CHANGELOG](../../CHANGELOG.md),
  and git history.

---

## Supporting platform capabilities

Established by building the first product (Knowledge Assistant) on the platform,
each an independent single-purpose service under `src/platform/`: Configuration,
Handbook, Retrieval, Prompt Renderer, and AI Client.

---

## Remaining Phase 2 work

- Wire the Knowledge Platform pipeline to an orchestration entry point.
- End-of-Session Workflow (SPEC-003) — owns git commits.
- Knowledge Review Workflow (SPEC-004).
- Further Context Builder capabilities — Explainability & Profiles (M5),
  Optimization (M6).
