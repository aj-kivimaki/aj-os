# AJS-006 --- Knowledge Governance Standard

**Status:** Draft v1.1

> **Amended by ADR-002 (2026-07-11).** Generated outputs are non-authoritative,
> but the LLM Wiki is **persistent but recoverable**, not freely disposable.
> See Principle 2.

## Purpose

Define how knowledge is governed throughout its lifecycle in AJ-OS.

Knowledge governance ensures that canonical knowledge remains accurate,
trustworthy, maintainable, and suitable for both human use and AI
consumption.

The objective is:

> Canonical knowledge should improve over time without losing integrity.

------------------------------------------------------------------------

# Core Principles

## 1. Canonical Knowledge is Curated

The handbook is the canonical knowledge source.

Changes require review before becoming permanent.

------------------------------------------------------------------------

## 2. Generated Artifacts Are Non-Authoritative

Generated outputs are never the source of truth; the Handbook is.

Freely disposable outputs (regenerated at any time):

-   Context Packages
-   Embeddings
-   Search indexes
-   AI summaries

The **LLM Wiki** is non-authoritative but **persistent but recoverable**
(ADR-002): it is incrementally maintained and committed, and full
regeneration is a lossy recovery/bootstrap path, not a routine operation.

Wiki page lifecycle is governed by ADR-003: a page is `active` or `stale`.
Source removal never deletes derived knowledge automatically — the headless
generator marks pages `stale` (with reason: `source-modified`,
`partial-orphan`, or `orphaned`) or *proposes* removal for **fully-orphaned**
pages (SPEC-005 §21 RECONCILE). Synthesized pages are never auto-rewritten
headless, and provenance is sticky (a removed source's id is retained for
audit; liveness is computed). **Actual deletion is an explicit orchestration
or human action**, never performed headless.

------------------------------------------------------------------------

## 3. Human Review Before Promotion

Automation may:

-   Extract
-   Summarize
-   Categorize
-   Suggest

Humans decide what becomes canonical.

------------------------------------------------------------------------

## 4. Continuous Improvement

Knowledge should evolve through refinement rather than duplication.

Improve existing knowledge whenever possible.

------------------------------------------------------------------------

## 5. Traceability

Canonical knowledge should always be traceable back to its source.

Sources may include:

-   Project documentation
-   ADRs
-   Books
-   External references
-   Personal experience

------------------------------------------------------------------------

# Knowledge Lifecycle

``` text
Raw
    ↓
Captured
    ↓
Candidate
    ↓
Reviewed
    ↓
Approved
    ↓
Canonical (Handbook)
    ↓
Published (LLM Wiki)
    ↓
Archived
```

------------------------------------------------------------------------

# Governance States

## Raw

Unprocessed notes, ideas, recordings, or imports.

------------------------------------------------------------------------

## Candidate

AI or human proposes reusable knowledge.

Awaiting review.

------------------------------------------------------------------------

## Reviewed

Verified for accuracy and usefulness.

------------------------------------------------------------------------

## Approved

Ready to become canonical.

------------------------------------------------------------------------

## Canonical

Stored in the handbook.

Single source of truth.

------------------------------------------------------------------------

## Published

Available through generated AI artifacts such as the LLM Wiki.

------------------------------------------------------------------------

## Archived

No longer active but retained for historical purposes.

------------------------------------------------------------------------

# Ownership

  Asset                   Owner
  ----------------------- -----------
  Project Documentation   Project
  Handbook                User
  Standards               User
  Reference Library       User
  LLM Wiki                Generated
  Context Packages        Generated
  AI Suggestions          Generated

Only canonical assets require long-term maintenance.

------------------------------------------------------------------------

# Review Policy

Review should occur:

-   After significant project milestones
-   During End-of-Session workflows
-   Weekly handbook review
-   Monthly knowledge review
-   Before publishing major handbook changes

------------------------------------------------------------------------

# Versioning

Canonical knowledge should support version history.

Recommended metadata:

``` yaml
id:
title:
version:
status:
owner:
created:
updated:
reviewed:
source:
tags:
related:
```

------------------------------------------------------------------------

# Quality Rules

Canonical knowledge should be:

-   Accurate
-   Reusable
-   Concise
-   Discoverable
-   Referenced
-   Maintainable

Avoid:

-   Duplicate entries
-   Outdated procedures
-   Project-specific details in reusable documents

------------------------------------------------------------------------

# Deprecation

Knowledge should be deprecated when:

-   Superseded
-   Incorrect
-   Obsolete
-   Replaced by a newer standard

Deprecated knowledge should remain accessible until archived.

------------------------------------------------------------------------

# Archival

Archive rather than delete whenever practical.

Archive when:

-   No longer useful
-   Historically valuable
-   Replaced
-   Project completed

------------------------------------------------------------------------

# Governance Responsibilities

## Automation

-   Detect candidate knowledge
-   Suggest updates
-   Detect duplicates
-   Identify stale content
-   Prepare review reports

## Human

-   Review
-   Edit
-   Approve
-   Merge
-   Archive
-   Maintain standards

------------------------------------------------------------------------

# Success Criteria

A governed knowledge system should:

-   Maintain a single source of truth.
-   Prevent uncontrolled duplication.
-   Preserve historical context.
-   Support regeneration of AI artifacts.
-   Remain trustworthy over time.

------------------------------------------------------------------------

# Relationship to Other Standards

-   **AJS-001** --- Developer Operating System
-   **AJS-002** --- Context Assembly
-   **AJS-003** --- Knowledge Standard
-   **AJS-004** --- AJ-OS Agent Specification
-   **AJS-005** --- Workflow Orchestration
-   **AJS-006** --- Knowledge Governance

AJS-006 defines how knowledge is reviewed, maintained, versioned, and
protected throughout its lifecycle.
