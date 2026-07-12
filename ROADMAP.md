# AJ-OS Roadmap

> **Roadmap Version:** v2.0\
> **Status:** Active

---

# Vision

AJ-OS is evolving into a knowledge-driven developer operating system
that continuously converts project work into reusable knowledge.

The platform evolves **through building real products**. Products validate and
drive the platform's capabilities: the platform stays reusable, but it grows because
a product needs it — not as an isolated engineering exercise.

---

# Guiding Principles

- Products drive platform growth — the platform evolves to serve real products.
- Architecture before implementation.
- Standards before features.
- Specifications before coding.
- Knowledge before prompts.
- Human governance over canonical knowledge.
- Small, composable platform services.
- Model-agnostic design.

---

# Current Status

## ✅ Phase 1 — Platform Foundation (Complete)

The architectural foundation has been established.

Completed:

- ARCH-001 Platform Architecture
- AJS-001 – AJS-007 Platform Standards
- SPEC-000 Specification Writing Standard
- SPEC-001 – SPEC-005 Core Platform Specifications

This phase defines **how AJ-OS is built**, not just what it does.

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
   Assistant can read a wiki this repo actually generated, and it exercises the
   pipeline against a real handbook — which is exactly what the upcoming
   real-world usage will stress.
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

# Phase 2 — Core Knowledge Platform (In Progress)

Build the reusable platform according to the approved architecture and specifications.

**Shipped in Platform v2.0.0:**

- **Context Builder** (SPEC-002) — collects, selects, and assembles knowledge deterministically end-to-end through `ContextBuilder.build(request)`, returning an immutable `ContextPackage`.
- **Supporting platform capabilities** — Configuration, Handbook, Retrieval, Prompt Renderer, and AI Client — established by building the first product on the platform.

**Implemented since v2.0.0 (library level, not yet wired):**

- **Knowledge Platform pipeline** (ARCH-002) — Source Connector (SPEC-006), Wiki
  Store (SPEC-007), and the Wiki Generator (SPEC-005) with its Knowledge Compiler,
  Identity Resolvers (ADR-005/006), Wiki Renderer, and Merge Engine. Tested library
  code with no orchestration entry point yet — see **Resume Here**, item 1.

Detailed implementation history lives in the [CHANGELOG](CHANGELOG.md) and the [specifications](docs/specifications/); it is intentionally not duplicated here.

**Remaining platform work (upcoming):**

- Wire the Knowledge Platform pipeline to an orchestration entry point
- Further Context Builder capabilities — explainability, context profiles, rendering
- End-of-Session Workflow (SPEC-003)
- Knowledge Review Workflow (SPEC-004)

Project Kickoff (SPEC-001) remains intentionally postponed until more of the core platform is operational, so it can become an early workflow built on top of it.

---

# Products (Active Track)

Products are now a live development track, not a distant future phase. AJ-OS grows **product-first**: each product validates and drives the platform capabilities it needs.

- **Knowledge Assistant v1.0.0** — the first complete product, shipped with Platform v2.0.0: a CLI (`aj ask`) that answers handbook questions with grounded, cited responses.

Future products (see Phase 5 — Productivity Services) build on the same pattern.

> **Versioning.** The AJ-OS Platform and each product are versioned independently — see [docs/project/versioning-and-releases.md](docs/project/versioning-and-releases.md).

---

# Phase 3 --- Developer Experience

Once the core platform services have been completed, implementation shifts to workflows and applications that consume the platform.

Priority:

- Project Kickoff Workflow (SPEC-001)

Supporting platform services may expand as implementation reveals reusable capabilities.

Examples include:

- Search
- Configuration
- Logging
- Agent Registry
- Workflow Registry
- Notification Service

Existing integrations, including Notion, will be adapted as KnowledgeProviders using the established provider contracts rather than bespoke integrations.

---

# Phase 4 --- Legacy Migration

Review and migrate existing project components.

Existing implementations include:

- Code-first Notion synchronization
- Schema engine
- REST API
- Handbook agent
- n8n workflows
- Experimental AI agents

Each component will be evaluated to determine whether it should be:

- Migrated
- Refactored
- Replaced
- Archived

The architecture remains the source of truth.

---

# Phase 5 --- Productivity Services

Build user-facing capabilities on top of the platform.

Examples:

- Portfolio Builder
- Job Finder
- Daily Planner
- Documentation Assistant
- Career Dashboard
- Personal Automation Workflows

These services should consume the platform rather than define it.

---

# Phase 6 --- Platform Evolution

Long-term goals include:

- MCP integration
- Public APIs
- Plugin architecture
- Multi-user support
- Distributed execution
- Additional KnowledgeProviders
- Advanced retrieval
- Semantic search
- Autonomous engineering workflows

---

# Knowledge Roadmap

The long-term knowledge flow is:

```text
Project Work
      ↓
Project Documentation
      ↓
End-of-Session Workflow
      ↓
Candidate Knowledge
      ↓
Knowledge Review
      ↓
Handbook (Canonical)
      ↓
Wiki Generator
      ↓
Generated LLM Wiki
      ↓
Context Builder
      ↓
Better AI Context
```

---

# Platform Maturity

AJ-OS is implemented in layers.

Layer 1 — Platform Contracts

- Configuration
- Knowledge Request
- Knowledge Provider
- Knowledge Item
- Context Package

Layer 2 — Core Services

- Context Builder
- Provider Registry

Layer 3 — Platform Behavior

- Context Collection
- Ranking
- Context Assembly

Layer 4 — Platform Consumers

- Project Kickoff
- End-of-Session
- Knowledge Review
- Wiki Generator

Each layer builds upon the contracts established by the previous layer.

---

# Success Metrics

AJ-OS succeeds when:

- Every project improves the next project.
- Canonical knowledge remains trusted and maintainable.
- AI context is generated automatically.
- Manual prompting is minimized.
- Platform components remain modular and replaceable.

---

# Relationship to Documentation

- ARCH documents describe the platform.
- AJS documents define the governing rules.
- SPEC documents define implementations.
- Project documentation records execution.
- The handbook stores canonical knowledge.
- The generated wiki enables AI retrieval.

---

# Roadmap Philosophy

Implementation follows the architecture.

Existing experiments are valuable but will be migrated only after the
core platform has been implemented according to the current standards
and specifications.

The architecture---not legacy implementations---defines the future
direction of AJ-OS.

---

> **Every project makes the next project better.**
