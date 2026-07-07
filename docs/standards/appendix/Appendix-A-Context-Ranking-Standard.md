# AJS-002 Appendix A --- Context Ranking Standard

## Purpose

Select the smallest amount of information that enables successful task
completion.

> More context is **not** better.

The best Context Package contains only the knowledge required for the
current task.

------------------------------------------------------------------------

# 1. Extract Knowledge Units

The Context Builder should rank **knowledge units**, not entire
documents, whenever possible.

Examples:

**README** - Project purpose - Folder structure - Installation

**Handbook** - OAuth checklist - Fastify conventions - Deployment
playbook

**Wiki** - OAuth - JWT - MCP

**Project Documentation** - Authentication architecture - ADR-004 -
Login implementation

------------------------------------------------------------------------

# 2. Score Each Knowledge Unit

Each unit is scored using multiple dimensions.

  Criterion           Description                               Priority
  ------------------- --------------------------------------- ----------
  Task Relevance      Directly supports the current task           ★★★★★
  Project Relevance   Specific to the active project               ★★★★☆
  Authority           Trustworthiness of the source                ★★★★☆
  Freshness           How current the information is               ★★★☆☆
  Token Cost          Prefer smaller units with equal value        ★★★☆☆

------------------------------------------------------------------------

# 3. Remove Duplicate Knowledge

When multiple units contain substantially the same information:

-   Prefer the highest authority source.
-   Prefer the smallest useful unit.
-   Do not duplicate information inside the Context Package.

------------------------------------------------------------------------

# 4. Resolve Conflicts

When two sources disagree, the following precedence applies:

1.  AJ-OS Standards (AJS)
2.  Architecture Decision Records (ADRs)
3.  Project Documentation
4.  Handbook
5.  Wiki
6.  Source Code Comments
7.  External References

Higher-priority sources always take precedence.

------------------------------------------------------------------------

# 5. Assemble the Context Package

Selected knowledge units are organized into the standard Context Package
structure.

The package should contain only the information necessary for the
current task.

------------------------------------------------------------------------

# Design Goals

The Context Builder should:

-   Produce consistent results.
-   Be explainable.
-   Minimize token usage.
-   Prefer reusable knowledge.
-   Avoid unnecessary duplication.
-   Remain model-agnostic.

------------------------------------------------------------------------

# Future Learning

Future versions of AJ-OS may learn from user feedback.

Examples:

-   Frequently approved knowledge receives higher ranking.
-   Frequently rejected knowledge receives lower ranking.
-   Context profiles may be optimized for implementation, debugging,
    documentation, or review.

------------------------------------------------------------------------

# Recommended Default Weights

``` yaml
weights:
  task_relevance: 0.40
  project_relevance: 0.25
  authority: 0.20
  freshness: 0.10
  token_cost: 0.05
```

These weights are configuration values, not hard-coded behavior,
allowing AJ-OS to evolve without changing the implementation.
