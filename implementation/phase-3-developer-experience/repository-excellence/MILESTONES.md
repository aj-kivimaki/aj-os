# REX — Implementation Milestones

> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Specification:** _None._ Non-specification quality package; see [README § Why this package has no SPEC](README.md#why-this-package-has-no-spec) and [REX-D0](decisions/REX-D0.md).
>
> **Status:** **Package Planning FROZEN** (AJ, 2026-07-17). **M1 (Documentation Truth) and M2 (Automated Quality Gates) COMPLETE and FROZEN** (AJ, 2026-07-17) — *M1 established repository truth; M2 established repository verification.* **Next: M3-A — Public Surface.** ⚠️ **Start M3 from these artefacts, not from conversational context** — reviewer's direction. **M1 (Documentation Truth & SPEC-003 Lifecycle Closure) COMPLETE and FROZEN** (reviewer: AJ, 2026-07-17) — REX-101..106 delivered; 20 findings closed; assertion inventory 13/13; **no executable source modified**; SPEC-003's AJS-007 debt discharged. **REX-D0, REX-D1 accepted; REX-D9 accepted (the package's first FPCP).** M1 retrospective complete. **Next: M2 — Automated Quality Gates.** ⚠️ **Reviewer requirement for M2:** *before the M2 Planning Freeze, the planning must be reviewed explicitly for the ownership-boundary defects identified during M1.*

---

# Purpose

This document breaks the Repository Excellence Review into independently deliverable milestones.
Each milestone:

- delivers a repository-wide quality property that is verifiable, not asserted;
- leaves the platform buildable, testable, and behaviourally unchanged;
- is small enough to review and freeze independently;
- **changes engineering quality without changing what the platform does.**

The roadmap of record is [FINDINGS.md](FINDINGS.md) — the Review Findings Inventory. Every
milestone below delivers a named subset of it. **The inventory is closed**: findings discovered
during implementation are recorded there as `Deferred — post-REX`, never actioned.

---

# The governing scope guard

> **The Repository Excellence Review improves engineering quality.**
>
> **If a finding materially changes architecture, introduces a new design pattern, or expands
> behaviour rather than improving an existing implementation, it is deferred to a future
> specification or ADR — unless it is required to preserve an already-frozen invariant.**

**This principle is part of the frozen plan and supersedes every individual recommendation in it,
including the author's.** Where a milestone's scope and the guard disagree, **the guard wins** and
the finding is deferred.

| Ask of every finding | Then |
|---|---|
| Does this make an **existing** implementation clearer, safer, or more consistent — without changing what it does? | **In scope.** |
| Does this change what the platform *is*, *promises*, or *can do*? | **Defer** to a SPEC or an ADR. |
| Is it needed to preserve an **already-frozen invariant**? | **In scope**, even if it looks structural. The only exception, and it is narrow. |

The guard is **falsifiable, not decorative**: a claim that a task is in scope must be answerable
against that table, and every milestone's Review checklist tests it. It is AJS-007 §6.1 **Scope
Discipline** applied at review level — cite it **by name** when it bites.

---

# Milestone Overview

| Milestone | Name | Goal | Status |
| --------- | ---- | ---- | ------ |
| M1 | Documentation Truth & SPEC-003 Lifecycle Closure | Every document describes the repository that exists today; SPEC-003's two outstanding AJS-007 deliverables discharged | ✅ **FROZEN** (AJ, 2026-07-17) |
| M2 | Automated Quality Gates | Every measurable property machine-verified on every PR, and non-regressible | ✅ **FROZEN** (AJ, 2026-07-17) |
| M3-A | Public Surface *(contractual)* | One export discipline; frozen-surface dead code resolved through FPCPs | ⬜ |
| M3-B | Naming & Readability | One naming rule; an architectural taxonomy covering all of `src/` | ⬜ |
| M4 | Structural Consistency & Genuine Duplication | Duplication evaluated against the shared-ownership criteria; DI and testability brought to standard | ⬜ |
| M5 | Comments, Errors & Test Craft | Comments state constraints; errors share a taxonomy and a voice | ⬜ |

---

# Implementation Sequence

```text
Review Findings Inventory        (prerequisite — REX-D0; NOT a lifecycle stage)
        ↓
M1 Documentation Truth & SPEC-003 Lifecycle Closure
        ↓
M2 Automated Quality Gates
        ↓
M3-A Public Surface  (contractual)      ← lands first
        ↓
M3-B Naming & Readability
        ↓
M4 Structural Consistency & Genuine Duplication
        ↓
M5 Comments, Errors & Test Craft
```

**The sequencing argument.**

- **M1 first** because every later milestone plans against the documentation, and today it lies.
- **M2 second** because it is **the ratchet**. M3–M5 are large diffs, and merging them without CI
  repeats the exact mistake that produced this inventory.
- **M3–M5 by ascending risk**: the public surface is contractual but small and pinned; naming is
  mechanical once decided; deduplication touches security-relevant code; comments and errors are
  pure craft and safest last.
- **Within M3, the contractual half precedes the readability half** so the surface is settled
  before any file moves underneath it.

Every completed milestone leaves the repository buildable, testable, and behaviourally unchanged.

---

# Milestone M1 — Documentation Truth & SPEC-003 Lifecycle Closure

## Objective

Make every document describe the repository that exists **today**, and discharge SPEC-003's two
outstanding AJS-007 deliverables.

**This milestone introduces no implementation or behavioural changes. Changes under `src/` or
`tests/` are limited to documentation (README files) and do not modify executable source.**

> *Amended by **[REX-D9](decisions/REX-D9.md)** (FPCP, accepted by the reviewer 2026-07-17). The
> original wording — "this milestone's diff touches no `src/` or `tests/` file" — contradicted
> REX-105's frozen scope and its own acceptance criterion. **The protected property is no
> implementation or behavioural change, not the filesystem path in which documentation happens to
> live.***

## Deliverables

- Corrected documentation set (root docs, guides, module READMEs, implementation READMEs)
- `retrospectives/` for SPEC-003 — the missing §4.7 stage 7 deliverable, **explicitly marked as
  reconstructed**
- The 7-item specification-hygiene backlog closed
- The **assertion inventory** — the reusable artifact that makes "docs are accurate" re-testable
- REX-D1 recorded (agent-layer architectural representation)

## Task Progress

| Task | Description | Status |
|------|-------------|--------|
| REX-101 | SPEC-003 Retrospective (reconstructed; F-018) | ✅ |
| REX-102 | Apply the SPEC-003 specification-hygiene backlog (F-019) | ✅ |
| REX-103 | Root documentation truth pass — README, ROADMAP, CHANGELOG (F-001, F-008, F-009, F-010) + the assertion inventory | ✅ |
| REX-104 | Guides truth pass — installation, configuration, development (F-002, F-013..F-017) | ✅ |
| REX-105 | Module & package README truth pass (F-005, F-006, F-007, F-011, F-012, **F-020**, F-021, F-024) | ✅ _(halted on [REX-D9](decisions/REX-D9.md); unhalted on its acceptance)_ |
| REX-106 | The "owns git commits" contradiction + agent-layer representation (F-003, F-004; **F-022 recommendation half** — documentation half is M3-B's, per the frozen plan) | ✅ |

_Task breakdown **PLANNING-FROZEN** by the reviewer (AJ) on 2026-07-17. **REX-D1 ruled at the same
review and accepted as recommended**, unblocking REX-106: REX documents at README/CONTRIBUTING level
using the lifetime taxonomy, produces a **recommendation** for a future ADR where a mismatch with
ARCH-001 is exposed, and **amends no architecture document**. The reviewer required the authority
ordering stay explicit: **repository review → recommendation; architecture → ADR.**_

## Decisions ratified at the M1 Planning Review (AJ, 2026-07-17)

| # | Decision | Task | Outcome |
|---|---|---|---|
| 1 | [REX-D1](decisions/REX-D1.md) — agent-layer architectural representation | REX-106 | **Accepted as recommended.** REX has no authority to amend frozen architecture. Document at README/CONTRIBUTING; represent via the lifetime taxonomy; recommend an ADR rather than author one; amend no architecture document. |
| 2 | M1 scope — documentation truth, lifecycle completion, retrospective, hygiene backlog, **no source changes** | all | **Approved.** Acceptance criteria ruled objective and aligned with the objective; the scope guard ruled sufficient to prevent drift into implementation work. |

### Recorded during M1 implementation

- **F-020 was double-assigned** to REX-101 and REX-105 by the M1 plan — an authoring error, caught
  by REX-101's validation rather than its review. **Resolved: REX-101 closes F-018 and creates the
  `retrospectives/` directory; REX-105 owns the README text.** The directory's existence does not
  make `spec-003-end-of-session/README.md:203`'s *"(added at each Milestone Freeze)"* annotation
  true — it was added **once, late**. **Not an FPCP**: no scope, objective, or acceptance boundary
  moved, and the finding still closes within M1. Recorded per `implementation/CLAUDE.md` — *"Do not
  silently choose."*

- **F-004 and F-008 occupied the same two lines** — a second boundary collision of the same class,
  found by REX-103. The M1 plan assigned *"REX-103 edits Resume Here; REX-106 edits `ROADMAP.md:26`"*
  — but line 26 **is** Resume Here item 1: *"**End-of-Session Workflow (SPEC-003)** — the
  orchestration layer that decides when to run the generator and **owns git commits**."* The split
  was **not physically possible**.
  **Resolved:** REX-103 removed the stale item (F-008), which removed the false claim with it.
  **F-004 is not thereby closed** — per the reviewer's intent-preservation principle, *deletion
  removes the error but not the omission*, so **REX-106 still owns positively recording** that the
  commit role is deferred (ADR-002 / AJS-005 §7) and that **no component owns it**. REX-106's ruling
  and authority-citation requirement are untouched; only the location moved.
  **Not an FPCP** — same reasoning as F-020, below the threshold ruled at the REX-101 review.

- **[REX-D9](decisions/REX-D9.md) — the first REX FPCP, raised by REX-105 and accepted.** M1's
  Objective and Validation contradicted REX-105's frozen scope and its own acceptance criterion.
  **Raised before any edit; ruled before dependent work began** — §7.2 working as designed. Reading B
  adopted; the Objective and Validation are amended above; **no finding moved**.

- **📌 For the M1 retrospective — the planning lesson behind all three collisions.** Ruled by the
  reviewer (AJ) — at the REX-103 review as *"a planning observation, not an implementation
  problem"*, and restated in its general form at the REX-D9 ruling. **Record as an evidence-based
  planning lesson.** In the reviewer's words:

  > **Repository review planning should allocate work by protected outcome (behaviour,
  > documentation, architecture), not by filesystem boundaries or finding identifiers. Paths and IDs
  > are useful navigation aids, but they are not reliable ownership boundaries.**

  Earlier formulation, from the REX-103 review:

  > *Repository findings are not guaranteed to partition the repository. Future review planning
  > should allocate ownership by intended outcome rather than assuming each finding maps cleanly
  > onto an isolated section of text.*

  **Three occurrences in one milestone, one root cause:**

  | # | Collision | Kind | Found by |
  |---|---|---|---|
  | 1 | **F-020** — assigned to both REX-101 and REX-105 | finding ↔ finding | REX-101 validation |
  | 2 | **F-004 / F-008** — the same two ROADMAP lines | finding ↔ finding | REX-103 validation |
  | 3 | **[REX-D9](decisions/REX-D9.md)** — M1's path-based objective vs. REX-105's scope | **milestone property ↔ task scope** | REX-105 planning, **before any edit** |

  The first two were **findings colliding with each other**; the third was a **milestone-level
  property colliding with task scope**. All three trace to the same defect: **the plan reasoned about
  paths and identifiers rather than protected outcomes.** Notably, **all three were caught by
  validation or by reading the plan against itself — never by review**, because each surfaced as an
  acceptance criterion that could not be satisfied honestly. Carries forward to M2–M5 planning.

## Dependencies

### Requires
- The frozen Review Findings Inventory and this roadmap (both frozen 2026-07-17)
- **REX-D1** for REX-106 only

### Enables
- M2 (gates are built against documentation that is true)
- Every later milestone (they plan against these documents)

## Validation

- Every Blocking documentation claim in `FINDINGS.md` is **re-verified against the code** that
  falsifies the old text — the same command that found it now passes.
- **Changes under `src/` and `tests/` are limited to README documentation. No executable
  implementation files (`.ts` or equivalent) are modified.** *(Amended by
  [REX-D9](decisions/REX-D9.md); intent-based rather than path-based. Verified **able to fail** —
  touch a `.ts`, confirm the check reports it.)*
- Link crawl holds its clean baseline (0 broken across the repository).

## Definition of Done

- [x] REX-101..106 complete.
- [x] Assertion inventory recorded and re-runnable. **13/13 passing.**
- [x] No document hard-codes a live test count.
- [x] Freeze Review completed; **Milestone Freeze declared by the reviewer (AJ) on 2026-07-17.**
      _(All five reservations in §8 weighed and ruled on; the freeze granted on the milestone's
      purpose rather than the absence of every remaining repository defect.)_
- [x] Retrospective created (§4.7 stage 7) — [retrospectives/RETROSPECTIVE-M1.md](retrospectives/RETROSPECTIVE-M1.md).

---

## M1 Freeze Review — Evidence (prepared for the reviewer)

> **M1 stays 🔨 in every progress table.** A freeze is a **reviewer decision, not a consequence of
> the author finishing the work** (AJS-007 §5.3/§5.4). Following SPEC-003 M5's precedent, including
> its §8 — the honest case *against* a freeze.

### 1. Tasks complete

REX-101..106, all ✅, each independently reviewed and committed. Eight commits, `32e1f9e..75692e4`.

### 2. Findings closed — 20 of 20 in M1's scope

| Property | Evidence |
|---|---|
| All M1 findings closed | F-001..F-024 (M1's subset): **20 closed**. F-022's documentation half is **M3-B's by frozen design**, recorded, not drifted. |
| Every closure carries its falsifier | Each `FINDINGS.md` row records the command that found it and now passes. |

### 3. The assertion inventory — **13/13 passing**

A-01..A-11 (A-04 and A-06 each split in two). **Established by REX-103, extended by REX-104/105/106.**
Verified by re-running the whole inventory at freeze, with markdown normalisation.

### 4. No implementation or behavioural change — the milestone's core claim

| Property | Evidence |
|---|---|
| **No `.ts` file modified** | `git diff --name-only 9bd051d..HEAD \| grep '\.ts$'` → **empty** |
| Changes under `src/`+`tests/` are README-only | 3 files: `src/end-of-session/README.md`, `src/context-builder/README.md`, `tests/context-builder/README.md` |
| **Verified able to fail** | Appending to `src/end-of-session/index.ts` made the check report; reverting cleared it. *(Not a vacuous guarantee.)* |
| Behaviour unchanged | **713 tests / 58 files green** |
| Links intact | **488 links checked, 0 broken** |

### 5. Frozen work untouched

`git diff --name-only 9bd051d..HEAD` touches **none** of: `docs/VISION.md`, `docs/architecture/**`
(incl. ADR-001..006), `docs/standards/**` (incl. AJS-007), any `MILESTONES.md`, `decisions/EOS-*`,
`tasks/EOS-*`, `decisions/CB-*`, `tasks/CB-*`, `archive/**`, `docs/archive/**`. **No ADR authored.**

### 6. AJS-007 deliverables discharged

- **§4.7 stage 7 / §8.1** — SPEC-003's missing Retrospective **written** (REX-101), covering M1–M5,
  **explicitly labelled reconstructed**, answering the §9.2 question directly.
- **§7.4** — the specification-hygiene backlog **closed** (REX-102), 7/7 applied.

### 7. Decisions recorded

**REX-D0** (Accepted, package freeze) · **REX-D1** (Accepted, M1 Planning Review) · **REX-D9**
(**FPCP — Accepted**, raised before any edit, ruled before dependent work).

### 8. What the reviewer should weigh — the case *against* a freeze

**Three planning defects in one milestone, all the same root cause.** F-020, F-004/F-008, and REX-D9.
The reviewer has named the lesson and it is recorded — but **the plan that produced them is the same
plan governing M2–M5**, and those milestones were written by the same hand on the same day. *M2's
findings are allocated by path (`.github/`, `tsconfig.json`) and M3's by identifier.* **This milestone
is evidence that M2–M5's planning should be re-read for the same defect before each Planning Review**,
not assumed sound because M1 shipped.

**One known-false claim was deliberately left in place.** `spec-003-end-of-session/README.md:329`
ticks *"Documentation updated and synchronized at each freeze"* — false, and F-005/F-012 are its
proof. Out of frozen scope; recorded, not actioned. **A reviewer could reasonably rule that freezing
M1 while a Blocking-class falsehood sits in a document M1 edited is the wrong trade.** The
alternative — expanding the inventory mid-milestone — is the failure mode the closed-inventory rule
exists to prevent. **The rule was followed; whether it was right here is the reviewer's call.**

**The retrospective is not yet written.** §4.7 puts it *after* the freeze, so this is correct — but
it means the reviewer is freezing before reading the milestone's own lessons. SPEC-003 froze five
times without ever writing one; **this milestone would be freezing with one owed.**

**F-022 is half-open at freeze.** The agent layer still appears in no architecture document and no
subsystem table. That is per the frozen plan (M3-B owns it) — but a reader of the M1 freeze could
reasonably expect *"documentation truth"* to include the repository's most conspicuous documentation
gap. **It does not, and will not until M3-B.**

**The `foundation/`+`library/` prerequisite is documented but not enforced.** A user still gets an
uncaught stack trace (F-060 live). M1 fixed the document; **the defect ships until M5.**

### 9. Definition of Done

Three of five satisfied; the remaining two are the freeze itself and the retrospective that follows
it.

---

# Milestone M2 — Automated Quality Gates

## Objective

Make the repository **machine-verifiable on every PR**, and non-regressible. This is the ratchet the
rest of the review depends on.

> **Wording tightened at the M2 Freeze Review (AJ, 2026-07-17).** The original — *"every objectively
> measurable property machine-verified"* — **overclaimed**, and the milestone's own evidence proved
> it: repository-wide coverage is **not** measurable with supported Vitest 4 tooling (F-030), and
> `noPropertyAccessFromIndexSignature` is deliberately deferred (F-031). **The demonstrated
> boundary** is five gates — format, lint, typecheck (incl. `tests/`), build, test — plus coverage
> **reported within a documented limit**. Per the reviewer: *"Repository Excellence should always
> describe the property actually established, not the one originally hoped for."*

**Runtime behaviour is intentionally unchanged.** Unlike M1, executable source **legitimately
changes** — so the protected property is an **outcome**, not a path:

- **production source changes are mechanical only** — formatter output, or diagnostics-driven
  corrections;
- **no test is removed, skipped, or weakened**;
- **behaviour preservation is demonstrated by the existing validation suite**, not asserted.

> *Amended by **[REX-D10](decisions/REX-D10.md)** (FPCP, accepted by the reviewer 2026-07-17,
> **during Planning — before any implementation**). The original wording — *"No runtime behaviour
> changes"* — was correct in intent but **not falsifiable** after a diff that touches nearly every
> file. **Protect the outcome, not the path.***

## Deliverables

- CI pipeline (typecheck + build + test) on push and PR
- `tsconfig.test.json` — and the 46 hidden errors resolved
- Formatter + linter + the six dormant `tsconfig` strictness flags
- Complete `package.json` metadata; Node version pinned
- `.github/` supporting configuration; `SECURITY.md`; `CODE_OF_CONDUCT.md`
- Coverage **measured, not gated**
- REX-D7 (toolchain choice)

## Task Progress

**Allocated by protected outcome, not by filesystem path** — applying M1's principal planning lesson
at the reviewer's requirement, *before* the Planning Freeze.

| Task | **Protected outcome** | Description | Findings | Status |
|------|---|-------------|---|--------|
| REX-201 | governance — **enforcement** | CI runs typecheck + build + test on push and PR | F-025 | ✅ |
| REX-202 | governance — **visibility** | `tsconfig.test.json` so typecheck reaches `tests/`. **Makes the errors visible; does not fix them.** | F-026 | ✅ |
| REX-203 | ⚠️ **executable behaviour boundary** | Resolve the **40** hidden errors. **The only M2 task changing executable source for non-mechanical reasons.** | F-027 | ✅ |
| REX-204 | **mechanical** (provable) | Formatter + `.editorconfig`. Isolated commit; proven by re-running the formatter on the pre-M2 tree. | F-029 | ✅ |
| REX-205 | **configuration truth** (behaviour risk) | Linter + **five of six** dormant flags + the dead `jsx` config | F-028, **F-031 (partial — reviewer-ruled)**, F-034 | ✅ |
| REX-206 | **documentation** | `package.json` metadata, `engines`, `.nvmrc`, `SECURITY.md`, `CODE_OF_CONDUCT.md` | F-032, F-033, F-035 | ✅ |
| REX-207 | governance — **process** | PR template, `dependabot.yml`, `CODEOWNERS` | F-036 | ✅ |
| REX-208 | governance — **measurement** | Coverage **measured, not gated** | **F-030 (partial — reviewer-ruled)** | ✅ ~~🛑 BLOCKED — acceptance criterion not met.** v8 reports only *loaded* files, so `KnowledgeAssistant.ts` (410 lines, 0 tests — the largest known hole) is **absent from the report**, and the headline number flatters by omission. `coverage.all = true` had no effect under Vitest 4. **A coverage report that cannot show bad news is not measuring.** Needs a reviewer decision — see below. |

_Task breakdown **PLANNING-FROZEN** by the reviewer (AJ) on 2026-07-17. The M2 Planning Review passed:
the outcome-based allocation was ruled *"a materially stronger planning model because each task has a
single invariant it is responsible for protecting and validating"* — and *"a direct application of
M1's retrospective rather than a redesign of the milestone."* **REX-D7** (Biome) and **REX-D10**
(protected outcome, FPCP) accepted._

### Ratified at the M2 Planning Review (AJ, 2026-07-17)

| # | Decision | Outcome |
|---|---|---|
| 1 | **REX-202 + REX-203 ship together** | **Approved as proposed.** *"Working Increment applies at the **merge boundary**, not necessarily at the task boundary."* They stay **separate tasks**, are **reviewed separately**, and **merge in one PR** — preserving both clean ownership and a healthy repository state. |
| 2 | **[REX-D7](decisions/REX-D7.md)** — Biome | **Accepted.** One binary, one config, nothing to migrate. |
| 3 | **[REX-D10](decisions/REX-D10.md)** — protected outcome as an outcome, not a path | **Accepted (FPCP).** The formatter proof singled out: *"Mechanical changes should be demonstrably mechanical."* |
| 4 | **REX-208 — no coverage threshold** | **Approved.** *"Repository Excellence should establish facts before establishing policy."* And: *"The report is the canonical measurement. The documentation should describe the process, not today's number."* |
| 5 | Planning corrections (40 not 46; no M3-A coupling; `rootDir` constraint) | **Approved** as *"planning-quality improvements, not milestone changes."* |

### ✅ REX-208 — resolved: investigated, then Option 2 approved (AJ, 2026-07-17)

**The reviewer required investigation before accepting the limitation** — *"The repository should not
accept a tooling limitation until we've verified it is actually a tooling limitation."* It was, and
the investigation established it:

| Question | Answer |
|---|---|
| Vitest 4 `coverage.all`? | **Removed** — absent from the shipped types; passing it changes nothing |
| `coverage.include` restores it? | **No** — it *is* the v4 replacement and **does** take effect (the headline moves), but the report still lists only loaded files |
| **istanbul** provider differs? | **No** — installed and tested: identical behaviour, same figure, same omission |

**Author correction, accepted by the reviewer as the stronger description:** the report is **not**
incapable of showing bad news — `src/agent/`, `src/api/`, `src/config/` all show **0%** correctly.
**Its limitation is that a module graph nothing imports vanishes rather than reading zero.**
`KnowledgeAssistant.ts` (410 lines, 0 tests) is absent because *nothing imports it*. **46 of 167
files are reported.**

**Option 2 approved:** keep the measurement, document the limitation, **F-030 partially closed** as
*"baseline established with known tooling limitation."* The boundary is documented in
[`docs/project/coverage.md`](../../../docs/project/coverage.md), and **the headline must never be
quoted as repository coverage** — it is coverage *of the files in the report*, a different claim.

> *"A measured value is only meaningful when its measurement boundary is understood. Without that
> boundary, precision can easily be mistaken for completeness."* — reviewer

**The measurement gap and the testing gap are the same gap:** coverage becomes repository-wide when
the unreachable graphs get tests, and `KnowledgeAssistant.ts` is **M4's** (F-053).

---

### ~~🛑 REX-208 — blocked~~ (superseded above)

**REX-208's acceptance criterion is not met and the task is not complete.** The criterion:
*"Report **shows the known holes** (`KnowledgeAssistant.ts` near-zero) — proving it can report bad
news."*

**It does not.** `@vitest/coverage-v8` reports only files the suite **loaded**. `KnowledgeAssistant.ts`
has **zero tests** (F-053), so nothing imports it, so it **vanishes from the report entirely** rather
than appearing at 0%. `coverage.all = true` produced **no change** — the option appears to have
changed or been removed in Vitest 4.

**Consequence:** the headline figure measures *the files the suite happens to touch*, not *the code
that ships*. It is **flattering by omission**, which is the precise failure the task was written to
avoid. The report *does* show 24 files at 0% (`src/agent/`, `src/api/`, `src/config/`, `server.ts`),
so it is not useless — but it cannot show the hole that matters most.

**Not resolved by the author**, because the options are a reviewer's call:

| Option | Cost |
|---|---|
| **Find the Vitest 4 mechanism** for including untouched files | Unknown; may not exist in v4 |
| **Ship the report with the limitation documented** | The baseline is not a repository figure and must never be quoted as one |
| **Defer REX-208 entirely** | F-030 stays open; M2 ships without measurement |

**The limitation is recorded in `vitest.config.ts` itself** rather than papered over.

---

### ⚠️ Reviewer expectation carried into implementation — REX-203

> **When reviewing fixes, optimise for preserving intent over minimising diagnostics. If resolving
> one diagnostic exposes a deeper design question, prefer surfacing that question over forcing the
> repository back to zero warnings as quickly as possible. Repository Excellence exists to improve
> repository quality, not merely repository metrics.**

The reviewer also ruled on what success looks like there: *"If one of those casts turns out to hide a
genuine behavioural defect, **discovering that is success, not failure**."* **REX-203's objective is
not "make TypeScript happy" — it is to determine, per diagnostic, whether it represents a typing
deficiency or a behavioural defect.**

### The ownership-boundary re-read (reviewer requirement, 2026-07-17)

Required before this Planning Freeze, per the M1 lesson. **It found the defect it was looking for**,
plus two evidence corrections:

**The defect — three paths, each carrying multiple protected outcomes:**

| Path | Findings | Outcomes tangled |
|---|---|---|
| `tsconfig.json` | F-026, F-031, F-034 | **governance** (what is checked) + **behaviour risk** (flags surface real issues) + **hygiene** (dead config) |
| `.github/` | F-025, F-036 | **enforcement** (CI gates) + **process** (templates) — and **F-035 is the same outcome as F-036 but lives at root**, so path-allocation orphaned it |
| `package.json` | F-032, F-033 | co-owned; genuinely fine |

**Resolved** by the allocation above: each task now protects exactly one property.

**Correction 1 — the hidden-error count is 40, not 46** *(below the FPCP threshold: no scope,
sequencing, or acceptance change)*. The frozen inventory's **46** came from ad-hoc flags
(`--target es2022` without the matching `lib`), inventing six false errors in
`src/platform/retrieval/RetrievalService.ts` because `toSorted` is es2023. **The real `tsconfig`
sets `target: esnext`.** Verified honest count: **40 errors, all in `tests/`, zero in `src/`.** The
original exploration said 40; the author introduced the error while "verifying" it.

**Correction 2 — F-031 has no coupling to M3-A.** The frozen plan warns `noUnusedLocals` *"may fail
on the two orphaned identity resolvers"* (F-042). **Verified false** — exported symbols are not
unused locals. Actual damage: **one** unused type, `ProviderMetadata` at
`src/context-builder/providers/schema.ts:22`. **A cross-milestone dependency the plan assumed does
not exist.**

**Design constraint the plan omitted:** `tsconfig.test.json` **must widen `rootDir`**. Inheriting
`rootDir: ./src` yields **58× TS6059** and never reaches typechecking at all.

## Dependencies

### Requires
- M1 (gates are documented truthfully; CONTRIBUTING's stated policy becomes enforceable)
- **[REX-D7](decisions/REX-D7.md)** — Biome (accepted) · **[REX-D10](decisions/REX-D10.md)** — the
  protected outcome (accepted FPCP)

### Enables
- M3-A, M3-B, M4, M5 — every subsequent large diff is verified rather than trusted

## Validation

Per **[REX-D10](decisions/REX-D10.md)** — each clause carries a falsifier:

| Clause | Falsifier |
|---|---|
| Typecheck reaches tests | **`tsc --listFiles \| grep -c '/tests/'` > 0** — the direct falsifier of F-026 |
| **Formatting is mechanical** | **`format(pre-M2 tree) == post-M2 tree`.** A formatter is deterministic, so a formatting commit containing a semantic edit **fails this check**. |
| **No test removed, skipped, or weakened** | test count does not fall; no `.skip`/`.only`/`todo` introduced; `expect` count does not fall |
| Every non-mechanical `src/` change is **diagnostics-driven** | each traceable to the compiler or linter diagnostic that demanded it |
| Gates work | each demonstrated **failing** on a deliberate violation, then passing. *A gate never seen red is not known to work.* |
| Behaviour preserved | all existing tests pass |

## Definition of Done

- [x] Every measurable property green in CI — **five gates on the runner**.
- [x] Any of the **40** that prove to be **real test defects** recorded and fixed failing-test-first.
      *(Result: **zero** behavioural defects; **two design questions** surfaced instead.)*
- [x] Every clause of the protected outcome demonstrated **and shown able to fail**.
- [x] Freeze Review completed; **Milestone Freeze declared by the reviewer (AJ) on 2026-07-17.** _(All five §8 reservations weighed and ruled; the freeze granted on the milestone's protected outcome.)_
- [x] Retrospective created (§4.7 stage 7) — [retrospectives/RETROSPECTIVE-M2.md](retrospectives/RETROSPECTIVE-M2.md).

---

## M2 Freeze Review — Evidence (prepared for the reviewer)

> **M2 stays 🔨 in every progress table.** A freeze is a **reviewer decision, not a consequence of
> the author finishing the work** (§5.3/§5.4). Including §8 — the case *against*.

### 1. Tasks complete

REX-201..208, all ✅. **11 commits** (`0c6c873..HEAD`), 138 files.

### 2. The repository can now verify itself — five gates, on a clean runner

`format:check` · `lint` · `typecheck` (**incl. `tests/`**) · `build` · `test`, plus **coverage
reported, never blocking**. CI runs on every push and PR. **Before M2, `.github/` had never existed
in the repository's history.**

### 3. Every gate demonstrated **failing** under the condition it exists to detect

*A gate is defined by the condition under which it fails.*

| Gate | Probe | Result |
|---|---|---|
| typecheck | bad type annotation | ❌ → ✅ |
| build | same | ❌ → ✅ |
| test | `expect(1).toBe(2)` | ❌ → ✅ |
| format:check | mis-formatted line | ❌ → ✅ |
| **lint** | unused `const` | **passed at first — the gate was vacuous.** `biome lint` exits 0 on warnings. Fixed with `--error-on-warnings`; ❌ → ✅ |

### 4. The protected outcome (REX-D10) — verified, not asserted

| Clause | Evidence |
|---|---|
| Formatting is **mechanical** | **`format(pre-tree) == post-tree` across all 104 files**, and **proven able to fail** by smuggling a *validly-formatted* semantic edit |
| **No test removed, skipped, or weakened** | no `.skip`/`.only`/`todo`; **`expect()` rose 1097 → 1105 (+8)** |
| Behaviour preserved | **713 tests green** |
| `src/` changes **diagnostics-driven** | each traceable to the compiler/linter diagnostic that demanded it |

### 5. Frozen work untouched

VISION · ARCH · ADR-001..006 · AJS-007 · EOS/CB decisions and tasks · **`archive/`** — all clean.

### 6. Findings

**Closed:** F-025 (file level), F-026, F-027, F-028, F-029, F-032, F-033, F-034, F-035, F-036.
**Partial, reviewer-ruled:** F-031 (5 of 6 flags), F-030 (baseline + documented tooling limit).
**Surfaced, recorded not resolved:** **DQ-1**, **DQ-2**.

### 7. Decisions

**REX-D7** (Biome) · **REX-D10** (FPCP — protected outcome as outcome, **raised during Planning**,
the first REX plan defect caught *before* implementation).

### 8. What the reviewer should weigh — the case *against* a freeze

**Three gates were built wrong before they were built right, and all three were mine.** The lint gate
**exited 0 on warnings** and enforced nothing. The formatter **rewrote 36 files of frozen archive**
because `biome.json` cannot hold comments and Biome **silently fell back to defaults**. `npm run ci`
reported **green while no longer running the format gate at all**, after `git checkout -- .` reverted
`package.json`. **Each was caught by testing the gate — none by building it.** A reviewer may
reasonably ask what that says about the ones I did *not* think to test.

**Two findings close only partially, both by reviewer ruling.** F-031 (`noPropertyAccessFromIndexSignature`
deferred) and F-030 (coverage cannot see unreachable module graphs). **M2's headline claim —
*"every objectively measurable property machine-verified"* — is therefore not literally true**:
repository-wide coverage is not measurable with this tooling, and one strictness flag is off.

**The coverage report is partially honest, which is arguably worse than uniformly dishonest.** It
reports **46 of 167 files** and *looks* complete. It is mitigated by documentation
(`docs/project/coverage.md`), not by tooling — and documentation is exactly what M1 proved drifts.

**F-025 is half-open by construction.** CI runs; **nothing requires it to pass before a merge.**
Branch protection is a repository setting REX cannot make. **A gate that can be merged past is a
suggestion** — and every claim above about CI protecting the repository is, until then, a claim
about a gate that can be bypassed.

**Planning was measurably wrong twice.** The "46 errors" was **40**; the six-flag risk assessment
covered **two** flags. Both were caught by the re-read or by implementation — **neither by planning
review.**

### 9. Definition of Done

Three of five satisfied; the remaining two are the freeze itself and the retrospective that follows.

---

# Milestone M3-A — Public Surface *(contractual)*

## Objective

One export discipline, with frozen-surface dead code resolved **through** FPCPs rather than
around them. An export is a **promise to a consumer**; this milestone treats it as one.

## Deliverables

- Zero `export *` in `src/`
- Barrels pruned to what consumers need
- One FPCP per frozen-surface item, each with the reviewer's ruling
- Dead-export inventory
- REX-D5, REX-D8

## Task Progress

_Task breakdown authored at M3-A Planning. Findings: F-037..F-044._

## Dependencies

### Requires
- M2 (CI catches an accidental surface change)

### Enables
- **M3-B** — the surface must be settled before files move underneath it

## Validation

- **The surface diff is reviewed export-by-export and contains no renames**, so every line is a
  deliberate contract decision.
- Public-surface pins in `foundation.test.ts:29-56` updated **deliberately, never incidentally**.

## Definition of Done

- [ ] `context-builder/index.ts:5-6`'s privacy claim is **either true or deleted**.
- [ ] Every FPCP ruled **before** its dependent change (§7.2).
- [ ] Every dead export removed or **justified in writing**.
- [ ] Freeze Review completed; **Milestone Freeze declared by the reviewer**.
- [ ] Retrospective created.

---

# Milestone M3-B — Naming & Readability

## Objective

One file-naming rule, and an architectural taxonomy with a slot for **every** module — including
the agent layer, with its expected lifetime stated.

## Deliverables

- REX-D2 (the naming rule) recorded and applied
- CONTRIBUTING's architecture rule covering 100% of `src/`
- README's subsystem table including the agent layer

## Task Progress

_Task breakdown authored at M3-B Planning. Findings: F-023, F-045..F-048._

## Dependencies

### Requires
- **M3-A frozen** — a rename and an export change are indistinguishable in a barrel diff
- REX-D1 (the lifetime taxonomy)

### Enables
- M4, M5

## Validation

- **Rename-only commits**: `git show --stat` shows renames; content diffs are empty.
- **No export identifier changes.** If a rename appears to require one, it is a surface change and
  belongs to M3-A.

## Definition of Done

- [ ] Every file conforms to REX-D2 or is listed as a **reasoned exception**.
- [ ] CONTRIBUTING names every top-level `src/` module with its expected lifetime.
- [ ] Freeze Review completed; **Milestone Freeze declared by the reviewer**.
- [ ] Retrospective created.

---

# Milestone M4 — Structural Consistency & Genuine Duplication

## Objective

Evaluate duplication against the **shared-ownership criteria** and act only where all four hold
and no ratified decision forbids it. **"Keep parallel" is a valid outcome, recorded as a result
rather than a deferral.** Bring the agent layer and `KnowledgeAssistant` to the DI and testability
standard the rest of the repository already meets.

## Deliverables

- REX-D3 ruled and recorded
- The `FilesystemWikiStore` divergence closed — **unconditionally**
- `deepFreeze` consolidated **within `src/context-builder/` only**
- `KnowledgeAssistant` composition root + tests
- Agent-layer and handbook test suites

## Task Progress

_Task breakdown authored at M4 Planning. Findings: F-049..F-055._

## Dependencies

### Requires
- M2 (a safety net for the highest-risk code changes in the package)
- REX-D1 (the agent layer's status), REX-D3

### Enables
- M5

## Validation

- Characterization tests against all three path-guard copies **first**, proven green on current
  behaviour, **before** any consolidation is attempted.
- Both live n8n paths (`/agent/ask`, `/inbox/note`) verified working **before and after**.

## Definition of Done

- [ ] REX-D3 recorded, with **the EOS-005 tension explicitly addressed either way**.
- [ ] `end-of-session/contracts/immutable.ts` **untouched** (EOS-005).
- [ ] `KnowledgeAssistant` constructible with injected dependencies, and **tested**.
- [ ] The live capability is intact.
- [ ] Freeze Review completed; **Milestone Freeze declared by the reviewer**.
- [ ] Retrospective created.

---

# Milestone M5 — Comments, Errors & Test Craft

## Objective

Comments state constraints rather than restate code; errors share a taxonomy and a voice; the test
suite stays the repository's strongest asset.

## Deliverables

- REX-D6 (the comment rule) — **written down so it survives this review**
- REX-D4 (test helpers) ruled
- Shared error base + `cause` chaining + message conventions
- `printReport` made testable, matching `session.ts`'s exemplar

## Task Progress

_Task breakdown authored at M5 Planning. Findings: F-056..F-066._

## Dependencies

### Requires
- M4 (the code it comments is in its final shape)

### Enables
- Package completion

## Validation

- **The preserve-list in `FINDINGS.md` is verified line-by-line.** A comment is removed only when
  the code it describes is **provably gone**.
- All existing tests pass; no behaviour change beyond error-construction internals.

## Definition of Done

- [ ] Zero comments describing code that no longer exists.
- [ ] `catch (e) { if (e instanceof AjError) }` is possible, or REX-D3 records why not.
- [ ] **Every protected comment intact.**
- [ ] Freeze Review completed; **Milestone Freeze declared by the reviewer**.
- [ ] Retrospective created.

---

# Package-Level Decisions

Ruled at the package Planning Review, or scheduled for their milestone's Planning Review. Per
`implementation/CLAUDE.md` — *"Do not silently choose."*

| ID | Decision | Blocks | Status |
|---|---|---|---|
| **REX-D0** | Findings Inventory substitutes for §4.2 Specification Decomposition; §7.7 Tailoring applied deliberately and its result recorded | all | ✅ **Accepted** — ratified by the package Planning Freeze (AJ, 2026-07-17) |
| **REX-D1** | Where does the agent layer live architecturally? ARCH-001 amendment (needs an ADR, §3) vs. README/CONTRIBUTING only? | **M1** (REX-106), M3-B, M4 | ✅ **Accepted** — ruled at the M1 Planning Review (AJ, 2026-07-17). Document + recommend; **amend no architecture**. |
| **REX-D2** | File naming rule; converge classes-vs-factories or not? | M3-B | ⬜ M3-B Planning |
| **REX-D3** | Shared-ownership criteria applied to the path guard, model-JSON-parse, and the error base | M4, M5 | ⬜ M4 Planning |
| **REX-D4** | Consolidate test helpers, or reaffirm per-suite inlining? | M5 | ⬜ M5 Planning |
| **REX-D5** | Frozen-surface dead code — remove (FPCP), implement, or document? Per item. | M3-A | ⬜ M3-A Planning |
| **REX-D6** | The rule separating a load-bearing comment from noise | M5 | ⬜ M5 Planning |
| **[REX-D7](decisions/REX-D7.md)** | Toolchain: ESLint+Prettier vs Biome | M2 | ✅ **Accepted** — ruled at the M2 Planning Review (AJ, 2026-07-17). One binary, one config, nothing to migrate. |
| **REX-D8** | Extend `foundation.test.ts`'s public-surface enforcement beyond `end-of-session`? | M3-A | ⬜ M3-A Planning |
| **[REX-D9](decisions/REX-D9.md)** | 🛑 **FPCP** — M1's Objective/Validation (*"touches no `src/` or `tests/` file"* / *"diff is **empty**"*) contradicted REX-105's frozen scope (F-005/F-011/F-012 live under `src/` and `tests/`) **and REX-105's own acceptance criterion**. Which governs? | **M1** — REX-105 **halted** | ✅ **Accepted (FPCP)** — ruled at the M1 Planning Review (AJ, 2026-07-17). **Reading B** adopted (*"no code changes — no `.ts` file anywhere"*); M1's Objective and Validation amended to be intent-based; REX-105 unhalted. **The package's first FPCP**, raised before any edit and ruled before dependent work. |
| **[REX-D10](decisions/REX-D10.md)** | 🛑 **FPCP** — M2 legitimately changes executable source, so M1's path-based invariant does not transfer; M2's *"no runtime behaviour changes"* is the right intent but **not falsifiable** after a diff touching nearly every file. How is the protected property expressed and proven? | **M2** (all tasks; REX-203/205 carry the weight) | ✅ **Accepted (FPCP)** — ruled at the M2 Planning Re-read (AJ, 2026-07-17), **during Planning, before any implementation**. Protected property re-expressed as an **outcome** (mechanical-only source changes; no test weakened; behaviour preserved by the existing suite), each clause given a falsifier — chiefly the **formatter proof**. **The first REX plan defect caught before implementation rather than during it.** *(Added by the register reconciliation, 2026-07-17 — the decision was ratified in the M2 freeze but never entered this register.)* |

## Three complementary validation mechanisms — recorded by the reviewer (AJ, 2026-07-17)

Observed at the REX-105 review, **for the M1 Freeze Review**. The reviewer:

> **The Repository Excellence Review has now demonstrated three complementary validation
> mechanisms: evidence-based findings, repeatable assertion checks, and end-to-end execution.
> Each has discovered defects the others could not.**
>
> *That layered validation approach is becoming one of the most valuable engineering outcomes of the
> review itself.*

**The evidence, per mechanism — each row is a defect the other two missed:**

| Mechanism | Found | Could the others have? |
|---|---|---|
| **Evidence-based findings** | The `[2.0.0]` CHANGELOG counts are **legitimate history, not drift** — and the `src/handbook` ↔ `src/platform/handbook` "duplication" was **rejected outright**, no finding raised. | **No.** Both required *judgement about what the evidence means*. An assertion would have flagged the counts; execution would have said nothing. |
| **Repeatable assertion checks** | **A-09** found **two** stale claims (`src/context-builder/README.md:1104,1118`) that **F-012 never named** — it was written to check a finding and ended up checking the file. **A-06** proved REX-106's work was still outstanding rather than silently absorbed by REX-103. | **No.** The finding was blind to them; execution does not read READMEs. |
| **End-to-end execution** | `aj wiki build` **crashed** on a handbook built from the guide's own description — an unstated `foundation/`+`library/` prerequisite (**A-11**), plus the uncaught `SourceConnectorError` (**F-060 live**). | **No.** No document *claimed* the prerequisite, so **no assertion could exist for it**, and no finding named it. |

**The layering is the point, and the mechanisms fail in different directions:** findings capture
what a human noticed once; assertions make that repeatable and catch neighbours the human missed;
execution finds what nobody wrote down at all. **Assertions verify declarative truth; execution
verifies operational truth** (see below). Neither subsumes the other.

---

## The two dimensions of repository truth — ruled by the reviewer (AJ, 2026-07-17)

Recorded at the REX-104 review, after following `installation.md` end to end found a defect that no
amount of reading it could have.

> **Repository truth has two dimensions.**
>
> - **Declarative truth:** what the repository explicitly claims.
> - **Operational truth:** what actually happens when someone follows those claims.
>
> **A professional repository needs both.**

**The validation techniques are complementary, not competing** — and this is the boundary the
assertion inventory turned out to have:

| Technique | Verifies | Blind to |
|---|---|---|
| **The assertion inventory** | **Explicit claims** — every statement a document makes about the code | **Omitted assumptions.** It can only check the claims a document *chose to make*. |
| **End-to-end execution** | **Omitted assumptions** — the unstated prerequisites a reader hits when they actually do the thing | Nothing about intent; it only shows what happens. |

**The evidence.** `installation.md` was internally consistent. The implementation was internally
consistent. **Neither was wrong about anything it said.** The defect was a prerequisite
(`HANDBOOK_SOURCES = ["foundation", "library"]`) that *no document mentioned* — so no assertion
could exist for it, and static review could not have found it. Only running the guide did.

**Carries into every remaining milestone:** a documentation claim is verified by assertion; a
documented *workflow* is verified by running it. **The assertion inventory remains a durable output —
with an explicitly defined boundary rather than an assumed one.** Preserve this distinction in the
M1 retrospective.

---

## Documentation preserves intent, not just implementation — ruled by the reviewer (AJ, 2026-07-17)

Recorded at the REX-102 review, after the §8 canonical-vs-projection omission proved more valuable
to correct than any factual error in the same document.

> **Documentation should not merely describe the implementation. It should preserve the
> architectural intent that future implementations depend upon. Correcting those omissions is every
> bit as valuable as correcting factual inaccuracies.**

**Why it matters for the remaining milestones.** M1's findings are framed as *false claims* —
statements that are wrong and can be grepped. This principle widens the lens to **true statements
that omit what matters**, which no grep finds. SPEC-003 §8 was the case in point: it listed both
outputs accurately and never said which was authoritative, so a correct reader implementing SPEC-004
would reasonably have parsed the markdown — the exact coupling EOS-D4 exists to prevent. **The
implementation was right; the document would have made the next implementation wrong.**

**How it applies:** when correcting a document, ask not only *"is this true?"* but *"does this
preserve the decision a future implementer depends on?"* An omission that would mislead a competent
reader is a defect of the same severity as an error.

**The scope guard still binds.** *Recording* an existing architectural decision in the document that
should always have carried it is documentation truth — **in scope**. *Making* an architectural
decision because the document lacks one is platform evolution — **defer**. REX-102 stayed on the
right side of that line: every clarification it added cited an already-ratified decision (EOS-D1..D6).

---

## The REX FPCP threshold — ruled by the reviewer (AJ, 2026-07-17)

Ruled at the REX-101 review, after a task-ownership correction was raised as a possible amendment.
**This governs every remaining REX milestone.**

A **Repository Excellence Frozen Plan Change Proposal is required** only for a change that alters:

- **milestone scope**
- **objectives**
- **sequencing**
- **acceptance criteria**
- **reviewer decisions**

**Below that threshold** — for example, correcting which task owns a finding, where the milestone
objective, scope, and acceptance boundary are all unchanged and the finding still closes inside the
same milestone — the correction is **ordinary planning refinement discovered during implementation,
not a frozen-plan amendment.**

The required conduct below the threshold is unchanged and non-negotiable:

> **identify it · explain it · record it · never silently absorb it.**

*"That preserves traceability without creating unnecessary governance overhead."* The threshold
exists so that §7.2 keeps its force where it matters; an FPCP raised for everything is an FPCP
raised for nothing.

**Precedent:** the F-020 ownership correction (REX-101 → REX-105), ruled **not** an FPCP.

---

## The shared-ownership criteria (REX-D3)

**Duplication is evidence, not a verdict.** Two implementations that look alike may be two
independent things that resemble each other *today*; consolidating those couples lifecycles that
were correctly separate — which is precisely what **EOS-005 ratified** when it chose *"parallel,
not shared"* for `TextGenerator`. **Shared names are not evidence of duplicate responsibility, and
neither are shared shapes.**

A duplicated implementation qualifies for shared ownership **only if all four hold**:

| Criterion | The question |
|---|---|
| **Same responsibility** | Do the copies answer the *same* question, or merely compute a similar answer for different questions? |
| **Same lifecycle** | Would a correct change to one always be correct for the others — or could one legitimately diverge? |
| **Same ownership** | Is there one module that should own the rule, or would sharing force an arbitrary home and an unwanted dependency edge? |
| **Same change cadence** | Do they change together in practice, or has one been stable while another churns? |

**If any criterion fails, keeping the copies parallel is the correct outcome**, and the task
records why. **A decision not to consolidate is a result, not a deferral.**

**Two questions that must never be coupled:**

1. *Should these implementations be shared?* — **judgement**, reviewer-owned, REX-D3.
2. *Has one implementation objectively drifted into a defect?* — **a defect**, fixed on its own
   merits **regardless of the ruling**, and never held hostage to it. (F-050.)

---

# Cross-Milestone Risks

- 🔴 **Scope creep is the defining risk of a quality review.** Every finding suggests an adjacent
  improvement; the constraint list exists because the temptation is real. **Mitigation:** the
  scope guard (frozen, and it outranks every recommendation) + a **closed** `FINDINGS.md`. New
  findings are recorded, not actioned.
- 🔴 **This review touches everything, which is exactly what a freeze forbids.** **Mitigation:**
  every frozen-surface change is an FPCP with a ruling **before** dependent work. When in doubt:
  **halt and report** (§3) — never settle by invention at a lower layer.
- 🔴 **F-027 (the 46 hidden errors) is the highest-value and highest-risk item in the package.**
  Precedent is unambiguous: this gotcha hid **3 real defects** in SPEC-003. **Mitigation:** its own
  task; each error triaged **defect vs. type-narrowing** *before* any fix; budget generously.
- 🟠 **M2 lands before most fixes**, so the ratchet may block M3–M5 on pre-existing violations.
  **Mitigation:** deliberate. Baseline-suppress **narrowly and with a comment naming the milestone
  that removes the suppression** — never suppress silently.
- 🟠 **Reviewer fatigue.** Nine decisions, several FPCPs, six freeze reviews. **Mitigation:**
  REX-D0's §7.7 tailoring exists for this; decisions are front-loaded into each Planning Review
  rather than discovered mid-implementation — the thing that made SPEC-003's M5 need five plan
  amendments.
- 🟡 **A comment cleanup deletes irreplaceable knowledge.** **Mitigation:** the preserve-list is an
  explicit anti-finding in `FINDINGS.md`, and REX-D6 precedes any edit.

---

# Deferred (post-REX)

See [FINDINGS.md § Deferred](FINDINGS.md#deferred--recorded-not-actioned) — each real, each out of
scope. **Recording them is what stops them leaking in.** *(The count is deliberately not stated here:
the closed-inventory rule **appends** to that list by design, so any number written here is drift
waiting to happen — the F-010 lesson, applied to this document. The list is the record; its length is
derived from it.)*

---

# Completion Criteria

- [ ] `FINDINGS.md` exhausted: every finding actioned, deferred with reason, or ruled won't-fix.
- [ ] M1, M2, M3-A, M3-B, M4, M5 each Freeze-Reviewed and frozen **by the reviewer**.
- [ ] A retrospective for every milestone (plus SPEC-003's reconstructed one).
- [ ] Every measurable property green in CI, on every PR.
- [ ] Every judgement call has a recorded decision naming the **reasoning**, not just the outcome.
- [ ] Zero frozen decisions violated; every frozen-surface change traces to a ruled FPCP.
- [ ] The architecture documents describe what is **actually supported today**.
- [ ] **Behaviour unchanged except where a recorded defect fix required it** — `aj wiki build` and
      `aj session end` produce byte-identical output on the same inputs. **That equality is the
      package's core claim**, and like SPEC-003's canonical-unchanged proof it must be verified
      **able to fail** before it is trusted.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 1.3 | ✅ **MILESTONE 1 FREEZE DECLARED by the reviewer (AJ).** The Freeze Review passed: the milestone's objective — *improve repository truth without changing implementation behaviour* — is met on evidence. All five §8 reservations were weighed and ruled: the planning defects are *"an input to future Planning Reviews"*, not a freeze blocker; leaving the known-false checkbox was **the correct outcome** because *"the review derives much of its value from respecting its own governance even when doing so is inconvenient"*; F-022 *"cannot simultaneously be a deferred finding and a freeze blocker without changing the governing decision"* (REX-D1 stands); `SourceConnectorError`'s implementation ownership is outside M1; and the retrospective correctly follows the freeze — *"the failure of SPEC-003 to consistently produce retrospectives is itself evidence supporting that ordering."* **The reviewer's conclusion: the principal engineering contribution of M1 is not the twenty closed findings but the three complementary validation layers** — evidence-based findings, repeatable assertion validation, and end-to-end execution — *"each layer has demonstrated defects that the others could not detect."* **M1 is frozen; changes now follow the AJS-007 FPCP process.** |
| 2026-07-17 | 1.2 | **M1 implementation complete (REX-101..106) — Freeze Review evidence assembled; awaiting the reviewer.** 20 findings closed; the assertion inventory is **13/13**; **no `.ts` file modified by any M1 commit** (verified able to fail); 713 tests green; 488 links, 0 broken; no frozen artifact touched and no ADR authored. SPEC-003's two outstanding AJS-007 deliverables discharged — the reconstructed Retrospective (REX-101) and the closed hygiene backlog (REX-102). **[REX-D9](decisions/REX-D9.md), the package's first FPCP**, was raised by REX-105 before any edit and accepted, amending M1's Objective and Validation from a path-based claim to an intent-based one. **M1 stays 🔨 in every progress table — a freeze is a reviewer decision, not a consequence of the author finishing the work (§5.3/§5.4).** |
| 2026-07-17 | 1.1 | **Milestone 1 Planning FROZEN** by the reviewer (AJ). REX-101..106 ratified; M1 scope approved as documentation truth + lifecycle closure with **no source changes**. **REX-D1 accepted as recommended** — REX documents at README/CONTRIBUTING using the lifetime taxonomy and **recommends** a future ADR rather than authoring one; no architecture document is amended. Reviewer required the authority ordering stay explicit: *repository review → recommendation; architecture → ADR*. Reviewer also commended the re-verification of `FINDINGS.md` over transcription — specifically the CHANGELOG correction, where evidence overturned an assumption made during planning — and directed that standard to carry through the rest of the review. |
| 2026-07-17 | 1.0 | Roadmap created and **FROZEN at package level** by the reviewer (AJ). Four reviewer-required refinements were incorporated **before** the freeze: (1) the **governing scope guard**, stated to outrank every recommendation, with a narrow exception for work preserving an already-frozen invariant; (2) **M3 split into M3-A (contractual) and M3-B (readability)** with independent acceptance criteria — a rename and an export change are indistinguishable in a barrel diff, so the split is the control, not careful review; (3) **REX-D3 reframed as neutral investigation** against explicit shared-ownership criteria, decoupling *"should these be shared?"* from *"has one drifted into a defect?"*; (4) **fixed counts replaced with behavioural assertions** throughout, and hard-coded metrics promoted to their own finding class. Reviewer also confirmed the **Measurable vs. Judgement** classification is treated as an experiment, not elevated to AJS-007 until it survives repeated use. |

---

> **Engineering Rule**
>
> A quality review that changes what the platform does has stopped being a quality review.
>
> When a finding and the scope guard disagree, the guard wins.
>
> Duplication is evidence, not a verdict.
