# EOS-D7 — Extend the Existing `GitPort` Rather Than Introduce a Second Git Abstraction

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-401 (implements the extension), EOS-402 (the only consumer),
> EOS-102 / EOS-103 (the M2-frozen seam being extended)
>
> **Date:** 2026-07-16

---

# Purpose

`Session.gitState` requires the head commit and a dirty flag, and `Session.branch` is
required — but the M2 `GitPort` exposes exactly one read, `changes(range)`. Something must
supply the missing observations. This decision fixes **where read-only git access lives**:
in the one existing seam, or in a second abstraction beside it. The answer determines
whether "read-only git access" remains a single concept in SPEC-003 or becomes two.

---

# Context

- **This is a gap between the frozen plan and the delivered code, not a new requirement.**
  EOS-002 recorded that the git access populating `gitState` was **M2's** job. M2 delivered
  a port with `changes(range)` only — all the `GitChangeAnalyzer` needed. The gap went
  unnoticed because **nothing constructs a `Session`**: at M5 planning, `parseSession` was
  used only by its own schema and by tests. M5 is the first milestone that must build a real
  session, and it cannot.
- The frozen `Session` contract requires `gitState.head` (non-empty), `gitState.dirty`
  (boolean), `gitState.range` (non-empty), and `branch` (non-empty). Only `range` is
  constructed (EOS-402); the other three must be **observed**.
- `GitPort`'s own docstring frames it as *the* read-only git seam: "the injectable boundary
  between the analyzer … and *how* those observations are obtained. It exposes **reads
  only** … Keeping the interface tiny keeps the real adapter and the unit-test stub
  trivially interchangeable."
- The platform has twice rejected splitting a seam that has one implementation and one
  consumer: **EOS-D6** (one store, one layout ⇒ no generic store + writer module) and the
  M3 decision to keep `TextGenerator` local (no promotion without a second client).

---

# Decision

1. **Extend `GitPort`** with three read-only observations — `head()`, `dirty()`,
   `branch()` — implemented in the existing `createGitPort` adapter (`git rev-parse HEAD`,
   `git status --porcelain`, `git branch --show-current`).

   > **Implementation refinement (EOS-401, 2026-07-16):** `branch()` returns
   > **`Promise<string | null>`**, not `Promise<string>` as first recorded here, and is
   > implemented with `git branch --show-current` rather than `git rev-parse --abbrev-ref
   > HEAD`. Code review found that `--abbrev-ref` reports the literal `"HEAD"` when HEAD is
   > detached (rebase, bisect, tag checkout) — a **non-empty** string that satisfies
   > `Session.branch`'s `.min(1)` and would record a branch that does not exist, while being
   > indistinguishable from a branch genuinely named `HEAD`. `null` reports the fact instead
   > of laundering it. This refines the *signature*, not the decision: one seam, extended,
   > read-only. It hands **EOS-402** the question of what a detached session's `branch`
   > records (that contract is required and non-empty).
2. **No second git abstraction is introduced.** There is one repository, read one way, by
   one composition root. `GitPort` remains the single seam for read-only git access in
   SPEC-003.
3. **`changes(range)` is unchanged** — its signature, behaviour, and the
   `GitChangeAnalyzer` that consumes it are untouched. The extension is purely additive.
4. **The seam's guarantees are unchanged and reaffirmed.** Widening *what can be observed*
   never widens *what is permitted*: the port remains **read-only** (no stage, commit,
   checkout, or fetch — ADR-002 §4, AJS-005 §7), the adapter remains minimal (invoke →
   parse → produce, no discovery, policy, or retry), and failures propagate rather than
   being swallowed.
5. **Failure semantics differ by caller, and that is correct.** A `changes` failure is
   **recoverable** — the EOS-101 execution stage turns it into one `AnalyzerError` under
   partial collection. A `head`/`dirty`/`branch` failure is **fatal** (SPEC-003 §15,
   "repository unavailable"): a session whose head or branch cannot be read cannot be
   identified at all, so there is nothing to capture. The port reports; the caller decides.

---

# Rationale

- **The seam's identity is "read-only git access", not "the analyzer's reads".** Its purpose
  is *what may be done to the repository* (read, never write). Three more reads is the same
  concept; a second port would fragment one concept across two abstractions to avoid an
  additive change.
- **One seam, one adapter, one stub.** Two ports would mean two injection points, two test
  doubles, and two things to keep read-only — for one repository read by one composition
  root. That is the "abstraction without a second client" this project has rejected twice
  (EOS-D6; `TextGenerator` in M3).
- **The port is still tiny.** Four reads honours the docstring's stated intent; the real
  adapter and the stub remain trivially interchangeable.
- **The alternative optimizes for a rule over a reason.** A separate `GitStatePort` would
  satisfy interface segregation literally while making the codebase harder to reason about:
  a reader asking "how does SPEC-003 touch git?" would have to find two answers.

---

# Alternatives Considered

## Option A — A separate `GitStatePort` (`head`/`dirty`/`branch`), leaving `GitPort` frozen

Description: a second port for session-state observations, injected into the Session factory;
`GitPort` untouched.

Pros
- Each consumer depends only on the methods it calls (interface segregation).
- Leaves the M2-frozen contract literally untouched — no §7.2 change.

Cons
- Two ports, two adapters (or one class implementing both), two injection points, two stubs
  — for one repository, read the same way, by one composition root.
