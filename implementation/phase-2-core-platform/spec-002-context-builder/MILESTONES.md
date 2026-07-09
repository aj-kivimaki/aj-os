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

| Milestone | Name                      | Goal                                                                        | Status |
| --------- | ------------------------- | --------------------------------------------------------------------------- | ------ |
| M1        | Foundation                | Establish immutable platform contracts, core services, and contract testing | ✅     |
| M2        | Knowledge Collection      | Collect knowledge deterministically from registered providers               | ✅     |
| M3        | Knowledge Selection       | Select, filter, and organize collected knowledge                            | ⬜     |
| M4        | Context Assembly          | Assemble deterministic Context Packages                                     | ⬜     |
| M5        | Explainability & Profiles | Explain selection decisions and support context profiles                    | ⬜     |
| M6        | Optimization              | Improve performance and prepare future platform extensions                  | ⬜     |

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
- [x] CB-009 — Define CollectionResult Contract
- [x] CB-010 — Implement Provider Execution
- [x] CB-011 — Integrate Context Builder Collection Pipeline
- [x] CB-012 — Implement Collection Behaviour Tests

## Validation

The Context Builder deterministically collects knowledge from all registered providers, surfacing per-provider failures as CollectionErrors without aborting collection.

## Definition of Done

- [x] Collection engine operational
- [x] Collection Error contract defined
- [x] CollectionResult contract defined (items + errors)
- [x] Provider execution implemented (partial collection)
- [x] Context Builder integration operational
- [x] Collection tests passing

---

# Milestone M3 — Knowledge Selection

## Objective

Implement deterministic knowledge selection using the immutable CollectionResult produced by Milestone 2.

Selection determines which collected knowledge should become part of a future Context Package. It operates entirely on the existing CollectionResult and introduces no new provider execution or collection behaviour.

## Deliverables

- Selection Engine (`select(collectionResult)` stage operation)
- Selection contracts (SelectionResult)
- Deterministic Selection Policy (executable comparator chain)
- Selection integration via the `build(request)` pipeline entry point
- Behaviour tests

## Explicitly Excluded

- Context Package generation
- Prompt formatting
- Explainability
- Context profiles
- Provider execution
- Knowledge collection
- Optimisation

## Approved Architecture Decisions

The following decisions were reviewed and approved during Milestone 3 planning and are the documented architecture (see PIPELINE-ARCHITECTURE.md):

- **Public entry point.** The Context Builder exposes a single public entry point, `build(request)`, which always executes the highest-level implemented pipeline (Collection → Selection → SelectionResult at Milestone 3). Stage operations (`collect`, `select`, future `assemble`) live on their engines; intermediate results remain internal. This supersedes the Milestone 2 era `ContextBuilder.collect` public entry point — an approved public API evolution, reconciled in CB-017.
- **Priority representation.** SelectionResult exposes no explicit priority field. The canonical deterministic ordering of `selectedItems` is the public contract; priority (if used) is an internal implementation detail. Assembly consumes `selectedItems` exactly in the order provided.
- **Deterministic ordering.** The Selection Policy is executable platform behaviour defining an ordered comparator chain. Every comparator is deterministic and the chain terminates with an immutable platform identifier (for example `KnowledgeItem.id`) to guarantee a stable total ordering. No scoring algorithms, numeric priority values, or business-specific ranking heuristics are introduced.

## Integration Check

The public entry-point evolution to `build(request)` has been reviewed and approved (recorded above and in CB-017). No frozen Milestone 1 or Milestone 2 platform contract is modified: CollectionResult, the Collection Engine, and the Provider Registry are unchanged, and the Milestone 2 `collect` behaviour is preserved as the `CollectionEngine.collect(request)` stage operation.

## Validation

The same CollectionResult and configuration always produce the same SelectionResult, including the same canonical deterministic ordering of `selectedItems`.

## Definition of Done

- [ ] Selection Engine operational
- [ ] Selection contracts implemented
- [ ] Deterministic selection implemented
- [ ] Context Builder integration complete
- [ ] Behaviour tests passing
- [ ] Planning review completed
- [ ] Planning frozen

## Architecture

Milestone 3 implements the Selection stage described in:

- architecture/PIPELINE-ARCHITECTURE.md

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

| Date       | Version | Description                                                                                                                                                                                                                                                              |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-09 | 2.7     | CB-017 completed: `ContextBuilder.build(request)` composes the Collection Engine and the Selection Engine and returns the SelectionResult unchanged; `ContextBuilder.collect` superseded (approved public API evolution). Regression-strategy migration recorded: the obsolete builder-level `collect` suite is retired (collection stays covered by the CB-010 engine suite; no coverage lost) and CB-018 becomes the permanent owner of the `build(request)` pipeline regression suite. No frozen M1/M2 platform contract changed beyond the approved entry-point evolution. |
| 2026-07-09 | 2.6     | Milestone 3 planning corrections applied (R1/R2/R3): approved `build(request)` single public entry point (supersedes M2-era `ContextBuilder.collect`, preserved as `CollectionEngine.collect`); SelectionResult exposes no priority field (canonical ordering is the contract); Selection Policy is an executable deterministic comparator chain terminating in an immutable identifier. Tasks CB-013…CB-018 and PIPELINE-ARCHITECTURE updated. Planning documentation only — no frozen M1/M2 platform contract changed.        |
| 2026-07-08 | 2.5     | CB-012 completed: permanent collection behaviour tests (Context Builder integration + deterministic error ordering) added on the CB-006 foundation; suite 105 → 119. **Milestone M2 complete** — all M2 tasks and DoD satisfied. No platform contract changed.           |
| 2026-07-08 | 2.4     | CB-011 completed: Context Builder integrated with the Collection Engine (`ContextBuilder.collect`). Approved contract evolution — `createContextBuilder(config)` → `createContextBuilder(config, registry)`; no other public contract changed. M2 task progress updated. |
| 2026-07-08 | 2.3     | CB-010 completed: deterministic partial provider execution implemented (`CollectionEngine.collect`); M2 task progress updated.                                                                                                                                           |
| 2026-07-08 | 2.2     | CB-009 completed: CollectionResult contract (items + errors + metadata) defined; M2 task progress updated.                                                                                                                                                               |
| 2026-07-08 | 2.1     | Milestone 2 planning corrections: adopted partial-collection model; reordered tasks contract-first (Error contract → CollectionResult → Provider Execution); added M2 Related Tasks list.                                                                                |
| 2026-07-08 | 2.0     | Updated roadmap after freezing Milestone 1; aligned milestones with contract-first architecture.                                                                                                                                                                         |
| 2026-07-07 | 1.0     | Initial milestone roadmap created                                                                                                                                                                                                                                        |

---

> **Engineering Rule**
>
> Every completed milestone must leave the Context Builder in a working, testable state.
>
> The implementation should evolve through small, deterministic increments, with each milestone having one primary responsibility.
