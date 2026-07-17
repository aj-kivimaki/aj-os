# SPEC-003 --- End-of-Session Workflow

**Specification ID:** SPEC-003\
**Version:** 1.1\
**Status:** Draft\
**Owner:** AJ-OS\
**Related Standards:** AJS-001, AJS-003, AJS-004, AJS-005, AJS-006\
**Related Specifications:** SPEC-000, SPEC-002, SPEC-004

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

## v1 Implementation Scope

This specification describes the workflow's full intent. **v1, as
implemented and frozen, is a capture-only vertical slice** of it:

-   **One Git analyzer.** The Documentation Analyzer named in §5 and §10
    is a seam, not an implementation.
-   **Manual trigger only.** The other triggers in §6 are seams.
-   **No-op notification.** §9 step 10 is a seam.
-   **No git commit and no wiki generation.** Both are **deferred**, per
    **ADR-002** (*version control belongs to orchestration*) and
    **AJS-005 §7**. The orchestration layer that would own the commit does
    not exist yet, so **no component performs it** --- the roadmap's
    "owns git commits" role is **deferred beyond v1** and is not
    SPEC-003's.

Analyzers, triggers, and notifiers are **pluggable seams**: v1 establishes
them so later capabilities are additive rather than structural.

**Permanent, not deferred:** the workflow must never modify canonical
handbook content (§17).

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

## Manual trigger --- the CLI entry point

The **manual** trigger is the only one implemented in v1, and its entry
point is:

``` text
aj session end [--since <ref>] [--notes <text>]
```

-   `--since <ref>` --- measure the session from `<ref>` instead of the
    working tree. Absent, the range is the complete uncommitted working
    state (`HEAD`); present, it is `<ref>..HEAD`.
-   `--notes <text>` --- the engineer's account of the session: what the
    diff cannot show. Reaches knowledge extraction **verbatim**, as
    context rather than instruction (**EOS-D10**).

The command is a thin entry point: it loads configuration, composes the
workflow, and runs it. It performs no git access and constructs no stage.

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

## The Session is a first-class object

A **Session** is a first-class object with a **stable opaque identifier**
(**EOS-D3**). The identifier is the session's identity.

**Trigger, branch, and git state are metadata --- never identity.** A
session is not identified by the branch it ran on, the commit it started
from, or what triggered it; those are facts *about* the session that it
records. Two sessions on the same branch, from the same commit, are two
sessions.

This is what lets the review store key its layout on `<session-id>`
(§17), and what lets SPEC-004 refer to a session without depending on
any git fact remaining true.

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

## Canonical output vs. projection

The list above names the workflow's outputs but not which of them is
**authoritative**. It is settled by **EOS-D4**:

-   **`CandidateKnowledge` is the canonical, machine-readable output.**
    Every candidate is persisted individually and is the durable result of
    a run.
-   **The `ReviewPackage` is a deterministic, human-readable
    *projection*** rendered from those canonical candidates. It is
    regenerable: deleting and re-rendering it from the persisted
    candidates yields the same package.

The direction is one-way. The projection is **rendered from** canonical
data and is **never parsed back**; nothing downstream reads meaning out of
the markdown. This includes the package's own `summary`, which must derive
from **canonical persisted data** --- never from the transient extraction
output that produced it.

**SPEC-004 consumes the structured candidates, not the markdown.** The
markdown exists for the human in the review loop; the contract exists for
the specification downstream. Reading the markdown as an interface would
couple SPEC-004 to a presentation format that is deliberately free to
change.

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

These are states of a **run**. The **Session** that the run captures is a
first-class object whose **opaque identifier is stable across all of
them** (see §7). A run's outcome --- `completed`, `partial`, or `failed`
--- is recorded in the session report; a failed run still produces one,
because the report is how a failure stays observable.

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

## Entry point

``` text
aj session end [--since <ref>] [--notes <text>]
```

See §6 for the flags. This is the workflow's only user-facing interface in
v1.

## Boundary contract

The **SPEC-003 → SPEC-004 boundary** is defined in
**`docs/architecture/CONTRACTS.md`**, the register of inter-specification
seams.

**`CandidateKnowledge` is producer-owned by SPEC-003** (**EOS-D1**,
**EOS-D5**): the producing specification owns its output contracts, and
publishes them as a boundary contract for its consumer. It is not a
temporary home awaiting migration to SPEC-004.

Where CONTRACTS.md and this specification disagree, **this specification
is authoritative** --- CONTRACTS.md is a register, not a source.

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

## The review package location

The location is **non-canonical by construction** (**EOS-D2**) --- named
for the business state of what it holds, not for a mechanism:

``` text
<handbook-vault>/knowledge-review/pending/<session-id>/
    candidates/<candidate-id>.json    one canonical CandidateKnowledge per file
    report.json                       the SessionReport for the run
    review-package.md                 the rendered ReviewPackage
    log.md                            append-only session log
```

Configured by **`AjConfig.handbook.reviewPath`** (default
**`knowledge-review`**), resolved beneath `handbook.path`. The store owns
this layout and its serialization (**EOS-D6**); no other component decides
where a session's files go.

**Every write is beneath this directory.** The store refuses a destination
whose basename is a canonical knowledge area, and rejects any path that
escapes the resolved root by symlink or traversal. That the workflow never
touches canonical content is therefore enforced at the boundary, not left
to convention --- which is what makes the permanent guarantee above
testable rather than aspirational.

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
