# After SPEC-002

These items are intentionally deferred until the Context Builder specification is fully complete. They are based on proven practices from implementing SPEC-002 and should be revisited only after the specification has been reviewed, frozen, and retrospectively evaluated.

---

## Engineering Standards

- ✅ **Done — delivered as AJS-007 — Engineering Lifecycle Standard** (Draft; `docs/standards/AJS-007-Engineering-Lifecycle-Standard.md`). The standard documents milestone delivery as seven lifecycle stages — Planning, Planning Review, Planning Freeze, Implementation, Freeze Review, Milestone Freeze, Retrospective. During design, "Implementation Review" was folded into per-task Task Review plus the Freeze Review, and "Specification Freeze" was reconciled as the per-milestone Milestone Freeze; architecture sits outside the lifecycle by design.

- ✅ **Addressed in AJS-007 §6.** The reusable engineering principles discovered during SPEC-002 were reviewed: the repeatedly validated principles are promoted in §6.1, and single-milestone observations are retained as provisional candidates in §6.2. Further promotion follows the governance defined in AJS-007 §10.

---

## Templates

Create reusable engineering templates based on the proven SPEC-002 workflow:

- TASK-IMPLEMENTATION-PROMPT.md
- TASK-PLANNING-PROMPT.md
- TASK-REVIEW-PROMPT.md
- MILESTONE-PLANNING-PROMPT.md
- MILESTONE-REVIEW-PROMPT.md
- SPECIFICATION-REVIEW-PROMPT.md

---

## Documentation

Review the documentation hierarchy across AJ-OS.

Consider creating:

- DOCUMENTATION-HIERARCHY.md

to document the purpose and ownership of:

- Repository documentation
- Implementation framework documentation
- Specification documentation
- Package documentation
- Module documentation

---

## Engineering Process

Review the implementation workflow established during SPEC-002 and decide which practices become permanent project conventions.

Examples include:

- Contract-first development
- Implementation Guardrail
- Composition Guardrail
- Architectural Evolution Review
- Deterministic implementation requirements
- Documentation synchronization before milestone freeze
- Decision records
- Milestone retrospectives as durable engineering history

---

## Architecture

Review recurring internal utilities and patterns introduced during SPEC-002 for possible consolidation.

Examples:

- shared immutability helpers
- common factory patterns
- shared validation utilities

Only consolidate after SPEC-002 is complete.

---

These items are intentionally deferred to avoid interrupting implementation of SPEC-002. They should be evaluated using the completed specification as evidence rather than assumptions.

---

Finish SPEC-002
↓
Specification Retrospective
↓
Open implementation/backlog/AFTER-SPEC-002.md
↓
Evaluate each item
↓
Promote only the proven ones
