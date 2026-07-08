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
10. implementation/phase-2-core-platform/spec-002-context-builder/tasks/CB-010.md

Milestone 2 planning has been reviewed and frozen.

Implement **CB-010 only**.

Do not implement future tasks.

Do not redesign the architecture.

Do not modify the milestone plan.

The implementation must follow the approved contracts and planning documents.

Before implementing:

1. Summarize your understanding.
2. Explain your implementation plan.
3. Identify any ambiguities.
4. If an ambiguity requires changing the approved architecture or milestone plan, stop and explain it before writing code.

Implementation scope:

Implement only the deterministic Provider Execution behaviour defined by CB-010.

Provide only:

- deterministic provider execution
- KnowledgeProvider invocation
- KnowledgeItem aggregation
- CollectionError aggregation
- CollectionResult construction
- documentation

The implementation must consume the existing contracts implemented in:

- CB-004 (KnowledgeProvider / KnowledgeItem)
- CB-005 (ProviderRegistry)
- CB-007 (CollectionEngine)
- CB-008 (CollectionError)
- CB-009 (CollectionResult)

Reuse those contracts.

Do not redefine or duplicate them.

Behaviour requirements:

- Execute registered providers through the injected ProviderRegistry.
- Return a CollectionResult.
- Successful providers contribute KnowledgeItems.
- Failed providers contribute CollectionErrors.
- Collection continues when a provider fails.
- Do not retry.
- Do not recover.
- Do not log.
- Do not throw provider failures once collection has begun.
- Represent failures exclusively as CollectionError objects.

Determinism requirements:

- ProviderRegistry order is authoritative.
- Provider completion order must never influence CollectionResult ordering.
- The same registry and KnowledgeRequest must always produce the same CollectionResult structure.
- CollectionResult must remain immutable.

Implementation requirements:

- Compose existing platform contracts.
- Keep CollectionEngine stateless.
- Preserve immutable structures.
- Follow existing factory-service conventions.
- Use composition rather than inheritance.
- Avoid speculative abstractions.

Implementation Guardrail

Existing public platform contracts established in previous completed tasks are considered frozen.

If implementation appears to require changing an existing public contract:

- Stop.
- Explain the issue.
- Explain why the current contract is insufficient.
- Propose the smallest possible change.
- Wait for approval.

Do not modify previously approved contracts without an explicit planning review.

Do not implement:

- Context Builder integration
- knowledge selection
- duplicate detection
- ranking
- explainability
- Context Package generation
- token estimation
- caching
- optimisation

If implementation reveals a better execution model:

Stop.

Explain the reasoning.

Do not silently redesign the platform.

After implementation:

1. Run:

- npm test
- npm run typecheck
- npm run build

2. Summarize the implementation.

3. List every created and modified file.

4. Explain implementation decisions.

5. Suggest a Worklog entry.

6. Update:

- CB-010 task document
- MILESTONES.md
- README.md (only if required by the task)

7. State whether every acceptance criterion has been satisfied.

8. State whether CB-011 is now ready to begin.

9. If you discover a reusable engineering principle, document it separately without modifying any AJS standard.

Do not commit.

Do not create a tag.

Do not begin CB-011.
