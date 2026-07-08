Read the following documents in order:

1. implementation/CLAUDE.md
2. docs/architecture/ARCH-001-...
3. docs/standards/AJS-001-...
4. docs/standards/AJS-002-...
5. docs/standards/AJS-004-...
6. docs/specifications/SPEC-002-...
7. implementation/phase-2-core-platform/spec-002-context-builder/README.md
8. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
9. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-004.md

Your objective is to implement **CB-004 only**.

Requirements:

- Stay strictly within the scope of CB-004.
- Do not implement future tasks.
- Use Zod for runtime validation where applicable.
- Implement only the provider contracts.
- Define KnowledgeRequest, KnowledgeProvider and KnowledgeItem.
- Keep every contract immutable.
- Keep the public API minimal.
- Do not implement provider registry.
- Do not implement provider implementations.
- Do not implement collection.
- Do not implement ranking.
- Do not implement Context Package generation.
- Do not implement file access.
- Do not implement external integrations.
- Do not modify architecture, standards, specifications, or implementation documents unless required by the task.

The provider API should follow the platform contract:

KnowledgeRequest
↓
KnowledgeProvider
↓
KnowledgeItem[]
↓
Context Builder
↓
Context Package

The purpose of this task is to define the platform's input contracts—not the implementation of knowledge collection.

Before implementing:

1. Summarize your understanding of the task.
2. Explain your implementation plan.
3. Identify ambiguities or architectural concerns.
4. If you recommend changes to the provider contracts, explain them before writing code.

Implementation principles:

- Prefer stable platform contracts over implementation details.
- Prefer composition over coupling.
- Prefer immutable data structures.
- Keep providers completely provider-agnostic.
- Do not expose implementation classes.
- Use a single immutable request object instead of expanding method signatures.
- Avoid speculative fields.
- Avoid provider-specific metadata.
- Avoid filesystem implementation details.
- Justify any additional fields that are not described by the specification.

After implementation:

1. Run all relevant validation (typecheck, build, tests if applicable).
2. Summarize what was implemented.
3. List every created or modified file.
4. Explain all implementation decisions.
5. Suggest a Worklog entry.
6. Update the task status.
7. Update milestone task progress.
8. State whether CB-004 satisfies every acceptance criterion.
9. Report any recommendations for improving the implementation process or templates based on this task.
10. If you identify a reusable engineering principle, document it separately as an implementation recommendation without modifying any AJS documents.

Do not begin CB-005.

Stop after CB-004 is complete.

If a contract appears to be missing information, first determine whether it represents a stable platform concept or an implementation detail. Only introduce new fields or contracts when they represent stable platform concepts.
