# REX — Repository Excellence Review

> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Specification:** _None._ This is a **non-specification engineering quality package**. See [Why this package has no SPEC](#why-this-package-has-no-spec).
>
> **Status:** **Package Planning FROZEN** by the reviewer (AJ) on 2026-07-17. The Review Findings Inventory, milestone roadmap, governing principles, sequencing, and package-level decisions are frozen. **Each milestone still runs its own Planning → Planning Review → Planning Freeze.** **Milestone 1 Planning FROZEN (AJ, 2026-07-17)** — REX-D1 accepted; M1 implementation in progress.

---

# Purpose

Elevate the repository to a professional, production-quality standard while preserving every
frozen architectural decision from SPEC-001 through SPEC-003.

SPEC-003 completed on 2026-07-17 (`9bd051d`, PR #11). SPEC-004 is next but deliberately not
started. That pause is the opportunity: three specifications have been delivered under mounting
engineering discipline, and the engineering record in `implementation/` is genuinely strong — but
the discipline was applied **per specification**, and repository-wide properties fell through the
gaps between them.

Nobody owned the README. Nobody owned CI. Nobody owned whether `npm run typecheck` actually
checks anything. REX owns them.

---

# Why this package has no SPEC

AJS-007 §2 governs *"the disciplined progression of a single specification milestone from an
approved plan to a frozen, validated result."* REX has no specification to deliver — it improves
what three completed specifications already built.

Writing a SPEC-008 to justify the ceremony would be dishonest: SPEC-000 mandates 17 sections
describing a component's inputs, outputs, state model, and agent responsibilities. A quality
review has none of those. It has findings.

So REX inherits the AJS-007 lifecycle with **exactly one substitution**, recorded as
[REX-D0](decisions/REX-D0.md):

> **§4.2 Specification Decomposition → Review Findings Inventory.**
> [`FINDINGS.md`](FINDINGS.md) fills the identical structural role: produced **before** the
> lifecycle begins, **not** a lifecycle stage, owned **upstream** of the lifecycle, and it
> establishes the milestone structure the lifecycle then delivers — satisfying §8.2 exactly.

Everything else — the seven stages, the two gates, the two freeze states, the mechanisms, the
principles, the authority order — applies unchanged.

---

# The governing scope guard

> **The Repository Excellence Review improves engineering quality.**
>
> **If a finding materially changes architecture, introduces a new design pattern, or expands
> behaviour rather than improving an existing implementation, it is deferred to a future
> specification or ADR — unless it is required to preserve an already-frozen invariant.**

**This principle outranks every recommendation in this package, including the author's.** Where a
milestone's scope and the guard disagree, the guard wins and the finding is deferred.

The risk it exists to stop is not bad work — it is **good work that isn't REX's to do**. Every
finding sits adjacent to a genuine improvement, and without the guard REX becomes SPEC-004 one
defensible step at a time.

| Ask of every finding | Then |
|---|---|
| Does this make an **existing** implementation clearer, safer, or more consistent — without changing what it does? | **In scope.** |
| Does this change what the platform *is*, *promises*, or *can do*? | **Defer** to a SPEC or an ADR. |
| Is it needed to preserve an **already-frozen invariant**? | **In scope**, even if it looks structural. The only exception, and it is narrow. |

This is AJS-007 §6.1 **Scope Discipline** applied at review level. Cite it **by name** when it
bites — which it will.

---

# Scope

## Included

- **Documentation truth** — every document describes the repository that exists today.
- **Automated quality gates** — CI, type-checking that reaches `tests/`, lint, format, coverage
  measurement.
- **Public surface** — export discipline; frozen-surface dead code resolved through FPCPs.
- **Naming and readability** — one file-naming rule; an architectural taxonomy covering all of `src/`.
- **Genuine duplication** — evaluated against the shared-ownership criteria, not assumed.
- **Comments, error messages, test craft.**
- **SPEC-003's two outstanding AJS-007 deliverables** — the missing retrospective and the
  unapplied specification-hygiene backlog.

## Not Included

- Architectural redesign, new design patterns, new features, speculative abstractions.
- Optimization for its own sake.
- Behaviour changes — **except** correcting an objectively incorrect implementation.
- Anything the scope guard defers. The standing list lives in
  [MILESTONES.md § Deferred](MILESTONES.md#deferred--recorded-not-actioned).

---

# The frozen set

Per AJS-007 §7.2, the **only** sanctioned path to change any of this is a **Frozen Plan Change
Proposal**, reviewed *before* dependent work begins. Per §5.4, only the reviewer may declare or
amend a freeze.

`docs/VISION.md` · `ARCH-001` / `ARCH-002` · `ADR-001..006` · AJS-007 §6.1 principles and §7
mechanisms · **EOS-D1..D11** · the five SPEC-003 invariants (Extractor, Candidate Generation,
Persistence, Orchestrator, Report Builder) · **CB-001..CB-022** · the five SPEC-003 and four
SPEC-002 milestone freezes · the archive convention (`docs/archive/` is *"not maintained or
updated"*).

## Two frozen decisions that actively constrain this review

Both are traps that look like cleanups. They are called out here because they will look like
obvious wins to anyone who hasn't read the decisions.

1. **EOS-005 "parallel, not shared."** `TextGenerator` is duplicated between
   `src/knowledge/compiler/` and `src/end-of-session/extraction/` **deliberately**, and
   `src/end-of-session/contracts/immutable.ts:6-8` cites the same precedent for
   `deepFreeze`/`DeepReadonly`. **Consolidating across modules violates a ratified decision.**
   M4 is scoped to within-module deduplication for exactly this reason.
2. **AJS-007 §6.1 Build on Frozen Foundations** — *"Treat validated, frozen work as immutable and
   build upon it rather than editing it."* Every frozen-surface change goes through an FPCP.

---

# Milestones

See [MILESTONES.md](MILESTONES.md) for the frozen roadmap.

| Milestone | Name | Status |
| --------- | ---- | ------ |
| M1 | Documentation Truth & SPEC-003 Lifecycle Closure | 🔨 **Planning FROZEN** (AJ, 2026-07-17) — in progress |
| M2 | Automated Quality Gates | ⬜ |
| M3-A | Public Surface *(contractual)* | ⬜ |
| M3-B | Naming & Readability | ⬜ |
| M4 | Structural Consistency & Genuine Duplication | ⬜ |
| M5 | Comments, Errors & Test Craft | ⬜ |

---

# Measurable vs. Judgement

The organizing principle of the package, and the axis every finding in
[FINDINGS.md](FINDINGS.md) is classified along.

- **Measurable** — a machine decides. The reviewer does not need to. M2 makes these true and keeps
  them true forever.
- **Judgement** — no tool can settle it. This is where reviewer attention is spent, because
  nothing else can spend it.

**This classification is an experiment, not a standard.** It is a candidate for AJS-007 **only**
after surviving repeated use across more than one context (§9.3), and only via a retrospective
recommendation (§3) that the reviewer accepts through §10.2. REX records whether it held —
**including where it failed**, which is the more valuable evidence.

Its weakest point is its own boundary: *"docs are accurate"* looked like judgement until it was
reframed as falsifiable assertions, and other rows may move the same way under pressure. A
boundary that drifts under use is a heuristic, not a standard.

---

# Package Structure

```text
repository-excellence/
├── README.md            this document
├── FINDINGS.md          Review Findings Inventory — the roadmap of record (prerequisite)
├── MILESTONES.md        the frozen milestone roadmap
├── decisions/           REX-D0.. — package and implementation decisions
├── tasks/               REX-101.. — the atomic unit of work
└── retrospectives/      one per milestone (AJS-007 §4.7 stage 7 — accumulated, never overwritten)
```

---

# Definition of Done

- [ ] [FINDINGS.md](FINDINGS.md) exhausted: every finding actioned, deferred with reason, or ruled
      won't-fix.
- [ ] M1, M2, M3-A, M3-B, M4, M5 each Freeze-Reviewed and frozen **by the reviewer**.
- [ ] A retrospective exists for every milestone (plus SPEC-003's reconstructed one).
- [ ] Every measurable property green in CI, on every PR.
- [ ] Every judgement call has a recorded decision naming the **reasoning**, not just the outcome.
- [ ] Zero frozen decisions violated; every frozen-surface change traces to a ruled FPCP.
- [ ] The architecture documents describe what is **actually supported today**.
- [ ] Behaviour unchanged except where a recorded defect fix required it.
- [ ] SPEC-004 begins on a repository whose docs are true and whose quality is **enforced rather
      than asserted**.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 1.0 | Package created. Planning Review completed and **package Planning Freeze declared by the reviewer (AJ)**: Findings Inventory, milestone roadmap, governing scope guard, sequencing, and package-level decisions frozen. Four reviewer-required refinements incorporated before the freeze — the scope guard, the M3-A/M3-B split, REX-D3 neutrality, and behavioural (not numeric) acceptance criteria. |

---

> **Engineering Rule**
>
> A quality review that changes what the platform does has stopped being a quality review.
>
> When a finding and the scope guard disagree, the guard wins.
