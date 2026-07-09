# AJ-OS

> **A knowledge-driven developer operating system for building software
> with AI.**
>
> **Every project makes the next project better.**

---

## Vision

AJ-OS is an opinionated platform for developing software with AI through
structured knowledge, engineering standards, reusable workflows, and
continuous learning.

Instead of treating AI as a coding assistant that starts from scratch
every session, AJ-OS continuously transforms project work into reusable
knowledge. That knowledge is reviewed, governed, and reused to improve
every future project.

The goal is not simply to generate code.

The goal is to build a system that continuously improves how software is
designed, implemented, documented, and maintained.

---

# Philosophy

AJ-OS is built around a simple idea:

    Project Work
          ↓
    Reusable Knowledge
          ↓
    Structured Context
          ↓
    Better AI Assistance
          ↓
    Better Project Work

Every completed project should permanently improve the next one.

---

# Core Principles

- Standards before implementation.
- Specifications before coding.
- Knowledge before prompts.
- Human approval before canonical knowledge.
- Handbook as the single source of truth.
- Generated AI artifacts are disposable.
- Model-agnostic architecture.
- Small, composable services and workflows.

---

# Platform Architecture

    Architecture
          ↓
    Standards (AJS)
          ↓
    Specifications (SPEC)
          ↓
    Implementation
          ↓
    Project Documentation
          ↓
    Handbook (Canonical)
          ↓
    Generated LLM Wiki
          ↓
    Context Builder
          ↓
    Coding Agent

For a complete architectural overview, see:

- `docs/architecture/ARCH-001-AJ-OS-Platform-Architecture.md`

---

# Platform Contracts

AJ-OS is built around immutable platform contracts.

Current contracts include:

- Context Builder Configuration
- Context Package
- Knowledge Request
- Knowledge Provider
- Knowledge Item
- Provider Registry
- Collection Error
- Collection Result

Future platform behavior is built on top of these contracts rather than redefining them.

---

# Documentation Structure

## Architecture

High-level platform design.

## Standards (AJS)

Platform rules and governance.

Examples:

- Developer Operating System
- Context Assembly
- Knowledge Standard
- Agent Specification
- Workflow Orchestration
- Knowledge Governance
- Engineering Lifecycle

## Specifications (SPEC)

Implementation blueprints for platform services and workflows.

Examples:

- Project Kickoff Workflow
- Context Builder Agent
- End-of-Session Workflow
- Knowledge Review Workflow
- Wiki Generator Agent

## Project Documentation

Working documentation for individual projects.

## Handbook

The canonical knowledge base.

Everything reusable is promoted here after review.

## Generated LLM Wiki

Automatically generated from the handbook.

Optimized for AI retrieval.

Never edited directly.

---

# Knowledge Pipeline

    Development
          ↓
    Project Documentation
          ↓
    End-of-Session Workflow
          ↓
    Candidate Knowledge
          ↓
    Knowledge Review
          ↓
    Handbook
          ↓
    Wiki Generator
          ↓
    Generated LLM Wiki
          ↓
    Context Builder
          ↓
    Coding Agent

---

# Current Status

AJ-OS has completed its platform architecture, engineering standards, and implementation specifications.

Implementation is now underway following the approved architecture.

> **On document status.** AJS standards and SPEC specifications carry a
> `Status: Draft` header. In AJ-OS, **Draft means "approved for implementation,
> not yet frozen"** — a document is stable enough to build against but may still
> be refined until the work it governs is frozen. A completed Phase or Milestone
> therefore builds on Draft documents by design; it does not imply those
> documents are incomplete.

Current implementation progress:

## Phase 1 — Platform Foundation ✅

Completed:

- Platform Architecture (ARCH)
- Engineering Standards (AJS)
- Core Specifications (SPEC)

## Phase 2 — Core Platform Services 🚧

Current focus:

### SPEC-002 — Context Builder

Milestone 1 — Foundation ✅ Complete

- ✅ CB-001 — Module Boundary
- ✅ CB-002 — Configuration Contract
- ✅ CB-003 — Context Package Contract
- ✅ CB-004 — Knowledge Provider Contracts
- ✅ CB-005 — Provider Registry
- ✅ CB-006 — Contract Testing Foundation

Milestone 2 — Knowledge Collection ✅ Complete

- ✅ CB-007 — Collection Engine Service
- ✅ CB-008 — Collection Error Contract
- ✅ CB-009 — Collection Result Contract
- ✅ CB-010 — Provider Execution (partial collection)
- ✅ CB-011 — Context Builder Collection Pipeline
- ✅ CB-012 — Collection Behaviour Tests

Milestone 3 — Knowledge Selection ✅ Complete

- ✅ CB-013 — Selection Engine Service
- ✅ CB-014 — SelectionResult Contract
- ✅ CB-015 — Deterministic Selection Policy
- ✅ CB-016 — Selection Execution
- ✅ CB-017 — Context Builder Selection Pipeline (`build(request)`)
- ✅ CB-018 — Selection Behaviour Tests

The Context Builder now exposes immutable platform contracts, core services, a permanent contract-testing foundation, and two platform behaviours: deterministic partial knowledge collection and deterministic knowledge selection. It runs Collection → Selection end-to-end through a single public entry point, `ContextBuilder.build(request)`, which returns an immutable `SelectionResult`.

Milestones 1 and 2 are complete and frozen; Milestone 3 is complete and ready for its freeze review. Implementation next proceeds to Milestone 4 — Context Assembly.

---

# Legacy Components (v1)

The repository currently contains earlier implementations that predate
the current architecture.

These include:

- Code-first Notion database synchronization
- Notion schema generation
- REST API
- Handbook Agent
- n8n workflows
- Experimental AI agents

These components remain valuable and will be reviewed individually.

Where appropriate they will be:

- Migrated into the new architecture
- Refactored to comply with AJS and SPEC documents
- Replaced by newer platform services
- Archived if no longer relevant

The Notion integration is now considered one possible knowledge provider
rather than the center of the platform.

---

# Roadmap

## Phase 1 --- Platform Foundation ✅

- Architecture
- Standards
- Specifications

## Phase 2 — Core Platform Services 🚧

Current implementation order:

1. Context Builder (SPEC-002) ← In Progress
2. End-of-Session Workflow (SPEC-003)
3. Knowledge Review Workflow (SPEC-004)
4. Wiki Generator Agent (SPEC-005)

Project Kickoff (SPEC-001) is intentionally postponed until the platform is operational and will become the first workflow built on the completed platform.

## Phase 3 --- Supporting Platform Services

- Search
- Configuration
- Logging
- Agent Registry
- Workflow Registry

## Phase 4 --- Productivity Services

- Portfolio Builder
- Job Finder
- Daily Planner
- Additional personal workflows

---

# Design Goals

AJ-OS aims to be:

- Modular
- Explainable
- Observable
- Extensible
- Testable
- Model-agnostic
- Human-governed
- Knowledge-driven

---

# Contributing

The architecture-first approach is intentional.

Before implementing new functionality:

1.  Update or create the relevant AJS standard if platform rules change.
2.  Write or update the appropriate SPEC document.
3.  Implement the feature.
4.  Validate the implementation.
5.  Capture reusable knowledge through the End-of-Session workflow.

---

# License

Released under the MIT License.

See the `LICENSE` file for details.

---

> **Capture knowledge. Govern it. Reuse it.**
