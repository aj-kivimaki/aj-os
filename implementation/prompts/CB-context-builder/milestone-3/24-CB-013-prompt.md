Implement CB-013 — Establish Selection Engine Service.

Milestone 3 planning has been reviewed and frozen.

The architecture is approved.

Do not redesign the architecture.

Do not modify milestone planning.

Implement only the approved CB-013 task.

Before writing any code, read:

1. implementation/CLAUDE.md
2. implementation/phase-2-core-platform/spec-002-context-builder/README.md
3. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
4. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
5. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-013.md

Also review the completed Milestone 2 implementation for consistency:

- Collection Engine (CB-007)
- CollectionResult (CB-009)
- Provider Execution (CB-010)
- Context Builder integration (CB-011)

CB-013 must follow the same implementation style, layout, documentation standards, immutability conventions, validation approach, and public export pattern established during Milestone 2.

──────────────────────────────────────────────
Scope
──────────────────────────────────────────────

Implement only the Selection Engine service boundary.

Implement exactly the responsibility defined in CB-013.

This task establishes the Selection Engine as an immutable service.

It does not implement:

- SelectionResult
- Selection Policy
- selection execution
- filtering
- prioritization
- ordering
- duplicate elimination
- Context Builder integration
- build(request)
- behaviour tests beyond the scope of CB-013

Do not begin CB-014.

──────────────────────────────────────────────
Implementation Requirements
──────────────────────────────────────────────

Mirror the architecture established by CB-007.

Implement only:

• SelectionEngine interface

• createSelectionEngine(...)

• immutable SelectionEngine handle

• public exports

• module documentation

Follow every existing naming convention.

Follow every existing folder convention.

Do not introduce new architecture.

Do not introduce placeholder methods unless explicitly required by the frozen task.

Do not invent future APIs.

The service boundary must remain minimal.

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

Update only documentation required by CB-013.

Follow the established Milestone 2 documentation pattern.

Update:

• module README

• task document

• milestone progress

• decision record

Only if required by the task.

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

9. Is CB-014 ready to begin?

Do not commit.

Do not create tags.

Do not begin CB-014.

If implementation requires changing a frozen public contract, stop immediately and produce a Contract Change Proposal instead of writing code.
