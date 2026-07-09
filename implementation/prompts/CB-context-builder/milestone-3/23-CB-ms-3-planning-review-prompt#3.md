Apply the approved Milestone 3 planning corrections.

Do not implement code.

Do not modify implementation.

Modify planning documentation only.

The Milestone 3 Planning Review identified three required planning corrections. We have now completed the architectural decisions. Apply those decisions exactly as described below.

Read first:

1. implementation/CLAUDE.md
2. implementation/review/MILESTONE-PLANNING.md
3. implementation/phase-2-core-platform/spec-002-context-builder/README.md
4. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
5. implementation/phase-2-core-platform/spec-002-context-builder/architecture/PIPELINE-ARCHITECTURE.md
6. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-013.md
7. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-014.md
8. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-015.md
9. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-016.md
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-017.md
11. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-018.md

Do not modify any implementation files.

Only update planning documentation.

──────────────────────────────────────────────
R1 — Context Builder public API
──────────────────────────────────────────────

The approved architectural decision is:

• ContextBuilder exposes a single public pipeline entry point:

    build(request)

• build() always executes the highest-level pipeline currently implemented.

Examples:

Milestone 3

KnowledgeRequest
        ↓
Collection
        ↓
Selection
        ↓
SelectionResult

Milestone 4

KnowledgeRequest
        ↓
Collection
        ↓
Selection
        ↓
Assembly
        ↓
ContextPackage

• Individual pipeline engines expose stage-specific operations only.

CollectionEngine

    collect(request)

SelectionEngine

    select(collectionResult)

AssemblyEngine

    assemble(selectionResult)

• Intermediate pipeline stages remain internal to the Context Builder pipeline.

• Update every affected planning document so this becomes the documented architecture.

Do not implement code.

Do not invent new public APIs.

──────────────────────────────────────────────
R2 — Priority representation
──────────────────────────────────────────────

The approved decision is:

SelectionResult does NOT expose an explicit priority field.

The canonical deterministic ordering of selectedItems is the public contract.

Ordering is the platform guarantee.

Priority (if used internally) is an implementation detail.

Assembly consumes selectedItems exactly in the order provided.

Update every affected planning document.

──────────────────────────────────────────────
R3 — Deterministic ordering
──────────────────────────────────────────────

The approved architecture is:

Selection produces a canonical deterministic sequence.

The Selection Policy defines an ordered comparator chain.

Every comparator must be deterministic.

The comparator chain must terminate with an immutable platform identifier (for example KnowledgeItem.id) to guarantee a stable total ordering.

Do NOT define business-specific comparator heuristics.

Do NOT introduce scoring algorithms.

Do NOT introduce numeric priority values.

The architecture specifies deterministic guarantees, not ranking heuristics.

Update all affected planning documents accordingly.

──────────────────────────────────────────────
Additional planning clarifications
──────────────────────────────────────────────

Where appropriate:

• Clarify that Selection Policy is implemented as executable platform behaviour, not merely documentation.

• Ensure CB-015 clearly owns deterministic evaluation policy.

• Ensure CB-016 only executes that policy.

• Ensure CB-017 extends the Context Builder pipeline using the approved build() orchestration model.

• Ensure PIPELINE-ARCHITECTURE.md reflects the approved ownership model:

ContextBuilder
    ├── CollectionEngine
    ├── SelectionEngine
    └── (future AssemblyEngine)

• Ensure README and MILESTONES remain consistent with the updated architecture.

──────────────────────────────────────────────
Constraints
──────────────────────────────────────────────

Do not redesign the milestone.

Do not introduce new responsibilities.

Do not change milestone ordering.

Do not create new tasks.

Do not modify any frozen Milestone 1 or Milestone 2 implementation contracts.

Do not implement code.

Planning documentation only.

──────────────────────────────────────────────
After completing the updates provide:

1. Summary of every planning decision applied.
2. Every modified file.
3. Any planning inconsistency discovered while updating.
4. Confirmation that all planning documents remain internally consistent.
5. Confirmation that Milestone 3 is ready for freeze review after these updates.

Do not commit.

Do not create tags.

Do not begin implementation.