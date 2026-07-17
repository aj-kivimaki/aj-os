# REX — Implementation Milestones

> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Specification:** _None._ Non-specification quality package; see [README § Why this package has no SPEC](README.md#why-this-package-has-no-spec) and [REX-D0](decisions/REX-D0.md).
>
> **Status:** **Package Planning FROZEN** by the reviewer (AJ) on **2026-07-17**. **Milestone 1 (Documentation Truth & SPEC-003 Lifecycle Closure) COMPLETE and FROZEN** (reviewer: AJ, 2026-07-17) — REX-101..106 delivered; 20 findings closed; assertion inventory 13/13; **no executable source modified**; SPEC-003's AJS-007 debt discharged. **REX-D0, REX-D1 accepted; REX-D9 accepted (the package's first FPCP).** M1 retrospective complete. **Next: M2 — Automated Quality Gates.** ⚠️ **Reviewer requirement for M2:** *before the M2 Planning Freeze, the planning must be reviewed explicitly for the ownership-boundary defects identified during M1.*

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
| M2 | Automated Quality Gates | Every measurable property machine-verified on every PR, and non-regressible | ⬜ |
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

Make every objectively measurable property machine-verified on every PR, and non-regressible.
**No runtime behaviour changes.** This is the ratchet the rest of the review depends on.

## Deliverables

- CI pipeline (typecheck + build + test) on push and PR
- `tsconfig.test.json` — and the 46 hidden errors resolved
- Formatter + linter + the six dormant `tsconfig` strictness flags
- Complete `package.json` metadata; Node version pinned
- `.github/` supporting configuration; `SECURITY.md`; `CODE_OF_CONDUCT.md`
- Coverage **measured, not gated**
- REX-D7 (toolchain choice)

## Task Progress

_Task breakdown authored at M2 Planning. Findings: F-025..F-036._

## Dependencies

### Requires
- M1 (gates are documented truthfully; CONTRIBUTING's stated policy becomes enforceable)

### Enables
- M3-A, M3-B, M4, M5 — every subsequent large diff is verified rather than trusted

## Validation

- **`tsc --listFiles | grep -c '/tests/'` > 0** — the direct falsifier of F-026.
- Each gate is demonstrated **failing** on a deliberate violation, then passing. *A gate never
  seen red is not known to work* — the standard SPEC-003 set with its canonical-unchanged proof.
- All existing tests pass, with **no test removed, skipped, or weakened** to make a gate green.

## Definition of Done

- [ ] Every measurable property in the README table green in CI.
- [ ] Any of the 46 that prove to be **real test defects** are recorded as findings and fixed
      failing-test-first — **not silently `!`-ed away**.
- [ ] Freeze Review completed; **Milestone Freeze declared by the reviewer**.
- [ ] Retrospective created.

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
| **REX-D7** | Toolchain: ESLint+Prettier vs Biome | M2 | ⬜ M2 Planning |
| **REX-D8** | Extend `foundation.test.ts`'s public-surface enforcement beyond `end-of-session`? | M3-A | ⬜ M3-A Planning |
| **[REX-D9](decisions/REX-D9.md)** | 🛑 **FPCP** — M1's Objective/Validation (*"touches no `src/` or `tests/` file"* / *"diff is **empty**"*) contradicts REX-105's frozen scope (F-005/F-011/F-012 live under `src/` and `tests/`) **and REX-105's own acceptance criterion** (*"README files only, no `.ts` file"*). Both frozen at the same review, same layer — §3 offers no resolution. Which governs? | **M1** — REX-105 **halted** | ⬜ **PROPOSED — awaiting the reviewer.** Proposes **Reading B**: *"No **code** changes — no `.ts` file anywhere"*. Reading A would defer three findings, one **Blocking** (F-005: a shipped, frozen module's README still says it has *"no behavior"*). **The first REX FPCP** — clears the threshold on two counts: **objective** and **acceptance criteria**. |

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

See [FINDINGS.md § Deferred](FINDINGS.md#deferred--recorded-not-actioned) — 14 items, each real,
each out of scope. **Recording them is what stops them leaking in.**

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
