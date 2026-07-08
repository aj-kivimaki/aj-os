# SPEC-002 — Context Builder Agent

> **Implementation Package**
>
> **Status:** Planned
>
> **Phase:** Phase 2 — Core Knowledge Platform
>
> **Related Specification:** SPEC-002
>
> **Owner:** AJ

---

# Purpose

This implementation delivers the first production service of AJ-OS.

The Context Builder is responsible for assembling high-quality, structured context for AI-assisted software engineering.

Rather than relying on manually written prompts, the Context Builder collects relevant knowledge from approved sources and assembles a deterministic Context Package for the coding agent.

This service becomes the foundation for all future platform workflows.

---

# Implementation Objective

Implement the Context Builder according to **SPEC-002**.

The implementation shall satisfy the specification's acceptance criteria while adhering to:

- ARCH-001
- AJS-001
- AJS-002
- AJS-003
- AJS-004

Implementation should remain deterministic, explainable, and model-agnostic.

---

# Overview

The Context Builder transforms approved knowledge into a Context Package that can be consumed by an AI coding agent.

The implementation focuses on deterministic engineering rather than AI-based retrieval.

Advanced retrieval techniques such as embeddings and semantic search are intentionally outside the scope of the initial implementation.

---

# Scope

## Included

- Context Builder service
- Knowledge Provider abstraction
- Context collection engine
- Deterministic ranking
- Context Package generation
- Explainability
- Context profiles

## Not Included

- Vector databases
- Embeddings
- Semantic search
- LLM-based reranking
- Automatic handbook updates

---

# References

## Architecture

- ARCH-001

## Standards

- AJS-001
- AJS-002
- AJS-003
- AJS-004

## Specifications

- SPEC-002

---

# Dependencies

## Required

- Approved standards
- Approved specifications
- Handbook structure
- Generated LLM Wiki

## Future Integrations

- Notion Provider
- Git Provider
- Jira Provider
- GitHub Provider

---

# Deliverables

This implementation is complete when it provides:

- Deterministic Context Builder
- Knowledge Provider framework
- Context Package generator
- Context profiles
- Explainability report
- Automated tests

---

# Implementation Strategy

Implementation follows an incremental, milestone-based approach.

Each milestone delivers usable functionality while expanding the capabilities of the Context Builder.

The implementation prioritizes:

- deterministic behaviour
- modular design
- small interfaces
- provider-based architecture
- incremental validation
- comprehensive testing

---

# Milestone Progress

| Milestone | Description               | Status |
| --------- | ------------------------- | ------ |
| M1        | Foundation                | ✅     |
| M2        | Knowledge Providers       | ⬜     |
| M3        | Collection Engine         | ⬜     |
| M4        | Ranking Engine            | ⬜     |
| M5        | Context Package           | ⬜     |
| M6        | Profiles & Explainability | ⬜     |
| M7        | Optimization              | ⬜     |

See:

`MILESTONES.md`

---

# Implementation Status

Current status:

- Architecture complete.
- Standards complete.
- Specification complete.
- Implementation planning in progress.

No production code has been written.

---

# Risks

Current implementation risks include:

- Overengineering the first version.
- Adding AI-specific functionality too early.
- Mixing implementation concerns with architectural concerns.

Implementation should prioritize simplicity over completeness.

---

# Open Questions

Questions identified during implementation planning:

- How should providers register themselves?
- What is the optimal Context Package structure?
- How should token estimation be implemented?
- Which information belongs in explainability reports?

These questions should be answered during implementation.

---

# Success Criteria

This implementation succeeds when:

- SPEC-002 acceptance criteria are satisfied.
- The Context Builder assembles deterministic Context Packages.
- Providers are extensible.
- Tests pass.
- The Context Builder can be used by SPEC-003.

---

# Definition of Done

The implementation is complete when:

- [ ] All milestones completed.
- [ ] All implementation tasks completed.
- [ ] Tests passing.
- [ ] Documentation updated.
- [ ] SPEC-002 acceptance criteria satisfied.
- [ ] Code reviewed.
- [ ] Merged into main.

---

# Change Log

| Date       | Version | Description                            |
| ---------- | ------- | -------------------------------------- |
| 2026-07-07 | 1.0     | Initial implementation package created |

---

> **Engineering Rule**
>
> The Context Builder is the foundation of the AJ-OS knowledge platform.
>
> Prioritize correctness, determinism, modularity, and maintainability over feature completeness.
>
> Future platform services should build upon this implementation rather than duplicate its functionality.
