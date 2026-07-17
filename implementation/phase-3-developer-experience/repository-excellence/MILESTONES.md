# REX — Implementation Milestones

> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Specification:** _None._ Non-specification quality package; see [README § Why this package has no SPEC](README.md#why-this-package-has-no-spec) and [REX-D0](decisions/REX-D0.md).
>
> **Status:** **Package Planning FROZEN** by the reviewer (AJ) on **2026-07-17**. The Review Findings Inventory, this roadmap, the governing scope guard, the sequencing, and the package-level decisions are frozen. **This freeze is package-level and is deliberately separate from each milestone's own Planning → Planning Review → Planning Freeze.** **Milestone 1 Planning FROZEN by the reviewer (AJ) on 2026-07-17** — REX-101..106 ratified; **REX-D1 accepted as recommended** (REX declines to amend frozen architecture; it documents and recommends). M1 implementation in progress.

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
| M1 | Documentation Truth & SPEC-003 Lifecycle Closure | Every document describes the repository that exists today; SPEC-003's two outstanding AJS-007 deliverables discharged | 🔨 **Planning FROZEN** (AJ, 2026-07-17) — in progress |
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
outstanding AJS-007 deliverables. **No source file changes** — this milestone's diff touches no
`src/` or `tests/` file, and that is a testable claim.

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
| REX-102 | Apply the SPEC-003 specification-hygiene backlog (F-019) | ⬜ |
| REX-103 | Root documentation truth pass — README, ROADMAP, CHANGELOG (F-001, F-008, F-009, F-010) | ⬜ |
| REX-104 | Guides truth pass — installation, configuration, development (F-002, F-013..F-017) | ⬜ |
| REX-105 | Module & package README truth pass (F-005, F-006, F-007, F-011, F-012, F-021, F-024) | ⬜ |
| REX-106 | The "owns git commits" contradiction + agent-layer representation (F-003, F-004, F-022) | ⬜ |

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
- `git diff --stat src/ tests/` is **empty**.
- Link crawl holds its clean baseline (0 broken across the repository).

## Definition of Done

- [ ] REX-101..106 complete (or REX-106 explicitly deferred if REX-D1 defers it).
- [ ] Assertion inventory recorded and re-runnable.
- [ ] No document hard-codes a live test count.
- [ ] Freeze Review completed; **Milestone Freeze declared by the reviewer**.
- [ ] Retrospective created (§4.7 stage 7).

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
