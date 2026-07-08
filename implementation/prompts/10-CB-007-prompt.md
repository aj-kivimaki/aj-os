Read the following documents in order:

1. implementation/CLAUDE.md
2. implementation/review/MILESTONE-PLANNING.md
3. ARCH-001
4. AJS-001
5. AJS-002
6. AJS-004
7. SPEC-002
8. implementation/phase-2-core-platform/spec-002-context-builder/README.md
9. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-007.md

Milestone 2 planning has been reviewed and frozen.

Implement **CB-007 only**.

Do not implement future tasks.

Do not redesign the architecture.

Do not modify the milestone plan.

The implementation must follow the approved contracts and planning documents.

Before implementing:

1. Summarize your understanding.
2. Explain your implementation plan.
3. Identify any ambiguities.
4. If an ambiguity requires changing the approved architecture or milestone plan, stop and explain it before writing code.

Implementation scope:

Implement only the Collection Engine service boundary defined by CB-007.

Provide only:

- Collection Engine module
- createCollectionEngine(registry)
- public CollectionEngine interface
- immutable service handle
- public exports
- documentation

Do not implement:

- provider execution
- CollectionResult
- CollectionError
- provider registry behaviour
- Context Builder integration
- ranking
- Context Package generation
- selection
- explainability
- business logic

Follow the same engineering principles established during Milestone 1:

- contract-first
- deterministic
- immutable
- explicit public APIs
- functional factories
- composition over inheritance
- no speculative abstractions

After implementation:

1. Run:

- npm test
- npm run typecheck
- npm run build

2. Summarize the implementation.

3. List every created and modified file.

4. Explain implementation decisions.

5. Suggest a Worklog entry.

6. Update:

- CB-007 task document
- MILESTONES.md
- README.md (only if required by the task)

7. State whether every acceptance criterion has been satisfied.

8. State whether CB-008 is now ready to begin.

Do not commit.

Do not create a tag.

Do not begin CB-008.
