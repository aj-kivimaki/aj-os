# SPEC-003 --- End-of-Session Workflow

**Specification ID:** SPEC-003\
**Version:** 1.0\
**Status:** Draft\
**Owner:** AJ-OS\
**Related Standards:** AJS-001, AJS-003, AJS-004, AJS-005, AJS-006\
**Related Specifications:** SPEC-000, SPEC-002

------------------------------------------------------------------------

# 1. Overview

## Purpose

Capture the outcome of a development session, extract reusable
knowledge, and prepare candidate updates for human review.

The End-of-Session Workflow is the primary mechanism by which AJ-OS
continuously improves its knowledge base.

## Scope

The workflow begins after a coding session has finished and ends when
candidate knowledge has been prepared for review.

## Goals

-   Capture today's work.
-   Reduce manual documentation.
-   Identify reusable knowledge.
-   Prepare handbook candidates.
-   Prepare wiki publication candidates.
-   Generate a reusable session summary.

## Non-Goals

-   Automatically modify the handbook.
-   Automatically publish to the wiki.
-   Automatically approve generated knowledge.

------------------------------------------------------------------------

# 2. Functional Requirements

The workflow SHALL:

1.  Detect the end of a work session.
2.  Collect project changes.
3.  Analyze code and documentation changes.
4.  Identify reusable knowledge.
5.  Generate structured candidate artifacts.
6.  Produce a review package.
7.  Record execution logs.

------------------------------------------------------------------------

# 3. Non-Functional Requirements

-   Deterministic where possible.
-   Explainable outputs.
-   Human-review first.
-   Extensible.
-   Auditable.

------------------------------------------------------------------------

# 4. User Stories

-   As AJ, I want documentation to stay up to date automatically.
-   As AJ, I want reusable knowledge extracted without manual effort.
-   As AJ-OS, I want every completed session to improve future work.

------------------------------------------------------------------------

# 5. Architecture Overview

``` text
Git / Project Changes
        │
        ▼
End-of-Session Workflow
        │
        ├── Git Analyzer
        ├── Documentation Analyzer
        ├── Knowledge Extractor
        ├── Candidate Generator
        └── Review Package Builder
                │
                ▼
Review Package
```

------------------------------------------------------------------------

# 6. Triggers

Supported triggers:

-   Manual
-   Git commit
-   Git push
-   End of workday
-   IDE command
-   Scheduled execution

------------------------------------------------------------------------

# 7. Inputs

Required:

-   Project
-   Repository
-   Current branch

Optional:

-   Commit hash
-   Commit message
-   Session notes
-   Task identifier
-   Context Package

------------------------------------------------------------------------

# 8. Outputs

Primary:

-   Session Summary
-   Review Package

Secondary:

-   Candidate Handbook Entries
-   Candidate Playbooks
-   Candidate Wiki Publications
-   Lessons Learned
-   Suggested Documentation Updates
-   Suggested Automation Ideas
-   Execution Log

------------------------------------------------------------------------

# 9. Workflow

1.  Detect trigger.
2.  Collect project changes.
3.  Analyze documentation changes.
4.  Analyze source code changes.
5.  Compare against handbook.
6.  Detect reusable knowledge.
7.  Generate candidate artifacts.
8.  Build review package.
9.  Log execution.
10. Notify user.

------------------------------------------------------------------------

# 10. Participating AJ-OS Agents

-   Git Analyzer
-   Documentation Analyzer
-   Knowledge Extractor
-   Candidate Generator
-   Review Package Builder
-   Notification Agent

------------------------------------------------------------------------

# 11. Data Flow

``` text
Repository
      ↓
Analysis
      ↓
Knowledge Extraction
      ↓
Candidate Generation
      ↓
Review Package
      ↓
Human Review
```

------------------------------------------------------------------------

# 12. State Model

Requested ↓ Collecting ↓ Analyzing ↓ Extracting ↓ Building Review ↓
Completed

------------------------------------------------------------------------

# 13. Interfaces

Consumes:

-   Git repository
-   Project documentation
-   Handbook
-   Context Package (optional)

Produces:

-   Markdown review package
-   JSON report
-   Candidate knowledge artifacts

------------------------------------------------------------------------

# 14. Configuration

Configurable:

-   Trigger type
-   Review thresholds
-   Extraction profiles
-   Output formats
-   Notification preferences

------------------------------------------------------------------------

# 15. Error Handling

Recoverable:

-   Missing documentation
-   Missing commit message
-   Partial analysis

Fatal:

-   Repository unavailable
-   Invalid project
-   Corrupted configuration

------------------------------------------------------------------------

# 16. Logging & Observability

Record:

-   Trigger
-   Duration
-   Files analyzed
-   Candidates produced
-   Errors
-   Result

------------------------------------------------------------------------

# 17. Security & Permissions

Read access:

-   Repository
-   Documentation
-   Handbook

Write access:

-   Review package location only

Must never modify canonical handbook content.

------------------------------------------------------------------------

# 18. Testing Strategy

Unit:

-   Knowledge extraction
-   Candidate generation

Integration:

-   Full workflow execution

Acceptance:

-   Review package generated
-   Candidate knowledge identified
-   No handbook modifications occur automatically

------------------------------------------------------------------------

# 19. Acceptance Criteria

-   [ ] Session summary generated.
-   [ ] Candidate handbook entries generated.
-   [ ] Candidate wiki publications prepared.
-   [ ] Review package created.
-   [ ] Canonical knowledge unchanged.
-   [ ] Logs recorded.

------------------------------------------------------------------------

# 20. Future Enhancements

-   Voice session summaries
-   Screenshot analysis
-   IDE activity timeline
-   Learning analytics
-   Automatic duplicate detection
-   Personalized extraction models

------------------------------------------------------------------------

# 21. Notes

This workflow is the primary self-improvement mechanism of AJ-OS.

Its responsibility is to transform completed work into candidate
knowledge while ensuring that humans remain the final authority over
canonical information.
