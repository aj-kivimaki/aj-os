# REX-D10 — FPCP: M2's Protected Outcome Must Be an Outcome, Not a Path

> **Status:** ✅ **ACCEPTED** — Frozen Plan Change Proposal (AJS-007 §7.2), approved by the reviewer (AJ) on 2026-07-17 at the M2 Planning Re-read. **Raised during Planning, before any implementation.**
>
> **Type:** Repository Excellence FPCP — alters a milestone **objective** and its **validation** (acceptance criteria): two of the five triggers ruled at the REX-101 review.
>
> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Task(s):** All of M2, and **REX-203** in particular.

---

# Purpose

**M2 will legitimately modify executable source. M1's protected property does not transfer, and M2's
own objective does not yet say what replaces it.**

This is [REX-D9](REX-D9.md)'s lesson recurring one milestone later — and it was found by the
ownership-boundary re-read the reviewer required *before* the M2 Planning Freeze, rather than by an
acceptance criterion failing mid-implementation. **That is the difference between M1's three
collisions and this one: it was caught by planning, not by validation.**

---

# Context

**M1's invariant was a path.** REX-D9 amended M1 to: *"Changes under `src/` or `tests/` are limited
to documentation (README files) and do not modify executable source."* That was correct **for M1**,
and provable — `git diff --name-only | grep '\.ts$'` → empty, verified able to fail.

**M2 cannot make that claim, and shouldn't try.** Verified 2026-07-17:

- **REX-203** must edit **`.ts` test files** — the hidden type errors live there (F-027).
- **REX-204**'s formatter first run touches **nearly every file**, including all of `src/`.
- **REX-205** enables six strictness flags; one produces a real error in `src/` today.

**M2's frozen objective says only:** *"No runtime behaviour changes."*

That is the **right intent** and it does **not** contradict M2's scope — unlike M1's, this is not an
impossibility. **But it is not falsifiable as written.** How is *"no runtime behaviour change"*
demonstrated after reformatting every file and editing test assertions? The frozen plan does not say,
and *"the tests still pass"* is too weak on its own: it is exactly what a weakened test suite also
reports.

