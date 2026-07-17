# REX Milestone 3-B — Retrospective

> **Milestone:** M3-B — Naming & Readability (REX-304 → REX-305)
> **Outcome:** **FROZEN** by the reviewer (AJ) on 2026-07-17.
> **Authored:** 2026-07-17, after the freeze — §4.7 stage 7.

---

## Summary

M3-B made repository names communicate **architectural role**, and gave every module a documented home
with an expected lifetime. Six findings closed (five M3-B + F-022's documentation half); **723 tests
green** (722 + 1 new taxonomy test); **no behaviour and no public surface changed**.

The milestone's strongest evidence is not that the repository still builds — it is that **the public
contract stayed mechanically identical (the REX-303 manifests never moved) while the naming system
became substantially clearer.** Structure changed; contracts did not.

**The reviewer's framing of the programme after M3-B:**

> *M1 Repository Truth · M2 Repository Verification · M3-A Public Contract Governance · M3-B Semantic
> Naming & Repository Taxonomy. Four milestones, each building on the previous rather than replacing
> it.*

---

## What worked well

- **The Evidence Review shrank the milestone before it started.** The inventory framed M3-B as "three
  casings coexist, converge them" (~57 files). Measurement found an **implicit role-based rule already
  followed by 22 of 26 PascalCase files**, a lowercase category of **59 files (32 the untouchable
  `types.ts`/`schema.ts` convention)**, and a real fix-set of **7 files**. The plan that shipped was a
  fraction of the plan the inventory implied — and safer for it.

- **REX-D2 became a role rule, not a casing rule.** *Name a file after its primary export, in that
  export's casing.* That reframing turned "F-047 is inconsistent" into "F-047 is **correct** —
  `wikiKnowledgeProvider.ts` is a factory." The rule closed a finding by **explaining** it, not
  renaming it.

- **M3-A's manifests became M3-B's safety net.** Every one of the 7 renames was proven surface-neutral
  by `tests/architecture/public-surface.test.ts` and `foundation.test.ts` staying green — a rename
  that moved an export would have turned them red. **The enforcement M3-A built to protect its own work
  turned out to protect M3-B's too.** Mechanical enforcement compounded across milestones.

- **All 7 renames were 100% pure `git mv`.** `git`'s own similarity index confirmed zero content
  change; the only edits were import specifiers in the importers. A rename that is provably just a
  rename is the whole point of the milestone's validation strategy.

- **The taxonomy got a machine check.** `module-taxonomy.test.ts` asserts every top-level `src/`
  module appears in CONTRIBUTING — proven able to fail on an undocumented module. F-023 will not
  silently reopen when module #12 is added.

---

## What surprised us

- **The "fourth style" was the largest category, not a footnote.** F-048 named 2 lowercase files;
  measurement found **59**. The finding's framing (a minor fourth style) inverted the reality (the
  dominant, mostly-legitimate style). Had the plan trusted the finding, REX-D2 might have tried to
  "fix" `types.ts` — the rule instead had to explicitly **bless** the convention.

- **The inventory undercounted the real violation too.** F-046 named 2 PascalCase-factory files;
  there were **4** (`FilesystemSourceConnector`, `AnthropicKnowledgeCompiler` unnamed). The inventory
  was directionally right and numerically wrong in both directions — a reminder that a frozen
  inventory is a starting hypothesis, not a measurement.

- **Nothing went wrong with the probes.** After M3-A's `git checkout` incident, M3-B did more
  file-tampering (renames) and more prove-it-can-fail probing — and had **zero** revert incidents,
  because the retrospective lesson (restore by `rm`/rewrite, never `git checkout` on uncommitted work)
  was applied deliberately. A retrospective changed behaviour.

---

## Engineering discoveries

- **A naming convention should express role, not enforce uniformity.** *"Repository names should
  communicate semantic role rather than visual consistency"* (the reviewer). PascalCase-for-types and
  camelCase-for-factories carries information a single casing would erase. The best rule was the one
  the codebase already half-followed, written down and made whole.

- **Taxonomy validation should check presence, not completeness.** The module-coverage test verifies
  every module *has a documented home* — it does not try to prove every module has reached its final
  architectural form. The latter is architecture governance, and it belongs to ADRs, not a repository
  review. Keeping the check at presence kept the milestone inside its charter.

- **Enforcement assets accumulate leverage.** M3-A's surface manifests were built to pin M3-A's work;
  they became the rename-safety proof for M3-B at zero additional cost. Repository Excellence is
  starting to compound — later milestones inherit earlier milestones' machinery rather than
  re-solving validation each time.

---

## Reviewer observations — recorded for the programme

The reviewer asked that these be recorded (M3-B Freeze Review, 2026-07-17):

1. **Naming conventions should express architectural role.** Uniformity is not the objective; semantic
   clarity is. The role-based convention is considerably stronger than a casing rule.

2. **Mechanical enforcement compounds in value.** M3-A's surface manifests became reusable validation
   assets for M3-B — a sign the programme is accumulating engineering leverage across milestones
   rather than solving each independently.

3. **Retrospectives are demonstrably improving implementation.** The absence of checkout-related
   incidents is not luck; it is evidence that M3-A's retrospective produced a behavioural improvement.

4. **Evidence Review continues to justify itself.** The planning phase materially reduced
   implementation scope before work began — among the clearest demonstrations yet that planning
   quality reduces implementation risk.

---

## Process improvements — recommendations only

1. 🟡 **A frozen inventory's counts are hypotheses; re-measure before planning a task against them.**
   M3-B's inventory was wrong on both the violation count (2 → 4) and the conventional-category size
   (2 → 59). The Evidence Review caught both, but the standing lesson is to treat every inventory
   number as a claim to verify, never a fact to inherit. (This is the M2 planning-accuracy lesson,
   confirmed again.)

2. 🟡 **Prefer `rm`/rewrite to `git checkout` for every prove-it-can-fail probe on uncommitted work.**
   Now applied twice without incident; worth stating once as standing practice rather than
   re-learning per milestone. Carry into M4, which changes executable structure (DI, tests) and will
   probe heavily.

---

## Deferred — recorded, not actioned

- **F-055 — two config systems.** The M3-B taxonomy *documents* the `src/config` vs `platform/config`
  split and cites F-055; **resolving** it is M4. Documenting a split is truth; merging it is
  structure — the scope boundary held.
- **The agent layer's ARCH-001 home.** Documented at README/CONTRIBUTING level with its lifetime; the
  architectural decision remains a REX-D1 **recommendation** for a future ADR, not an amendment.

---

## What M3-B cost, and its character

**Three commits, one ruled decision, 7 pure renames, +1 test, zero behavioural change.** The lightest
implementation milestone yet — because the Evidence Review did the heavy lifting in planning, and
M3-A's manifests did the validation for free.

M3-B's signature is **readability without instability**. It reduced the cognitive load of every future
change — a file's name now tells you what it exports — while the contracts M3-A verified stayed
byte-identical. A milestone that makes the repository easier to read without making it riskier to
change is exactly the kind of compounding improvement the programme was meant to produce.

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.0 | M3-B Retrospective authored after the Milestone Freeze (§4.7 stage 7). Records the Evidence-Review scope reduction (57 → 7 files), REX-D2 as a role rule (F-047 closed by explanation), M3-A's manifests reused as rename-safety proof, all 7 renames at 100% git similarity, and the **absence of `git checkout` incidents as evidence M3-A's retrospective changed behaviour**. Captures the reviewer's four observations and the programme framing: M1 Truth → M2 Verification → M3-A Public Contract Governance → M3-B Semantic Naming & Taxonomy. |
