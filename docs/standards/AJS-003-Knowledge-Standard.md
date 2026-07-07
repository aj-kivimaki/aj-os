# AJS-003 --- Knowledge Standard

**Status:** Draft v1.0

## Purpose

Define how knowledge is classified, stored, maintained, promoted, and
consumed throughout AJ-OS.

The objective is:

> Every piece of knowledge has exactly one canonical home and a clearly
> defined lifecycle.

This standard ensures that knowledge remains consistent, reusable, and
easy for both humans and AI systems to consume.

------------------------------------------------------------------------

# Core Principles

## 1. Single Source of Truth

Every knowledge item has one canonical home.

Other systems should reference it rather than duplicate it.

------------------------------------------------------------------------

## 2. Canonical Knowledge First

The handbook is the canonical knowledge base.

Everything else is either:

-   Working knowledge
-   Generated knowledge
-   Archived knowledge

------------------------------------------------------------------------

## 3. Generated Artifacts Are Disposable

Generated artifacts are outputs, not sources of truth.

Examples:

-   LLM Wiki
-   Embeddings
-   Search indexes
-   Context Packages
-   Session summaries
-   AI suggestions

If they become outdated or corrupted, regenerate them from the handbook.

------------------------------------------------------------------------

## 4. Projects Produce Knowledge

Projects are temporary.

Knowledge is permanent.

Every completed project should improve the handbook.

------------------------------------------------------------------------

## 5. Automation Assists

Automation extracts and proposes.

Humans review and approve.

------------------------------------------------------------------------

## 6. Reuse Over Rewriting

If knowledge is likely to be useful again, promote it instead of
rewriting it.

------------------------------------------------------------------------

# Knowledge Domains

## 1. Project Documentation

Purpose:

Capture everything related to a specific project.

Examples:

-   Research
-   Architecture
-   ADRs
-   Meeting notes
-   Experiments
-   Logs
-   TODOs
-   Screenshots

Owner:

The project.

------------------------------------------------------------------------

## 2. Handbook (Canonical Knowledge)

Purpose:

Maintain reusable human knowledge.

Examples:

-   Playbooks
-   Checklists
-   Standards
-   Templates
-   Best practices
-   Lessons learned

Question:

> Will Future AJ use this again?

If yes, it belongs in the handbook.

------------------------------------------------------------------------

## 3. LLM Wiki (Generated)

Purpose:

Provide an AI-optimized representation of handbook knowledge.

Characteristics:

-   Generated automatically
-   Read-only
-   Disposable
-   Regenerable
-   Optimized for retrieval

The wiki is never edited directly.

------------------------------------------------------------------------

## 4. Standards

Purpose:

Define how AJ-OS operates.

Examples:

-   AJS-001
-   AJS-002
-   AJS-003

Standards evolve slowly and require deliberate review.

------------------------------------------------------------------------

## 5. Reference Library

Purpose:

Store external source material.

Examples:

-   Books
-   PDFs
-   API documentation
-   Articles
-   Videos

Reference materials are not modified.

------------------------------------------------------------------------

## 6. Generated Knowledge

Purpose:

Hold temporary AI-generated outputs awaiting review.

Examples:

-   Candidate handbook entries
-   Candidate wiki notes
-   Session summaries
-   Suggested playbooks

Nothing here becomes permanent without approval.

------------------------------------------------------------------------

# Knowledge Flow

``` text
Reference Library
        │
        ▼
Project Work
        │
        ▼
Project Documentation
        │
Knowledge Extraction
        │
        ▼
Handbook (Canonical)
        │
Wiki Generator
        │
        ▼
LLM Wiki
        │
Embeddings / Retrieval
        │
        ▼
Context Builder
        │
        ▼
Coding Agent
```

------------------------------------------------------------------------

# Canonical Ownership

```
  Knowledge                       Canonical Owner
  ------------------------------- ---------------------------------------
  Research notes                  Project Documentation
  Architecture Decisions (ADRs)   Project Documentation
  Experiments                     Project Documentation
  Checklists                      Handbook
  Playbooks                       Handbook
  Templates                       Handbook
  Technical concepts              Handbook (published through the Wiki)
  AI-optimized wiki pages         LLM Wiki
  Standards                       Standards
  External books and articles     Reference Library
```

------------------------------------------------------------------------

# Duplication Rules

Allowed:

-   References
-   Links
-   Tags
-   Indexes

Not Allowed:

-   Maintaining multiple editable copies of the same knowledge.

------------------------------------------------------------------------

# Knowledge Quality Levels

Knowledge progresses through these trust levels:

1.  Draft
2.  Reviewed
3.  Approved
4.  Canonical
5.  Archived

Quality is independent of storage location.

------------------------------------------------------------------------

# Success Criteria

A compliant knowledge system should answer:

-   Where does this belong?
-   Who owns it?
-   Is it reusable?
-   Is it canonical?
-   Can it be regenerated?
-   Can AI reliably retrieve it?

------------------------------------------------------------------------

# Relationship to Other Standards

-   **AJS-001** --- Defines the developer workflow.
-   **AJS-002** --- Defines how context is assembled.
-   **AJS-003** --- Defines what knowledge exists, where it belongs, and
    who owns it.
-   **AJS-004** --- Will define AI agent contracts.
-   **AJS-005** --- Will define automation contracts.
-   **AJS-006** --- Will define the knowledge lifecycle and governance.