**Why this is an FPCP** (the reviewer's ruling): *"The protected outcome and milestone validation are
part of the frozen milestone contract. Changing how that contract is expressed alters milestone
acceptance."* And why it is nonetheless narrow: *"the milestone objective is not changing, only the
way the protected property is expressed and verified."*

---

# Decision — Approved

## M2's Objective

Amended from:

> *"Make every objectively measurable property machine-verified on every PR, and non-regressible.
> **No runtime behaviour changes.** This is the ratchet the rest of the review depends on."*

to:

> *"Make every objectively measurable property machine-verified on every PR, and non-regressible.
> This is the ratchet the rest of the review depends on.*
>
> ***Runtime behaviour is intentionally unchanged.** Unlike M1, executable source legitimately
> changes — so the protected property is an **outcome**, not a path:*
>
> - ***production source changes are mechanical only** — formatter output, or diagnostics-driven
>   corrections;*
> - ***no test is removed, skipped, or weakened;***
> - ***behaviour preservation is demonstrated by the existing validation suite**, not asserted."*

## M2's Validation

Amended to add the falsifiers:

> - **`tsc --listFiles | grep -c '/tests/'` > 0** — the direct falsifier of F-026.
> - **The formatter proof.** Re-running the formatter on the **pre-M2 tree** reproduces the
>   **post-M2 tree exactly**. A formatter is deterministic; therefore any formatting commit that
>   contains a semantic edit **fails this check**. This is the primary evidence that `src/` changed
>   mechanically and nothing more.
> - **No test removed, skipped, or weakened** — test count does not fall; no `.skip`/`.only`/`todo`
>   introduced; `expect` count does not fall.
> - **Every non-mechanical `src/` change is diagnostics-driven and individually recorded** — a
>   compiler or linter diagnostic names it, or it does not belong in M2.
> - Each gate is demonstrated **failing** on a deliberate violation, then passing.
> - All existing tests pass.

---

# Rationale

- **The reviewer's principle, applied one milestone on:** *the protected property is the outcome,
  not the filesystem path.* M1 learned this the hard way through REX-D9; M2 applies it **before**
  implementation. That is the retrospective paying for itself.

- **The formatter proof is the strongest evidence available, and it is cheap.** A formatter is
  **deterministic**. `format(pre-M2 tree) == post-M2 tree` is an objective demonstration that the
  formatting commit contains **no semantic edit** — not a review opinion, not a spot check. The
  reviewer: *"That is exactly the kind of falsifiable engineering evidence Repository Excellence
  should favour."*

- **"Tests pass" alone is not evidence of behaviour preservation.** A suite with a weakened
  assertion also passes. Hence the explicit "no test removed, skipped, or weakened" clause: it
  closes the one hole through which M2 could make a gate green by lowering the bar. This mirrors
  SPEC-003's most common review finding — *tests that cannot fail*.

- **"Diagnostics-driven" is the honest boundary for REX-205.** Enabling a strictness flag may
  require a real `src/` change. That is legitimate **only** because a diagnostic demands it — which
  is checkable. Any `src/` edit that no diagnostic names is out of scope, and the scope guard
  defers it.

---

# Alternatives Considered

## Option A — Leave the objective as-is

**Pros:** no plan change; the objective is not *wrong*.

**Cons:** **unfalsifiable.** The milestone would freeze on *"no runtime behaviour changes"* with no
stated way to demonstrate it — after a diff touching nearly every file. That is precisely the
failure class M1's retrospective named: **a claim that cannot fail is not evidence.**

## Option B — Forbid `src/` changes in M2

**Pros:** M1's clean, provable invariant carries over unchanged.

**Cons:** **makes M2 impossible.** F-031's flags produce a real `src/` error; the formatter touches
every file by construction. This is Reading A of REX-D9 all over again — protecting the letter of a
sentence at the cost of the milestone.

## Selected — C: express the protected property as an outcome, and make each clause falsifiable

---

# Consequences

## Positive

- M2 can be frozen on **evidence** rather than on the absence of `.ts` in a diff.
- The formatter proof is **reusable**: any future mechanical change can borrow it.
- Applies the M1 lesson before implementation rather than after — **the first time REX has done so.**

## Trade-offs

- **The invariant is weaker than M1's, and honestly so.** "Mechanical only" admits judgement in a way
  "no `.ts` touched" did not. The formatter proof removes that judgement for REX-204; **for REX-203
  and REX-205 it remains a reviewed claim**, backed by the requirement that every change be named by
  a diagnostic.
- More validation surface to run at the freeze.

---

# Impact

## Affected Tasks

All of M2. **REX-203** and **REX-205** carry the weight — they are the only tasks changing
executable source for non-mechanical reasons. **REX-204** is fully covered by the formatter proof.

## Affected Components

None. **No runtime behaviour changes** — the point of the decision.

## Documentation Requiring Updates

- [MILESTONES.md](../MILESTONES.md) — M2's Objective and Validation. **This decision is that change.**

---

# Validation

At the M2 Freeze Review, each clause is demonstrated **and** shown able to fail:

| Clause | Falsifier |
|---|---|
| Formatting is mechanical | `format(pre-M2 tree) == post-M2 tree`; introduce a semantic edit → **check fails** |
| No test weakened | test count, `expect` count, `.skip`/`.only` scan; skip a test → **check fails** |
| Typecheck reaches tests | `tsc --listFiles \| grep -c '/tests/'` > 0 |
| Every `src/` change is diagnostics-driven | each is traceable to the diagnostic that demanded it |
| Behaviour preserved | full suite green |

---

# Related Documents

Standards
- **AJS-007 §7.2** — FPCP: *"reviewed and approved before any implementation dependent upon the
  change begins."* **Satisfied — this was raised during Planning.**
- **AJS-007 §5.3/§5.4** — the freeze is the reviewer's.

Implementation
- **[REX-D9](REX-D9.md)** — the same class of defect in M1, caught by *validation*. This one was
  caught by *planning*.
- [MILESTONES.md](../MILESTONES.md) — the FPCP threshold; the ownership-boundary lesson.
- [RETROSPECTIVE-M1.md](../retrospectives/RETROSPECTIVE-M1.md) — the lesson this decision applies.

---

# Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-17 | 1.0     | **PROPOSED and ACCEPTED** at the M2 Planning Re-read (reviewer: AJ). M2's protected property re-expressed as an **outcome** rather than a path, and each clause given a falsifier — chiefly the **formatter proof**, which the reviewer singled out: *"A formatter is deterministic. Re-running it on the pre-M2 tree provides an objective demonstration that formatting commits contain no semantic edits."* Reviewer ruled this an FPCP because *"the protected outcome and milestone validation are part of the frozen milestone contract"*, while noting it is the same narrow class as REX-D9: *"the milestone objective is not changing, only the way the protected property is expressed and verified."* **Raised during Planning — the first REX plan defect caught before implementation rather than during it.** |

---

> **Engineering Rule**
>
> Protect the outcome, not the path.
>
> An invariant that cannot be demonstrated is a hope. If executable source must change, say what must
> stay true — and say how you will prove it.
