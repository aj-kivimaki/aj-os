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

**AJ-OS Platform v2.0.0 has shipped** — the first stable release of the reusable
platform architecture, delivered together with its first complete product,
**Knowledge Assistant v1.0.0**.

> **Platform vs. product versions.** AJ-OS versions the *platform* (this repository)
> and each *product* independently. `v2.0.0` is the platform version; the Knowledge
> Assistant carries its own `v1.0.0`. See
> [docs/project/versioning-and-releases.md](docs/project/versioning-and-releases.md).

## What has shipped

- **The reusable platform** — a three-layer architecture (CLI → Product → Platform)
  with a strict one-way dependency direction, plus its core services:
  - **Context Builder** (SPEC-002) — deterministic Collection → Selection → Assembly,
    returning an immutable `ContextPackage` via `ContextBuilder.build(request)`.
  - **Platform capabilities** consumed by the first product — Configuration,
    Handbook, Retrieval, Prompt Renderer, and AI Client.
- **Knowledge Assistant v1.0.0** — the first end-user product; see
  [Products](#products).
- **A REST API and Handbook AI Agent** for integrations and automation.

## In progress since v2.0.0 (unreleased)

- **The Knowledge Platform pipeline** (ARCH-002) — the sources → wiki engine that
  *produces* the generated wiki the Knowledge Assistant reads. It is **implemented
  at the library level and covered by tests**, but is **not yet wired to a runnable
  command** — no CLI or service invokes it yet. Its pieces:
  - **Source Connector** (SPEC-006), **Wiki Store** (SPEC-007), and the **Wiki
    Generator** (SPEC-005) with its Knowledge Compiler, Identity Resolvers
    (ADR-005/006), Wiki Renderer, and Merge Engine.
  - Code: `src/ingestion/` and `src/knowledge/`. Architecture: `ARCH-002`.

  Wiring this pipeline to an orchestration entry point is the top of the
  [roadmap](ROADMAP.md).

## Learn more

- [CHANGELOG.md](CHANGELOG.md) — the full, itemized release history (including the
  Context Builder milestone breakdown).
- [docs/project/versioning-and-releases.md](docs/project/versioning-and-releases.md)
  — versioning & release governance.
- [docs/specifications/](docs/specifications/) — platform and product specifications
  (including SPEC-002 — Context Builder).
- [implementation/products/knowledge-assistant/](implementation/products/knowledge-assistant/)
  — the Knowledge Assistant engineering documentation.

> **On document status.** AJS standards and SPEC specifications carry a
> `Status: Draft` header. In AJ-OS, **Draft means "approved for implementation, not
> yet frozen"** — stable enough to build against, but still refinable until the work
> it governs is frozen. A shipped release building on Draft documents is by design;
> it does not imply those documents are incomplete.

---

# Products

Products are user-facing tools built on the AJ-OS platform. Each product is
versioned independently of the platform.

## Knowledge Assistant v1.0.0

Ask questions about a configured handbook and get grounded, cited answers from the
command line.

**Get started:**

1. Install dependencies: `npm install`
2. Configure your handbook — copy the template and set your path:
   `cp aj.config.example.json aj.config.json`, then edit `handbook.path`.
3. Add your API key — copy the template and set `ANTHROPIC_API_KEY`:
   `cp .env.example .env`
4. Ask a question:

```bash
aj ask "How does the Context Builder work?"
```

> Run `npm run build && npm link` once to make the `aj` command available, or use
> `npm run dev -- ask "…"` to run straight from source without building.

> **Prerequisite — a pre-generated wiki.**
> The Knowledge Assistant searches a handbook's **generated `wiki/`**, not its raw
> notes — reading a curated, AI-optimized wiki is what keeps answers grounded and
> citable. Producing that wiki is the job of the **Wiki Generator (SPEC-005)**. As
> of v2.0.0 the generator was not yet built; it now exists as a **tested library**
> (ARCH-002) but is **not yet wired to a runnable command**, so it cannot yet be
> invoked end-to-end (see the [roadmap](ROADMAP.md)). Until that wiring lands, a
> **pre-generated wiki is required** — if you see "no generated wiki," that is a
> known limitation, not a missed setup step. The
> [usage guide](implementation/products/knowledge-assistant/usage.md) has the
> details.

- One-shot (`aj ask "…"`) and interactive (`aj ask`) modes, with `--debug`
  diagnostics.
- Answers only from the handbook's generated wiki, always with citations.
- Documentation:
  [implementation/products/knowledge-assistant/](implementation/products/knowledge-assistant/)
  — start with the
  [README](implementation/products/knowledge-assistant/README.md) and the
  [usage guide](implementation/products/knowledge-assistant/usage.md).

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

> AJ-OS is developed **product-first** — the platform grows to serve real products.
> **Platform v2.0.0** shipped with the first product, **Knowledge Assistant v1.0.0**.
> The detailed roadmap lives in [ROADMAP.md](ROADMAP.md).

## Phase 1 — Platform Foundation ✅

- Architecture, Standards, Specifications

## Phase 2 — Core Platform Services

- ✅ Context Builder (SPEC-002) — delivered in Platform v2.0.0
- 🟡 Knowledge Platform pipeline — Wiki Generator (SPEC-005), Source Connector
  (SPEC-006), Wiki Store (SPEC-007): implemented at the library level, **pending
  orchestration wiring**
- End-of-Session Workflow (SPEC-003)
- Knowledge Review Workflow (SPEC-004)

Project Kickoff (SPEC-001) is intentionally postponed until more of the platform is operational.

## Phase 3 — Supporting Platform Services

- Search, Configuration, Logging, Agent Registry, Workflow Registry

## Phase 4 — Productivity Services

- Portfolio Builder, Job Finder, Daily Planner, additional personal workflows

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
