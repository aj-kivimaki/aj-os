Read the following documents in order:

1. implementation/CLAUDE.md
2. implementation/review/MILESTONE-PLANNING.md
3. docs/architecture/ARCH-001-...
4. docs/standards/AJS-001-...
5. docs/standards/AJS-002-...
6. docs/standards/AJS-004-...
7. docs/specifications/SPEC-002-...
8. implementation/phase-2-core-platform/spec-002-context-builder/README.md
9. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-007.md
11. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-008.md
12. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-009.md
13. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-010.md
14. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-011.md
15. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-012.md

Review the complete Milestone 2 implementation plan using the Milestone Planning Review process.

This is an engineering planning review—not an implementation task.

Do not implement code.

Do not redesign the approved architecture.

Do not begin CB-007.

Your responsibility is to verify that the milestone plan is complete, coherent, and ready for implementation.

Follow every step of the Milestone Planning Review.

Review the milestone as a whole.

Review areas:

1. Milestone Objective
   - Is the objective clear?
   - Does the milestone have one primary responsibility?

2. Scope
   - Is the scope well defined?
   - Is deferred functionality correctly postponed?

3. Task Breakdown
   - Does every task have exactly one responsibility?
   - Are responsibilities overlapping?
   - Are responsibilities missing?

4. Dependencies
   - Are task dependencies correct?
   - Is the implementation order appropriate?
   - Would you reorder any tasks?

5. Contract Review
   - Are new contracts introduced before behaviour?
   - Are public APIs stable?
   - Are service boundaries consistent with Milestone 1?

6. Increment Review
   - Does every completed task leave the platform in a better working state?
   - Does every task produce a meaningful implementation increment?

7. Validation Strategy
   - Is every behavioural capability permanently tested?
   - Are validation responsibilities correctly assigned?

8. Risk Review
   - Identify architectural risks.
   - Identify implementation risks.
   - Identify sequencing risks.
   - Recommend mitigations if necessary.

9. Milestone Coherence
   - Does the milestone tell one coherent implementation story?
   - Does it prepare Milestone 3 cleanly?
   - Is the platform layering preserved?

Review principles:

- Prefer simplicity over cleverness.
- Prefer consistency over novelty.
- Prefer deterministic behaviour.
- Prefer explicit contracts.
- Prefer composition over expansion.
- Avoid speculative abstractions.
- Avoid introducing future milestone behaviour.

At the end of the review:

1. State whether Milestone 2 is ready for implementation.
2. List any required corrections.
3. Distinguish between:
   - Required corrections
   - Optional improvements
4. Recommend whether the milestone plan should be frozen.
5. State whether CB-007 can begin immediately after the review.
6. Identify reusable engineering principles discovered during planning.
7. Suggest improvements to future milestone planning if applicable.

Conclude with one of three decisions:

PASS
The milestone plan may be frozen immediately.

PASS WITH MINOR CORRECTIONS
Only small documentation or sequencing improvements are recommended.

DO NOT FREEZE
Significant planning issues remain.

Do not modify any files automatically.

Present recommendations first and wait for approval before making changes.
