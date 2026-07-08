# SPEC-002 — Implementation Milestones

> **Implementation Package:** SPEC-002 — Context Builder Agent
>
> **Related Specification:** SPEC-002
>
> **Status:** Active

---

# Purpose

This document defines the implementation roadmap for the Context Builder.

Each milestone delivers a usable increment of functionality while moving the implementation closer to the complete specification.

The milestones prioritize working software over technical completeness.

---

# Milestone Overview

| Milestone | Name | Goal | Status |
| --------- | ---- | ---- | ------ |
| M1 | Foundation | Establish immutable platform contracts, core services, and contract testing | ✅ |
| M2 | Knowledge Collection | Collect knowledge deterministically from registered providers | ⬜ |
| M3 | Knowledge Selection | Select, filter, and organize collected knowledge | ⬜ |
| M4 | Context Assembly | Assemble deterministic Context Packages | ⬜ |
| M5 | Explainability & Profiles | Explain selection decisions and support context profiles | ⬜ |
| M6 | Optimization | Improve performance and prepare future platform extensions | ⬜ |

---

# Implementation Flow

```text
Foundation
        ↓
Knowledge Collection
        ↓
Knowledge Selection
        ↓
Context Assembly
        ↓
Explainability & Profiles
        ↓
Optimization
```

Every completed milestone must produce a working and testable Context Builder.

---

# Milestone M1 — Foundation ✅

## Objective

Create the foundation of the Context Builder.

This milestone establishes the project structure, immutable platform contracts, core services, and permanent contract testing.

No business logic is implemented.

## Deliverables

- Context Builder module
- Configuration contract
- Context Package contract
- Knowledge Provider contracts
- Provider Registry
- Contract Testing Foundation

## Related Tasks

- [x] CB-001 — Establish Context Builder Module
- [x] CB-002 — Public Configuration Contract & Factory
- [x] CB-003 — Context Package Schema
- [x] CB-004 — Knowledge Provider Contracts
- [x] CB-005 — Provider Registry
- [x] CB-006 — Establish Contract Testing Foundation

## Validation

- Project builds successfully.
- Tests execute successfully.
- Interfaces compile.
- Architecture follows SPEC-002.

## Definition of Done

- [x] Foundation complete
- [x] Tests passing
- [x] Documentation updated
- [x] Freeze review completed

---

# Milestone M2 — Knowledge Collection

## Objective

Implement deterministic knowledge collection using the platform contracts established during Milestone 1.

The Context Builder should be able to execute registered providers and collect KnowledgeItems.

Collection is **partial with deterministic error reporting**: a single provider failure never aborts collection. A provider contributes either KnowledgeItems or a CollectionError, and the CollectionResult contains both.

No ranking, filtering, or Context Package generation is performed.

## Deliverables

- Collection Engine
- Collection Error contract
- CollectionResult contract (items + errors)
- Provider execution (partial collection)
- Context Builder integration
- Collection tests

## Related Tasks

Contract-first implementation order:

- [x] CB-007 — Establish Collection Engine Service
- [x] CB-008 — Define Collection Error Contract
- [ ] CB-009 — Define CollectionResult Contract
- [ ] CB-010 — Implement Provider Execution
- [ ] CB-011 — Integrate Context Builder Collection Pipeline
- [ ] CB-012 — Implement Collection Behaviour Tests

## Validation

The Context Builder deterministically collects knowledge from all registered providers, surfacing per-provider failures as CollectionErrors without aborting collection.

## Definition of Done

- [ ] Collection engine operational
- [x] Collection Error contract defined
- [ ] CollectionResult contract defined (items + errors)
- [ ] Provider execution implemented (partial collection)
- [ ] Context Builder integration operational
- [ ] Collection tests passing

---

# Milestone M3 — Knowledge Selection

## Objective

Select the most relevant knowledge from collected results.

The focus is deterministic selection rather than package generation.

## Deliverables

- Relevance scoring
- Duplicate handling
- Filtering
- Ordering
- Token budgeting

## Validation

The same collected knowledge always produces the same selected result.

## Definition of Done

- [ ] Selection pipeline operational
- [ ] Duplicate handling implemented
- [ ] Tests passing

---

# Milestone M4 — Context Assembly

## Objective

Transform selected knowledge into a deterministic Context Package.

Implement the Context Package defined by AJS-002 Appendix B.

## Deliverables

- Context Package generator
- Markdown output
- Metadata generation
- Deterministic assembly

## Validation

The same input always produces the same Context Package.

## Definition of Done

- [ ] Context Package generated
- [ ] Appendix B satisfied
- [ ] Output validated

---

# Milestone M5 — Explainability & Profiles

## Objective

Make Context Packages transparent and adaptable.

Profiles influence selection and assembly while explainability records why content was selected.

## Deliverables

- Explainability report
- Context profiles
- Ranking explanation
- Token estimation

## Validation

Generated reports explain exactly why content was selected.

## Definition of Done

- [ ] Explainability implemented
- [ ] Profiles supported
- [ ] Tests passing

---

# Milestone M6 — Optimization

## Objective

Optimize performance and prepare the Context Builder for future platform services.

## Deliverables

- Performance improvements
- Caching
- Configuration refinements
- Extension points

## Validation

Performance targets satisfied.

Future provider integrations remain straightforward.

## Definition of Done

- [ ] Optimization complete
- [ ] Documentation updated
- [ ] Ready for production use

---

# Cross-Milestone Risks

Potential implementation risks:

- Overengineering early milestones
- Adding AI-specific behavior prematurely
- Tight coupling between providers
- Premature optimization

Mitigation:

Maintain modular interfaces and validate each milestone independently.

---

# Completion Criteria

The implementation roadmap is complete when:

- [ ] Every milestone completed
- [ ] Every implementation task completed
- [ ] SPEC-002 acceptance criteria satisfied
- [ ] Tests passing
- [ ] Context Builder ready for use by SPEC-003

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | --------------------------------- |
| 2026-07-08 | 2.1 | Milestone 2 planning corrections: adopted partial-collection model; reordered tasks contract-first (Error contract → CollectionResult → Provider Execution); added M2 Related Tasks list. |
| 2026-07-08 | 2.0 | Updated roadmap after freezing Milestone 1; aligned milestones with contract-first architecture. |
| 2026-07-07 | 1.0 | Initial milestone roadmap created |

---

> **Engineering Rule**
>
> Every completed milestone must leave the Context Builder in a working, testable state.
>
> The implementation should evolve through small, deterministic increments, with each milestone having one primary responsibility.
