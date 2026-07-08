Read the following documents in order:

1. implementation/CLAUDE.md
2. docs/architecture/ARCH-001-...
3. docs/standards/AJS-001-...
4. docs/standards/AJS-002-...
5. docs/standards/AJS-004-...
6. docs/specifications/SPEC-002-...
7. implementation/phase-2-core-platform/spec-002-context-builder/README.md
8. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
9. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-005.md

Your objective is to implement **CB-005 only**.

Requirements:

- Stay strictly within the scope of CB-005.
- Do not implement future tasks.
- Implement only the immutable Provider Registry.
- Follow the existing factory-based platform architecture.
- Expose only the public registry contract.
- Implement `createProviderRegistry()`.
- Ensure the registry is immutable after construction.
- Reject duplicate providers during registry construction.
- Keep provider ordering deterministic.
- Do not implement provider execution.
- Do not implement provider discovery.
- Do not implement dependency injection.
- Do not implement plugin loading.
- Do not implement context collection.
- Do not implement ranking.
- Do not implement Context Package generation.
- Do not modify architecture, standards, specifications, or implementation documents unless required by the task.

The Provider Registry represents an immutable catalogue of KnowledgeProviders.

Its responsibility is limited to:

KnowledgeProviders
↓
Validation
↓
Immutable Registry
↓
Lookup

Nothing more.

Before implementing:

1. Summarize your understanding of the task.
2. Explain your implementation plan.
3. Identify ambiguities or architectural concerns.
4. If you recommend changes to the registry contract, explain them before writing code.

If you discover that the registry can be simplified while still satisfying the specification, prefer the simpler design and explain the reasoning before implementing it.

Implementation principles:

- Prefer immutable platform services.
- Prefer deterministic behaviour.
- Prefer composition over coupling.
- Keep the public API minimal.
- Do not expose implementation classes.
- Follow the existing factory pattern established by `createContextBuilder()`.
- Validate provider uniqueness during registry construction.
- Avoid speculative features.
- Avoid provider-specific logic.
- Avoid runtime mutation.
- Justify any additional functionality not described by the specification.

After implementation:

1. Run all relevant validation (typecheck, build, tests if applicable).
2. Summarize what was implemented.
3. List every created or modified file.
4. Explain all implementation decisions.
5. Suggest a Worklog entry.
6. Update the task status.
7. Update milestone task progress.
8. State whether CB-005 satisfies every acceptance criterion.
9. Report any recommendations for improving the implementation process or templates based on this task.
10. If you identify a reusable engineering principle, document it separately as an implementation recommendation without modifying any AJS documents.

Do not begin CB-006.

Stop after CB-005 is complete.
