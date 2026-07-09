We are now entering the Implementation stage of SPEC-002 Milestone 4.

The following artifacts are frozen and are the implementation baseline:

- AJS-007 Engineering Lifecycle Standard
- Milestone 4 Architecture (AD-001–AD-010)
- Milestone 4 Planning Package
- CB-019 through CB-024 task documents

Treat these artifacts as immutable.

Do not redesign the architecture.

Do not modify the Planning Package.

Do not modify any frozen contract.

Changes require a Frozen Plan Change Proposal.

---

# Task

Implement **CB-019 — Assembly Engine Service Boundary** only.

Do not begin work on CB-020 or any later task.

CB-019 establishes the immutable, stateless Assembly Engine boundary, mirroring the Selection Engine pattern.

Its responsibilities are limited to:

- create the AssemblyEngine service boundary
- expose `createAssemblyEngine()`
- expose the `AssemblyEngine` interface
- define the `assemble(...)` API surface (no implementation behaviour)
- ensure the engine is immutable
- ensure the engine holds no state at construction
- wire public exports
- update implementation-level documentation

CB-019 explicitly excludes:

- section composition
- metadata composition
- ContextPackage construction
- rendering
- validation logic
- pipeline integration
- behaviour tests beyond boundary verification

---

## Before writing code

Review the frozen CB-019 task and provide:

1. A concise summary of the task.
2. Every file that will be created or modified.
3. Why each file changes.
4. Confirmation that every planned change stays within the frozen scope.
5. Any implementation-level decision requiring reviewer approval.

Wait for my approval.

Do not write code until approval is given.

---

## After approval

Implement CB-019.

After implementation provide:

1. A complete summary of every file changed.
2. Confirmation that only CB-019 was implemented.
3. Any implementation inconsistency discovered.
4. Any recommendation requiring reviewer approval before CB-019 is frozen.

Do not begin CB-020.

Wait for the CB-019 Implementation Review before proceeding.