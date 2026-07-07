# Decision: CB-002 Configuration Contract

> **Task:** CB-002 — Define Context Builder Public Configuration Contract
> **Date:** 2026-07-07
> **Status:** Accepted

---

## Context

CB-002 defines the Context Builder's public configuration contract and factory
API — stable interfaces only, no behaviour. The task's design principles require
the contract to be **immutable, deterministic, explicit ("avoid hidden
defaults") and minimal ("model platform capabilities, not implementation
details")**. It names Context Profile, Explainability and Output Format as
example fields and explicitly excludes provider configuration, filesystem paths,
token limits and environment configuration. Several shape choices were open, so
they were made deliberately here.

## Decision

1. **Three required fields, no defaults.** The configuration is
   `{ profile, explainability, outputFormat }`. Every field is required and the
   Zod object is `.strict()` (unknown keys rejected). There are no `.default()`
   values — the contract is fully explicit, honouring "avoid hidden defaults."

2. **Fields map to stable, spec-defined capabilities only.**
   - `profile` — the five Context Profiles from SPEC-002 §6
     (`implementation | debugging | documentation | review | planning`).
   - `explainability` — boolean toggle for the explainability report (SPEC-002 §8).
   - `outputFormat` — primary Context Package rendering, `markdown | json`
     (SPEC-002 §8).
   No speculative fields (token budget, provider config, paths, env) are added;
   those belong to the tasks that implement those capabilities.

3. **Immutable at runtime and in types.** `parseContextBuilderConfig()` validates
   then `Object.freeze()`s the result; `ContextBuilderConfig` is a `Readonly<>`
   type inferred from the schema so the runtime and compile-time contracts cannot
   drift. `createContextBuilder()` also freezes the returned handle.

4. **Factory hides internals; minimal `ContextBuilder` interface.** The public
   surface is the `createContextBuilder(config)` function returning a
   `ContextBuilder` whose only member is `readonly config`. No implementation
   class is exposed. Behaviour (`build()` etc.) is added to this interface by
   later M1+ tasks rather than by changing it.

## Rationale

- Required fields + strict schema make invalid configuration fail loudly, which
  the task's validation section requires, and keep every capability visible.
- Deriving types from the schema (single source of truth) matches the existing
  `src/api/schemas.ts` convention and eliminates drift.
- Freezing delivers the "supplied once, never mutated" immutability principle in
  a way that is observable at runtime (verified in the smoke test).
- A one-member interface keeps the public API minimal and stable while leaving a
  clear extension point for future milestones.

## Consequences

- Consumers must pass all three fields explicitly; there is no
  `createContextBuilder({})` convenience form. This is the intended trade-off of
  "avoid hidden defaults." If ergonomic defaults are later desired, that is a
  contract change to be decided explicitly, not introduced silently.
- Adding a capability (e.g. token budget) is an additive schema change owned by
  the task that implements it.

## Alternatives Considered

- **Zod `.default()` for each field** (allowing `createContextBuilder({})`) —
  more ergonomic but introduces hidden defaults, which the task's "Explicit"
  principle forbids. Rejected.
- **Optional fields** — same hidden-default problem plus interacts awkwardly with
  `exactOptionalPropertyTypes`. Rejected.
- **Class-based `new ContextBuilder(config)`** — the task requires the modern
  functional factory pattern and that consumers never instantiate implementation
  classes. Rejected.
