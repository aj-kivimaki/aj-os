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

> ✅ **The first loop is closed.** `aj wiki build` composes the Knowledge
> Platform from config and runs a generation cycle, producing a wiki — with its
> `index.md` corpus catalog — that `aj ask` reads through the shared
> `handbook.generatedWikiPath` contract. AJ-OS now generates and consumes its own
> knowledge.

> ✅ **Sessions are captured.** `aj session end` turns a finished session into
> reviewed-knowledge candidates in `knowledge-review/pending/<session-id>/`
> (SPEC-003, complete and frozen 2026-07-17). The capture half of "evolve
> automatically" exists; **the governance half — deciding what becomes durable —
> does not yet.** That is SPEC-004, and it is why the loop is not closed twice.

> ⬜ **Nobody owns git commits — deliberately, and this is a known gap.**
> **ADR-002** holds that *version control belongs to orchestration*. The Wiki
> Generator never commits; the End-of-Session Workflow never commits. **The
> orchestration layer that would own it does not exist**, so today AJ-OS writes
> files and a human commits them. This is recorded rather than assigned: no
> specification currently claims the role, and one should not acquire it by
> default. See ADR-002 and AJS-005 §7.

1. **Repository Excellence Review (REX)** — **in progress**, and deliberately
   before SPEC-004. A non-specification engineering-quality milestone: the
   documentation is brought in line with what actually ships, and quality is made
   machine-enforced rather than asserted (there is no CI, no linter, and
   `npm run typecheck` does not reach `tests/`). See
   `implementation/phase-3-developer-experience/repository-excellence/`.
2. **Knowledge Review Workflow (SPEC-004)** — human governance of what enters the
   Handbook. It consumes the `CandidateKnowledge` that `aj session end` already
   produces; the boundary contract is published in
   [CONTRACTS.md](docs/architecture/CONTRACTS.md).
3. **Acceptance Review & dogfooding — after SPEC-004.** Only once the loop
   *maintains* the context automatically can we honestly evaluate what the
   VISION asks — *"is AJ-OS helping maintain an accurate, evolving working
   context?"* Evaluating a single subsystem earlier would answer a smaller
   question. Capture friction (retrieval quality, citations, identity dedup,
   cost/latency, UX) then.
4. **Context Builder M5 — Explainability & Profiles**, then M6 — Optimization
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
- ✅ **Knowledge Platform pipeline** (ARCH-002; SPEC-005/006/007) — implemented,
  tested, and **wired end to end** via `aj wiki build`. The generator produces the
  `index.md` corpus catalog the Knowledge Assistant retrieves from, closing the
  producer → consumer loop.
- ✅ **End-of-Session** (SPEC-003) — `aj session end` captures a finished session
  as candidate knowledge for review. Complete and frozen 2026-07-17; a
  capture-only v1 vertical slice (one git analyzer, manual trigger, no-op
  notification).
- ⬜ **Knowledge Review** (SPEC-004) — human governance of what becomes durable
  knowledge, and the other half of keeping the context evolving automatically
  (Resume Here #2).

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
