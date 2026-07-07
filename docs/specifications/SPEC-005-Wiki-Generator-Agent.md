# SPEC-005 --- Wiki Generator Agent

**Specification ID:** SPEC-005 **Version:** 1.0 **Status:** Draft
**Owner:** AJ-OS **Related Standards:** AJS-001, AJS-002, AJS-003,
AJS-004, AJS-005, AJS-006 **Related Specifications:** SPEC-000,
SPEC-002, SPEC-004

------------------------------------------------------------------------

# 1. Overview

## Purpose

Generate the AI-optimized LLM Wiki from approved handbook knowledge.

The Wiki Generator Agent transforms canonical handbook content into a
structured representation optimized for retrieval by the Context
Builder.

## Scope

Begins with approved handbook content and ends with a regenerated LLM
Wiki and retrieval artifacts.

## Goals

-   Publish approved knowledge.
-   Generate deterministic wiki output.
-   Keep the wiki synchronized with the handbook.
-   Produce AI-friendly knowledge units.
-   Regenerate the wiki at any time.

## Non-Goals

-   Edit handbook content.
-   Create new canonical knowledge.
-   Review handbook updates.

------------------------------------------------------------------------

# 2. Functional Requirements

The agent SHALL:

1.  Read approved handbook content.
2.  Detect changed handbook entries.
3.  Transform handbook entries into wiki pages.
4.  Generate atomic knowledge units.
5.  Build cross-references.
6.  Generate retrieval metadata.
7.  Validate the generated wiki.
8.  Publish the updated wiki.

------------------------------------------------------------------------

# 3. Non-Functional Requirements

-   Deterministic
-   Regenerable
-   Idempotent
-   Explainable
-   Observable
-   Model-agnostic

------------------------------------------------------------------------

# 4. User Stories

-   As AJ, I want my handbook automatically published for AI use.
-   As the Context Builder, I want a searchable, AI-optimized wiki.
-   As AJ-OS, I want handbook changes reflected in the wiki without
    manual effort.

------------------------------------------------------------------------

# 5. Architecture Overview

``` text
Approved Handbook
        │
        ▼
Wiki Generator
        │
        ├── Parser
        ├── Knowledge Unit Builder
        ├── Cross-reference Builder
        ├── Metadata Generator
        ├── Validation
        └── Publisher
                │
                ▼
Generated LLM Wiki
        │
        ▼
Retrieval / Context Builder
```

------------------------------------------------------------------------

# 6. Triggers

-   Handbook update approved
-   Manual regeneration
-   Scheduled rebuild
-   Release workflow

------------------------------------------------------------------------

# 7. Inputs

Required:

-   Approved handbook
-   Configuration

Optional:

-   Changed files only
-   Full rebuild flag
-   Publication profile

------------------------------------------------------------------------

# 8. Outputs

Primary:

-   Generated LLM Wiki

Secondary:

-   Knowledge units
-   Search metadata
-   Cross-reference index
-   Build report
-   Validation report
-   Generation log

------------------------------------------------------------------------

# 9. Workflow

1.  Detect handbook changes.
2.  Load canonical entries.
3.  Parse handbook.
4.  Generate knowledge units.
5.  Build relationships.
6.  Generate metadata.
7.  Validate output.
8.  Publish wiki.
9.  Notify completion.

------------------------------------------------------------------------

# 10. AJ-OS Agent Responsibilities

-   Read handbook
-   Parse content
-   Build wiki pages
-   Generate metadata
-   Validate output
-   Publish generated artifacts

------------------------------------------------------------------------

# 11. Data Flow

``` text
Handbook
    ↓
Parser
    ↓
Knowledge Units
    ↓
Cross References
    ↓
Metadata
    ↓
Generated Wiki
    ↓
Context Builder
```

------------------------------------------------------------------------

# 12. State Model

Requested ↓ Loading ↓ Parsing ↓ Generating ↓ Validating ↓ Publishing ↓
Completed

------------------------------------------------------------------------

# 13. Interfaces

Consumes:

-   Handbook
-   Standards
-   Configuration

Produces:

-   Generated Wiki
-   Retrieval metadata
-   Build reports
-   Validation reports

------------------------------------------------------------------------

# 14. Configuration

Configurable:

-   Output format
-   Chunk size
-   Metadata schema
-   Cross-reference rules
-   Publication profile
-   Full vs incremental rebuild

------------------------------------------------------------------------

# 15. Error Handling

Recoverable:

-   Invalid handbook entry
-   Missing metadata
-   Partial generation failure

Fatal:

-   Handbook unavailable
-   Corrupted configuration
-   Publication failure

------------------------------------------------------------------------

# 16. Logging & Observability

Record:

-   Entries processed
-   Knowledge units generated
-   Build duration
-   Validation results
-   Publication status
-   Errors

------------------------------------------------------------------------

# 17. Security & Permissions

Read:

-   Handbook
-   Standards
-   Configuration

Write:

-   Generated wiki
-   Retrieval artifacts
-   Build logs

Must never modify handbook content.

------------------------------------------------------------------------

# 18. Testing Strategy

Unit:

-   Parsing
-   Knowledge unit generation
-   Metadata generation

Integration:

-   Full handbook-to-wiki generation

Acceptance:

-   Wiki generated successfully
-   Output validates
-   Handbook unchanged
-   Retrieval artifacts generated

------------------------------------------------------------------------

# 19. Acceptance Criteria

-   [ ] Generated wiki created.
-   [ ] Knowledge units generated.
-   [ ] Cross-references built.
-   [ ] Retrieval metadata generated.
-   [ ] Validation completed.
-   [ ] Handbook remains unchanged.

------------------------------------------------------------------------

# 20. Future Enhancements

-   Incremental regeneration
-   Multi-language wiki generation
-   Embedding generation
-   Semantic graph generation
-   Search quality metrics
-   Multiple publication targets

------------------------------------------------------------------------

# 21. Notes

The Wiki Generator Agent publishes canonical handbook knowledge for AI
consumption.

The handbook remains the single source of truth.

The generated LLM Wiki is a disposable artifact that can always be
regenerated from approved handbook content.
