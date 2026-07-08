Read the following documents in order:

1. implementation/CLAUDE.md
2. docs/architecture/ARCH-001-...
3. docs/standards/AJS-001-...
4. docs/standards/AJS-002-...
5. docs/standards/AJS-004-...
6. docs/specifications/SPEC-002-...
7. implementation/phase-2-core-platform/spec-002-context-builder/README.md
8. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
9. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-006.md

Your objective is to implement **CB-006 only**.

Requirements:

- Stay strictly within the scope of CB-006.
- Establish the permanent contract testing foundation.
- Configure a modern TypeScript test framework (prefer Vitest unless a strong architectural reason suggests otherwise).
- Replace the ad-hoc validation harnesses introduced during CB-001 through CB-005 with permanent automated tests where appropriate.
- Test only public contracts and public services.
- Keep tests deterministic.
- Keep tests fast.
- Keep tests readable.
- Do not implement future milestones.
- Do not modify public platform contracts unless implementation exposes a genuine defect.
- Do not implement provider behaviour, collection, ranking, or Context Package generation.

The testing foundation should permanently validate:

- Context Builder configuration
- Context Package
- KnowledgeRequest
- KnowledgeItem
- KnowledgeProvider
- Provider Registry
- Factory APIs

Before implementing:

1. Summarize your understanding.
2. Explain your implementation plan.
3. Identify ambiguities.
4. If you recommend changing any existing implementation to improve testability, explain the reasoning before making changes.

Implementation principles:

- Public contracts are the testing target.
- Tests should document expected behaviour.
- Prefer contract tests over implementation tests.
- Avoid testing private implementation details.
- Avoid filesystem, network, randomness, and timing dependencies.
- Keep the implementation minimal.

After implementation:

1. Run the complete test suite.
2. Run typecheck.
3. Run build.
4. Summarize the implementation.
5. List every created or modified file.
6. Explain implementation decisions.
7. Suggest a Worklog entry.
8. Update task status.
9. Update milestone task progress.
10. State whether every acceptance criterion has been satisfied.
11. Report any recommendations for improving the implementation process or templates.

Do not begin Milestone 2.

Stop after CB-006 is complete.
