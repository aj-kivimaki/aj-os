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
- CB-023 (Pipeline Integration) — implemented and frozen

Treat all of the above as immutable.

Do not redesign the architecture.

Do not modify the Planning Package.

Do not modify any frozen contract.

Changes require a Frozen Plan Change Proposal.

---

# Task

Implement **CB-024 — Permanent Assembly Behaviour Tests** only.

CB-024 is the final implementation task of Milestone 4.

Its responsibilities are limited to:

- author the permanent public-surface behaviour tests for the Assembly stage,
- verify the behaviour of the complete Assembly implementation through its public surface only,
- lock the deterministic guarantees established by CB-020, CB-021, CB-022, and CB-023,
- update implementation-level documentation required by the task.

The test suite should permanently verify, at minimum:

- canonical section ordering,
- the four always-present empty Decision A sections,
- the complete source.type → section-kind mapping,
- merging of multiple source types into shared section kinds,
- reference de-duplication and ordering,
- referential integrity,
- metadata composition,
- the distinction between contextVersion and contextBuilderVersion,
- omission of issue from ContextPackage metadata,
- minimal explainability and summary structures,
- deterministic output for identical inputs,
- immutability of the returned ContextPackage,
- immutability of the input SelectionResult,
- overall public behaviour of Assembly through the public API.

CB-024 explicitly excludes:

- implementation changes,
- Assembly behaviour changes,
- Collection changes,
- Selection changes,
- pipeline changes,
- rendering,
- semantic validation,
- optimization.

If a test exposes a defect, stop and report it.

Do not change implementation until reviewer approval is given.

---

## Before writing code

Review the frozen CB-024 task and provide:

1. A concise summary of the task.
2. Every file that will be created or modified.
3. Why each file changes.
4. Confirmation that every planned change stays within the frozen scope.
5. Any implementation-level decision requiring reviewer approval.

Wait for my approval.

Do not write code until approval is given.

---

## After approval

Implement CB-024.

After implementation provide:

1. A complete summary of every file created or modified.
2. Confirmation that only CB-024 was implemented.
3. Any implementation inconsistency discovered.
4. Any recommendation requiring reviewer approval before the CB-024 Implementation Review.

Stop after CB-024 is complete.

Do not begin any subsequent work.

Wait for my review.
