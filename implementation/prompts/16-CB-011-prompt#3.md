Architectural review complete.

The proposed contract evolution is approved.

Implement the approved change together with CB-011.

Do not redesign the architecture.

Do not introduce any alternative API.

Do not introduce additional services.

Do not introduce optional behaviour.

The approved architectural decision is:

The Context Builder is the single public orchestration service.

It owns the Collection Engine.

It composes the Collection Engine during construction.

Therefore the ProviderRegistry is injected into the Context Builder constructor.

Approved public contract evolution

Update the factory signature from:

createContextBuilder(config)

to

createContextBuilder(config, registry)

where registry is a required ProviderRegistry.

Update the ContextBuilder interface to include:

collect(request): Promise<CollectionResult>

The implementation must delegate directly to the internally composed CollectionEngine.

The Context Builder must remain a thin orchestration layer.

It must not inspect, modify, filter, rank, deduplicate, enrich, or otherwise alter the returned CollectionResult.

Scope

Implement only:

- the approved ContextBuilder factory evolution
- internal CollectionEngine composition
- collect(request) delegation
- required documentation updates
- required test updates

Do not modify:

- ContextBuilderConfig
- ProviderRegistry
- CollectionEngine
- KnowledgeRequest
- CollectionResult
- CollectionError
- KnowledgeItem
- any other previously approved platform contract

The contract evolution must be the smallest possible change.

Required documentation updates

Because this changes a previously frozen public contract:

- update the CB-011 task document
- update MILESTONES.md if required
- update README.md if required
- update any documentation that explicitly documents the old createContextBuilder(config) signature

Record this as an approved architectural evolution rather than an implementation detail.

Required test updates

Update only the tests that directly depend on the previous factory signature.

Do not broaden test scope.

Implementation Guardrail

All other public contracts established by completed tasks remain frozen.

Do not modify any additional public contract.

If implementation appears to require another public contract change:

- Stop.
- Explain the issue.
- Wait for approval.

Composition Guardrail

Continue to extend the existing Context Builder.

Do not introduce a parallel orchestration service.

Do not introduce another Context Builder factory.

Do not introduce staged construction.

Do not introduce optional registry injection.

Do not introduce conditional collect() behaviour.

Validation

After implementation run:

- npm test
- npm run typecheck
- npm run build

All validation must pass.

Completion report

After implementation provide:

1. Summary of implementation.
2. Every created file.
3. Every modified file.
4. Exactly which public contract changed.
5. Confirmation that no other public contracts changed.
6. Implementation decisions.
7. Suggested Worklog entry.
8. Acceptance criteria review.
9. Confirmation that CB-012 is ready.

Do not commit.

Do not create a tag.

Do not begin CB-012.