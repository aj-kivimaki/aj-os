# SPEC-002 --- Context Builder Agent

**Specification ID:** SPEC-002\
**Version:** 1.1\
**Status:** Draft\
**Owner:** AJ-OS\
**Related Standards:** AJS-001, AJS-002, AJS-003, AJS-004, AJS-005,
AJS-006\
**Related Specifications:** SPEC-000, SPEC-001

------------------------------------------------------------------------

# 1. Overview

## Purpose

The Context Builder Agent assembles the smallest, highest-value Context
Package required for a coding agent to successfully complete a single
task.

It is the primary bridge between AJ-OS knowledge and implementation.

## Scope

Generate Context Packages for implementation, debugging, documentation,
review and planning workflows.

## Goals

-   Assemble relevant context automatically.
-   Reduce LLM token usage.
-   Improve implementation consistency.
-   Minimize manual prompt creation.
-   Produce deterministic, explainable Context Packages.
-   Support multiple context profiles.

## Non-Goals

-   Implement features.
-   Modify source code.
-   Update the handbook.
-   Update the generated wiki.

------------------------------------------------------------------------

# 2. Functional Requirements

The agent SHALL:

1.  Accept a project and task.
2.  Determine the appropriate Context Profile.
3.  Collect candidate knowledge.
4.  Rank knowledge using AJS-002 Appendix A.
5.  Remove duplicate information.
6.  Assemble a Context Package according to AJS-002 Appendix B.
7.  Estimate token usage.
8.  Produce an explainability report.
9.  Return structured output.

------------------------------------------------------------------------

# 3. Non-Functional Requirements

-   Deterministic
-   Explainable
-   Model-agnostic
-   Extensible
-   Observable
-   Token-efficient

------------------------------------------------------------------------

# 4. User Stories

-   As AJ, I want to start coding without manually collecting
    documentation.
-   As a coding agent, I want only the information required for my task.
-   As AJ-OS, I want consistent context generation across every project.

------------------------------------------------------------------------

# 5. Architecture Overview

``` text
Task
   │
   ▼
Context Builder
   │
   ├── Standards
   ├── Specifications
   ├── Handbook
   ├── Generated Wiki
   ├── Project Documentation
   └── Source Code
        │
        ▼
Context Package
```

------------------------------------------------------------------------

# 6. Context Profiles

The Context Builder supports configurable profiles.

## Implementation

Prioritizes:

-   Relevant SPECs
-   AJS Standards
-   Architecture
-   Source Code
-   Handbook

## Debugging

Prioritizes:

-   Error logs
-   Recent commits
-   Changed files
-   Existing implementation
-   Relevant documentation

## Documentation

Prioritizes:

-   README
-   Handbook
-   ADRs
-   Existing documentation

## Review

Prioritizes:

-   Coding standards
-   Acceptance criteria
-   Tests
-   Changed files
-   Specifications

## Planning

Prioritizes:

-   AJS Standards
-   Roadmap
-   Architecture
-   Handbook
-   Project documentation

Profiles influence ranking weights but do not change the Context Package
schema.

------------------------------------------------------------------------

# 7. Inputs

## Required

-   Project
-   Task

## Optional

-   Branch
-   Commit
-   Issue
-   Workflow type
-   Context profile

------------------------------------------------------------------------

# 8. Outputs

Primary

-   Context.md

Secondary

-   Source list
-   Ranking report
-   Token estimate
-   Structured JSON
-   Build log

------------------------------------------------------------------------

# 9. Knowledge Sources

Priority follows AJS-002.

1.  Task Specification
2.  Relevant SPEC documents
3.  AJS Standards
4.  Project Documentation
5.  Handbook
6.  Generated Wiki
7.  Source Code
8.  Git History (when required)

------------------------------------------------------------------------

# 10. Workflow

1.  Validate request.
2.  Determine Context Profile.
3.  Collect candidate knowledge.
4.  Extract knowledge units.
5.  Rank knowledge.
6.  Remove duplicates.
7.  Resolve conflicts.
8.  Assemble Context Package.
9.  Validate package.
10. Estimate token usage.
11. Produce explainability report.
12. Return outputs.

------------------------------------------------------------------------

# 11. Agent Responsibilities

-   Search specifications.
-   Search standards.
-   Search project documentation.
-   Search handbook.
-   Search generated wiki.
-   Rank knowledge.
-   Assemble Context Package.
-   Produce reports.

------------------------------------------------------------------------

# 12. Data Flow

``` text
Task
   ↓
Profile Selection
   ↓
Knowledge Collection
   ↓
Knowledge Units
   ↓
Ranking
   ↓
Filtering
   ↓
Context Assembly
   ↓
Validation
   ↓
Context Package
```

------------------------------------------------------------------------

# 13. Interfaces

Consumes:

-   Handbook
-   Generated Wiki
-   Project Documentation
-   AJS Standards
-   SPEC Documents

Produces:

-   Context.md
-   JSON
-   Ranking Report
-   Explainability Report
-   Logs

------------------------------------------------------------------------

# 14. Configuration

Configurable values:

-   Ranking weights
-   Token budget
-   Maximum sources
-   Context profiles
-   Output formats

------------------------------------------------------------------------

# 15. Error Handling

Recoverable:

-   Missing handbook entries
-   Missing wiki entries
-   Missing documentation

Fatal:

-   Unknown project
-   Invalid task
-   Corrupted configuration

------------------------------------------------------------------------

# 16. Logging & Observability

Record:

-   Inputs
-   Selected profile
-   Sources searched
-   Sources selected
-   Ranking scores
-   Token estimate
-   Duration
-   Result

------------------------------------------------------------------------

# 17. Security & Permissions

Requires read-only access to:

-   Project files
-   Handbook
-   Generated Wiki
-   Standards
-   Specifications

Must never modify canonical knowledge.

------------------------------------------------------------------------

# 18. Testing Strategy

Unit:

-   Ranking
-   Duplicate removal
-   Profile selection
-   Validation

Integration:

-   End-to-end Context Package generation

Acceptance:

-   Correct profile selected
-   Correct sources selected
-   Package follows AJS-002 Appendix B
-   Token budget respected

------------------------------------------------------------------------

# 19. Acceptance Criteria

-   [ ] Context Package generated.
-   [ ] Context profile applied.
-   [ ] Ranking follows AJS-002.
-   [ ] Duplicate information removed.
-   [ ] Required sections included.
-   [ ] Explainability report produced.
-   [ ] Token estimate generated.
-   [ ] No canonical knowledge modified.

------------------------------------------------------------------------

# 20. Future Enhancements

-   Semantic retrieval
-   Embedding search
-   Personalized ranking
-   Context caching
-   Adaptive token budgeting
-   Multiple concurrent profiles

------------------------------------------------------------------------

# 21. Notes

The Context Builder Agent is a foundational AJ-OS capability.

It is responsible for transforming governed knowledge into focused,
explainable Context Packages that enable coding agents to work
efficiently with minimal prompting.
