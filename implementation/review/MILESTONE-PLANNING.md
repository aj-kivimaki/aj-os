# Milestone Planning Review

> Purpose:
>
> Verify that a milestone is well designed before implementation begins.
>
> A milestone planning review validates the implementation strategy—not the implementation itself.
>
> The objective is to ensure that implementation can proceed task-by-task without requiring architectural redesign.
>
> **This document is used before implementation begins.**
>
> The corresponding end-of-milestone review is defined in:
>
> `implementation/review/SPEC-FREEZE-REVIEW.md`

---

# Planning Principles

During milestone planning:

- Do not implement code.
- Do not redesign approved architecture.
- Do not expand the specification.
- Do not introduce speculative features.

The purpose is to produce a coherent implementation roadmap.

---

# Planning Checklist

## Step 1 — Milestone Objective

Question:

Can the milestone be summarized in one sentence?

A milestone should have one primary responsibility.

Verify:

- single objective
- measurable outcome
- clear completion point

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 2 — Milestone Scope

Question:

What is intentionally excluded?

Verify:

- responsibilities
- boundaries
- deferred functionality

Every milestone should explicitly define what it does **not** implement.

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 3 — Task Breakdown

Review every planned task.

Question:

Does each task have one responsibility?

Verify:

- logical sequencing
- manageable scope
- independent completion

Tasks should be small enough to review independently.

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 4 — Dependency Review

Verify:

- task dependencies
- specification dependencies
- architecture dependencies

Question:

Can tasks be implemented sequentially without redesign?

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 5 — Contract Review

Question:

Does every new behavior rely on an existing contract?

If new contracts are required:

Create them before behavior.

Avoid introducing behavior before stable interfaces exist.

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 6 — Increment Review

Question:

Does every completed task leave the platform in a better working state?

Verify:

- meaningful progress
- buildable state
- testable state

Each task should produce a usable increment.

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 7 — Validation Strategy

Question:

How will this milestone be validated?

Verify:

- testing approach
- review approach
- completion criteria

Testing should be planned before implementation.

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 8 — Risk Review

Identify:

- architectural risks
- implementation risks
- sequencing risks

Question:

Can these risks be reduced by changing the implementation order?

Record any accepted risks.

Result:

- [ ] Pass
- [ ] Notes recorded

---

## Step 9 — Milestone Coherence

Review the milestone as a whole.

Question:

Do the tasks tell one coherent implementation story?

Verify:

- smooth progression
- no duplicated work
- no missing responsibilities
- no architectural gaps

Result:

- [ ] Pass
- [ ] Notes recorded

---

# Planning Decision

A milestone is ready for implementation when:

- [ ] Objective clearly defined
- [ ] Scope approved
- [ ] Tasks complete
- [ ] Dependencies verified
- [ ] Contracts identified
- [ ] Validation planned
- [ ] Risks reviewed
- [ ] Milestone coherent

---

# Outputs

A successful planning review produces:

- completed task documents
- milestone roadmap
- implementation order
- identified risks

It does not produce:

- production code
- architectural redesign
- specification changes

---

# Engineering Principles

Every milestone should:

- have one primary responsibility
- build on completed contracts
- produce deterministic progress
- end in automated validation
- leave the platform in a working state

---

# AJ-OS Engineering Lifecycle

> **Canonical source.** The engineering lifecycle is now defined canonically by **AJS-007 — Engineering Lifecycle Standard** (`docs/standards/AJS-007-Engineering-Lifecycle-Standard.md`). This section is retained as implementation-level guidance and defers to AJS-007.

```text
Architecture
        ↓
Standards
        ↓
Specification
        ↓
Milestone Planning
        ↓
Implementation
        ↓
Freeze Review
        ↓
Release
```

Every implementation package follows this lifecycle.

Each stage has a single purpose:

- **Architecture** defines the platform.
- **Standards** define engineering rules.
- **Specifications** define required capabilities.
- **Milestone Planning** defines the implementation strategy.
- **Implementation** builds the platform incrementally.
- **Freeze Review** verifies completeness and consistency.
- **Release** records the completed milestone.

---

> A milestone plan should be stable before implementation begins.
>
> Good planning minimizes redesign during implementation.
>
> Architecture defines **what** is built.
>
> Specifications define **what** must exist.
>
> Milestone planning defines **how** implementation progresses.
