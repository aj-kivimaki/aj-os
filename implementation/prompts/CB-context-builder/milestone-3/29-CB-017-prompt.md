Implement CB-017 — Extend Context Builder Pipeline.

Milestone 3 planning has been reviewed and frozen.

The architecture is approved.

Do not redesign the architecture.

Do not modify milestone planning.

Implement only the approved CB-017 task.

Before writing any code, read:

1. implementation/CLAUDE.md
2. implementation/phase-2-core-platform/spec-002-context-builder/README.md
3. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
4. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
5. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-017.md

Also review the completed implementations for consistency:

- CB-007 — Collection Engine
- CB-010 — Collection Execution
- CB-011 — Context Builder integration (Milestone 2)
- CB-013 — Selection Engine
- CB-014 — SelectionResult contract
- CB-015 — Selection Policy
- CB-016 — Selection Execution

CB-017 must follow the implementation style, composition pattern, immutability conventions, documentation standards, public export pattern, and engineering discipline established during Milestones 1–3.

──────────────────────────────────────────────
Frozen Planning Guardrail
──────────────────────────────────────────────

The Milestone 3 plan is frozen.

If you discover:

• a missing responsibility
• a required contract change
• an architectural inconsistency
• a public API evolution beyond the approved design
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

CB-017 is an orchestration task.

The Context Builder owns orchestration.

The Collection Engine owns collection.

The Selection Engine owns selection.

──────────────────────────────────────────────
Scope
──────────────────────────────────────────────

Implement only the approved CB-017 task.

Extend the Context Builder pipeline.

Implement exactly the approved public API evolution.

Do not begin CB-018.

──────────────────────────────────────────────
Implementation Requirements
──────────────────────────────────────────────

Implement only:

• ContextBuilder.build(request)

• Context Builder orchestration

• Collection → Selection pipeline composition

• immutable SelectionResult returned unchanged

• required documentation updates

The Context Builder shall:

• compose the Collection Engine

• compose the Selection Engine

• call:

    await collectionEngine.collect(request)

followed by

    await selectionEngine.select(collectionResult)

• return the resulting SelectionResult unchanged

The Context Builder shall not:

• implement Selection Policy

• implement Collection behaviour

• inspect SelectionResult

• modify SelectionResult

• reorder selectedItems

• filter items

• eliminate duplicates

• construct ContextPackage

• communicate with providers directly

• maintain runtime state

The Context Builder remains a thin orchestrator.

──────────────────────────────────────────────
Public API
──────────────────────────────────────────────

Implement the approved public API evolution.

ContextBuilder exposes:

    build(request)

The previous public pipeline entry point:

    collect(request)

is superseded by build(request), exactly as approved during the Milestone 3 planning freeze.

CollectionEngine.collect()

remains unchanged.

SelectionEngine.select()

remains unchanged.

Do not introduce additional public methods.

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

Update only documentation required by CB-017.

Follow the established documentation pattern from previous implementation tasks.

Update:

• module README

• task document

• decision record

Only if required by the task.

Do not modify frozen milestone planning except where the approved public API evolution explicitly requires updating implementation documentation.

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

9. Is CB-018 ready to begin?

Do not commit.

Do not create tags.

Do not begin CB-018.

If implementation requires changing a frozen public contract beyond the approved build(request) evolution, stop immediately and produce a Contract Change Proposal instead of writing code.
