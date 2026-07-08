Read the following documents in order:

1. implementation/CLAUDE.md
2. implementation/review/SPEC-FREEZE-REVIEW.md
3. docs/architecture/ARCH-001-...
4. docs/standards/AJS-001-...
5. docs/standards/AJS-002-...
6. docs/standards/AJS-004-...
7. docs/specifications/SPEC-002-...
8. implementation/phase-2-core-platform/spec-002-context-builder/README.md
9. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
10. implementation/phase-2-core-platform/spec-002-context-builder/RETROSPECTIVE.md

Review the completed implementation of SPEC-002 Milestone 1 using the Specification Freeze Review process.

This is an engineering review—not an implementation task.

Do not implement new features.

Do not redesign the architecture.

Do not expand public contracts.

Do not begin Milestone 2.

Your responsibility is to verify that the completed implementation matches the approved architecture, standards, and specification.

Follow every step of the Specification Freeze Review.

Review areas:

1. Architecture
   - Verify implementation matches ARCH-001.
   - Identify any deviations.

2. Standards
   - Verify implementation complies with AJS-001, AJS-002 and AJS-004.
   - Identify any violations.

3. Specification
   - Verify SPEC-002 Milestone 1 is fully implemented.
   - Confirm every implementation task (CB-001 through CB-006) satisfies the specification.

4. Public API
   - Review exported contracts.
   - Review factory APIs.
   - Review module boundaries.
   - Identify anything that should change before the platform is frozen.

5. Module Design
   - Review responsibilities.
   - Review cohesion.
   - Review unnecessary abstractions.
   - Review consistency across modules.

6. Documentation
   - Verify README.
   - Verify ROADMAP.
   - Verify implementation documentation.
   - Identify outdated or inconsistent documentation.

7. Deferred Improvements
   - Identify improvements that were intentionally postponed.
   - Do not implement them.
   - Recommend whether they should become future tasks.

8. Retrospective
   - Populate RETROSPECTIVE.md.
   - Record:
     - What worked well.
     - Engineering discoveries.
     - Process improvements.
     - Architectural observations.
     - Reusable implementation patterns.
     - Deferred improvements.
     - Recommendations for future specifications.

Review principles:

- Prefer simplicity over cleverness.
- Prefer consistency over novelty.
- Prefer explicit contracts over implicit behaviour.
- Prefer deterministic architecture.
- Do not recommend speculative abstractions.
- Do not recommend new features outside the approved specification.

At the end of the review:

1. State whether SPEC-002 Milestone 1 should be frozen.
2. List any required corrections before freezing.
3. Distinguish between:
   - Required corrections
   - Optional improvements
4. State whether the public platform contracts are stable.
5. State whether the implementation is ready for Milestone 2.
6. Provide a completed RETROSPECTIVE.md.
7. Summarize the review with an overall engineering assessment.

The review should conclude with one of three decisions:

PASS
Milestone may be frozen immediately.

PASS WITH MINOR CORRECTIONS
Only documentation or minor implementation corrections are required.

DO NOT FREEZE
Significant issues remain that must be resolved before freezing.

Do not make changes automatically.

Present recommendations first and wait for approval before modifying any files.
