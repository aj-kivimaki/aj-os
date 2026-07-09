Approved.

Proceed with the smallest possible planning correction and then complete CB-015.

Do not redesign the milestone.

Do not change any public contract.

Do not introduce new behaviour beyond the approved definition.

Use the following definition.

──────────────────────────────────────────────
Exact Duplicate Definition
──────────────────────────────────────────────

Two KnowledgeItems are exact duplicates if and only if:

• their content values are identical, and

• their entire source objects (id, type, title, locator) are structurally identical.

KnowledgeItem.id is explicitly excluded from duplicate identity.

KnowledgeItem.id exists solely as the immutable deterministic ordering tie-breaker and must never participate in duplicate identity.

No normalization or transformation is applied.

"Exact" means literal structural equality.

When duplicate elimination occurs, the first occurrence in canonical Selection Policy order is retained and every subsequent duplicate is moved to excludedItems.

──────────────────────────────────────────────
Required changes
──────────────────────────────────────────────

Apply the smallest possible documentation update to the frozen Milestone 3 planning:

• Add the approved "Exact Duplicate Definition" subsection to CB-015.

• Update CB-016 only where necessary to reference the approved definition.

• Update CB-018 only where necessary so behaviour tests validate the approved definition.

Do not redesign any task.

Do not change milestone ordering.

Do not introduce new responsibilities.

Do not modify public contracts.

──────────────────────────────────────────────
Implementation
──────────────────────────────────────────────

After the planning clarification is applied, complete the remaining duplicate-elimination policy work for CB-015 using the approved definition.

Do not begin CB-016.

──────────────────────────────────────────────
Completion report
──────────────────────────────────────────────

Provide:

1. Every planning file modified.
2. Every implementation file modified.
3. Confirmation that the planning clarification is the only planning change.
4. Confirmation that no public contract changed.
5. Validation results.
6. Updated acceptance criteria review.
7. Confirmation that CB-016 is now fully unblocked.

Do not commit.

Do not create tags.

Do not begin CB-016.
