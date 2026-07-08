Good catch.

Do not implement code yet.

Do not modify any files.

This is an architectural review triggered by the Implementation Guardrail.

The goal is to determine whether CB-011 can be implemented without changing the frozen CB-002 public contract.

Current situation

CB-002 defines:

createContextBuilder(config)

CB-011 requires:

- the Context Builder composes the Collection Engine
- the Collection Engine is created with createCollectionEngine(registry)
- Context Builder owns the Collection Engine
- collect(request) returns CollectionResult unchanged

The question is whether the ProviderRegistry must become a required parameter of createContextBuilder(), or whether the approved architecture can be satisfied through an additive design that preserves the frozen CB-002 contract.

Please perform a focused architectural review.

Do not implement.

Do not modify documentation.

Do not redesign the approved architecture.

Evaluate the following.

1. Can the approved architecture be satisfied while leaving

   createContextBuilder(config)

completely unchanged?

Consider additive integration approaches only.

Examples (not prescriptions):

- an additional factory
- an integration wrapper
- another additive public entry point

Do not assume these are correct.

Evaluate them critically.

2. For every viable additive approach explain:

- how ownership works
- where the Collection Engine is composed
- where the ProviderRegistry is injected
- whether Context Builder still owns orchestration
- whether the architecture remains consistent with CB-011
- whether any existing public contract changes

3. If an additive solution exists:

Recommend the best one.

Explain why it is superior to modifying the frozen CB-002 API.

4. If no additive solution satisfies the approved architecture:

Explain why.

Only then recommend changing

createContextBuilder(config)

to

createContextBuilder(config, registry)

with a required registry parameter.

Do not recommend:

- optional registry injection
- conditional collect() behaviour
- passing a pre-built CollectionEngine
- hidden runtime behaviour

Evaluation criteria

- preserve frozen contracts whenever reasonably possible
- preserve contract-first architecture
- preserve composition
- preserve deterministic behaviour
- avoid duplicate public APIs
- minimise architectural churn
- minimise impact on Milestone 1
- keep the public API coherent

Deliver:

1. Candidate designs considered.
2. Pros and cons of each.
3. Recommended design.
4. Whether CB-002 must change.
5. If a change is unavoidable, explain why no additive solution is architecturally sound.

Do not write code.

Do not modify files.

Wait for approval after the architectural recommendation.
