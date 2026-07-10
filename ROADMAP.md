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

# Phase 2 — Core Knowledge Platform (In Progress)

Build the reusable platform according to the approved architecture and specifications.

**Shipped in Platform v2.0.0:**

- **Context Builder** (SPEC-002) — collects, selects, and assembles knowledge deterministically end-to-end through `ContextBuilder.build(request)`, returning an immutable `ContextPackage`.
- **Supporting platform capabilities** — Configuration, Handbook, Retrieval, Prompt Renderer, and AI Client — established by building the first product on the platform.

Detailed implementation history lives in the [CHANGELOG](CHANGELOG.md) and the [specifications](docs/specifications/); it is intentionally not duplicated here.

**Remaining platform work (upcoming):**

- Further Context Builder capabilities — explainability, context profiles, rendering
- End-of-Session Workflow (SPEC-003)
- Knowledge Review Workflow (SPEC-004)
- Wiki Generator Agent (SPEC-005)

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