- Fragments "read-only git access" across two abstractions; the read-only guarantee must now
  be maintained in two places.
- An abstraction with no second client, contrary to EOS-D6's and M3's precedents.

Rejected: it avoids an additive change by paying a structural cost.

## Option B (selected) — Extend `GitPort`

Selected — one seam for one concept; additive; the analyzer, `changes`, and every M2
guarantee are untouched.

## Option C — Take `head`/`branch` from `SessionContext` (caller-supplied)

Description: use the context's optional `commitHash` and required `branch` instead of
observing git.

Cons
- `commitHash` is **optional** and caller-supplied — provenance would record a *claim*
  rather than a *fact*, undermining AJS-006 traceability.
- `dirty` cannot be derived at all.
- Pushes the git read up to the CLI, breaking the thin-CLI pattern (see EOS-D9).

Rejected: provenance must be observed, not asserted.

---

# Consequences

## Positive

- One seam, one adapter, one place the read-only guarantee is enforced.
- `Session` becomes constructible — M5 (and therefore the v1 vertical slice) is unblocked.
- The analyzer, `changes(range)`, and every M2 test remain untouched; the extension is
  provably additive.
- The public operation count is unchanged (`GitPort`/`createGitPort` are already exported),
  so the module's public surface does not grow.

## Trade-offs

- **`GitChangeAnalyzer` depends on an interface with three methods it never calls** — a mild
  interface-segregation smell, accepted deliberately as the cheaper cost. Named here so it
  is a known trade-off rather than an oversight. Revisit only if a consumer appears that
  needs the state reads *without* `changes` (or vice versa) in a genuinely different context
  — a promotion, not a fix.
- The port grows from one read to four. Accepted: still tiny, still trivially stubbed.

---

# Impact

## Affected Tasks

- **EOS-401** — implements the three reads on the port and in the adapter.
- **EOS-402** — the only consumer (assembles `gitState` and `branch`).
- **EOS-407** — constructs the port with the injected `repositoryPath`.

## Affected Components

- `src/end-of-session/analyzers/git/GitPort.ts`, `createGitPort.ts`.

## Documentation Requiring Updates

- MILESTONES (M5), EOS-401, PIPELINE-ARCHITECTURE (Session stage — `gitState` is observed
  through the git seam).

---

# Validation

- EOS-401 implements the three reads with fixture-repo behaviour tests (`head` matches real
  `git rev-parse HEAD`; `dirty` flips on an uncommitted **and** a staged change; `branch`
  tracks a checkout; a broken path rejects for each read).
- `changes(range)` behaviour is byte-for-byte unchanged; the M2 suites stay green untouched
  — the regression check that proves the extension is additive.
- No write/stage/commit command appears anywhere in the adapter (its command list stays
  `diff`, `rev-parse`, `status`).
- Revisited when a second analyzer or trigger needs git: confirm the single seam still
  absorbs it without a split.

---

# Future Review

- Revisit **only if** a consumer needs the state reads without `changes` (or vice versa) in a
  genuinely different context — at which point segregating the interface may be justified as
  a promotion, not a fix.
- The reviewer-accepted `execFile` `maxBuffer` deferral (M2 Freeze) remains deferred; these
  reads produce small outputs and do not change that assessment.

---

# Related Documents

Architecture
- PIPELINE-ARCHITECTURE.md (Session stage; Integration Check — "no git or wiki side effect
  enters the pipeline"), ADR-002 §4, docs/architecture/CONTRACTS.md (boundary invariant 5)

Standards
- AJS-004 (single responsibility), AJS-005 §7 (no VCS in an engine), AJS-007 §7.2 (Frozen
  Plan Change Proposal)

Decisions
- EOS-D3 (`gitState` is session metadata), EOS-D6 (the same one-consumer/one-shape reasoning
  applied to the store), EOS-D9 (keeps the git read out of the CLI)

Specifications
- SPEC-003 §13 (Consumes — git repository), §15 (Fatal — repository unavailable), §17 (Read
  access: repository)

Implementation Tasks
- EOS-401, EOS-402, EOS-102, EOS-103

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-16 | 1.1 | **Signature refined during EOS-401 implementation** (code review): `branch()` returns `Promise<string \| null>` (implemented with `git branch --show-current`), because `git rev-parse --abbrev-ref HEAD` answers the literal `"HEAD"` for a detached repository — a non-empty value that would pass `Session.branch`'s `.min(1)` and record a branch that does not exist. The decision's substance is unchanged (extend the one read-only seam; no second git abstraction). Consequence for **EOS-402**: the Session factory must decide what a detached session's required, non-empty `branch` records. Recorded for the reviewer's ratification at the next gate. |
| 2026-07-16 | 1.0 | Decision created and **Accepted** at the M5 Planning Review (reviewer: AJ). Closes the frozen-plan gap found at M5 planning — `Session.gitState.head`/`dirty` and `branch` are required but M2's `GitPort` exposes only `changes(range)`, so no `Session` was constructible. The existing read-only seam is **extended** with `head`/`dirty`/`branch` rather than joined by a second git abstraction; `changes(range)`, the analyzer, and every M2 guarantee are untouched. Read-only guarantee reaffirmed; fatal-vs-recoverable failure semantics fixed per caller. Ratified under AJS-007 §7.2 as an additive change to the M2-frozen contract. |

---

> **Engineering Rule**
>
> One repository, one seam. The git port observes; extending what it can see never extends
> what it may do.
</content>
