# REX — Review Findings Inventory

> **Implementation Package:** REX — Repository Excellence Review
>
> **Role:** **Lifecycle Prerequisite** (AJS-007 §8.2). Substitutes for §4.2 Specification Decomposition per [REX-D0](decisions/REX-D0.md). Produced **before** the lifecycle begins; **not** a lifecycle stage.
>
> **Status:** **FROZEN** as part of the package Planning Freeze declared by the reviewer (AJ) on 2026-07-17.

---

# Purpose

This is the **roadmap of record**. It establishes the milestone structure that the lifecycle
delivers, exactly as a Specification Roadmap would.

**The inventory is closed.** New findings discovered during implementation are **recorded here as
`Deferred — post-REX`, never actioned**. That rule is the primary defence against the package's
defining risk: a quality review that grows without limit because every finding suggests an
adjacent improvement. AJS-007 §6.1 **Scope Discipline** governs; cite it by name.

---

# How to read this

## The evidence rule

**No finding enters a milestone without reproducible evidence.** Every row carries a command or a
`file:line` that a reviewer can run or open. Claims are **proven, not asserted** — the standard
SPEC-003 set (*"Verified by grep"*, *"Verified adapter-only by diff: one file changed"*, *"the
canonical-unchanged proof was itself verified to be able to fail"*).

All evidence below was verified against the working tree at `9bd051d` on **2026-07-17**.

## Classification — `class`

| Value | Meaning |
|---|---|
| **M** — Measurable | A machine decides. The reviewer does not need to. |
| **J** — Judgement | No tool can settle it. Reviewer attention is the only instrument. |

The classification is an **experiment** (see [README § Measurable vs. Judgement](README.md#measurable-vs-judgement)), not a standard. Where a finding resists classification, that is **evidence about the boundary** and belongs in the retrospective.

## Severity

| Value | Meaning |
|---|---|
| **Blocking** | A document states a falsehood, or a mandatory AJS-007 mechanism failed. |
| **Major** | Real cost to correctness, safety, or maintainability. |
| **Minor** | Consistency and polish. |

## `frozen?`

**Yes** ⇒ the fix touches frozen work ⇒ an **FPCP is mandatory** and must be **ruled before**
dependent work begins (AJS-007 §7.2).

---

# The Assertion Inventory

> **Established by REX-103.** Extended by REX-104 (guides), REX-105 (module READMEs), REX-106.

**This is the artifact that makes "the documentation is accurate" re-runnable.** Without it, M1 is a
tidy-up that decays; with it, drift is detectable.

Each row is **a falsifiable assertion about the code**, with the command that proves or disproves
it. This is the reframing that moves *"docs are accurate"* from **Judgement** to **Measurable**, and
it is the load-bearing move of the whole classification — so it is worth being precise about what it
does and does not cover.

**What it covers:** claims a document makes about what the code *is* or *does*. Those are
mechanically checkable, and a machine should check them.

**What it does not cover, and must not pretend to:** whether the README is *welcoming*, whether an
explanation is *clear*, whether the ROADMAP's priorities are *right*. Those are Judgement, and no
command settles them. **A claim that resists mechanical checking is evidence about the
classification's boundary** and belongs in the retrospective — not a row to be forced into this
table.

**Not automated in M1.** These are commands a reviewer runs. Automating them is a quality gate, and
**M2 owns quality gates** — noted there rather than built here.

> ### ⚠️ Read this before automating these in M2
>
> **A naive `grep` gives wrong answers on markdown prose, and gave three during M1.** Every case was
> a **false result about a correct document** — the dangerous direction, because it invites
> "fixing" text that was already right.
>
> 1. **Line wrapping** splits a claim across lines. `reviewPath ... (default **knowledge-review**)`
>    spans two lines, so a single-line `grep` reported the guide as missing a default it documented
>    correctly (REX-102).
> 2. **Blockquote markers survive a naive join.** After `tr '\n' ' '`, *"so no component performs
>    it"* becomes *"so no **>** component performs it"* — the assertion fails on correct text
>    (REX-106).
> 3. **`sed 's/^\s*>\s\?//'` silently does nothing on macOS** — BSD `sed` does not support `\?` in
>    BRE. **No error; it just doesn't strip.** The check then "fails" while appearing to normalise.
>
> **The fix:** normalise before matching — strip blockquote markers, unwrap lines, squeeze
> whitespace — with a real parser or Python, **not** a `sed`/`tr` pipeline. The working
> implementation is in REX-106's validation.
>
> **The deeper point for M2:** an assertion that reports a false failure trains its reader to ignore
> it. **A flaky gate is worse than no gate**, because it converts a signal into noise and teaches
> the team to override it.

| ID | Assertion | Documented in | Command | Expect |
|---|---|---|---|---|
| A-01 | SPEC-003 is shipped, not "next" | `README.md` | `grep -q '\*\*Next:\*\* the workflows.*SPEC-003' README.md` | **no match** |
| A-02 | `aj session end` is documented | `README.md` | `grep -q 'aj session end' README.md` | **match** |
| A-03 | "Resume Here" does not point at completed SPEC-003 work | `ROADMAP.md` | `sed -n '/^# Resume Here/,/^# Phases/p' ROADMAP.md \| grep -qE '^1\. \*\*End-of-Session'` | **no match** |
| A-04a | SPEC-003 is recorded as shipped | `CHANGELOG.md` | `sed -n '/^### Added/,/^### Planned/p' CHANGELOG.md \| grep -q 'SPEC-003'` | **match** |
| A-04b | SPEC-003 is no longer listed as Planned | `CHANGELOG.md` | `sed -n '/^### Planned/,/^---/p' CHANGELOG.md \| grep -q 'SPEC-003'` | **no match** |
| A-05 | No **live** hard-coded test count | root docs | `grep -nE '\*\*[0-9]{2,4} tests\*\*' README.md ROADMAP.md CHANGELOG.md` | **only** matches under a released `## [x.y.z]` heading — those are history, not drift |
| A-06a | **No component is credited** with owning git commits | `docs/README.md`, `ROADMAP.md` | `grep -rn "owns commits\|owns git commits" docs/README.md ROADMAP.md \| grep -v "Nobody owns git commits"` | **no match** — ✅ **REX-106** |
| A-06b | **The deferral is positively recorded**, with its authority | `docs/README.md`, `ROADMAP.md` | both cite **ADR-002** and state that **no component performs the commit** | **match** — ✅ **REX-106**. *Deletion alone would have passed A-06a and lost the intent; this row is why.* |
| A-07 | The wiki generator is not described as unwired | `docs/guides/installation.md` | `grep -rn "not yet wired\|known limitation" docs/guides/` | **no match** — ✅ **REX-104** |
| A-08 | Every shipped `handbook` config key is documented | `docs/guides/configuration.md` | each of `path`, `generatedWikiPath`, `reviewPath` appears; cross-check `src/platform/config/ConfigService.ts` | **all three** — ✅ **REX-104** |
| A-09 | No module README understates its module's status | `src/*/README.md`, `tests/*/README.md` | `grep -rn "No behavior\|pending Freeze Review" src/ tests/ --include="*.md"` | **no match** — ✅ **REX-105**. *Caught **two instances the finding did not name** (`src/context-builder/README.md:1104,1118`) — the assertion outperformed the inventory row that spawned it.* |
| A-10 | Documented CLI flags match the code | guides, specs | compare against `src/cli/index.ts` | **exact** — ✅ REX-102 (spec), ✅ REX-104 (guides) |
| **A-11** | **The handbook layout `aj wiki build` requires is documented** | `docs/guides/installation.md`, `README.md` | both `foundation` and `library` named as required; cross-check `HANDBOOK_SOURCES` at `src/knowledge/composition/createKnowledgePipeline.ts:41` | **match** — ✅ **REX-104**. *Added by REX-104: the guide described "a directory of notes" and `aj wiki build` crashed on one. **No assertion existed for a prerequisite nobody had written down.*** |

**Status at M1 completion (REX-106):** **every assertion passes.**

## Two lessons the inventory taught about itself

**1. A-11 — an inventory built by reading documents is blind to what they never said.** A-01..A-10
all assert against claims a document *makes*. A-11 asserts a prerequisite **no document made**
(`foundation/`+`library/`), found only by running the guide end to end. **No assertion could have
existed for it**, because assertions are derived from text. This is the reviewer's *declarative vs.
operational truth* distinction, discovered the hard way.

**2. A-06 fired on the correct answer, and had to be split.** The original assertion grepped for
`owns commits|owns git commits` and expected no match. REX-106's **correct** replacement text —
*"**Nobody** owns git commits — deliberately"* — contains that string, so the assertion **failed on
the very fix it was written to verify.** It was matching a **string**, not a **claim**.

Split into **A-06a** (no component is *credited*) and **A-06b** (the deferral is *positively
recorded*, citing ADR-002). **A-06b exists because deletion alone would have passed A-06a** — the
document would have been silent about commits, which is exactly the failure the reviewer's
intent-preservation principle names.

**The general lesson, for M2 when these are automated:** an assertion written against a falsehood
can fire on the truth that replaces it. **A negative assertion (`grep` → no match) is only as
precise as its pattern**, and a pattern derived from broken text tends to encode the breakage. Pair
every "the falsehood is gone" check with a "the truth is present" check — the first alone cannot
distinguish *corrected* from *deleted*.

---

# M1 — Documentation Truth & SPEC-003 Lifecycle Closure

## Falsifiable false claims

Each is a **falsifiable assertion about the code**, which is why these are Measurable rather than
Judgement — the reframing that makes "docs are accurate" testable.

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-001 | M | Blocking | No | ✅ **CLOSED** (REX-103) — README now records SPEC-003 as **Captured** and names SPEC-004 as Next. — `README.md:90-91` — *"**Next:** … End-of-Session (SPEC-003) and Knowledge Review (SPEC-004)"*. SPEC-003 shipped. | `grep -n "Next:" README.md`; `git log --oneline 9bd051d` |
| F-002 | M | Blocking | No | ✅ **CLOSED** (REX-104) — limitation text and Troubleshooting entry removed; `aj wiki build` documented as the answer. Verified by running it. — `docs/guides/installation.md:51-56` — the wiki generator is *"implemented but **not yet wired to a runnable command**"*, and *"no generated wiki" is a "**known limitation**"*. **README:58 documents `aj wiki build`. The two docs contradict each other.** | `grep -n "not yet wired\|known limitation" docs/guides/installation.md`; `src/cli/commands/wiki.ts` |
| F-003 | M | Blocking | No | ✅ **CLOSED** (REX-106) — the credit is gone **and** the deferral is positively recorded: `docs/README.md` now states that ADR-002 puts version control with orchestration, that **no component performs it**, and that this is a **deliberate gap, recorded rather than filled**. — `docs/README.md:74` — *"SPEC-003 \| End-of-Session (**owns commits**)"*. **Contradicts a frozen decision**: ADR-002 / AJS-005 §7 exclude git writes from v1, verified absent at the M5 freeze. | `grep -n "owns commits" docs/README.md`; ADR-002 |
| F-004 | M | Blocking | No | ✅ **CLOSED** (REX-106) — falsehood removed by REX-103 (it lived inside the stale Resume Here item); **the deferral positively recorded by REX-106**: ROADMAP now carries an explicit ⬜ marker — *"Nobody owns git commits — deliberately, and this is a known gap"* — citing ADR-002 and AJS-005 §7. **Deletion alone would have left the document silent**, which is why A-06b exists. — *(REX-103 note: falsehood removed)* — the claim lived *inside* "Resume Here" item 1, which F-008 deleted as stale. **Not yet closed:** deletion removes the error but not the omission. **REX-106 must positively record** that the commit role is deferred (ADR-002 / AJS-005 §7) and that **no component owns it**, per the reviewer's intent-preservation principle. — `ROADMAP.md:26` — *"**owns git commits** (the engine never commits)"*. | `grep -n "owns git commits" ROADMAP.md` → now no match |
| F-005 | M | Blocking | No | ✅ **CLOSED** (REX-105) — status block now records all five milestones frozen; the *"arrives later"* table replaced with per-milestone freeze dates; a **permanent** *"what this module does not do"* section added (no git write, no wiki generation, never modifies canonical). — `src/end-of-session/README.md:5,7,54` — *"Status: Milestone M1 … **No behavior yet** — collection, extraction, generation, persistence, projection, and the `aj session end` CLI arrive in M2–M5."* All five milestones are frozen; `aj session end` ships. | `grep -n "No behavior" src/end-of-session/README.md` |
| F-006 | M | Blocking | No | ✅ **CLOSED** (REX-105) — now records the pipeline as wired end to end via `aj wiki build` through the composition root. — `implementation/phase-2-core-platform/README.md` — *"**no CLI command or service currently invokes `WikiGenerator.run()`**"*. False. | `src/cli/commands/wiki.ts` |
| F-007 | M | Blocking | No | ✅ **CLOSED** (REX-105) — SPEC-003 moved to a *Completed Phase 2 work* section with its freeze dates and the ADR-002 deferral. — `implementation/phase-2-core-platform/README.md` — *"SPEC-003 … **Planning frozen; Milestone 1 ready to implement**"*. SPEC-003 is complete and merged. | `MILESTONES.md` v1.33 |
| F-008 | M | Blocking | No | ✅ **CLOSED** (REX-103) — "Resume Here" now leads with REX (in progress), then SPEC-004; Phase 2's End-of-Session marker flipped to ✅. — `ROADMAP.md` — the single **"Resume Here"** pointer aims at completed SPEC-003 work. The one place a reader looks to find the next task is wrong. | `ROADMAP.md` §Resume Here |
| F-009 | M | Blocking | No | ✅ **CLOSED** (REX-103) — SPEC-003 recorded under `[Unreleased] → Added` describing capabilities, not counts; removed from `Planned`. — `CHANGELOG.md:9` `[Unreleased] → Planned:` still lists SPEC-003. **SPEC-003 appears nowhere as `Added`** despite 26 tasks, 5 milestones, 11 decisions and a shipped command across PRs #6–#11. | `grep -n "^## \[" CHANGELOG.md` |
| F-024 | M | Minor | No | ✅ **CLOSED** (REX-105) — scoped to *"the implementation package's roadmap of record"*; the sentence's real point is preserved, not deleted. — `implementation/review/SPEC-FREEZE-REVIEW.md:142` — *"there is **no separate ROADMAP document**"*. A top-level `ROADMAP.md` exists. Likely means "per implementation package", but reads as a flat contradiction. | `ls ROADMAP.md` |

## Hard-coded metrics that drift by construction

**A distinct finding class.** The defect is **the count, not its value** — updating it re-arms the
same trap. The fix is to remove it or generate it. *A document that cannot drift needs no
synchronization*, which is cheaper than any documentation-sync mechanism.

**Scope boundary, verified:** counts under a **released version heading are legitimate history**
and are **out of scope**. `CHANGELOG.md:106,113,120` (*"the suite grew from 63 → 119 tests
(CB-012)"*) sit under `## [2.0.0] - 2026-07-11` and record what was true at that release. Only
**live claims** are findings.

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-010 | M | Major | No | ✅ **CLOSED** (REX-103) — the count was **removed, not updated**; replaced with the guarantee it was trying to convey. — `CHANGELOG.md:55` — *"the test suite grew to **340 tests**"* sits under **`[Unreleased]`** (line 9), not a released heading. It is a live claim and it has drifted. | `awk 'NR<=55 && /^## /{h=$0;n=NR} END{print n": "h}' CHANGELOG.md` → `9: ## [Unreleased]` |
| F-011 | M | Major | No | ✅ **CLOSED** (REX-105) — count **removed, not updated**; the surrounding sentence already states the guarantee (deterministic, fast) and cannot drift. — `tests/context-builder/README.md:19` — *"**Current** size: **205 tests across 15 files**"*. The word *Current* makes it a live claim. **Actual: 207 across 15.** | `npx vitest run tests/context-builder` → `Tests 207 passed` |

## Missing documentation for things that exist

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-013 | M | Major | No | ✅ **CLOSED** (REX-104) — documented, with the default cross-checked against `ConfigService.ts:13`. — `docs/guides/configuration.md` omits **`handbook.generatedWikiPath`** — shipped, and README:68 calls it *"one configuration contract"*. | `src/platform/config/ConfigService.ts:107,118` |
| F-014 | M | Major | No | ✅ **CLOSED** (REX-104) — documented, with the default cross-checked against `ConfigService.ts:20`. — `docs/guides/configuration.md` omits **`handbook.reviewPath`** — shipped by EOS-303. | `src/platform/config/ConfigService.ts:108,138` |
| F-015 | M | Major | No | ✅ **CLOSED** (REX-104) — `aj session end` documented in `installation.md` with a flag table and its three guarantees, each proven by an end-to-end run. — **`aj session end` is documented nowhere outside `implementation/`** — not in README, installation, configuration, or development. | `grep -rn "session end" README.md docs/guides/` |
| F-016 | M | Major | No | ✅ **CLOSED** (REX-104) — `aj wiki build` documented, including the handbook layout it requires. — `aj wiki build` absent from the guides. | `grep -rn "wiki build" docs/guides/` |
| F-017 | M | Minor | No | ✅ **CLOSED** (REX-104) — corrected to `generatedWikiPath` (default `wiki-generated`). — `docs/guides/installation.md:60` — *"a handbook that contains a **`wiki/`** directory"*. The contract is `handbook.generatedWikiPath`, default **`wiki-generated`**. | `aj.config.example.json` |

## AJS-007 compliance failures

**These are not stale docs. They are mandatory mechanisms that did not run.**

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-018 | M | **Blocking** | No | ✅ **CLOSED** (REX-101, 2026-07-17) — `spec-003-end-of-session/retrospectives/RETROSPECTIVE.md` authored, covering M1–M5, **labelled reconstructed**. §9.2 answered: the practice **partially** generalises. — **No retrospective exists for any of the five SPEC-003 milestones**, yet all five were frozen. Violates AJS-007 §4.7 stage 7, §8.1 (a Lifecycle Deliverable), `SPEC-FREEZE-REVIEW.md` Step 8, and its Freeze Decision box *"Retrospective completed (accumulated, not overwritten)"*. **SPEC-002 has four.** §9.2 designated SPEC-003 as AJS-007's own validating evidence and §3 makes the retrospective the **only** upward path — so that evidence has never travelled. | `ls implementation/phase-2-core-platform/spec-003-end-of-session/` → no `retrospectives/`; compare `spec-002-context-builder/retrospectives/` (4 files) |
| F-019 | M | **Blocking** | No | ✅ **CLOSED** (REX-102, 2026-07-17) — all seven items applied as one batched revision; SPEC-003 Draft **v1.0 → v1.1**; backlog closed. Items 2/3 verified against the code. — `implementation/backlog/SPEC-003-specification-hygiene.md` — **all 7 boxes unchecked**, though the document states they must land *"no later than the SPEC-003 implementation Freeze Review"*. That freeze happened on 2026-07-17. **The deadline was self-declared and missed.** | `grep -c "^- \[ \]" implementation/backlog/SPEC-003-specification-hygiene.md` |
| F-020 | M | Major | No | ✅ **CLOSED** (REX-105) — annotation now reads `RETROSPECTIVE.md — M1–M5, reconstructed`, describing what happened rather than the process that didn't. — **REX-105** (reassigned from REX-101 — the plan double-assigned it). `spec-003-end-of-session/README.md:203` documents `retrospectives/ (added at each Milestone Freeze)`. REX-101 made the **directory** exist; the **annotation is still false** — it was added **once, late**, not at each freeze. REX-105 must make the line describe what happened. | `sed -n '203p' spec-003-end-of-session/README.md` |
| F-012 | M | Major | No | ✅ **CLOSED** (REX-105) — M1–M4 recorded as frozen and shipped in v2.0.0. **A-09 caught two further instances** at `:1104` and `:1118` that the finding did not name. — `src/context-builder/README.md` — *"M4 … implementation complete, **pending Freeze Review**"*. SPEC-002 M4 is frozen (✅) and v2.0.0 shipped Assembly. Same class as F-005: **AJS-007 §7.4 Documentation Synchronization is Mandatory and failed silently at two separate freezes.** | `spec-002-context-builder/MILESTONES.md` |
| F-021 | M | Minor | No | ✅ **CLOSED** (REX-105) — ticked; records `9bd051d` (PR #11). — `spec-003-end-of-session/README.md:333` — `- [ ] Merged into main. _(M5 pull request open — the last step.)_` PR #11 merged as `9bd051d`. | `git log --oneline -1 9bd051d` |

## Architectural representation

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-022 | **J** | Major | **Depends** | **The agent layer has no architectural home.** `src/agent/`, `src/handbook/`, `src/api/` are live (n8n calls `/agent/ask` and `/inbox/note`) but appear in **no** architecture document and **not** in README's subsystem table. ARCH-001 is frozen; amending it requires an ADR (§3). **Blocked on [REX-D1](decisions/) — must be ruled before the task proceeds.** | `grep -ohE '"url".*' infrastructure/n8n/workflows/*.json`; `grep -rn "src/agent" docs/architecture/` |

---

# M2 — Automated Quality Gates

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-025 | M | **Blocking** | No | ✅ **CLOSED at the file level** (REX-201, 2026-07-17) — `.github/workflows/ci.yml` runs typecheck+build+test on push and PR; all three gates **demonstrated failing, then green**. ⚠️ **Half the finding remains and is the reviewer's:** branch protection is a **repository setting, not a file**, so nothing yet *requires* the check before merge. **A gate that can be merged past is a suggestion.** Recommendation recorded in [REX-201](tasks/REX-201.md). — **`.github/` does not exist and never has.** 11 PRs merged with **zero** automated gates, while `CONTRIBUTING.md:72` and `docs/guides/development.md:51` both mandate typecheck+build+test. **A policy stated twice and enforced zero times.** | `ls -d .github` → absent; `git log --all --oneline -- .github \| wc -l` → **0** |
| F-026 | M | **Blocking** | No | ✅ **CLOSED** (REX-202, 2026-07-17) — `tsconfig.test.json` created with **`rootDir` widened**; `typecheck` now runs both projects. **`tsc --listFiles \| grep -c '/tests/'` → 60** (was 0); **zero TS6059**; `build` still green and `dist/` still free of test artefacts. The planning-measured constraint held exactly. — **`npm run typecheck` type-checks zero test files.** `tsconfig.json:46` `include: ["src"]` is the sole file-selection directive. ~11k lines never checked. | `npx tsc --noEmit --listFiles \| grep -c '/tests/'` → **0** |
| F-027 | M | **Blocking** | No | ✅ **CLOSED** (REX-203, 2026-07-17) — all **40** resolved; `tsc -p tsconfig.test.json` → **0**. **Every one triaged** against the reviewer's three-way taxonomy. **Verdict: 40× incorrect type, 0 behavioural defects — and 2 design questions surfaced ([DQ-1](#deferred--recorded-not-actioned), [DQ-2](#deferred--recorded-not-actioned)).** The two `TS2352` casts — the task's stated highest risk — were **proven able to fail** (frozen push → TypeError; unfrozen → no throw), so the immutability guarantee is real and the casts were a typing issue. **Assertions went UP, 387 → 395**: eight guards added where an index was unguarded, none removed; no `.skip`/`.only`/`todo`; 713 tests still green; **`src/` untouched**. — **40 errors hidden by F-026**, all in `tests/`, none in `src/`. Precedent: this gotcha hid **3 real defects** during SPEC-003 — **REX-203 found a 4th instance of the mechanism** (EOS-303's required `reviewPath` silently broke a SPEC-005 fixture). | `tsc -p tsconfig.test.json` → **0** |
| F-028 | M | **Blocking** | No | ✅ **CLOSED** (REX-205) — Biome linter + `npm run lint` + CI gate. `implementation/CLAUDE.md`'s *"pass linting"* is now **enforceable**. ⚠️ **The gate was vacuous on first build** — `biome lint` exits 0 on warnings, so an unused `const` passed it. Fixed with `--error-on-warnings`; **demonstrated failing, then passing**. — **No linter exists**, yet `implementation/CLAUDE.md` § Code Quality requires code to *"pass linting"* and `CONTRIBUTING.md:75-77` asserts code conventions. **The instruction is unenforceable.** | `ls .eslintrc* eslint.config.* biome.json*` → none; `grep -c '"lint"' package.json` → 0 |
| F-029 | M | Major | No | ✅ **CLOSED** (REX-204, 2026-07-17) — Biome formatter at `lineWidth: 90`; isolated commit **proven mechanical** (`format(pre-tree) == post-tree` across 104 files, **verified able to fail**). ⚠️ **The finding's premise is FALSE and that is the real point:** the code is **not** *"formatted consistently by hand"* — `src` and `tests` were written to different widths and no width leaves the tree untouched (80 → ~1058 lines, 90 → ~504). **The inconsistency is the argument for a formatter.** Two traps found by running it: the formatter rewrote the **frozen `archive/`**, because **`biome.json` cannot contain comments** and Biome **silently fell back to defaults** while `--write` ran anyway → moved to `biome.jsonc`. — No formatter (`.prettierrc*`, `biome.json`, `.editorconfig` all absent). | `ls .prettierrc* .editorconfig` → none |
| F-030 | M | Major | No | 🔨 **PARTIALLY CLOSED — reviewer-ruled** (REX-208, 2026-07-17). **Baseline established; repository-wide coverage NOT measurable with supported Vitest 4 tooling.** `@vitest/coverage-v8` + `test:coverage` + a CI step that **reports and never blocks**. **No thresholds** — *"establish facts before establishing policy."* **The limitation, established by investigation not assumption:** Vitest 4 **removed** `coverage.all`; `coverage.include` is the replacement and **takes effect but does not restore it**; the **istanbul** provider behaves identically. **The report is not incapable of bad news** — `src/agent/`, `src/api/`, `src/config/` show 0% correctly — **but a module graph nothing imports vanishes rather than reading zero.** `KnowledgeAssistant.ts` (410 lines, 0 tests) is **absent**; **46 of 167 files reported**. ⚠️ **The headline is NOT repository coverage** and must never be quoted as such. Boundary documented in `docs/project/coverage.md`. **The measurement gap and the testing gap are the same gap** — M4 owns F-053. | `npx vitest run --coverage` → 46 rows; `tinyglobby src/**/*.ts` → 167 |
| F-031 | M | Major | No | 🔨 **PARTIALLY CLOSED — reviewer-ruled** (REX-205, 2026-07-17). **Five of six enabled and clean**: `noImplicitReturns`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. **`noPropertyAccessFromIndexSignature` DEFERRED by reviewer decision** — it produces **13 TS4111 across 5 `src/` files**, forcing `cfg.title` → `cfg["title"]`. The reviewer: *"Unlike the other compiler flags enabled during this milestone, this option does not primarily strengthen repository correctness. Instead, it enforces a stylistic access pattern across production code… Repository Excellence should not introduce widespread production churn unless the repository demonstrably benefits from it."* **Treat as a future repository-style decision, not unfinished M2 work.** ⚠️ **Author planning error recorded:** the plan measured only `noUnusedLocals`/`noUnusedParameters` and reported *"one error"* — that measurement never covered this flag. | `npx tsc --noEmit -p tsconfig.json` with the flag → **13× TS4111** |
| F-032 | M | Major | No | ✅ **CLOSED** (REX-206) — `package.json` now carries `description`, `license`, `repository`, `author`, `keywords`, `homepage`, `bugs`, `engines` (17 keys, each traced to a source). ⚠️ **`packageManager` was silently dropped from REX-206's Scope and Acceptance** though the finding **and** REX-206's own Purpose name it — an unrecorded below-threshold narrowing, surfaced by the register reconciliation (2026-07-17). **Recorded, not actioned:** the inventory is closed, and `packageManager` is a corepack-pinning choice a maintainer should make deliberately, not a reconciliation edit — see [§ Deferred](#deferred--recorded-not-actioned). — *(orig: only 8 top-level keys; `private: true` excuses `exports`/`files` — not `license` or `engines`.)* | `node -e "console.log(Object.keys(require('./package.json')).length)"` → **17** |
| F-033 | M | Minor | No | ✅ **CLOSED** (REX-206) — Node pinned in three places that agree: `engines.node` `>=22`, `.nvmrc` `22`, `ci.yml` `node-version: "22"`. — *(orig: no `.nvmrc` / `.node-version` / `engines`.)* | `engines`/`.nvmrc`/CI all name 22 |
| F-034 | M | Minor | No | ✅ **CLOSED** (REX-205) — removed. — `tsconfig.json:38` `jsx: "react-jsx"` — **dead config**. No JSX exists in this Node-only repo. | `grep -rl "\.tsx" src/` → none |
| F-035 | M | Minor | No | ✅ **CLOSED** (REX-206) — `SECURITY.md` (scope + reporting, no overpromised SLA) and `CODE_OF_CONDUCT.md` both present at root. — *(orig: neither existed, though the project handles `ANTHROPIC_API_KEY`/`API_AUTH_TOKEN` and README says "developed in the open".)* | `ls SECURITY.md CODE_OF_CONDUCT.md` → both present |
| F-036 | M | Minor | No | ✅ **CLOSED** (REX-207) — `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `.github/CODEOWNERS` all present; Dependabot is live (PRs #14–#17 open at reconciliation). — *(orig: none existed; 9 dependencies drifted unmonitored.)* | `ls .github/` → all three present |

---

# M3-A — Public Surface *(contractual)*

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-037 | M | Major | No | **4 barrels use blanket `export *`**, leaking everything by default, while every other module uses explicit named re-exports. | `grep -rln "export \*" src/` → `platform/{config,handbook,retrieval}/index.ts`, `products/knowledge-assistant/index.ts` |
| F-038 | J | Major | No | `src/end-of-session/index.ts` re-exports **~70 symbols** — every schema, parse function, const tuple, factory, plus internal-ish types (`SessionRunFacts`, `FatalStageError` at `:183`). Effectively the whole module. | `src/end-of-session/index.ts` |
| F-039 | M | Major | No | `src/context-builder/index.ts:5-6` **claims** internal components stay private. **They don't**: `createCollectionEngine` (`:80`), `createSelectionEngine` (`:106`), `createAssemblyEngine` (`:124`) are all public, though `createContextBuilder` is documented as *"the single public orchestration service"*. **The claim is either true or deleted.** | `sed -n '1,10p;78,126p' src/context-builder/index.ts` |
| F-040 | M | Minor | No | `src/products/knowledge-assistant/types.ts` is a **0-byte file**. Dead. | `wc -c src/products/knowledge-assistant/types.ts` → **0** |
| F-041 | **J** | Major | **YES** | **`ContextBuilderConfig` requires three fields nothing reads.** `profile`, `explainability`, `outputFormat` are validated, frozen, `.strict()`, "no hidden defaults" — and inert. `assembleContext.ts:130-134` hardcodes empty placeholders; `KnowledgeAssistant.ts:266-269` dutifully passes all three and gets empty explainability regardless. **`outputFormat: "json"` produces output identical to `"markdown"` — the contract makes a promise the code does not keep.** FPCP required. Note the scope guard: *implementing* them is platform evolution and defers. | `grep -rn "\.profile\b\|\.explainability\b\|\.outputFormat\b" --include="*.ts" src/context-builder/ \| grep -v schema\|types` → **empty** |
| F-042 | **J** | Major | **YES** | **Two identity resolvers are exported, fully tested, and wired to nothing.** The only composition root uses `createSlugIdentityResolver`. `createSemanticIdentityResolver` costs a **model call per resolution** — this is an unused AI code path, not inert scaffolding. **May be staged for ADR-006 Identity Learning; only the reviewer knows.** FPCP required. | `grep -rn "createSemanticIdentityResolver\|createAliasAwareResolver" --include="*.ts" src/ \| grep -v "identity/"` → **empty**; `createKnowledgePipeline.ts:101` → `createSlugIdentityResolver()` |
| F-043 | J | Minor | **YES** | `createWikiGenerator.ts:479` returns `lint: { findings: [] }` against a `noLint` stub at `:173` — **a declared but unimplemented capability on the public `GenerationReport`.** FPCP required. Implementing it is a feature and defers. | `sed -n '173p;479p' src/knowledge/wiki-generator/createWikiGenerator.ts` |
| F-044 | J | Minor | No | `tests/end-of-session/foundation.test.ts:78-112` reads sibling test files and fails if any imports a non-barrel path; `:29-56` pins the exact export manifest. **This is the repo's best idea and exactly one module uses it** — while AJS-007 §6.1 names Public-Surface Validation a **validated principle**. | `grep -rln "foundation.test" tests/` → 1 |

---

# M3-B — Naming & Readability

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-045 | **J** | Major | No | **Three file-naming schemes coexist, all three inside a single directory.** PascalCase (26 files), camelCase (28), kebab-case (3). e.g. `analyzers/git/{GitPort.ts, createGitPort.ts, createGitChangeAnalyzer.ts, index.ts}`. | `find src -name "*.ts"` |
| F-046 | J | Major | No | The implicit rule (PascalCase = type/class, camelCase = function) **breaks**: `FilesystemReviewStore.ts` and `FilesystemWikiStore.ts` are PascalCase but export only **functions** (`createFilesystemReviewStore` + an error class). Compare `projection/createReviewPackageProjector.ts` — camelCase for the identical factory shape, **same module, opposite naming**. | `grep -n "^export" src/end-of-session/store/FilesystemReviewStore.ts` |
| F-047 | J | Minor | No | `products/knowledge-assistant/wikiKnowledgeProvider.ts` is camelCase beside PascalCase `KnowledgeAssistant.ts` in the same folder. | `ls src/products/knowledge-assistant/` |
| F-048 | J | Minor | No | `src/knowledge/naming.ts` and `src/handbook/paths.ts` are bare lowercase nouns — a **fourth** style. | `ls src/knowledge/ src/handbook/` |
| F-023 | J | Major | No | **`CONTRIBUTING.md:31-38`'s "one rule" describes ~⅓ of the tree.** *"Platform capabilities live in `src/platform/` (and `src/context-builder/`)… Products live in `src/products/`… CLI → Product → Platform."* No slot for `src/knowledge/`, `src/end-of-session/`, `src/ingestion/`, `src/handbook/`, `src/agent/`, `src/api/`, `src/config/`. The rule **is** respected where it applies (verified: nothing under `platform/`/`context-builder/` imports `products/`) — it just doesn't apply to most of `src/`. | `ls src/`; `grep -rn "products" src/platform src/context-builder` → empty |

---

# M4 — Structural Consistency & Genuine Duplication

**Governed by the shared-ownership criteria ([REX-D3](decisions/)).** Duplication is **evidence,
not a verdict**. All four criteria must hold before consolidating; **"keep parallel" is a valid
outcome, recorded as a result rather than a deferral.**

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-049 | **J** | Major | No | **Path-guarding logic triplicated** — ~200 lines of **security-relevant** code (symlink-escape prevention) in three copies with three error types: `FilesystemReviewStore.ts:59,74,104,143` · `FilesystemWikiStore.ts:47,56,80,113` · `handbook/paths.ts:60-114`. **Contested against the criteria** — each guards a *different root* with different canonicality rules. REX-D3 rules. | the three files |
| F-050 | M | **Major** | No | **The copies have already diverged, and one has a bug hazard the other doesn't.** `FilesystemWikiStore.ts:96-98` catches inside the loop and must re-throw its own error type to avoid swallowing it; `FilesystemReviewStore` factored out `realpathIfExists` and has no such hazard. **This is a defect on its own merits — M4 closes it regardless of the REX-D3 ruling, and it must not be held hostage to that decision.** | `sed -n '80,100p' src/knowledge/wiki-store/FilesystemWikiStore.ts` |
| F-051 | M | Major | No | **`deepFreeze` defined 6×**, five of them **private and identical inside `src/context-builder/` alone**. `DeepReadonly<T>` defined 2×. **Scope: within `context-builder` only** — `end-of-session/contracts/immutable.ts` is **excluded by EOS-005**, which it cites at `:6-8`. | `grep -rln "function deepFreeze" src/` → **6** |
| F-052 | J | Minor | No | Model-JSON-parse duplicated: `knowledge/compiler/extraction.ts:59-64` and `end-of-session/contracts/knowledge-extraction/schema.ts:144-149` — same routine, same two messages, different error class. **Likely governed by EOS-005** (parallel by design). REX-D3 rules. | both files |
| F-053 | M | **Major** | No | **`KnowledgeAssistant.ts` — 410 lines, zero tests**, because it hard-wires every dependency as a field initializer (`:77,85,93,184,192,263-267`). No `deps` param; `ask.ts:18` calls `new KnowledgeAssistant()`. **You cannot construct it without a real filesystem and a real API key.** The two modules *with* composition roots have exhaustive suites — **direct causal link.** `createKnowledgePipeline` / `createEndOfSessionWorkflow` are the pattern to copy. | `ls tests/products/`; `sed -n '77,95p' src/products/knowledge-assistant/KnowledgeAssistant.ts` |
| F-054 | M | Major | No | The agent layer is **untested**: `src/agent/tools.ts` (190 lines), `loop.ts` (98), `src/api/*`, `src/handbook/writer.ts` (127), `src/server.ts`. Live code, zero coverage. | `ls tests/` → no `agent/`, `api/`, `handbook/` |
| F-055 | J | Minor | No | **Two config systems**: `src/config/{app-env,agent-env}.ts` (Zod over dotenv, `HANDBOOK_PATH`) vs `platform/config/ConfigService.ts` (hand-rolled validation over `aj.config.json`, `handbook.path`). Two handbook-path sources of truth, two validation styles. **They serve two transports** — document and bound them; **merging is a redesign and defers** (scope guard). | both paths |

---

# M5 — Comments, Errors & Test Craft

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-056 | M | Major | No | `src/end-of-session/index.ts:16-19` still says *"services and the `run` entry point land in **later M1+ tasks**. The barrel exports nothing that does not yet exist."* They landed. | `sed -n '16,19p' src/end-of-session/index.ts` |
| F-057 | M | Major | No | `src/config/app-env.ts:6-13` and `agent-env.ts:6-9` defend against a `NOTION_*` constraint **deleted in `16e66da`** (*"so the Notion sync CLI can boot without them"*). The comments defend a constraint that no longer exists. | `git show 16e66da --stat \| grep -i notion` |
| F-058 | J | Minor | No | Pure section-label noise: `src/context-builder/index.ts:20` `// Public factory and handle.` above `export { createContextBuilder }`; `:24` `// Public configuration contract.` above `export { contextBuilderConfigSchema }`. | `sed -n '20,25p' src/context-builder/index.ts` |
| F-059 | J | Major | No | `src/end-of-session/index.ts` is **215 lines, ~150 of them prose duplicating JSDoc already present at each definition** (e.g. `:161-168` re-describes the Orchestrator Invariant that `createSessionWorkflow.ts` already documents). **Two copies that will drift — and F-056 proves they already have.** | `wc -l src/end-of-session/index.ts` |
| F-060 | M | **Major** | No | **12 custom error classes, no shared base.** Each is an identical 4-line `extends Error` + `this.name`. No `cause`, no codes. `catch (e) { if (e instanceof AjError) }` is impossible, so every call site enumerates: `session.ts:157` (`ConfigError \|\| ReviewStoreError`), `wiki.ts:45` (`ConfigError \|\| AIError`). **A new user-facing error silently breaks the friendly-message path in both.** — ⚠️ **LIVE REPRODUCTION, found by REX-104 (2026-07-17): the enumeration is not merely fragile, it is already incomplete.** `SourceConnectorError` is **not** in `wiki.ts:45`'s list, so a first-time user whose handbook lacks `foundation/` gets a **raw stack trace** where the code has a friendly-message path sitting right there. Reproduced by following `installation.md` end to end on a scratch vault. **Not fixed by REX-104 — M1 changes no source.** **M5 owns it; the doc-side mitigation shipped in `installation.md` Troubleshooting.** | `grep -rn "extends Error" src/` → 12; `sed -n '45p' src/cli/commands/wiki.ts`; reproduction in [REX-104](tasks/REX-104.md) |
| F-061 | M | Minor | No | **Three spellings of one message.** `FilesystemReviewStore.ts:79` *"must not contain NUL bytes."* · `FilesystemWikiStore.ts:118` *"Path must not contain null bytes."* · `handbook/paths.ts:67` *"Path must not contain NUL bytes"* (no period). | the three files |
| F-062 | M | Minor | No | Inconsistent terminal punctuation: platform errors end with `.`; `handbook/paths.ts:67,70,75,80` and `api/errors.ts:12,43` do not. | same |
| F-063 | J | Minor | No | No `cause` chaining anywhere — underlying errors are discarded when wrapped. | `grep -rn "cause:" src/` |
| F-064 | **J** | Minor | No | Test helper duplication: `stubGenerator` ×4, `makeProvider` ×3, `candidate` ×3, `item` ×3, `stubGitPort` ×2. **But per-suite inlining is a documented, deliberate convention** (`tests/end-of-session/support.ts:5-8`). Defensible for **contract fixtures**; less so for infrastructure like `makeProvider`. REX-D4 rules. | `grep -rn "const stubGenerator\|const makeProvider" tests/` |
| F-065 | M | Minor | No | `src/cli/commands/wiki.ts:58` `printReport` `console.log`s directly and is untestable. `session.ts:83` `formatSessionReport` returns `string[]` **specifically so it can be tested without stdout capture**, and documents why at `:81-82`. **Same layer, two conventions; `session.ts` is the exemplar.** | both files |
| F-066 | J | Minor | No | **The agent layer has ~zero comments** — `api/routes/inbox.ts` (20 lines, 0%), `routes/agent.ts` (17, 0%), `agent/client.ts` (16, 0%), `agent/tools.ts` (190, 0%) — while `src/end-of-session/` runs 60-83% and cites decision records. **The repo has two documentation cultures.** | the files |

## Comments that must be preserved — an explicit anti-finding

**A comment cleanup is the single easiest way to delete irreplaceable knowledge.** These are
**load-bearing** and are protected by name. REX-D6 defines the rule; this list is the safety net.

| Location | Why it is irreplaceable |
|---|---|
| `FilesystemReviewStore.ts:123-128` | Why only the destination's **basename** is checked against canonical dirs, why scanning the whole absolute path would be wrong (a vault under `~/wiki/` is not canonical space), and what covers the residual gap. **Unrecoverable from the code.** |
| `src/cli/commands/session.ts:44-54` | Why the workflow must **not** pre-flight the API key, and why detection reads the report instead of catching — *"the error never escapes `run` — it is data by the time the command sees it."* |
| `src/cli/commands/session.ts:150-156` | Why `AIError` is **deliberately absent** from the catch block. **Documents an absence — the hardest thing to document and the easiest for a cleanup pass to delete.** |
| `createEndOfSessionWorkflow.ts:43-53` | Why `NO_BRANCH = "detached"` does *not* reimplement the Session factory's Branch Policy — for a field nothing reads. |
| `selectKnowledge.ts:67-68` | *"Copy before sorting: the CollectionResult's `items` array is frozen and `Array.prototype.sort` orders in place."* Terse, load-bearing. |
| `tsconfig.json:38-41` | Why `include` is scoped to `src`. **Sound for `build`; it is the reasoning F-026 must engage with, not delete.** |

---

# Deferred — recorded, not actioned

Each is real. Each is out of scope. **Recording them is what stops them leaking in.**

| Item | Why deferred |
|---|---|
| **`PROJECT-STORY`** | Promised by `README.md:130` *"once the cleanup is complete"*. REX **is** the cleanup — its genuine successor. |
| **ADR-007** (producer-owned contracts) | Deliberately deferred at SPEC-003 M1; trigger arguably now met. **Architecture layer — above REX** (§3). REX-D1 may *recommend* it. |
| **Test tier separation** | The suite runs fast enough that tiering buys nothing today. Revisit if runtime grows ~an order of magnitude. |
| **Coverage thresholds** | Needs a baseline first. **A threshold picked before measuring is a number, not a standard.** M2 measures; a later review gates. |
| **`createWikiGenerator.ts` refactor** | 485 lines, 15 nested closures, `run` ~79 lines over a 12-field mutable bag. Real — but **structural redesign**. Scope guard. |
| **Config system unification** | Two systems serve two transports. **Merging is a redesign**; may resolve itself in the MCP migration. |
| **`createGitPort` `maxBuffer`** | Already a **reviewer-accepted** M2 deferral; degrades correctly into an `AnalyzerError`. **Not REX's to re-open.** |
| **Non-ASCII path quoting** | Pre-existing in M2's frozen parser; recorded as Future Hardening in SPEC-003 MILESTONES. |
| **MCP transport** | Product work. |
| **`/inbox/file`** | Registered, no n8n consumer. May be deliberate. Recorded; not acted on. |
| **`implementation/prompts/` gaps** | No `EOS-*` history though `implementation/README.md` advertises it; two filename typos (`plannig`, `promt`). Cosmetic. |
| **`CB-019` decision record** | Missing from an otherwise complete CB-001..CB-022 sequence. **SPEC-002's to close.** |
| 🔍 **DQ-1 — `renderRelated`'s `| undefined` + `?? []` guard defends a case production cannot produce** *(surfaced by REX-203, 2026-07-17)* | **Recorded, not resolved — the reviewer's explicit ruling.** `extraction.ts:19` gives `related` a Zod `.default([])`, so a parsed `SourceExtraction` **always** carries it — verified: `parse({name,description})` → `{related: []}`. Yet `createWikiRenderer.ts:62` types it `readonly string[] \| undefined` and `:68` guards `?? []`. **The guard exists because the test fixtures passed `undefined`** — they were typed as the Zod *output* but written as *input*. **The tests taught production to defend against their own defect, and the typecheck gap is why nobody noticed.** REX-203 made the fixtures faithful; the renderer tests **still pass**, confirming the guard is dead. Reviewer: *"Leave the guard in place. Record the design question. Allow a future architectural review to decide whether production should become simpler or fixtures should become more faithful."* **No diagnostic demands the `src/` change (REX-D10), so it is not REX-203's to make.** |
| 🔍 **DQ-2 — `AjConfig` carries a required field one consumer never uses** *(surfaced by REX-203, 2026-07-17)* | **Recorded, not resolved.** `96bc19d` (SPEC-003 M4, EOS-303) made `reviewPath` **required** on the shared `AjConfig`. `createKnowledgePipeline` (SPEC-005) must now be handed a `reviewPath` it never reads. **Architectural friction of the same shape SPEC-003 logged against `SessionContext`** (*"nearly inert: only `sessionNotes` is consumed"*): an interface carries data, downstream code does not consume it, callers must satisfy the contract anyway. Reviewer: *"Repository Excellence should surface it rather than resolve it."* |
| ⚠️ **A SPEC-003 DoD box claims documentation synchronization that demonstrably did not happen** *(found during REX-105, 2026-07-17)* | **Recorded, not actioned — the inventory is closed.** `spec-003-end-of-session/README.md:329` ticks *"[x] Documentation updated and synchronized at each freeze."* **F-005 and F-012 falsify it**: `src/end-of-session/README.md` said the module had *"no behavior"* through five freezes, and `src/context-builder/README.md` carried the same defect from SPEC-002's M4. **This is the §7.4 failure REX-101's retrospective documents, asserted as a completed checkbox in the package's own Definition of Done.** REX-105 ticked F-021's box directly beneath it and **deliberately left this one** — it is not in REX-105's frozen scope, and the closed-inventory rule says record, don't action. **Flagged for the reviewer:** this is arguably the *root* claim that F-005/F-012 are symptoms of, and a reviewer may judge it in scope. Fixing it is one line; the rule says it is not mine to take. |
| **No specification has a Change Log** *(found during REX-102, 2026-07-17)* | **Recorded, not actioned** — the inventory is closed. All eight specs (SPEC-000..007) carry a `**Version:**` field and no change log; SPEC-002's v1.0→v1.1 bump left no record of *what* changed. SPEC-000 mandates only `Version`. So a spec revision is traceable only from outside the spec. Adding one to SPEC-003 alone would diverge from seven siblings and from SPEC-000's mandated structure — **a convention question for SPEC-000, above REX's scope guard.** REX-102 followed the SPEC-002 precedent and recorded its revision in the backlog and task document instead. |
| **`worklog/` directory** | `implementation/README.md` documents it; it doesn't exist. `CLAUDE.md` already hedges that it *"may therefore be empty"*. |
| **`dist/` staleness** | Gitignored and untracked, but `bin` points into it, so `npm link` can serve old code. Verify manually post-M2. |
| **`package.json` `packageManager`** *(surfaced by the register reconciliation, 2026-07-17)* | Named in F-032 and in REX-206's own Purpose, but **dropped from REX-206's Scope and Acceptance with no recorded reason** — a silent below-threshold narrowing the reconciliation caught. **Recorded, not actioned:** `packageManager` pins a corepack toolchain (npm/pnpm/yarn + version) — a maintainer decision with real behavioural reach, not a metadata gap a reconciliation edit should fill by invention. The other eight keys had an authoritative source (`LICENSE`, the git remote); this one has none until a maintainer chooses. **The lesson is the omission's silence, not the missing field.** |

---

# Summary

> **These counts are derived from the tables above, not maintained alongside them.** Because the
> inventory is **closed**, every column here is a **permanent property of a frozen document** — it
> cannot drift. It can only be **miscounted**, and it was. Re-derive in one command:
>
> ```sh
> python3 - <<'PY'
> import re, collections
> rows = re.findall(r'^\|\s*\**(F-\d+)\**\s*\|\s*\**([MJ])\**\s*\|\s*\**(Blocking|Major|Minor)\**\s*\|\s*\**(Yes|No|YES|Depends)\**\s*\|',
>                   open('FINDINGS.md').read(), flags=re.M)
> print('findings', len(rows), collections.Counter(r[1] for r in rows), collections.Counter(r[2] for r in rows))
> PY
> ```

| Milestone | Findings | Blocking | Measurable | Judgement | Frozen (FPCP) |
|---|---|---|---|---|---|
| M1 | 23 | 11 | 22 | 1 | 1 (F-022 — *Depends*; ruled by REX-D1) |
| M2 | 12 | 4 | 12 | 0 | 0 |
| M3-A | 8 | 0 | 4 | 4 | **3** |
| M3-B | 5 | 0 | 1 | 4 | 0 |
| M4 | 7 | 0 | 4 | 3 | 0 |
| M5 | 11 | 0 | 7 | 4 | 0 |
| **Total** | **66** | **15** | **47** | **19** | **4** |

**71% Measurable** (47 of 66). That ratio is itself the argument for M2 landing early: most of this
inventory can be held true by a machine forever, and until CI exists none of it is.

> **Counting basis:** each row counts an **inventory finding by its home milestone** — the mechanical
> row count of the tables above. This is **not** the same measure as a milestone freeze narrative,
> which counts *findings actioned within that milestone's scope* (e.g. the M1 Freeze Review's
> *"20 of 20"* excludes F-022, deferred to M3-B, and treats F-012 as SPEC-002-originated). Both are
> legitimate; they answer different questions. This table answers *"how large is the inventory, by
> section?"* — nothing here revises a frozen freeze-review figure.
>
> **Corrected 2026-07-17** — below the FPCP threshold (no scope, objective, sequencing, acceptance
> criterion, or reviewer decision moves; ruled at the REX-101 review). The table previously read
> **63 / M1=20 / Blocking=16 / Judgement=16 / "~75%"**. Every one of those was **wrong at authoring
> as a row count** and never recomputed; only *Measurable=47* was correct. **The sequencing argument
> the ratio supported is unchanged** — M2 still lands early, and still for the right reason. **The
> defect is that the statistic offered as its argument was never verified.** Found by recounting the
> rows, not by reading the table. *This is the F-010 finding class — a hard-coded metric — inside the
> inventory that raised F-010.*

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 1.0 | Inventory created and **FROZEN** with the package Planning Freeze (reviewer: AJ). All evidence verified against `9bd051d`. Two corrections made during verification rather than transcribed from exploration: (1) the `CHANGELOG.md` counts under `## [2.0.0]` are **legitimate history** and out of scope — only `[Unreleased]` and *"Current size"* claims are live drift (F-010, F-011); (2) the reported `src/handbook/` ↔ `src/platform/handbook/` "duplication" was **rejected** — they share a name, not a responsibility, and no finding was raised. |

---

> **Engineering Rule**
>
> No finding enters a milestone without reproducible evidence.
>
> The inventory is closed. New findings are recorded, not actioned.
