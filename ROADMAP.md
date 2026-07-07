# AJ-OS Roadmap

> **Roadmap Version:** v2.0\
> **Status:** Active

------------------------------------------------------------------------

# Vision

AJ-OS is evolving into a knowledge-driven developer operating system
that continuously converts project work into reusable knowledge.

The roadmap prioritizes building the platform itself before expanding
into productivity features or integrations.

------------------------------------------------------------------------

# Guiding Principles

-   Architecture before implementation.
-   Standards before features.
-   Specifications before coding.
-   Knowledge before prompts.
-   Human governance over canonical knowledge.
-   Small, composable platform services.
-   Model-agnostic design.

------------------------------------------------------------------------

# Current Status

## ✅ Phase 1 --- Platform Foundation (Complete)

The architectural foundation has been established.

Completed:

-   ARCH-001 Platform Architecture
-   AJS-001 -- AJS-006 Platform Standards
-   SPEC-000 Specification Writing Standard
-   SPEC-001 -- SPEC-005 Core Platform Specifications

This phase defines **how AJ-OS is built**, not just what it does.

------------------------------------------------------------------------

# Phase 2 --- Core Knowledge Platform (Current Focus)

Implement the platform exactly as specified.

Priority order:

1.  Context Builder Agent
2.  End-of-Session Workflow
3.  Knowledge Review Workflow
4.  Wiki Generator Agent

The goal of this phase is to complete the AJ-OS knowledge platform.

Project Kickoff (SPEC-001) is intentionally postponed until the platform
is operational, allowing it to become the first workflow that consumes
the completed platform.

Success criteria:

-   All specifications implemented.
-   Standards validated against implementation.
-   End-to-end knowledge pipeline operational.

------------------------------------------------------------------------

# Phase 3 --- Developer Experience

Complete the first platform consumer before expanding reusable platform
capabilities.

Priority:

-   Project Kickoff Workflow (SPEC-001)

Supporting services:

Planned services:

-   Search
-   Configuration
-   Logging
-   Agent Registry
-   Workflow Registry
-   Notification Service
-   Knowledge Provider Interfaces

During this phase existing integrations such as Notion will be adapted
to the new architecture through provider interfaces.

------------------------------------------------------------------------

# Phase 4 --- Legacy Migration

Review and migrate existing project components.

Existing implementations include:

-   Code-first Notion synchronization
-   Schema engine
-   REST API
-   Handbook agent
-   n8n workflows
-   Experimental AI agents

Each component will be evaluated to determine whether it should be:

-   Migrated
-   Refactored
-   Replaced
-   Archived

The architecture remains the source of truth.

------------------------------------------------------------------------

# Phase 5 --- Productivity Services

Build user-facing capabilities on top of the platform.

Examples:

-   Portfolio Builder
-   Job Finder
-   Daily Planner
-   Documentation Assistant
-   Career Dashboard
-   Personal Automation Workflows

These services should consume the platform rather than define it.

------------------------------------------------------------------------

# Phase 6 --- Platform Evolution

Long-term goals include:

-   MCP integration
-   Public APIs
-   Plugin architecture
-   Multi-user support
-   Distributed execution
-   Additional knowledge providers
-   Advanced retrieval and semantic search

------------------------------------------------------------------------

# Knowledge Roadmap

The long-term knowledge flow is:

``` text
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

------------------------------------------------------------------------

# Success Metrics

AJ-OS succeeds when:

-   Every project improves the next project.
-   Canonical knowledge remains trusted and maintainable.
-   AI context is generated automatically.
-   Manual prompting is minimized.
-   Platform components remain modular and replaceable.

------------------------------------------------------------------------

# Relationship to Documentation

-   ARCH documents describe the platform.
-   AJS documents define the governing rules.
-   SPEC documents define implementations.
-   Project documentation records execution.
-   The handbook stores canonical knowledge.
-   The generated wiki enables AI retrieval.

------------------------------------------------------------------------

# Roadmap Philosophy

Implementation follows the architecture.

Existing experiments are valuable but will be migrated only after the
core platform has been implemented according to the current standards
and specifications.

The architecture---not legacy implementations---defines the future
direction of AJ-OS.

------------------------------------------------------------------------

> **Every project makes the next project better.**
