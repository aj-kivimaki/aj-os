Approved.

Proceed with Option A.

Apply the smallest possible planning clarification and then complete CB-017 in the same implementation.

Do not redesign the milestone.

Do not change any public contract beyond the already-approved build(request) evolution.

──────────────────────────────────────────────
Approved reconciliation strategy
──────────────────────────────────────────────

The permanent regression strategy evolves with the public API.

ContextBuilder.collect() is no longer a public API.

Therefore its builder-level regression suite is retired.

Collection behaviour remains permanently covered by the Collection Engine regression suite.

CB-018 becomes the permanent owner of the ContextBuilder.build(request) pipeline regression suite.

No behavioural coverage is intentionally removed from the completed milestone.

──────────────────────────────────────────────
Required planning changes
──────────────────────────────────────────────

Apply only the minimum planning clarification:

• Update CB-017 to state that the obsolete ContextBuilder.collect() builder-level regression suite is retired as part of the approved public API evolution.

• Update CB-018 to explicitly own the permanent ContextBuilder.build(request) pipeline regression suite.

• Update MILESTONES.md only if required to record the regression-strategy migration.

Do not redesign tasks.

Do not change responsibilities.

Do not modify any other planning documents.

──────────────────────────────────────────────
Implementation
──────────────────────────────────────────────

After applying the approved planning clarification:

• Complete the full CB-017 implementation.

• Remove the obsolete builder.collect regression suite.

• Do not replace it with temporary bridge tests.

• Do not move engine behaviour tests.

• Leave permanent build(request) behaviour testing entirely to CB-018.

──────────────────────────────────────────────
Completion report
──────────────────────────────────────────────

Provide:

1. Every planning file modified.

2. Every implementation file modified.

3. Every removed test file.

4. Confirmation that no behavioural coverage was intentionally lost.

5. Validation results.

6. Updated acceptance criteria review.

7. Confirmation that CB-018 is fully unblocked.

Do not commit.

Do not create tags.

Do not begin CB-018.
