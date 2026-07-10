# AJ-OS Roadmap

> **Roadmap Version:** v2.0\
> **Status:** Active

---

# Vision

AJ-OS is evolving into a knowledge-driven developer operating system
that continuously converts project work into reusable knowledge.

The roadmap prioritizes building the platform itself before expanding
into productivity features or integrations.

---

# Guiding Principles

- Architecture before implementation.
- Standards before features.
- Specifications before coding.
- Knowledge before prompts.
- Human governance over canonical knowledge.
- Small, composable platform services.
- Model-agnostic design.

---

# Current Status

## ✅ Phase 1 --- Platform Foundation (Complete)

The architectural foundation has been established.

Completed:

- ARCH-001 Platform Architecture
- AJS-001 -- AJS-007 Platform Standards
- SPEC-000 Specification Writing Standard
- SPEC-001 -- SPEC-005 Core Platform Specifications

This phase defines **how AJ-OS is built**, not just what it does.

---

# Phase 2 —-- Core Knowledge Platform (Current Focus)

Implement the platform according to the approved architecture and specifications.

Current implementation progress:

## SPEC-002 — Context Builder

Milestone 1 — Platform Contracts & Core Services ✅ Complete

Completed:

- ✅ CB-001 — Module Boundary
- ✅ CB-002 — Configuration Contract
- ✅ CB-003 — Context Package Contract
- ✅ CB-004 — Knowledge Provider Contracts
- ✅ CB-005 — Provider Registry
- ✅ CB-006 — Contract Testing Foundation

Milestone 2 — Knowledge Collection ✅ Complete

Completed:

- ✅ CB-007 — Collection Engine Service
- ✅ CB-008 — Collection Error Contract
- ✅ CB-009 — Collection Result Contract
- ✅ CB-010 — Provider Execution (partial collection)
- ✅ CB-011 — Context Builder Collection Pipeline
- ✅ CB-012 — Collection Behaviour Tests

Milestone 3 — Knowledge Selection ✅ Complete

Completed:

- ✅ CB-013 — Selection Engine Service
- ✅ CB-014 — SelectionResult Contract
- ✅ CB-015 — Deterministic Selection Policy
- ✅ CB-016 — Selection Execution
- ✅ CB-017 — Context Builder Selection Pipeline (`build(request)`)
- ✅ CB-018 — Selection Behaviour Tests

Milestone 4 — Context Assembly ✅ Complete

Completed:

- ✅ CB-019 — Assembly Engine Service Boundary
- ✅ CB-020 — Section Composition Strategy
- ✅ CB-021 — Assembly Inputs & Metadata Composition
- ✅ CB-022 — Deterministic Assembly
- ✅ CB-023 — Context Builder Assembly Pipeline (`build(request)` → `ContextPackage`)
- ✅ CB-024 — Assembly Behaviour Tests

With Milestones 1, 2, and 3 complete and frozen and Milestone 4 complete (ready for its freeze review), the Context Builder now collects, selects, and assembles knowledge deterministically end-to-end through a single public entry point, `build(request)`, which returns an immutable `ContextPackage` (AJS-002 Appendix B). Assembly is structural only; rendering, explainability computation and context profiles are deferred. Implementation continues with Milestone 5 — Explainability & Profiles — and the remaining Context Builder milestones.

Project Kickoff (SPEC-001) remains intentionally postponed until the core platform is operational, allowing it to become the first workflow built on top of the completed platform.

Current implementation order:

1. Context Builder (SPEC-002)
2. End-of-Session Workflow (SPEC-003)
3. Knowledge Review Workflow (SPEC-004)
4. Wiki Generator Agent (SPEC-005)

Success criteria:

- Context Builder foundation completed.
- All specifications implemented.
- Standards validated against implementation.
- End-to-end knowledge pipeline operational.

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
