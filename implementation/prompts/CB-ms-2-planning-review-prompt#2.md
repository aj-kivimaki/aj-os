Good review. I agree with the required corrections.

Please apply the planning corrections only.

Do not implement any code.

Do not modify the approved architecture.

Do not begin implementation.

The architecture decision has already been made:

The Context Builder uses a **partial collection with deterministic error reporting** model.

Collection never fails because a single provider fails.

A provider may contribute either:

- KnowledgeItems
- CollectionErrors

The CollectionResult represents the complete deterministic outcome of collection and therefore contains both:

- items
- errors

Please update the Milestone 2 planning documents accordingly.

Required changes

R1.

Record the failure model consistently across the milestone.

State that collection is partial rather than fail-fast.

CollectionResult contains both:

- KnowledgeItem[]
- CollectionError[]

R2.

Reorder the milestone tasks to restore the contract-first implementation strategy.

New implementation order:

CB-007 — Collection Engine

CB-008 — Collection Error Contract

CB-009 — CollectionResult Contract

CB-010 — Provider Execution

CB-011 — Context Builder Integration

CB-012 — Collection Behaviour Tests

Update every affected dependency list, milestone table, README, and roadmap as required.

R3.

Update CB-010 so it no longer mixes provider execution with error handling.

Provider Execution should simply surface CollectionErrors using the contract established in CB-008.

Do not introduce retry, recovery, logging, or policy.

R4.

Update CB-011.

Explicitly define the integration point.

The Context Builder pipeline becomes:

KnowledgeRequest
↓
Collection Engine
↓
Provider Registry
↓
Knowledge Providers
↓
KnowledgeItems
CollectionErrors
↓
CollectionResult

State clearly that the Context Builder integrates both successful knowledge and collection errors.

R5.

Update CB-012.

Extend the permanent test plan to include:

- CollectionError contract validation
- invalid CollectionErrors
- immutable CollectionErrors
- partial collection
- deterministic error ordering
- CollectionResult containing both items and errors

Also apply the following optional improvements:

O1.

Specify that ProviderRegistry is injected into the Collection Engine during construction.

Example:

createCollectionEngine(registry)

The Context Builder composes the Collection Engine rather than owning the registry.

O2.

State explicitly that provider completion order must never influence CollectionResult ordering.

Registry order is authoritative.

O3.

Remove any unnecessary dependency declarations created by the previous ordering.

O4.

Correct any outdated document references (for example AJS-002 naming).

O5.

Do not add additional behavioural tests before CB-012.

Keep the Milestone 1 testing strategy.

After applying the changes:

1. Summarize every modified document.
2. Explain every planning decision.
3. Confirm that all milestone documents remain internally consistent.
4. State whether Milestone 2 is now ready to freeze.
5. If any issue still blocks freezing, identify it explicitly.

Do not implement code.

Do not modify files outside the planning documentation.

Do not begin CB-007 implementation.

