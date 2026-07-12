# AJ-OS Roadmap

> **Status:** Active · **What this is:** where AJ-OS is going and what to do
> next. For *what AJ-OS is*, see [docs/VISION.md](docs/VISION.md); for *how it is
> built*, see [docs/architecture/](docs/architecture/). Itemized history lives in
> the [CHANGELOG](CHANGELOG.md).

AJ-OS grows **product-first**: the platform evolves because a product needs it,
never as an isolated exercise. Each phase below advances the subsystems that
serve the [loop](docs/VISION.md) — it does not restate the vision behind them.

---

# Resume Here — Recommended Next Steps

> Read this first when returning to development. It is the single "where do I
> pick up" pointer. Items are ordered; the first is the highest-leverage.

1. **Wire the Knowledge Platform pipeline to an entry point.** The Wiki Generator
   (SPEC-005), Source Connector (SPEC-006), and Wiki Store (SPEC-007) exist as
   tested library code (`src/ingestion/`, `src/knowledge/`) but nothing invokes
   `WikiGenerator.run()` yet. Add a thin CLI command (e.g. `aj wiki build`) that
   composes the connectors, store, compiler, resolver, renderer, and merge engine
   from config and runs a generation cycle. This closes the loop so the Knowledge
   Assistant can read a wiki this repo actually generated.
2. **Use the Knowledge Assistant against a real handbook** and capture friction
   as backlog items (configuration, retrieval quality, citations, missing-wiki UX).
3. **End-of-Session Workflow (SPEC-003)** — the orchestration layer that decides
   when to run the generator and owns git commits (the engine never commits).
4. **Knowledge Review Workflow (SPEC-004)** — human governance of what enters the
   Handbook.
5. **Context Builder M5 — Explainability & Profiles**, then M6 — Optimization
   (see `implementation/phase-2-core-platform/spec-002-context-builder/`).

Deferred and future work is catalogued in the phases below.

---

# Phases

## Phase 1 — Platform Foundation ✅
Architecture (ARCH-001), Standards (AJS-001–007), and the core Specifications
(SPEC-000–007) are established. This phase defines **how** AJ-OS is built.

## Phase 2 — Core Platform (in progress)
- ✅ **Context Builder** (SPEC-002) — deterministic Collection → Selection →
  Assembly, shipped in Platform v2.0.0.
- 🟡 **Knowledge Platform pipeline** (ARCH-002; SPEC-005/006/007) — implemented at
  the library level and tested, **pending orchestration wiring** (Resume Here #1).
- ⬜ **End-of-Session** (SPEC-003) and **Knowledge Review** (SPEC-004).

Project Kickoff (SPEC-001) is intentionally postponed until more of the platform
is operational, so it can be built as an early workflow on top of it.

## Products (active track)
- **Knowledge Assistant v1.0.0** — the first product, shipped with Platform
  v2.0.0. Future products build on the same pattern.

Platform and products are versioned independently — see
[versioning & releases](docs/project/versioning-and-releases.md).

## Phase 3 — Developer Experience
Workflows and applications that consume the platform — starting with Project
Kickoff (SPEC-001). Supporting services (search, logging, agent/workflow
registries, notifications) expand as implementation reveals reusable needs.

## Phase 4 — New Context Sources
Additional sources feed the loop as pluggable providers: GitHub, Jira, calendar,
domain databases — and Notion, **redesigned for the current architecture** rather
than revived from the archived v1 sync. The v1 implementation is preserved in
[docs/archive/v1/](docs/archive/v1/README.md); if AJ-OS needs one of its ideas
again, it is rebuilt against the current architecture, not carried forward.

## Phase 5 — Productivity Services
User-facing capabilities on top of the platform (e.g. Portfolio Builder, Daily
Planner). These consume the platform rather than define it.

## Phase 6 — Platform Evolution
Longer-term: MCP integration, public APIs, plugin architecture, multi-user
support, semantic search, and autonomous engineering workflows.

---

> **Every project makes the next one easier.**
