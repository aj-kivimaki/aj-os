Implement CB-016 — Selection Execution.

Milestone 3 planning has been reviewed and frozen.

The architecture is approved.

Do not redesign the architecture.

Do not modify milestone planning.

Implement only the approved CB-016 task.

Before writing any code, read:

1. implementation/CLAUDE.md
2. implementation/phase-2-core-platform/spec-002-context-builder/README.md
3. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
4. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
5. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-016.md

Also review the completed implementations for consistency:

- CB-009 — CollectionResult contract
- CB-010 — Collection Engine execution
- CB-013 — Selection Engine
- CB-014 — SelectionResult contract
- CB-015 — Selection Policy

CB-016 must follow the same implementation style, folder layout, immutability conventions, documentation standards, public export pattern, testing philosophy, and engineering discipline established during Milestones 1–2 and the completed Milestone 3 tasks.

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
Scope
──────────────────────────────────────────────

Implement only the Selection Engine execution.

Implement exactly the responsibility defined in CB-016.

This task executes the approved Selection Policy against a CollectionResult and constructs a SelectionResult.

It does not implement:

- Selection Policy
- Context Builder integration
- build(request)
- Context Package generation
- explainability
- behaviour tests beyond the scope of CB-016

Do not begin CB-017.

──────────────────────────────────────────────
Implementation Requirements
──────────────────────────────────────────────

Mirror the architecture established by CB-010.

Implement only:

• SelectionEngine.select(collectionResult)

• execution of the approved Selection Policy

• SelectionResult construction

• immutable SelectionResult output

• module documentation

Selection execution shall:

• consume CollectionResult

• evaluate every KnowledgeItem

• apply the approved filtering policy

• apply the approved comparator chain

• eliminate exact duplicates using the approved definition

• retain the first occurrence in canonical order

• route subsequent duplicates to excludedItems

• construct SelectionResult using parseSelectionResult()

• return an immutable SelectionResult

Selection execution shall not:

• modify KnowledgeItems

• redefine Selection Policy

• introduce new comparators

• expose comparator functions publicly

• introduce priority

• introduce score

• introduce ranking values

• communicate with providers

• access external services

• maintain runtime state

Execution is responsible for applying policy.

Policy remains responsible for defining decisions.

──────────────────────────────────────────────
Validation
──────────────────────────────────────────────

Run:

npm run typecheck

npm test

npm run build

All validation must pass.

Do not suppress failing tests.

──────────────────────────────────────────────
Documentation
──────────────────────────────────────────────

Update only documentation required by CB-016.

Follow the established documentation pattern from previous implementation tasks.

Update:

• module README

• task document

• decision record

Only if required by the task.

Do not modify frozen milestone planning.

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

9. Is CB-017 ready to begin?

Do not commit.

Do not create tags.

Do not begin CB-017.

If implementation requires changing a frozen public contract, stop immediately and produce a Contract Change Proposal instead of writing code.
