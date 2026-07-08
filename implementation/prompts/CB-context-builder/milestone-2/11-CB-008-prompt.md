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
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-008.md

Milestone 2 planning has been reviewed and frozen.

Implement **CB-008 only**.

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

Implement only the CollectionError contract defined by CB-008.

Provide only:

- CollectionError Zod schema
- runtime validation
- immutable CollectionError contract
- TypeScript types
- parseCollectionError() (validate + freeze)
- public exports
- documentation

The implementation must follow the same contract pattern established by:

- CB-002 (Configuration)
- CB-003 (Context Package)
- CB-004 (Knowledge Provider)
- CB-009 (future CollectionResult will consume this contract)

Do not implement:

- CollectionResult
- provider execution
- Collection Engine behaviour
- Context Builder integration
- retry logic
- recovery behaviour
- logging
- ranking
- Context Package generation
- business logic

Implementation requirements:

- Use Zod for runtime validation.
- Use TypeScript inference.
- Use .strict() schemas.
- Use immutable structures.
- Use DeepReadonly where appropriate.
- Deep-freeze parsed contracts.
- Export only stable public APIs.
- Follow the existing config/, package/, and providers/ module patterns.

The CollectionError contract represents a deterministic platform error.

It must be provider-agnostic.

It must not expose implementation-specific exceptions, stack traces, or runtime objects.

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

- CB-008 task document
- MILESTONES.md
- README.md (only if required by the task)

7. State whether every acceptance criterion has been satisfied.

8. State whether CB-009 is now ready to begin.

9. If you discover a reusable engineering principle, document it separately without modifying any AJS standard.

Do not commit.

Do not create a tag.

Do not begin CB-009.
