# REX-D0 — Applying AJS-007 to a Non-Specification Package

> **Status:** **Accepted** — ratified by the reviewer (AJ) at the package Planning Freeze, 2026-07-17
>
> **Specification:** _None._ This decision exists because there is none.
>
> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Task(s):** All. This decision governs the package's lifecycle.

---

# Purpose

AJS-007 governs the delivery of a **specification** milestone. REX has no specification. This
decision records how the standard is applied anyway, what is substituted, and — more importantly
— **what is not**.

It is recorded because it adapts a standard, and a standard adapted silently is a standard
abandoned.

---

# Context

AJS-007 §2 defines its scope as *"the disciplined progression of a single specification milestone
from an approved plan to a frozen, validated result."* Its §4.2 prerequisite is **Specification
Decomposition**, which *"produces the Specification Roadmap and milestone structure of a
specification."*

REX delivers no specification. It improves the engineering quality of what SPEC-001..003 already
built. Three options existed, and every subsequent piece of ceremony depends on which was chosen.

The pressure to choose badly here is real in both directions: skip the ceremony and REX becomes a
series of unreviewed chores in a repository where nothing else is; invent a SPEC and the standard
starts accepting fiction as input.

---

# Decision

**REX inherits the AJS-007 lifecycle unchanged, with exactly one substitution:**

> **§4.2 Specification Decomposition → Review Findings Inventory (`FINDINGS.md`).**

The substitution is legitimate because `FINDINGS.md` fills the **identical structural role** that
§8.2 defines for a Lifecycle Prerequisite, point for point:

| §8.2 requires the Specification Roadmap to be… | `FINDINGS.md` |
|---|---|
| *"Created… before the lifecycle begins"* | Authored and frozen at the package Planning Freeze, before M1 Planning. |
| *"available throughout the specification's delivery"* | The roadmap of record for all six milestones. |
| *"Owned at the specification level, upstream of the lifecycle"* | Owned at package level, upstream of every milestone. |
| *"a prerequisite, not a product of any lifecycle stage"* | Not produced by any stage; explicitly **not** a stage. |
| *"Establish the milestone structure that the lifecycle then delivers"* | Every milestone delivers a named subset of it. |

**Everything else applies unchanged**: the seven stages, the two review gates, the two freeze
states, the §7 mechanisms, the §6.1 principles, and the §3 authority order.

**Additionally: §7.7 Tailoring / Proportionality is applied deliberately, and its result is
recorded.** REX's milestones differ sharply in risk — M1 changes no code; M4 touches
security-relevant code — and applying identical ceremony to both would be ritual rather than
engineering. §7.7 is **Provisional** and explicitly *"subject to reviewer approval"*, so each
milestone's ceremony is proposed at its Planning Review and the reviewer rules.

---

# Rationale

**The substitution is narrow by design.** Only the prerequisite changes, because only the
prerequisite is specification-shaped. Adapting anything else would be adapting the standard to
suit the work, which is backwards.

**A package-level Planning Freeze is not a milestone Planning Freeze.** The reviewer made this
explicit at the freeze: what is frozen is the inventory, the roadmap, the governing principles,
the sequencing, and the package-level decisions. Each milestone still runs its own Planning →
Planning Review → Planning Freeze. This preserves §5.3 — *"the author does not self-certify a
freeze"* — at both levels rather than letting a package-level approval quietly authorise six
milestones of implementation.

**§7.7 is applied because REX is the evidence it needs.** §7.7 records that Tailoring *"has not
been validated beyond SPEC-002, which applied uniform ceremony to every milestone"* — SPEC-002
therefore could not validate it, because uniform ceremony produces no evidence about
proportionality. REX has genuinely heterogeneous milestones and can. Applying it **and recording
where it fails** is worth more than applying it and reporting success.

---

# Alternatives Considered

## Option A — Write SPEC-008 for the review

Formally a specification, so AJS-007 applies with no adaptation at all.

**Pros**
- Zero adaptation; the standard applies verbatim.
- Fits existing tooling and document structure.

**Cons**
- **Dishonest.** SPEC-000 mandates 17 sections describing a component's Inputs, Outputs, Workflow,
  State Model, Data Flow, and Agent Responsibilities. A quality review has none of them.
- Teaches the repository that a SPEC is a ceremony wrapper rather than a component definition —
  which corrodes SPEC-000 to protect AJS-007.
- Would place REX in `docs/specifications/`, implying the platform has a "repository excellence"
  capability. It does not.

## Option B — Ad-hoc chore; no package, no lifecycle

A branch and a series of PRs.

**Pros**
- Minimal ceremony; fastest to start.

