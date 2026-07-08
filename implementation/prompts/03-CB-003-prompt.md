Read the following documents in order:

1. implementation/CLAUDE.md
2. docs/architecture/ARCH-001-...
3. docs/standards/AJS-001-...
4. docs/standards/AJS-002-...
5. docs/standards/AJS-004-...
6. docs/specifications/SPEC-002-...
7. implementation/phase-2-core-platform/spec-002-context-builder/README.md
8. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
9. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-003.md

Your objective is to implement **CB-003 only**.

Requirements:

- Stay strictly within the scope of CB-003.
- Do not implement future tasks.
- Use Zod for runtime validation.
- Define the Context Package contract only.
- Create immutable package structures.
- Expose only the public Context Package contract.
- Do not implement providers, collection, ranking, package generation, rendering, or business logic.
- If you believe the Context Package contract should differ from the task, explain why before making changes.
- Do not modify architecture, standards, specifications, or implementation documents unless required by the task.

The Context Package is the canonical output of the Context Builder.

Design it as a stable platform contract that future milestones will populate rather than redesign.

Before implementing:

1. Summarize your understanding of the task.
2. Explain your implementation plan.
3. Identify any ambiguities or architectural concerns.
4. If you recommend changes to the package contract, explain them before writing code.

During implementation:

- Keep the implementation deterministic.
- Prefer composition over coupling.
- Keep the public API minimal.
- Avoid speculative fields.
- Avoid provider-specific metadata.
- Avoid implementation-specific details.
- Justify any additional fields that are not described by the specification.

After implementation:

1. Run all relevant validation (typecheck, build, tests if applicable).
2. Summarize what was implemented.
3. List every created or modified file.
4. Explain any implementation decisions made.
5. Suggest a Worklog entry.
6. Update the task status.
7. Update milestone task progress.
8. State whether CB-003 satisfies every acceptance criterion.
9. Report any recommendations for improving the implementation process or templates based on this task.

Do not begin CB-004 or anticipate future milestones.

Stop after CB-003 is complete.

If you identify a reusable engineering principle during implementation, call it out separately. Do not modify AJS documents, but recommend whether the principle should remain implementation-specific or be promoted to a future engineering standard.
