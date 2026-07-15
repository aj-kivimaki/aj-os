# EOS-D1 — CandidateKnowledge Contract Ownership

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-003
>
> **Date:** 2026-07-15

---

# Purpose

`CandidateKnowledge` is the contract that crosses the SPEC-003 → SPEC-004
boundary. SPEC-004 is not yet implemented, so a naïve reading places the contract
"temporarily" in SPEC-003 until SPEC-004 exists. This decision fixes where the
contract lives and how it is governed, so it does not become a future migration.

---

# Context

- SPEC-003 *produces* candidate knowledge; SPEC-004 *consumes* it. Neither spec
  defines a field-level schema today (unlike SPEC-006's `SourceRecord`).
- The concern raised in planning review: the contract "belongs to the boundary,"
  not to either implementation, so it might warrant a neutral shared module or an
  explicitly temporary home.
- Existing precedent in AJ-OS: **the producing specification owns its output
  contract.** `SourceRecord` is owned by SPEC-006 (producer) and imported by
  SPEC-005 (consumer); the `ContextPackage` is owned by SPEC-002 and imported by
  every reader. The dependency direction rule (ARCH-002 §5; SPEC-002
  retrospective) says the consumer depends on the producer's contract, never the
  reverse.

---

# Decision

1. **`CandidateKnowledge` is owned by SPEC-003** and defined in the End-of-Session
   module under a dedicated contracts barrel: `src/end-of-session/contracts/`
   (exported from the module `index.ts`). SPEC-004 will import it from there.
2. **It is not a temporary location.** It is the permanent producer-owned home,
   consistent with `SourceRecord`/`ContextPackage`. There is no planned move.
3. **It is elevated as a published boundary contract** in
   `docs/architecture/CONTRACTS.md` (see EOS-D5), which records the producer/
   consumer relationship and the boundary invariants — so the contract's
   *cross-spec* status is documented even though its *definition* lives with the
   producer.
4. **A neutral shared module is not created now.** There is exactly one consumer
   (SPEC-004, future); a shared module would be an abstraction without a second
   client — premature per the implementation playbook ("avoid unnecessary
   abstractions / speculative features").

---

# Rationale

- **Consistency.** Producer-owned contracts are the established AJ-OS pattern;
  following it keeps the codebase coherent and the dependency graph acyclic
  (consumer → producer).
- **No future churn.** Framing the location as "temporary" invites a later
  migration that would break SPEC-004's imports. Declaring it permanent avoids
  that.
- **Clean import surface.** Placing it in `contracts/` with its own barrel lets
  SPEC-004 import only the contract, not the whole End-of-Session module
  (analyzers, services), keeping the boundary narrow.
- **Boundary is still explicit.** CONTRACTS.md gives the contract first-class
  cross-spec visibility without moving the code, satisfying the reviewer's
  intent that the contract "belongs to the boundary."

---

# Alternatives Considered

## Option A — Temporary home in SPEC-003, move when SPEC-004 exists

Description: define it in SPEC-003 now, plan to relocate to a shared/neutral
location when SPEC-004 is built.

Pros
- Acknowledges the boundary nature explicitly.

Cons
- Guarantees future churn and a breaking import move.
- No precedent in AJ-OS for relocating a producer-owned contract.

Rejected: a planned migration is a liability, not a plan.

## Option B — Neutral shared contracts module now (e.g. `src/contracts/`)

Description: introduce a cross-spec contracts package immediately.

Pros
- Symmetric ownership; neither spec "owns" the other's boundary.

Cons
- Premature abstraction — one (future) consumer only; breaks the producer-owned
  precedent; creates a module with unclear ownership and lifecycle.

Rejected: no second consumer justifies it yet.

## Selected Option

**Option C (selected)** — Producer-owned in `src/end-of-session/contracts/`,
permanent, published as a boundary contract in CONTRACTS.md.

---

# Consequences

## Positive
- Matches `SourceRecord`/`ContextPackage` precedent; acyclic dependencies.
- SPEC-004 gets a stable import path with no planned migration.
- Boundary is documented once, in CONTRACTS.md.

## Trade-offs
- SPEC-004 will depend on the SPEC-003 module for this contract. This is the
  correct (consumer → producer) direction, but it does couple SPEC-004's build to
  SPEC-003's package — accepted, and mitigated by the narrow `contracts/` barrel.

---

# Impact

## Affected Tasks
- EOS-003 (defines the contract in `contracts/`).

## Affected Components
- `src/end-of-session/contracts/` (new), module `index.ts`.

## Documentation Requiring Updates
- `docs/architecture/CONTRACTS.md` (EOS-D5), README, PIPELINE-ARCHITECTURE.

---

# Validation

- EOS-003 implements the contract with Zod validation + deep-freeze and public
  export; CONTRACTS.md lists it as the SPEC-003→004 boundary contract.
- Revisited when SPEC-004 begins: confirm SPEC-004 imports cleanly with no
  contract move required.

---

# Future Review

- Revisit **only if** a second, independent consumer of `CandidateKnowledge`
  appears (e.g. an analytics service). At that point a neutral shared module may
  become justified — a promotion, not a fix.

---

# Related Documents

Architecture
- ARCH-001 §5, ARCH-002 §5, docs/architecture/CONTRACTS.md

Standards
- AJS-006 (Candidate lifecycle state)

Specifications
- SPEC-003, SPEC-004, SPEC-006 (`SourceRecord` precedent)

Implementation Tasks
- EOS-003

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.0 | Decision created — producer-owned, permanent, boundary-published. |