**Cons**
- No Planning Freeze, no Freeze Review, no durable record — **inconsistent with how every other
  body of work in this repository has been delivered.**
- REX's defining risk is scope creep. The lifecycle *is* the control; removing it removes the
  control precisely where it is needed most.
- A review that finds "nothing is enforced" and then proceeds unenforced is self-refuting.

## Selected Option — C: Non-specification package, one substituted prerequisite

Chosen because it is the only option that keeps **both** standards honest. SPEC-000 keeps its
meaning (a SPEC defines a component), and AJS-007 keeps its force (the lifecycle governs the
work). The substitution is recorded, bounded, and testable against §8.2's own wording rather than
asserted.

---

# Consequences

## Positive

- REX inherits the full engineering discipline without distorting what a specification means.
- `FINDINGS.md` is genuinely better suited than a roadmap would be: it carries evidence,
  classification, and severity, which a specification roadmap does not.
- Establishes a reusable pattern for future non-specification work (tooling, migrations,
  infrastructure) that currently has no home in the standard.
- Produces the first real evidence for **§7.7 Tailoring**, which has none.

## Trade-offs

- **AJS-007 does not currently sanction this substitution.** It is an adaptation the reviewer
  approved for this package — it is **not** a revision of the standard, and it must not be cited
  as precedent for one. Only a §10.2 revision can do that, and only on retrospective evidence.
- A future reader may mistake REX's package structure for a specification's. The README's
  *"Why this package has no SPEC"* section exists to prevent that.
- Six Planning Reviews plus six Freeze Reviews is real reviewer load. §7.7 is the intended relief;
  if it doesn't relieve it, that is evidence about §7.7.

---

# Impact

## Affected Tasks

- All REX tasks — the lifecycle they follow.

## Affected Components

- None. This decision changes no code.

## Documentation Requiring Updates

- `implementation/phase-3-developer-experience/README.md` — the phase is no longer "Not yet started".
- **`docs/standards/AJS-007-*.md` — deliberately NOT updated.** See Future Review.

---

# Validation

- The substitution holds if REX completes six milestones under the standard **without any further
  adaptation**. Each additional adaptation required is evidence that this decision was wrong, or
  too narrow, and belongs in the retrospective.
- §7.7's application is validated by whether tailored ceremony **changed a milestone's outcome for
  the worse**. If it never did, that is weak positive evidence; if it did, that is strong negative
  evidence and worth more.

---

# Future Review

**Yes — but not by REX, and not yet.**

AJS-007 §3 is explicit: retrospectives are the **only** approved upward path, and *"a retrospective
may surface evidence recommending a change to a higher layer… but it does not itself change any
layer. It produces a recommendation."* REX sits at the package layer and **cannot amend an AJS
document.** The scope guard forbids trying.

Two candidates will exist by the end of this package, and **both must wait for evidence**:

1. **Non-specification packages under AJS-007** — whether §4.2 should formally admit a substituted
   prerequisite.
2. **Measurable vs. Judgement** — the classification the reviewer identified as potentially
   belonging in AJS-007.

Both are subject to §9.3: promotion requires demonstration *"across more than one specification
context"*. **One review is one observation.** Proposing either now would repeat the error that put
three principles in §6.2 as Candidates rather than §6.1 as Validated.

There is a sharper reason for restraint. §9.2 designated **SPEC-003** as AJS-007's validating
evidence, and the retrospective meant to carry it upward was never written (F-018) — so the
evidence never travelled, and the standard is still Draft on SPEC-002 alone. **Making REX's own
good ideas wait for evidence is the same rule, applied to ourselves.**

---

# Related Documents

Architecture
- None — this decision is deliberately below the architecture layer.

Standards
- **AJS-007 — Engineering Lifecycle Standard** — §2 (scope), §3 (authority, upward feedback),
  §4.2 (the substituted prerequisite), §5.3–5.4 (freeze ownership), §7.7 (Tailoring), §8.2
  (Lifecycle Prerequisites), §9.2–9.3 (validation), §10.2 (revision).

Specifications
- **SPEC-000 — Specification Writing Standard** — the reason Option A was rejected.

Implementation
- [FINDINGS.md](../FINDINGS.md) — the substituted prerequisite.
- [MILESTONES.md](../MILESTONES.md) — the roadmap it establishes.
- [README.md](../README.md) — *Why this package has no SPEC*.

---

# Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-17 | 1.0     | Decision created and **Accepted** — ratified by the reviewer (AJ) at the package Planning Freeze. |

---

> **Engineering Rule**
>
> A standard adapted silently is a standard abandoned.
>
> Adapt the work to the standard. Substitute only what the standard cannot express, record it, and
> test the substitution against the standard's own wording.
