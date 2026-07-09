Implement CB-014 — SelectionResult Contract.

Milestone 3 planning has been reviewed and frozen.

The architecture is approved.

Do not redesign the architecture.

Do not modify milestone planning.

Implement only the approved CB-014 task.

Before writing any code, read:

1. implementation/CLAUDE.md
2. implementation/phase-2-core-platform/spec-002-context-builder/README.md
3. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
4. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
5. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-014.md

Also review the completed implementations for consistency:

- CB-004 — KnowledgeItem contract
- CB-007 — Collection Engine
- CB-008 — CollectionError contract
- CB-009 — CollectionResult contract
- CB-013 — Selection Engine

CB-014 must follow the same implementation style, folder layout, contract conventions, runtime validation pattern, immutability model, public exports, documentation standards, and testing philosophy established during Milestones 1–2.

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

Implement only the SelectionResult contract.

Implement exactly the responsibility defined in CB-014.

This task establishes the immutable SelectionResult data contract.

It does not implement:

- Selection Policy
- Selection Engine execution
- filtering
- prioritization
- ordering logic
- duplicate elimination
- Context Builder integration
- build(request)
- behaviour beyond contract validation

Do not begin CB-015.

──────────────────────────────────────────────
Implementation Requirements
──────────────────────────────────────────────

Mirror the architecture established by CB-009.

Implement only:

• SelectionResult schema

• runtime validation

• parseSelectionResult()

• immutable deep-frozen contract

• TypeScript types

• public exports

• module documentation

The SelectionResult contract represents the complete deterministic outcome of selection.

It contains:

• metadata

• selectedItems

• excludedItems

SelectionResult shall:

• compose existing platform contracts

• reuse KnowledgeItem

• introduce no priority field

• expose the canonical deterministic ordering through selectedItems only

• preserve original KnowledgeItems without modification

SelectionResult must be:

• .strict()

• validated

• deep-frozen

• immutable

Do not introduce:

- priority
- score
- ranking value
- timestamps
- counters
- diagnostics
- execution metadata
- runtime information

Ordering is the public contract.

Priority remains an implementation detail.

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

Update only documentation required by CB-014.

Follow the established documentation pattern from CB-008 and CB-009.

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

9. Is CB-015 ready to begin?

Do not commit.

Do not create tags.

Do not begin CB-015.

If implementation requires changing a frozen public contract, stop immediately and produce a Contract Change Proposal instead of writing code.
