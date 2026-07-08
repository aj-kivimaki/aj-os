Read the following documents in order:

1. implementation/CLAUDE.md
2. implementation/review/MILESTONE-PLANNING.md
3. ARCH-001
4. AJS-001
5. AJS-002
6. AJS-004
7. SPEC-002
8. implementation/phase-2-core-platform/spec-002-context-builder/README.md
9. implementation/phase-2-core-platform/spec-002-context-builder/MILESTONES.md
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-012.md

Milestone 2 planning has been reviewed and frozen.

Implement **CB-012 only**.

Do not implement future tasks.

Do not redesign the architecture.

Do not modify the milestone plan.

The implementation must follow the approved contracts and planning documents.

Before implementing:

1. Summarize your understanding.
2. Explain your implementation plan.
3. Identify any ambiguities.
4. If an ambiguity requires changing the approved architecture or milestone plan, stop and explain it before writing code.

---

## Implementation Scope

Implement only the permanent automated behaviour tests defined by CB-012.

Provide only:

- Collection Engine behaviour tests
- Context Builder integration tests
- Provider execution tests
- CollectionResult behaviour tests
- CollectionError behaviour tests
- deterministic execution tests
- documentation updates

The implementation must validate the existing platform.

Do not introduce new platform behaviour.

The implementation must exercise the existing contracts implemented in:

- CB-002 (Context Builder)
- CB-004 (KnowledgeProvider / KnowledgeItem / KnowledgeRequest)
- CB-005 (ProviderRegistry)
- CB-007 (CollectionEngine)
- CB-008 (CollectionError)
- CB-009 (CollectionResult)
- CB-010 (Provider execution)
- CB-011 (Context Builder integration)

Reuse those contracts exactly as implemented.

Do not redefine or duplicate them.

---

## Behaviour Requirements

The test suite must verify:

### Context Builder

- ContextBuilder.collect() delegates correctly.
- CollectionResult is returned unchanged.
- The Context Builder remains a thin orchestration layer.

### Collection Engine

- deterministic provider execution
- registry-authoritative ordering
- successful provider aggregation
- partial collection
- failed providers become CollectionErrors
- immutable CollectionResult

### CollectionResult

- valid runtime parsing
- invalid runtime parsing
- deep immutability
- metadata preservation
- KnowledgeItems and CollectionErrors composed correctly

### CollectionError

- valid parsing
- invalid parsing
- immutable structure
- deterministic failure representation

### Provider Execution

- all providers invoked
- provider failures do not abort collection
- deterministic output
- provider completion order never changes output ordering

---

## Determinism Requirements

The tests must prove that:

- registry order is authoritative
- Promise completion order cannot affect output ordering
- partial collection is deterministic
- CollectionResult remains immutable
- CollectionErrors remain immutable
- repeated execution with identical inputs produces equivalent results

No filesystem.

No network.

No randomness.

No timing-sensitive assertions.

---

## Implementation Requirements

- Extend the existing Vitest suite.
- Test only public APIs.
- Import through module entry points whenever possible.
- Keep tests deterministic.
- Keep tests readable.
- Follow the existing testing conventions established in CB-006.

---

## Implementation Guardrail

Existing public platform contracts established by completed tasks are considered frozen.

Do not modify any public contract.

If testing reveals a contract deficiency:

- Stop.
- Explain the issue.
- Explain why the contract is insufficient.
- Wait for approval.

Do not silently modify platform contracts.

---

## Composition Guardrail

Do not introduce new platform services.

Do not introduce testing-only production code.

Do not duplicate existing behaviour.

Test the existing implementation exactly as it exists.

---

## Do Not Implement

Do not implement:

- new platform behaviour
- knowledge selection
- duplicate detection
- ranking
- explainability
- Context Package generation
- optimisation
- caching
- diagnostics
- additional public APIs

If testing exposes an architectural issue:

- Stop.
- Explain the issue.
- Wait for approval.

---

## Validation

After implementation run:

- npm test
- npm run typecheck
- npm run build

All validation must pass.

The complete test suite should remain green.

---

## Completion Report

After implementation provide:

1. Summary of implementation.
2. Every created file.
3. Every modified file.
4. Test coverage added.
5. Validation results.
6. Implementation decisions.
7. Suggested Worklog entry.
8. Acceptance criteria review.
9. Confirmation that Milestone 2 is complete.
10. If you discover a reusable engineering principle, document it separately without modifying any AJS standard.

Do not commit.

Do not create a tag.

Do not begin Milestone 2 freeze activities.
