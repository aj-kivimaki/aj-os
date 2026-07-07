# {{SPEC-ID}} — {{IMPLEMENTATION NAME}}

> **Implementation Package**
>
> **Status:** Planned | In Progress | Blocked | Completed
>
> **Phase:** {{ROADMAP PHASE}}
>
> **Related Specification:** {{SPEC-ID}}
>
> **Owner:** {{OWNER}}

---

# Purpose

Describe the purpose of this implementation.

Answer the question:

> **Why does this implementation exist?**

Focus on the business or platform capability rather than implementation details.

---

# Implementation Objective

The objective of this implementation is to fully satisfy the acceptance criteria defined in **{{SPEC-ID}}**.

Implementation shall follow the approved:

- Architecture (ARCH)
- Standards (AJS)
- Specifications (SPEC)

If implementation reveals deficiencies in those documents, implementation should pause while the architecture is reviewed through the ADR process.

Implementation must never intentionally diverge from the approved architecture.

---

# Overview

Provide a high-level overview of what this implementation delivers.

Avoid implementation details.

Focus on capabilities.

---

# Scope

## Included

-

-

-

## Not Included

-

-

- ***

# References

## Architecture

- ARCH-001

## Standards

- AJS-...

## Specifications

- SPEC-...

---

# Dependencies

## Required

-

-

## Optional

-

- ***

# Deliverables

This implementation is considered complete when the following deliverables exist.

- [ ]

- [ ]

- [ ]

---

# Implementation Strategy

Describe the implementation strategy.

Examples:

- Incremental development
- Milestone-based delivery
- Test-driven development
- Backward compatibility
- Migration strategy
- Rollout strategy

---

# Milestone Progress

| Milestone | Description | Status |
| --------- | ----------- | ------ |
| M1        |             | ⬜     |
| M2        |             | ⬜     |
| M3        |             | ⬜     |
| M4        |             | ⬜     |
| M5        |             | ⬜     |

See:

`MILESTONES.md`

---

# Directory Structure

```text
spec-xxx/

README.md

MILESTONES.md

tasks/

decisions/

worklog/
```

---

# Implementation Status

Summarize the current implementation status.

Example:

- Milestone 1 in progress.
- Configuration schema completed.
- Provider registry pending.
- No known blockers.

---

# Risks

Current implementation risks.

-

-

- ***

# Open Questions

Questions that should be resolved before continuing.

-

-

- ***

# Success Criteria

This implementation succeeds when:

- the specification is fully implemented,
- all acceptance criteria are satisfied,
- automated tests pass,
- documentation is complete,
- implementation can be consumed by the next platform service.

---

# Definition of Done

The implementation is complete when:

- [ ] All milestones completed.
- [ ] All implementation tasks completed.
- [ ] Tests passing.
- [ ] Documentation updated.
- [ ] Specification acceptance criteria satisfied.
- [ ] Code reviewed.
- [ ] Merged into main.

---

# Change Log

| Date       | Version | Description                    |
| ---------- | ------- | ------------------------------ |
| YYYY-MM-DD | 1.0     | Implementation package created |

---

> **Engineering Rule**
>
> The implementation README must always represent the current state of the implementation.
>
> If implementation and specification conflict, update the implementation only until the conflict is understood. Architectural changes must be documented through an ADR and reflected in the appropriate AJS or SPEC documents before implementation continues.
