Architectural Planning Review — Milestone 4 (Assembly)
Review type: Architectural Planning Review (pre-Planning Freeze)

Context

Thank you for the previous Milestone 4 planning review.

That review identified one genuine architectural gap:

- the absence of a deterministic strategy for assigning KnowledgeItems to Appendix B sections.

Rather than adopting the proposed implementation-level mapping (`source.type → section kind`), the architecture has been updated to acknowledge the requirement while intentionally leaving the specific mechanism undecided until Planning Review.

The architectural decisions below supersede the earlier planning where they differ.

This review concerns architecture only.

Do not redesign the milestone.
Do not propose implementation.
Do not decompose tasks.
Do not write code.

Review the approved architectural decisions for:

- internal consistency
- completeness
- separation of responsibilities
- contract ownership
- architectural boundaries
- scope discipline
- hidden assumptions
- future extensibility

Treat these decisions as the proposed architecture.

---

# AD-001 — Assembly Output

Assembly outputs an immutable ContextPackage.

The ContextPackage is the canonical structured representation of assembled context.

---

# AD-002 — Assembly Responsibility

Assembly performs structural composition only.

Assembly does not:

- render
- validate
- optimize
- explain decisions

---

# AD-003 — Canonical Representation

ContextPackage is the canonical structured representation between Selection and future stages.

Renderers consume ContextPackage.

Assembly never produces Markdown directly.

---

# AD-004 — Appendix B Alignment

ContextPackage mirrors the logical structure defined by Appendix B.

Assembly constructs that structure.

Renderers serialize it.

ContextPackage models logical structure rather than Markdown.

---

# AD-005 — Fixed Assembly Contract

Milestone 4 implements Appendix B v1.0 exactly.

Configurable schemas are intentionally excluded.

Future schema revisions occur through specification revision rather than runtime configuration.

---

# AD-006 — Metadata Ownership

Caller supplies:

- project
- task
- branch
- commit

Assembly generates:

- context_version
- generated_at
- context_builder_version

The completed ContextPackage contains both.

Version information is single-sourced.

---

# AD-007 — Determinism & Immutability

Assembly produces deterministic, deeply immutable ContextPackages.

Identical inputs produce identical ContextPackages except for intentionally variable metadata explicitly defined by the contract (for example `generated_at`).

Returned packages are immutable.

---

# AD-008 — Validation Boundary

Assembly owns construction.

Validation is a separate architectural responsibility.

Validation belongs to a future milestone.

---

# AD-009 — Explicit Scope Exclusions

Milestone 4 excludes:

- Markdown rendering
- JSON rendering
- MCP rendering
- explainability
- token estimation
- profile-specific assembly
- configurable schemas
- semantic optimization
- AI prompt optimization
- package validation
- caching
- streaming
- incremental assembly

---

# AD-010 — Section Classification Strategy

Assembly requires a deterministic strategy for assigning selected knowledge to the canonical Appendix B sections.

The existence of a section-classification strategy is part of the architecture.

The specific classification mechanism is intentionally left undecided during architectural planning because no frozen contract currently provides explicit section identity for KnowledgeItems.

Determining the mechanism is a Planning Review decision before implementation begins.

Any adopted strategy shall:

- be deterministic,
- preserve frozen contracts,
- avoid semantic evaluation unless explicitly approved,
- remain compatible with Appendix B.

---

Milestone objective

Implement deterministic structural assembly from SelectionResult to ContextPackage.

The milestone ends when the Assembly Engine can construct the canonical ContextPackage defined by Appendix B.

Rendering, validation, optimization, explainability, and profile-specific behavior remain outside Milestone 4.

---

Review objectives

Please review the architecture only.

Evaluate:

1. Executive Summary

2. Required Corrections

3. Optional Improvements

4. Items Already Correct

5. Recommendation

The goal is to determine whether the architectural planning is ready for Planning Freeze before the Milestone 4 Planning Package and task decomposition are written.

Please do not propose implementation or task decomposition unless a genuine architectural issue requires it.
