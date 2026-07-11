# ARCH-001 --- AJ-OS Platform Architecture

**Architecture ID:** ARCH-001\
**Version:** 1.1\
**Status:** Draft\
**Owner:** AJ-OS

> **Amended by ADR-002 (2026-07-11).** The Knowledge Layer is detailed in
> **ARCH-002 — Knowledge Platform Architecture**. Per ADR-002, the LLM
> Wiki is **persistent but recoverable** (not disposable), AJ-OS is its
> sole producer while it is hosted in the Handbook vault, the generator is
> source/destination-agnostic, and version control belongs to
> orchestration. Sections below are updated accordingly.

------------------------------------------------------------------------

# 1. Purpose

Describe the overall architecture of AJ-OS, the relationships between
its major components, and the guiding principles for implementation.

This document is the architectural map of the platform.

------------------------------------------------------------------------

# 2. Vision

AJ-OS is a knowledge-driven developer operating system.

Its purpose is to continuously transform project work into reusable
knowledge that improves future development through structured context,
human review, and AI-assisted automation.

------------------------------------------------------------------------

# 3. Architectural Principles

-   Handbook is the single source of truth.
-   Generated artifacts are derived; most are disposable, but the LLM Wiki
    is **persistent but recoverable** (ADR-002).
-   Location and production ownership are separable: the wiki is hosted in
    the Handbook vault but produced solely by AJ-OS.
-   The knowledge engine is source- and destination-agnostic.
-   Version control belongs to orchestration, not to knowledge components.
-   Standards govern the platform.
-   Specifications define implementations.
-   Services are composed from small agents.
-   Workflows orchestrate agents.
-   Humans approve canonical knowledge.
-   Components remain model-agnostic.

------------------------------------------------------------------------

# 4. Documentation Architecture

``` text
AJS (Standards)
        ↓
SPEC (Specifications)
        ↓
Implementation
        ↓
Project Documentation
        ↓
Handbook (Canonical)
        ↓
Generated Wiki
```

------------------------------------------------------------------------

# 5. Core Platform Components

## Standards

Govern platform rules.

## Specifications

Define implementation blueprints.

## Project Documentation

Working documentation for individual projects.

## Handbook

Canonical, curated knowledge.

## Generated Wiki

AI-optimized representation of handbook knowledge.

## Context Builder

Creates focused Context Packages.

## Coding Agent

Implements features using Context Packages.

------------------------------------------------------------------------

# 6. Knowledge Pipeline

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
Handbook (sources: foundation/ + library/)
      ↓
Source Connector  (SPEC-006)
      ↓
Wiki Generator    (SPEC-005)
      ↓
Wiki Store        (SPEC-007)
      ↓
Generated Wiki (persistent; hosted in Handbook)
      ↓
Context Builder
      ↓
Coding Agent
```

The detailed knowledge-engine architecture (Source Connector → Wiki
Generator → Wiki Store → Retrieval → Context) is specified in **ARCH-002**.

------------------------------------------------------------------------

# 7. Platform Layers

1.  Governance Layer
    -   Standards (AJS)
2.  Design Layer
    -   Specifications (SPEC)
3.  Execution Layer
    -   Agents
    -   Workflows
4.  Knowledge Layer
    -   Handbook
    -   Generated Wiki
5.  Development Layer
    -   Projects
    -   Source Code

------------------------------------------------------------------------

# 8. Core Workflows

-   Project Kickoff
-   Context Generation
-   Feature Development
-   End-of-Session
-   Knowledge Review
-   Wiki Generation

------------------------------------------------------------------------

# 9. Core Specifications

-   SPEC-000 --- Specification Writing Standard
-   SPEC-001 --- Project Kickoff Workflow
-   SPEC-002 --- Context Builder Agent
-   SPEC-003 --- End-of-Session Workflow
-   SPEC-004 --- Knowledge Review Workflow
-   SPEC-005 --- Wiki Generator Agent
-   SPEC-006 --- Source Connector
-   SPEC-007 --- Wiki Store

------------------------------------------------------------------------

# 10. Technology Boundaries

The architecture intentionally separates responsibilities.

-   ChatGPT: planning, architecture, research
-   Coding Agent: implementation
-   Handbook: canonical knowledge
-   Generated Wiki: AI retrieval
-   n8n: orchestration
-   Git: version history

Implementations may change without changing the architecture.

------------------------------------------------------------------------

# 11. Implementation Roadmap

## Phase 1

Architecture and standards ✔

## Phase 2

Core platform services

-   Project Kickoff
-   Context Builder
-   End-of-Session
-   Knowledge Review
-   Wiki Generator

## Phase 3

Supporting services

-   Search
-   Logging
-   Configuration
-   Agent registry
-   Workflow registry

## Phase 4

Productivity services

-   Portfolio Builder
-   Job Finder
-   Daily Planner
-   Other personal agents

------------------------------------------------------------------------

# 12. Design Goals

The platform should be:

-   Modular
-   Observable
-   Testable
-   Replaceable
-   Explainable
-   Automation-friendly
-   AI-friendly
-   Human-governed

------------------------------------------------------------------------

# 13. Future Evolution

Potential future additions include:

-   Service contracts
-   MCP integration
-   Public APIs
-   Multi-user support
-   Distributed execution
-   Plugin architecture
-   Marketplace for AJ-OS agents

------------------------------------------------------------------------

# 14. Relationship to Other Documents

ARCH-001 is the architectural overview.

ARCH-002 details the Knowledge Layer (ingestion → wiki → retrieval →
context).

ADR-002 records the wiki ownership, location, and persistence decisions.

AJS documents define platform rules.

SPEC documents define implementations.

Project documentation records execution.

The handbook preserves canonical knowledge.

The generated wiki enables AI retrieval.

------------------------------------------------------------------------

# 15. Summary

AJ-OS is a platform for continuously converting project experience into
reusable, governed knowledge that improves future development.

The architecture intentionally separates governance, implementation,
execution, knowledge management, and AI consumption to keep the platform
maintainable, extensible, and independent of any specific model or
tooling.
