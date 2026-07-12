# AJS-002 --- Context Assembly Standard

**Status:** Draft v1.0

## Purpose

Define how AJ-OS assembles, filters, ranks, and delivers context to a
coding agent.

The objective is simple:

> Give the AI exactly the information it needs to complete one task---no
> more, no less.

This standard is model-agnostic. It applies regardless of whether the
coding agent is Claude Code, ChatGPT, Gemini, or a future AJ-OS agent.

------------------------------------------------------------------------

# Guiding Principles

1.  Context should be **minimal**.
2.  Context should be **relevant**.
3.  Context should be **deterministic**.
4.  Context should be **repeatable**.
5.  Context should be assembled automatically whenever possible.
6.  The same inputs should produce substantially the same Context
    Package.

------------------------------------------------------------------------

# Inputs

The Context Builder accepts:

-   Project
-   Task
-   Optional current branch
-   Optional issue/ticket
-   Optional current commit

Example:

``` text
Project: AJ-OS
Task: Implement Google OAuth
Branch: feature/google-login
```

------------------------------------------------------------------------

# Context Sources (Priority Order)

  ------------------------------------------------------------------------
  Priority                   Source                Purpose
  -------------------------- --------------------- -----------------------
  1                          Current Task          Defines the work to be
                             Specification         completed.

  2                          Project README        High-level project
                                                   overview.

  3                          CLAUDE.md (or         Coding conventions and
                             equivalent project    project rules.
                             instructions)         

  4                          Architecture          Structural decisions
                             Documentation         and system design.

  5                          Relevant Project      Feature-specific
                             Documentation         knowledge.

  6                          Handbook              Reusable methods,
                                                   playbooks, and
                                                   standards.

  7                          Wiki                  Evergreen technical
                                                   knowledge.

  8                          Source Code           Existing implementation
                                                   patterns.

  9                          Git History           Only when required for
                                                   recent changes or
                                                   debugging.
  ------------------------------------------------------------------------

------------------------------------------------------------------------

# Context Package Structure

Every generated Context Package should follow this structure.

``` text
# Context Package

## Objective

## Success Criteria

## Constraints

## Relevant Architecture

## Coding Standards

## Related Documentation

## Handbook References

## Wiki References

## Files Likely to Change

## Relevant Existing Code

## Open Questions
```

Consistency is more important than completeness.

------------------------------------------------------------------------

# Inclusion Rules

Include information only when it directly supports the current task.

Include:

-   Relevant architecture
-   Existing implementation patterns
-   Coding standards
-   Project conventions
-   Related handbook entries
-   Related wiki notes

Do not include:

-   Unrelated meeting notes
-   Historical discussions with no impact
-   Completed features unrelated to the task
-   Entire documents when only one section is relevant

------------------------------------------------------------------------

# Context Ranking

Candidate information should be ranked using the following criteria:

1.  Task relevance
2.  Project relevance
3.  Reusability
4.  Recency (when applicable)
5.  Dependency relationships

Ranking logic may evolve over time.

------------------------------------------------------------------------

# Output Formats

The assembly process is independent of output format.

Supported outputs may include:

-   Context.md (primary)
-   JSON
-   MCP context
-   Prompt template

The standard governs the content, not the serialization.

------------------------------------------------------------------------

# Success Criteria

A successful Context Package should:

-   Allow the coding agent to begin implementation immediately.
-   Minimize unnecessary context.
-   Reduce token usage.
-   Produce consistent results.
-   Be understandable by a human reviewer.

------------------------------------------------------------------------

# Future Extensions

Future versions may include:

-   Semantic handbook search
-   Wiki relevance scoring
-   Dependency graph analysis
-   Automatic code reference extraction
-   User feedback for ranking improvements
-   Specialized packages for implementation, debugging, review, and
    documentation

------------------------------------------------------------------------

# Relationship to Other Standards

-   **AJS-001** --- Daily Workflow Standard: the daily operating cadence of a work session.
-   **AJS-002** --- Defines how implementation context is assembled.
-   **AJS-003** --- Will define what knowledge belongs where.
-   **AJS-004** --- Will define AI agent contracts.
-   **AJS-005** --- Will define automation contracts.
-   **AJS-006** --- Will define the knowledge lifecycle.

------------------------------------------------------------------------

# Design Principles

-   Optimize for focus, not completeness.
-   Prefer quality over quantity.
-   Assemble context automatically whenever possible.
-   Keep the standard independent of any specific AI model or editor.
-   Treat the Context Package as the contract between AJ-OS and any
    coding agent.
