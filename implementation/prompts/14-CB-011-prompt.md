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
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-011.md

Milestone 2 planning has been reviewed and frozen.

Implement **CB-011 only**.

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

Implement only the **Context Builder integration** defined by CB-011.

Provide only:

- Context Builder integration with the Collection Engine
- CollectionEngine invocation
- CollectionResult return path
- public API updates required by the task
- documentation

The implementation must consume the existing contracts implemented in:

- CB-002 (Context Builder configuration)
- CB-004 (KnowledgeRequest)
- CB-005 (ProviderRegistry)
- CB-007 (CollectionEngine)
- CB-008 (CollectionError)
- CB-009 (CollectionResult)
- CB-010 (Provider execution)

Reuse those contracts.

Do not redefine or duplicate them.

---

## Behaviour Requirements

The Context Builder:

- composes the Collection Engine
- invokes `CollectionEngine.collect(request)`
- returns the resulting `CollectionResult`
- remains a thin orchestration layer
- owns orchestration only

Business logic remains inside the Collection Engine.

The Context Builder must not:

- inspect the CollectionResult
- modify the CollectionResult
- filter items
- filter errors
- rank knowledge
- deduplicate knowledge
- enrich results
- perform provider-specific behaviour

---

## Determinism Requirements

The implementation must preserve the deterministic behaviour already established.

Specifically:

- Collection Engine behaviour must remain deterministic.
- Provider Registry ordering must remain authoritative.
- CollectionResult ordering must not change.
- CollectionResult must remain immutable.
- The same KnowledgeRequest and ProviderRegistry must always produce the same CollectionResult.

---

## Implementation Requirements

- Compose existing platform services.
- Reuse existing platform contracts.
- Keep ContextBuilder stateless.
- Preserve immutable structures.
- Follow the established functional factory pattern.
- Prefer composition over inheritance.
- Avoid speculative abstractions.

---

## Implementation Guardrail

Existing public platform contracts established in previous completed tasks are considered frozen.

If implementation appears to require changing an existing public contract:

- Stop.
- Explain the issue.
- Explain why the current contract is insufficient.
- Propose the smallest possible change.
- Wait for approval.

Do not modify previously approved contracts without an explicit planning review.

---

## Composition Guardrail

Prefer extending existing platform services over introducing new services.

If the required behaviour can be implemented by composing or extending an existing approved service without changing its public contract:

- Extend the existing service.
- Do not introduce a parallel service.
- Do not duplicate orchestration responsibilities.

If a new service appears necessary:

- Stop.
- Explain why composition is insufficient.
- Wait for approval before introducing a new platform service.

---

## Do Not Implement

Do not implement:

- knowledge selection
- duplicate detection
- ranking
- explainability
- Context Package generation
- token estimation
- caching
- optimisation
- additional platform services

If implementation reveals a better integration model:

- Stop.
- Explain the reasoning.
- Do not silently redesign the platform.

---

## Validation

After implementation, run:

- npm test
- npm run typecheck
- npm run build

All validation must pass.

---

## Completion Report

After implementation:

1. Summarize the implementation.
2. List every created file.
3. List every modified file.
4. Explain the implementation decisions.
5. Suggest a Worklog entry.
6. Update:
   - CB-011 task document
   - MILESTONES.md
   - README.md (only if required by the task)
7. State whether every acceptance criterion has been satisfied.
8. State whether CB-012 is ready to begin.
9. If you discover a reusable engineering principle, document it separately without modifying any AJS standard.

Do not commit.

Do not create a tag.

Do not begin CB-012.
