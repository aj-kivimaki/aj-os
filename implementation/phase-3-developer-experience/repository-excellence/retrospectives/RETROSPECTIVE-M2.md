# REX Milestone 2 — Retrospective

> **Milestone:** M2 — Automated Quality Gates (REX-201 → REX-208)
> **Outcome:** **FROZEN** by the reviewer (AJ) on 2026-07-17.
> **Authored:** 2026-07-17, after the freeze — §4.7 stage 7.

---

## Summary

M2 gave the repository the ability to verify itself. Five gates now run on every push and pull
request — `format:check`, `lint`, `typecheck` (**including `tests/`**), `build`, `test` — plus
coverage reported and never blocking. **Before M2, `.github/` had never existed in the repository's
history**, and eleven PRs had merged with a stated policy and zero enforcement.

**The reviewer's framing of what M1 and M2 together achieved:**

> *M1 established repository truth. M2 established repository verification. Those are distinct
> achievements. Together they move the repository from one that depends primarily on engineering
> discipline to one that is increasingly capable of enforcing that discipline automatically.*

Runtime behaviour is unchanged. `expect()` **rose 1097 → 1105**. Frozen work untouched.

---

## What worked well

- **Testing every gate rather than trusting it.** All five were demonstrated failing under the
  condition they exist to detect. **This found three broken gates that all looked green.** The
  reviewer: *"Every failure you listed was discovered because the gate itself was validated rather
  than trusted… The milestone's purpose was not simply to introduce gates. It was to establish
  trustworthy gates."*

- **The formatter proof.** `format(pre-tree) == post-tree` across 104 files, **proven able to fail**
  by smuggling a *validly-formatted* semantic edit. **The only claim in M2 that is a computation
  rather than a reviewed judgement**, and the pattern is reusable for any mechanical change.

- **The ownership-boundary re-read paid for itself before implementation.** It found the
  `tsconfig.test.json` `rootDir` trap — without which the first attempt would have produced **58
  phantom errors** and a false picture of REX-203's size. It also corrected the error count
  (46 → **40**) and removed a cross-milestone dependency (F-031 ↔ M3-A) that never existed.

- **REX-D10 was raised during Planning** — the first REX plan defect caught **before** implementation
  rather than during it. M1's three collisions were all caught by validation; this one by reading the
  plan against itself.

- **Separating REX-202 from REX-203 made the review stronger.** *"REX-202 exposed the truth. REX-203
  interpreted the truth."* Different engineering activities, and the split is why the design
  questions surfaced at all.

---

## What surprised us

- **Three gates were built wrong before they were built right, and all three looked green.**
  1. `npm run lint` **exited 0 on warnings** — an unused `const` passed it. The tool was correct; the
     gate was decorative.
  2. The formatter **rewrote 36 files of frozen archive**, because `biome.json` **cannot contain
     comments**: Biome reported parse errors, **silently fell back to defaults, and `--write` ran
     anyway**.
  3. `npm run ci` reported **green while no longer running the format gate at all**, after
     `git checkout -- .` reverted `package.json`.

  **None was caught by building the gate. All three by testing it.**

- **CI caught a defect no local run could.** REX-205 failed with `biome: not found` — the dependency
  was **installed but undeclared**, another casualty of that same `git checkout`. It worked locally
  because `node_modules` held a package nothing declared. **A clean runner has no accumulated state.
  That is the entire argument for REX-201, demonstrated on its first real test.**

- **REX-203 found zero behavioural defects — and that is a result.** SPEC-003's hypothesis was that
  this visibility gap conceals defects; it concealed three. Tested in a different context, it
  concealed **none, and two design questions instead**. *"Negative results are still results when
  they are produced by a sound process."*

- **The linter's advice broke the frozen archive.** Biome's own `useBiomeIgnoreFolder` rule advises
  `!archive/` over `!archive/**`. **That form does not exclude the folder.** Following the tool's
  recommendation silently re-enabled formatting of preserved v1 history.

- **F-029's premise was false.** The code is **not** *"formatted consistently by hand"* — `src` and
  `tests` were written to different widths. **No width leaves the tree untouched.** The inconsistency
  is the actual argument for a formatter, and it is a stronger one than the finding made.

---

## Engineering discoveries

- **A gate is defined by the condition under which it fails, not the tool it invokes.** `npm run
  lint` invoked the right tool, reported the right findings, and enforced nothing.

- **Configuration files are executable engineering artefacts.** An unparseable config **changed
  behaviour while allowing execution to continue** — blast radius the whole repository, signal a
  warning above the output. **Every config must be proven to take effect, not assumed to.**

- **Static analysis is a discovery tool, not an authority.** Every diagnostic in REX-203 had a fast,
  defensible, count-reducing fix that would have destroyed the finding. Following the linter's advice
  on the archive was actively wrong.

- **A measured value is meaningless without its measurement boundary.** Coverage reports **46 of 167
  files** and *looks* complete. Untested files show 0% **when something in their module graph loads**;
  a graph nothing imports **vanishes**. Partially honest is arguably worse than uniformly dishonest.

---

## Process improvements — recommendations only

1. 🔴 **Tighten M2's own objective wording.** The reviewer's direction: *"Repository Excellence should
   always describe the property actually established, not the one originally hoped for."* *"Every
   objectively measurable property machine-verified"* is **too broad** — repository-wide coverage is
   not measurable with this tooling, and one strictness flag is deferred. **Recommend the milestone
   record state the demonstrated boundary.**

2. 🟠 **Prove every configuration takes effect.** Three of M2's incidents trace to a config that
   parsed, ran, exited 0, and did something other than intended. **A config change is not done when
   the command succeeds; it is done when the intended property is demonstrated.**

3. 🟠 **Planning must measure what it claims to measure.** Two inaccuracies: "46 errors" was **40**
   (ad-hoc flags without the matching `lib` invented six); the six-flag risk assessment measured
   **two** flags. The reviewer: *"planning re-read corrected one, implementation corrected the other,
   neither was silently carried forward."* **The process caught both — but neither was caught by
   planning review.**

4. 🟡 **Branch protection remains outstanding, and it bounds every CI claim.** *"A gate that can be
   merged past is a suggestion."* Repository administration, not REX work — the recommendation to
   require `verify` on `main` **remains in force**.

---

## Deferred — recorded, not actioned

- **F-031** — `noPropertyAccessFromIndexSignature`: 13 TS4111 across 5 `src/` files for a stylistic
  access pattern. Reviewer-ruled a **future repository-style decision**, not unfinished M2 work.
- **F-030** — repository-wide coverage: baseline established with a **documented tooling limit**.
- **DQ-1** — `renderRelated`'s dead `?? []` guard, defending a case production cannot produce.
- **DQ-2** — `AjConfig` carries a required field one consumer never uses.
- **F-025** (half) — branch protection.
- **`KnowledgeAssistant.ts`** — the measurement gap and the testing gap are **the same gap**; **M4**
  owns it (F-053).

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.0 | M2 Retrospective authored after the Milestone Freeze (§4.7 stage 7). Records that three gates were built wrong before they were built right — **all three caught by testing the gate, none by building it** — and that CI caught an undeclared dependency no local run could. Recommends tightening M2's objective wording to the **demonstrated** boundary rather than the hoped-for one, per the reviewer's direction. |
