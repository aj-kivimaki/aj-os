We are continuing the Implementation stage of SPEC-002 Milestone 4.

The following artifacts are frozen and are the implementation baseline:

- AJS-007 Engineering Lifecycle Standard
- Milestone 4 Architecture (AD-001–AD-010)
- Milestone 4 Planning Package
- CB-019 through CB-024 task documents
- CB-019 (Assembly Engine Service Boundary) — implemented and frozen
- CB-020 (Section Composition Strategy decision record) — implemented and frozen

Treat all of the above as immutable.

Do not redesign the architecture.

Do not modify the Planning Package.

Do not modify any frozen contract.

Changes require a Frozen Plan Change Proposal.

---

# Task

Implement **CB-021 — Assembly Inputs & Metadata Composition** only.

Do not begin work on CB-022 or any later task.

CB-021 is responsible for defining and implementing the complete input set required by Assembly and the deterministic composition of ContextPackage metadata.

Its responsibilities are limited to:

- define the complete Assembly input set,
- define metadata composition,
- realize Decision B (construction-time injected `generated_at`),
- define the single sources of all metadata values,
- preserve deterministic, pure Assembly inputs,
- prepare the metadata required for ContextPackage construction in CB-022.

CB-021 explicitly excludes:

- section composition (already frozen by CB-020),
- ContextPackage construction,
- assemble() behaviour,
- rendering,
- validation,
- build() integration,
- permanent behaviour tests.

---

## Before writing code

Review the frozen CB-021 task and provide:

1. A concise summary of the task.
2. Every file that will be created or modified.
3. Why each file changes.
4. Confirmation that every planned change stays within the frozen scope.
5. Any implementation-level decision requiring reviewer approval.

Wait for my approval.

Do not write code until approval is given.

---

## After approval

Implement CB-021.

After implementation provide:

1. A complete summary of every file created or modified.
2. Confirmation that only CB-021 was implemented.
3. Any implementation inconsistency discovered.
4. Any recommendation requiring reviewer approval before the CB-021 Implementation Review.

Do not begin CB-022.

Wait for the CB-021 Implementation Review before proceeding.
