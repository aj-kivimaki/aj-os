We are continuing the Implementation stage of SPEC-002 Milestone 4.

The following artifacts are frozen and are the implementation baseline:

- AJS-007 Engineering Lifecycle Standard
- Milestone 4 Architecture (AD-001–AD-010)
- Milestone 4 Planning Package
- CB-019 through CB-024 task documents
- CB-019 (Assembly Engine Service Boundary) — implemented and frozen
- CB-020 (Section Composition Strategy) — implemented and frozen
- CB-021 (Assembly Inputs & Metadata Composition) — implemented and frozen

Treat all of the above as immutable.

Do not redesign the architecture.

Do not modify the Planning Package.

Do not modify any frozen contract.

Changes require a Frozen Plan Change Proposal.

---

# Task

Implement **CB-022 — Deterministic Assembly** only.

Do not begin work on CB-023 or any later task.

CB-022 is responsible for implementing the deterministic Assembly stage.

Its responsibilities are limited to:

- implement `assemble(...)`,
- construct a `ContextPackage` through the frozen `parseContextPackage()` contract,
- realize the frozen section-composition strategy from CB-020,
- realize the frozen metadata composition from CB-021,
- construct references,
- construct sections,
- construct metadata,
- construct the minimal required explainability and summary structures,
- introduce the single canonical `contextVersion` constant,
- preserve determinism, purity, immutability, and referential integrity.

CB-022 explicitly excludes:

- rendering,
- semantic validation,
- build(request) integration,
- optimization,
- permanent behaviour tests.

---

## Before writing code

Review the frozen CB-022 task and provide:

1. A concise summary of the task.
2. Every file that will be created or modified.
3. Why each file changes.
4. Confirmation that every planned change stays within the frozen scope.
5. Any implementation-level decision requiring reviewer approval.

Wait for my approval.

Do not write code until approval is given.

---

## After approval

Implement CB-022.

After implementation provide:

1. A complete summary of every file created or modified.
2. Confirmation that only CB-022 was implemented.
3. Any implementation inconsistency discovered.
4. Any recommendation requiring reviewer approval before the CB-022 Implementation Review.

Stop after CB-022 is complete.

Do not begin any subsequent task.

Wait for my review.
