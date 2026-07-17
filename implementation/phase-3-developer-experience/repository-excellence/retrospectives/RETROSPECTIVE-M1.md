# REX Milestone 1 — Retrospective

> **Milestone:** M1 — Documentation Truth & SPEC-003 Lifecycle Closure (REX-101 → REX-106)
> **Outcome:** **FROZEN** by the reviewer (AJ) on 2026-07-17.
> **Authored:** 2026-07-17, after the freeze — §4.7 stage 7 follows stage 6.

---

## Summary

M1 made the repository's documentation true. Twenty findings closed across root documents, guides,
module READMEs, and implementation packages; SPEC-003's two outstanding AJS-007 deliverables
discharged; the assertion inventory established and passing 13/13. **No executable source was
modified and no behaviour changed** — the milestone's core claim, verified by a check that was itself
proven able to fail.

Three decisions were recorded: **REX-D0** (how AJS-007 applies to a package with no SPEC),
**REX-D1** (the agent layer's architectural representation), and **REX-D9** — the package's first
**Frozen Plan Change Proposal**, raised before any edit and ruled before dependent work began.

**The reviewer's verdict on what M1 actually produced:**

> *The most valuable output of M1 is not the twenty closed findings. It is that the Repository
> Excellence Review has established three complementary validation layers — evidence-based findings,
> repeatable assertion validation, and end-to-end execution. Each layer has demonstrated defects that
> the others could not detect.*

---

## What worked well

- **The three validation layers, and the fact that each caught what the others missed.** This is not
  a design that was planned; it emerged, and the evidence for it is specific:

  | Layer | Caught | Why the others couldn't |
  |---|---|---|
  | **Evidence-based findings** | The `[2.0.0]` CHANGELOG counts are **legitimate history**, not drift; the `src/handbook` ↔ `src/platform/handbook` "duplication" was **rejected outright**. | Both are *judgements about what evidence means*. An assertion would have flagged the counts as defects. |
  | **Assertion checks** | **A-09** found two stale claims **F-012 never named**. **A-06** proved REX-106's work was still outstanding rather than silently absorbed by REX-103. | The findings were blind to them; execution doesn't read READMEs. |
  | **End-to-end execution** | `aj wiki build` **crashed** on a handbook built from the guide's own description — an unstated prerequisite (**A-11**) and an uncaught `SourceConnectorError` (**F-060 live**). | **No document claimed the prerequisite**, so no assertion could exist for it. |

- **The FPCP mechanism, on its first real use.** REX-D9 was raised *before any edit*, ruled *before
  dependent work*, and amended the plan at the correct layer. It cost one round trip and prevented
  either a silently-violated objective or three deferred findings — one Blocking. **§7.2 works.**

- **"Verified able to fail" caught a check that couldn't.** REX-104's first "never generates the
  wiki" test used a 2-minute mtime window that also caught the `wiki build` from minutes earlier —
  it could not have failed for the right reason. Replaced with a before/after hash and **proven able
  to fail by tampering**. SPEC-003's most common review finding, reproduced and caught.

- **The reviewer's intent-preservation principle changed outputs within one task of being stated.**
  F-005's status line was the *finding*; the module's three load-bearing guarantees (no git write, no
  wiki generation, never modifies canonical) being **absent from its README** was the *defect*.
  Likewise F-004: deleting *"owns git commits"* would have left the ROADMAP silent about an unowned
  role — an invitation for the next specification to acquire it by default.

- **The scope guard held, including when it cost something.** See below.

---

## What surprised us

- **The plan contradicted itself three times, and always in the same way.** F-020 (a finding assigned
  to two tasks), F-004/F-008 (two findings on the same two lines), REX-D9 (a milestone property
  contradicting a task scope). **All three were caught by validation or by reading the plan against
  itself — never by review**, because each surfaced as an acceptance criterion that *could not be
  satisfied honestly*. An acceptance criterion that cannot be met honestly is doing its job.

- **A documentation fix made the document worse before it made it better.** REX-104's first draft
  asserted *"a directory of notes — you do not need to bring one"*: more confident, more welcoming,
  and **more wrong** than the stale text it replaced. **A pass that only corrects known findings can
  introduce new falsehoods with total sincerity.** Only running the guide caught it.

- **Three `grep` false-negatives, all reporting *correct* documents as broken.** Line wrapping;
  blockquote markers surviving a naive join; and **BSD `sed` silently ignoring `\?`** so a
  normalisation step did nothing *without erroring*. The dangerous direction — it invites "fixing"
  text that was already right.

- **An assertion fired on the correct answer.** A-06 grepped `owns git commits` and expected no
  match; the fix — *"**Nobody** owns git commits"* — contains that string. **It was matching a
  string, not a claim**, and a pattern derived from broken text encodes the breakage.

- **F-060's prediction came true within a day, and was too optimistic.** It said a *new* error class
  would silently break the friendly-message path. Reality: `SourceConnectorError` was **never** in
  `wiki.ts:45`'s list, so the very first thing a new user does bypasses it entirely.

---

## Engineering discoveries

- **Repository truth has two dimensions** (the reviewer's formulation): **declarative truth** — what
  the repository explicitly claims — and **operational truth** — what actually happens when someone
  follows those claims. **Assertions verify the first; only execution verifies the second.** A-11 is
  the proof: an inventory built by reading documents *can only check the claims those documents chose
  to make*.

- **"Delete the false claim" is rarely the whole fix.** It removes the error and keeps the omission.
  Both A-06a (nothing is credited) and A-06b (the deferral is present) are needed — **A-06a alone
  passes on a document that says nothing.**

- **A hard-coded metric is a defect regardless of its value.** Updating it re-arms the trap. *A
  document that cannot drift needs no synchronization* — cheaper than any documentation-sync
  mechanism.

- **Historical records and live claims look identical and are governed differently.** CHANGELOG's
  counts under `## [2.0.0]` are legitimate release history; the same shape under `[Unreleased]` is
  drift. **The heading, not the sentence, decides.**

---

## The Measurable vs. Judgement classification — honest assessment

The reviewer asked that this be treated as an **experiment**, tracked including where it fails. It
mostly held. **Three limits surfaced, and they matter more than the successes.**

**1. Its boundary moved under use — twice.** *"Docs are accurate"* was Judgement until REX-103
reframed each claim as a falsifiable assertion, moving ~19 findings from J to M. That reframing is
the classification's best moment **and its biggest problem**: if the boundary can be moved by
choosing a better framing, then the classification measures *how hard we thought*, not *what kind of
thing this is*.

**2. It classifies findings, not work.** F-004 is Measurable (*"does this document say X?"*). But
**deciding what should replace the false claim was pure judgement** — it needed the reviewer's
intent-preservation principle. A finding can be Measurable while the work to close it is not. The
classification has no column for that, and M1 quietly relied on the distinction anyway.

**3. It has no cell for what nobody wrote down.** A-11 was neither Measurable nor Judgement before
execution found it — it did not exist. The reviewer's declarative/operational axis covers this and
**M/J does not**. That is a gap in the classification, not a detail.

**Recommendation: do not promote it.** It has survived one milestone in one context, which is one
observation. §9.3 requires demonstration across more than one specification context, and REX-101's
retrospective just argued the same restraint against SPEC-003's candidate principles. **Applying a
weaker standard to our own idea than to the standard's would be the exact failure that put three
principles in §6.2 rather than §6.1.** Track it through M2–M5; revisit at package close.

---

## Process improvements — recommendations only

Per §3, these are proposals. The reviewer accepts or rejects them at the receiving layer.

1. 🔴 **Ownership boundaries must be challenged at Planning Review, not discovered at
   implementation.** The reviewer has already made this an **expectation for M2**:

   > *Repository review planning should allocate work by protected outcome (behaviour,
   > documentation, architecture), not by filesystem boundaries or finding identifiers. Paths and
   > IDs are useful navigation aids, but they are not reliable ownership boundaries.*

   **Concrete, and owed before the M2 Planning Freeze:** M2's findings are allocated by path
   (`.github/`, `tsconfig.json`, `package.json`) and M3's by identifier — **the same defect that
   produced all three M1 collisions, in a plan written by the same hand on the same day.** M2's
   planning must be re-read for it rather than assumed sound because M1 shipped.

2. 🟠 **Pair every "the falsehood is gone" assertion with a "the truth is present" one.** A negative
   assertion cannot distinguish *corrected* from *deleted*. A-06a/A-06b is the pattern.

3. 🟠 **M2 must normalise markdown with a parser, not a `sed`/`tr` pipeline.** Three false negatives
   in one milestone, all on correct documents. **A flaky gate is worse than no gate** — it converts
   a signal into noise and teaches its reader to override it. The warning is recorded at the top of
   `FINDINGS.md` where M2 will find it.

4. 🟡 **A documented workflow is verified by running it, not by reading it.** REX-104's acceptance
   criterion said *follow* the guide, and that single word found the milestone's most user-visible
   defect. Future milestones that touch a documented workflow should carry the same criterion.

---

## Deferred improvements — recorded, not actioned

- **`spec-003-end-of-session/README.md:329`** ticks *"Documentation updated and synchronized at each
  freeze"* — **false**, proven by F-005/F-012, in a file M1 edited. Left deliberately: out of frozen
  scope, closed inventory. The reviewer ruled this **the correct outcome**: *"The Repository
  Excellence Review derives much of its value from respecting its own governance even when doing so
  is inconvenient."*
- **F-022's documentation half** → M3-B. The agent layer is still in no architecture document.
- **The agent-layer ADR recommendation** (REX-D1) → the architecture layer, on its own triggers.
- **No specification has a change log** (found at REX-102) → a SPEC-000 convention question.
- **`SourceConnectorError` uncaught** (F-060 live) → M5.

---

## What M1 cost, and whether it was worth it

**Eight commits, three FPCP/decision records, one halt, six reviewer round trips.** For twenty
documentation findings, that is heavy — and it is the honest number.

**It bought three things that were not the findings:** the assertion inventory (which will outlive
the review), the layered validation model (which the reviewer judges M1's principal contribution),
and **a demonstrated FPCP path** — the first time in AJ-OS that a frozen plan's own contradiction was
surfaced and ruled rather than absorbed.

**The scope guard cost something real, once.** Leaving a one-line false claim in a file already open
is the moment a governance rule stops being free. **A rule that never costs anything is not
restraining anything.**

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.0 | M1 Retrospective authored after the Milestone Freeze (§4.7 stage 7). Records the three validation layers as M1's principal contribution (reviewer's assessment); the ownership-boundary planning defect across three instances, now an explicit **expectation for M2's Planning Review**; and an honest assessment of the **Measurable vs. Judgement** classification — **three limits found, promotion not recommended**, on the same evidentiary standard REX-101 applied to SPEC-003's candidate principles. |
