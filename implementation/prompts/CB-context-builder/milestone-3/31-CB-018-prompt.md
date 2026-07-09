Implement CB-018 — Selection Behaviour Tests.

Milestone 3 planning has been reviewed and frozen.

The architecture is approved.

Do not redesign the architecture.

Do not modify milestone planning.

Implement only the approved CB-018 task.

Before writing any code, read:

1. implementation/CLAUDE.md
2. implementation/phase-2-core-platform/spec-002-context-builder/README.md
3. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
4. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
5. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-018.md

Also review the completed implementations for consistency:

- CB-009 — CollectionResult contract
- CB-010 — Collection Engine execution
- CB-013 — Selection Engine
- CB-014 — SelectionResult contract
- CB-015 — Selection Policy
- CB-016 — Selection Execution
- CB-017 — Context Builder pipeline

CB-018 must follow the testing philosophy, documentation standards, engineering discipline, and implementation patterns established throughout Milestones 1–3.

──────────────────────────────────────────────
Frozen Planning Guardrail
──────────────────────────────────────────────

The Milestone 3 plan is frozen.

If you discover:

• a missing responsibility
• a required contract change
• an architectural inconsistency
• a public API evolution
• a dependency conflict

STOP.

Do not resolve it yourself.

Produce a Contract Change Proposal explaining:

1. the issue
2. why the frozen plan is insufficient
3. the smallest possible change
4. affected tasks
5. recommendation

Wait for approval before modifying code or planning documents.

──────────────────────────────────────────────
Composition Guardrail
──────────────────────────────────────────────

Implement new behaviour by composing previously completed contracts, services, and policies.

Do not duplicate logic that already exists.

Do not redefine previously implemented behaviour.

If existing functionality satisfies the task, compose it rather than creating a parallel implementation.

──────────────────────────────────────────────
Orchestration Guardrail
──────────────────────────────────────────────

When validating an orchestration task:

• validate the public pipeline

• never duplicate engine behaviour tests

• never move business logic into the orchestrator

• verify only that orchestration composes the existing stages correctly

The orchestrator coordinates.

The services decide.

──────────────────────────────────────────────
Regression Guardrail
──────────────────────────────────────────────

Behaviour tests must validate public guarantees.

Do not test internal implementation details.

Prefer asserting observable contracts over private sequencing.

If behaviour is already permanently covered by lower-layer tests, do not duplicate it here.

CB-018 owns the permanent ContextBuilder.build(request) pipeline regression suite.

Engine-level collection behaviour remains owned by CB-010.

──────────────────────────────────────────────
Scope
──────────────────────────────────────────────

Implement only the approved CB-018 task.

Create the permanent behaviour tests for the completed Milestone 3 pipeline.

Do not begin Milestone 4.

──────────────────────────────────────────────
Implementation Requirements
──────────────────────────────────────────────

Implement only:

• Selection Engine behaviour tests

• ContextBuilder.build(request) pipeline tests

• deterministic ordering tests

• filtering behaviour tests

• exact duplicate elimination tests

• SelectionResult validation

• documentation required by CB-018

Behaviour tests shall verify:

• build(request) returns the same SelectionResult as the equivalent manual engine composition

• deterministic execution across repeated runs

• filtering behaviour

• canonical ordering

• exact duplicate elimination

• duplicate routing to excludedItems

• metadata preservation

• immutable SelectionResult

• input immutability

• SelectionResult conforms to the public contract

Do not test:

• private helper functions

• comparator implementation details

• policy implementation internals

• engine internals already permanently tested

• provider execution (covered by CB-010)

Tests should validate observable platform behaviour through the public API.

──────────────────────────────────────────────
Validation
──────────────────────────────────────────────

Run:

npm run typecheck

npm test

npm run build

All validation must pass.

The completed Milestone 3 test suite should fully validate the public Selection pipeline.

──────────────────────────────────────────────
Documentation
──────────────────────────────────────────────

Update only documentation required by CB-018.

Follow the established documentation pattern from previous implementation tasks.

Update:

• module README

• task document

• decision record

• milestone progress

Only if required by the task.

Do not modify frozen milestone planning except for approved implementation tracking.

──────────────────────────────────────────────
Completion Report
──────────────────────────────────────────────

After implementation provide:

1. Summary

2. Every file created

3. Every file modified

4. Important implementation decisions

5. Suggested Worklog entry

6. Validation results

7. Acceptance criteria review

8. Reusable engineering principle discovered during implementation (if any)

9. Confirmation that Milestone 3 is complete and ready for the Freeze Review.

Do not commit.

Do not create tags.

Do not begin Milestone 4.

If implementation requires changing a frozen public contract, stop immediately and produce a Contract Change Proposal instead of writing code.