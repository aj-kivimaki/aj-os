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

## Architecture

The Context Builder is implemented as a deterministic processing pipeline.

Each stage has a single responsibility and communicates exclusively through immutable platform contracts.

See:

- architecture/PIPELINE-ARCHITECTURE.md

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

# Latest Milestone

## Milestone 3 — Knowledge Selection

**Objective**

Implement deterministic knowledge selection using the immutable CollectionResult produced by Milestone 2.

Selection determines which collected knowledge becomes part of a future Context Package. It operates entirely on the existing CollectionResult and introduces no new provider execution or collection behaviour.

**Expected Deliverables**

- Selection Engine
- Selection contracts
- Deterministic selection rules
- Selection integration
- Behaviour tests

**Intentionally excluded**

- Context Package generation
- Prompt formatting
- Explainability
- Context profiles
- Provider execution
- Knowledge collection
- Optimisation

**Status**

Complete. Deterministic knowledge selection is implemented (Selection Engine, SelectionResult contract, executable Selection Policy, `build(request)` pipeline) and protected by permanent behaviour tests (CB-018). Ready for the Milestone 3 Freeze Review.

**Next**

Milestone 4 — Context Assembly.

---

# Milestone Progress

| Milestone | Description               | Status |
| --------- | ------------------------- | ------ |
| M1        | Foundation                | ✅     |
| M2        | Knowledge Collection      | ✅     |
| M3        | Knowledge Selection       | ✅     |
| M4        | Context Assembly          | ⬜     |
| M5        | Explainability & Profiles | ⬜     |
| M6        | Optimization              | ⬜     |

See:

`MILESTONES.md`

---

# Implementation Status

Current status:

- ✅ Architecture complete.
- ✅ Engineering standards complete.
- ✅ Specification complete.
- ✅ Milestone 1 complete and frozen.
- ✅ Milestone 2 complete and frozen.
- ✅ Milestone 3 complete (ready for Freeze Review).

Completed implementation:

- Context Builder module
- Configuration contract
- Context Package contract
- Knowledge Provider contracts
- Provider Registry
- Contract Testing Foundation
- Collection Engine
- Collection Error contract
- CollectionResult contract
- Deterministic provider execution
- Context Builder collection pipeline
- Selection Engine
- SelectionResult contract
- Deterministic Selection Policy
- Selection execution (`SelectionEngine.select`)
- Context Builder selection pipeline (`build(request)`)
- Selection behaviour regression tests

The platform foundation is complete through deterministic knowledge collection and
knowledge selection.

The next implementation milestone introduces deterministic Context Assembly (M4).

---

# Risks

Current implementation risks include:

- Overengineering the first version.
- Adding AI-specific functionality too early.
- Mixing implementation concerns with architectural concerns.

Implementation should prioritize simplicity over completeness.

---

# Open Questions

Milestone 3 planning resolved the following (recorded in the Milestone 3 planning review):

- **What deterministic selection model should be used?** — Resolved. The Selection Policy is executable platform behaviour expressed as an ordered comparator chain. Every comparator is deterministic and the chain terminates with an immutable platform identifier (for example `KnowledgeItem.id`) to guarantee a stable total ordering. No scoring algorithms, numeric priority values, or business-specific ranking heuristics are introduced.
- **How should selection priorities be represented?** — Resolved. SelectionResult exposes no explicit priority field. The canonical deterministic ordering of `selectedItems` is the public contract; any priority used within the policy is an implementation detail. Assembly consumes `selectedItems` exactly in the order provided.
- **What should the SelectionResult contract contain?** — Resolved. SelectionResult contains `metadata`, `selectedItems`, and `excludedItems`, composed from existing immutable platform contracts (CB-014).
- **What is the Context Builder public entry point?** — Resolved. The Context Builder exposes a single public entry point, `build(request)`, which always executes the highest-level implemented pipeline. Stage-specific operations (`collect`, `select`, future `assemble`) remain on their engines; intermediate results stay internal to the pipeline.

Remaining open question (deferred beyond Milestone 3):

- **Where should Context Profiles influence selection?** — Deferred to Milestone 5 (Explainability & Profiles). Selection in Milestone 3 is profile-agnostic; the comparator chain is designed so a future profile can modulate it without changing the SelectionResult contract or the `build(request)` entry point.

---

# Success Criteria

This implementation succeeds when:

- SPEC-002 acceptance criteria are satisfied.
- The Context Builder deterministically collects and selects knowledge.
- Providers are extensible.
- Tests pass.
- The Context Builder foundation is ready for Context Assembly.

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

| Date       | Version | Description                                                                                                                                                                                                                                                  |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-09 | 2.5     | CB-018 completed: permanent Selection behaviour tests (Selection Engine boundary, execution + policy through the public API, and the `build(request)` pipeline) added on the CB-006 foundation; suite 123 → 160. **Milestone M3 complete** — deterministic knowledge selection is protected by permanent regression tests. No platform contract changed.                                                                                                        |
| 2026-07-09 | 2.4     | Milestone 3 planning corrections applied (R1/R2/R3): resolved Open Questions — `build(request)` single public entry point, SelectionResult exposes no priority field (ordering is the contract), Selection Policy is an executable deterministic comparator chain terminating in an immutable identifier. Planning documentation only — no code, no frozen M1/M2 platform contract changed.        |
| 2026-07-08 | 2.3     | Milestone 2 status corrected to complete **and frozen** (freeze recorded in RETROSPECTIVE-M2). "Latest Milestone" section marked complete; next milestone (M3 — Knowledge Selection) noted. Documentation only — no contract, code or milestone-plan change. |
| 2026-07-08 | 2.2     | CB-012 completed and Milestone 2 marked complete: deterministic knowledge collection is now protected by permanent behaviour tests (105 → 119). No platform contract changed.                                                                                |
| 2026-07-08 | 2.1     | Milestone 2 planning corrections: partial-collection model; deliverables reordered contract-first (CB-007…CB-012).                                                                                                                                           |
| 2026-07-08 | 2.0     | Updated after freezing Milestone 1 and aligning the implementation roadmap with the contract-first architecture.                                                                                                                                             |
| 2026-07-07 | 1.0     | Initial implementation package created                                                                                                                                                                                                                       |

---

> **Engineering Rule**
>
> The Context Builder is the foundation of the AJ-OS knowledge platform.
>
> Prioritize correctness, determinism, modularity, and maintainability over feature completeness.
>
> Future platform services should build upon this implementation rather than duplicate its functionality.
