# After SPEC-002

These items are intentionally deferred until the Context Builder specification is fully complete. They are based on proven practices from implementing SPEC-002 and should be revisited only after the specification has been reviewed, frozen, and retrospectively evaluated.

---

## Engineering Standards

- Create an **Engineering Lifecycle Standard** documenting the complete AJ-OS engineering workflow:
  - Planning
  - Planning Review
  - Planning Freeze
  - Implementation
  - Implementation Review
  - Milestone Freeze Review
  - Milestone Freeze
  - Retrospective
  - Specification Freeze

- Review the reusable engineering principles discovered during SPEC-002 and determine which should be promoted into AJS standards.

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
