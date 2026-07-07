Read the following documents in order:

1. implementation/CLAUDE.md
2. docs/architecture/ARCH-001-...
3. docs/standards/AJS-001-...
4. docs/standards/AJS-004-...
5. docs/specifications/SPEC-002-...
6. implementation/phase-2-core-platform/spec-002-context-builder/README.md
7. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
8. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-002.md

Your objective is to implement **CB-002 only**.

Requirements:

- Stay strictly within the scope of CB-002.
- Do not implement future tasks.
- Use Zod for runtime validation.
- Design a minimal immutable configuration contract.
- Expose a modern public factory API (`createContextBuilder()`).
- Do not implement providers, collection, ranking, or context generation.
- If you believe the public API or configuration contract should differ from this task, explain why before making changes.
- Do not modify architecture, standards or specifications.

Before implementing:

1. Summarize your understanding.
2. Explain your implementation plan.
3. Identify ambiguities, if any.

After implementation:

1. Run validation.
2. Summarize the implementation.
3. List every created or modified file.
4. Suggest a Worklog entry.
5. Update task status.
6. Update milestone task progress.
7. State whether CB-002 satisfies its acceptance criteria.
