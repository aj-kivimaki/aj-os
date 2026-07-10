We are continuing the Implementation stage of SPEC-002 Milestone 4.

The following artifacts are frozen and are the implementation baseline:

- AJS-007 Engineering Lifecycle Standard
- Milestone 4 Architecture (AD-001–AD-010)
- Milestone 4 Planning Package
- CB-019 through CB-024 task documents
- CB-019 (Assembly Engine Service Boundary) — implemented and frozen
- CB-020 (Section Composition Strategy) — implemented and frozen
- CB-021 (Assembly Inputs & Metadata Composition) — implemented and frozen
- CB-022 (Deterministic Assembly) — implemented and frozen

Treat all of the above as immutable.

Do not redesign the architecture.

Do not modify the Planning Package.

Do not modify any frozen contract.

Changes require a Frozen Plan Change Proposal.

---

# Task

Implement **CB-023 — Pipeline Integration** only.

Do not begin work on CB-024 or any later task.

CB-023 is responsible for integrating the completed Assembly stage into the Context Builder pipeline.

Its responsibilities are limited to:

- extend `build(request)` to execute the complete pipeline:
  - Collection
  - Selection
  - Assembly
- construct and inject the explicit `generatedAt` input required by Assembly
- preserve the existing public Context Builder API
- preserve deterministic orchestration
- prove that `build(request)` performs no additional engineering decisions beyond composing the frozen stage operations
- update implementation-level documentation required by the task

CB-023 explicitly excludes:

- changes to Collection behaviour,
- changes to Selection behaviour,
- changes to Assembly behaviour,
- rendering,
- semantic validation,
- optimization,
- permanent behaviour tests.

---

## Before writing code

Review the frozen CB-023 task and provide:

1. A concise summary of the task.
2. Every file that will be created or modified.
3. Why each file changes.
4. Confirmation that every planned change stays within the frozen scope.
5. Any implementation-level decision requiring reviewer approval.

Wait for my approval.

Do not write code until approval is given.

---

## After approval

Implement CB-023.

After implementation provide:

1. A complete summary of every file created or modified.
2. Confirmation that only CB-023 was implemented.
3. Any implementation inconsistency discovered.
4. Any recommendation requiring reviewer approval before the CB-023 Implementation Review.

Stop after CB-023 is complete.

Do not begin any subsequent task.

Wait for my review.
