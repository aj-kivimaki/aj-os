Implement CB-015 — Selection Policy.

Milestone 3 planning has been reviewed and frozen.

The architecture is approved.

Do not redesign the architecture.

Do not modify milestone planning.

Implement only the approved CB-015 task.

Before writing any code, read:

1. implementation/CLAUDE.md
2. implementation/phase-2-core-platform/spec-002-context-builder/README.md
3. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
4. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
5. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-015.md

Also review the completed implementations for consistency:

- CB-004 — KnowledgeItem contract
- CB-009 — CollectionResult contract
- CB-013 — Selection Engine
- CB-014 — SelectionResult contract

CB-015 must follow the same implementation style, folder layout, immutability conventions, documentation standards, public export pattern, and engineering discipline established during Milestones 1–2.

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

Additional guardrail:

If implementing duplicate elimination requires defining the platform meaning of "exact duplicate":

STOP.

Do not invent the definition.

Produce a Contract Change Proposal describing:

• why the definition is required
• why the current planning is insufficient
• the smallest planning addition needed

Wait for approval before implementing duplicate elimination.

──────────────────────────────────────────────
Scope
──────────────────────────────────────────────

Implement only the Selection Policy.

Implement exactly the responsibility defined in CB-015.

This task establishes the executable deterministic Selection Policy.

It does not implement:

- Selection Engine execution
- SelectionResult construction
- Context Builder integration
- build(request)
- Context Package generation
- explainability
- behaviour tests

Do not begin CB-016.

──────────────────────────────────────────────
Implementation Requirements
──────────────────────────────────────────────

Implement only the Selection Policy.

The Selection Policy is executable platform behaviour.

Mirror the approved Milestone 3 architecture.

Implement only:

• deterministic evaluation policy

• deterministic filtering policy

• deterministic comparator chain

• deterministic ordering policy

• exact duplicate elimination policy (only if fully defined by the frozen plan)

• module documentation

The Selection Policy shall:

• remain deterministic

• remain stateless

• preserve KnowledgeItems unchanged

• define the ordered comparator chain

• terminate the comparator chain with an immutable platform identifier

The Selection Policy shall not:

• execute the Selection Engine

• construct SelectionResult

• communicate with providers

• modify KnowledgeItems

• expose priority

• expose score

• expose ranking values

• introduce runtime state

Ordering is the public guarantee.

Comparator implementation remains internal platform behaviour.

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

Update only documentation required by CB-015.

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

9. Is CB-016 ready to begin?

Do not commit.

Do not create tags.

Do not begin CB-016.

If implementation requires changing a frozen public contract, stop immediately and produce a Contract Change Proposal instead of writing code.