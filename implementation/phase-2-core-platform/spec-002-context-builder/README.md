# SPEC-002 — Context Builder Agent

> **Implementation Package:** SPEC-002
>
> **Status:** Active
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

# Current Milestone

## Milestone 2 — Knowledge Collection

**Objective**

Implement deterministic knowledge collection using the platform contracts established during Milestone 1.

Collection is **partial**: a single provider failure never aborts collection. A provider contributes either KnowledgeItems or a CollectionError, and the CollectionResult contains both.

**Deliverables (implementation order)**

- Collection Engine (CB-007)
- Collection Error contract (CB-008)
- CollectionResult contract — items + errors (CB-009)
- Provider execution — partial collection (CB-010)
- Context Builder integration (CB-011)
- Collection tests (CB-012)

**Intentionally excluded**

- Knowledge selection
- Ranking
- Context Package generation
- Explainability
- Profiles

---

# Milestone Progress

| Milestone | Description | Status |
| --------- | -------------------------- | ------ |
| M1 | Foundation | ✅ |
| M2 | Knowledge Collection | ⬜ |
| M3 | Knowledge Selection | ⬜ |
| M4 | Context Assembly | ⬜ |
| M5 | Explainability & Profiles | ⬜ |
| M6 | Optimization | ⬜ |

See:

`MILESTONES.md`

---

# Implementation Status

Current status:

- ✅ Architecture complete.
- ✅ Engineering standards complete.
- ✅ Specification complete.
- ✅ Milestone 1 complete and frozen.
- 🚧 Milestone 2 planning in progress.

Completed foundation:

- Context Builder module
- Configuration contract
- Context Package contract
- Knowledge Provider contracts
- Provider Registry
- Contract Testing Foundation

Milestone 2 introduces the first platform behaviour: deterministic knowledge collection.

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

| Date | Version | Description |
| ---------- | ------- | -------------------------------------- |
| 2026-07-08 | 2.1 | Milestone 2 planning corrections: partial-collection model; deliverables reordered contract-first (CB-007…CB-012). |
| 2026-07-08 | 2.0 | Updated after freezing Milestone 1 and aligning the implementation roadmap with the contract-first architecture. |
| 2026-07-07 | 1.0 | Initial implementation package created |

---

> **Engineering Rule**
>
> The Context Builder is the foundation of the AJ-OS knowledge platform.
>
> Prioritize correctness, determinism, modularity, and maintainability over feature completeness.
>
> Future platform services should build upon this implementation rather than duplicate its functionality.
