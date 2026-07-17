# REX Milestone 3-A — Retrospective

> **Milestone:** M3-A — Public Surface *(contractual)* (REX-301 → REX-303)
> **Outcome:** **FROZEN** by the reviewer (AJ) on 2026-07-17.
> **Authored:** 2026-07-17, after the freeze — §4.7 stage 7.

---

## Summary

M3-A gave the repository's public surface three complementary forms of governance: **intentional
policy** (REX-D5/REX-D8, ruled before any code moved), **truthful implementation** (barrels that
export exactly what they mean and say so), and **mechanical enforcement** (a pin that turns a future
re-leak red). Eight findings closed; **722 tests green** (713 + 9 new enforcement tests); **no runtime
behaviour changed**.

The milestone's defining character is restraint. **Five of the eight findings closed with no code
removed** — three frozen items documented as intentional (F-041/042/043), one large barrel measured
and kept (F-038), one doc-comment corrected rather than a contract reduced (F-039). Only F-037 (four
barrels rewritten), F-040 (one dead file deleted), and F-044 (enforcement added) changed the tree in
any structural way, and none changed behaviour.

**The reviewer's framing of the programme after M3-A:**

> *M1 established Repository Truth. M2 established Repository Verification. M3-A established Public
> Contract Governance. Those three milestones now form a coherent progression.*

---

## What worked well

- **The Evidence Review was in the planning, not the retrospective — and it changed the plan.** Every
  finding was re-measured against `HEAD` before a task was authored. That caught: every `file:line`
  pointer had drifted (the inventory froze at pre-formatter `9bd051d`); F-038 was **100** exports, not
  the estimated "~70"; and — most consequentially — **F-042 was ADR-006 Phase 1 staging, not dead
  code.** The last one changed a disposition from a candidate removal to a documented keep *before*
  the reviewer ruled, not after an FPCP round-trip.

- **The three frozen findings resolved by following the contract back to its source.** F-043 is the
  exemplar: rather than treat *"unused"* as *"removable"*, REX-301 read SPEC-005 and found LINT is a
  **specified core operation** (§8/§192/§293/§345). The always-empty `lint` report is an honest
  placeholder for a declared capability, not speculative surface. **Investigation, not assumption,
  set the outcome.**

- **F-038 was a "keep" the measurement earned.** The barrel looked oversized. Measured: 87 of 100
  exports are pinned-intentional (26 operations + 61 contracts the barrel *must* mirror per EOS-007),
  and all 9 unconsumed types are **signature types of public factories** — removing them would make a
  documented factory's parameters unnameable. The finding's own named examples (`SessionRunFacts`,
  `FatalStageError`) turned out to be consumed. **The estimate did not survive contact with the
  evidence, and the evidence won.**

- **REX-303 enforced a surface that was already settled.** Policy → implementation → enforcement, in
  that order. The pin encodes decisions REX-301/302 already made, so it protects a reviewed surface
  rather than freezing an accidental one. And every guard was **proven able to fail** (re-add
  `export *` → red; add a stray export → red), the M2 gate discipline carried forward intact.

- **REX-D5's "document" rulings meant zero frozen-surface churn and zero FPCPs.** The FPCP machinery
  was ready; the evidence meant none was needed. A milestone chartered to touch frozen surface touched
  none of it.

---

## What surprised us

- **The largest finding by symbol count was the one with nothing to do.** F-038 named ~70 reducible
  symbols; the honest answer was zero. The surface breadth that looked like a defect was a tested
  architectural guarantee (EOS-007's "a consumer never has to guess which barrel") plus the signature
  types of the public operations. **A big number is evidence, not a verdict** — the REX-D3 lesson,
  reappearing on exports.

- **An explanatory comment tripped the check it was explaining.** REX-302's first barrel comment
  literally contained `export *` to say "not `export *`", which the F-037 validation grep dutifully
  flagged. Same class as M2's three gates-built-wrong: **the artefact that describes a rule must not
  accidentally violate it.** Caught by running the validation, not by writing it.

- **A "prove it can fail" probe reverted real work.** Using `git checkout <file>` to undo a
  deliberately-injected `export *` restored the file to its **committed** state — which, for
  uncommitted task work, meant reverting REX-302's own edit on that barrel. Caught immediately by
  typecheck and the editor, reconstructed by explicit rewrite. **The lesson: validate-by-tampering on
  uncommitted work must restore by rewrite, never by `git checkout`.**

- **F-039 turned out to be a fork in the road, not a typo.** *"Internal components stay private"* was
  false — but the fix was not obvious. Making the engines private would satisfy the architecture's
  *"single public entry point"* language; correcting the doc would satisfy the seven test suites that
  exercise the engines as public boundaries. The finding said *"either true or deleted,"* and both
  branches technically satisfy it. Choosing truth-over-reduction was a judgement about architectural
  intent, not a mechanical correction.

---

## Engineering discoveries

- **A public contract is defined by its signatures, not by its current importers.** A type no
  repository consumer imports today can still be load-bearing: if it is the parameter or return type
  of a public factory, removing it from the barrel makes that factory unusable by an external caller.
  `HandbookInfo` (handbook) and the nine end-of-session signature types are the same discovery at two
  scales. **"No consumer imports it" is not "it is dead."**

- **Enforcement must trail the decision it enforces.** REX-303 worked because the surface was settled
  first. A pin written before the surface is decided encodes whatever happens to exist — freezing
  accidents. The correct order is policy → implementation → enforcement, and it is the same order M2
  used for its gates.

- **Truthful documentation can be the proportional fix for a surface defect.** When the code is
  intentional and the doc-comment lies, correcting the doc is a truth pass; reducing the surface is a
  contract change. Distinguishing the two kept F-039 inside M3-A's charter instead of drifting into
  architecture.

---

## Reviewer observations — recorded for the programme

The reviewer asked that these be recorded (M3-A Freeze Review, 2026-07-17):

1. **Repository contracts matured.** M3-A shifted Repository Excellence from improving implementation
   quality toward **governing public contracts** — an architectural milestone, not another cleanup.

2. **"Keep" is a valid engineering outcome.** Multiple findings closed through stronger evidence
   rather than code removal. *"Leave unchanged because the evidence supports it"* is a first-class
   successful outcome.

3. **Mechanical enforcement should follow — not precede — architectural decisions.** REX-303 succeeded
   because it enforced a surface already reviewed and intentionally settled. That ordering is the
   standard for future enforcement work.

4. **Validation continues to prove its value.** Both implementation incidents were detected before
   commit through deliberate validation. Validating the validator prevents defects from becoming
   history.

5. **Public contracts deserve the same discipline as implementation.** M1 established documentation
   truth; M2 established repository verification; M3-A established public contract governance — a
   coherent progression.

---

## Process improvements — recommendations only

Per §3, proposals for the receiving layer.

1. 🟠 **Freeze-then-reformat invalidates every line pointer in a frozen inventory.** FINDINGS.md was
   pinned at `9bd051d`; M2's formatter reflowed the tree; every M3-A `file:line` had drifted. It cost
   nothing here because the Evidence Review re-measured — but the standing lesson is that **an inventory
   frozen against a commit carries coordinates, and coordinates rot.** Prefer content anchors (symbol
   names, grep patterns) over line numbers in any inventory expected to outlive a formatting pass. The
   corrected pointers are recorded in the M3-A tasks.

2. 🟠 **Validate-by-tampering must restore by rewrite on uncommitted work.** `git checkout <file>`
   reverts to the last commit, which silently discards uncommitted task edits. Recorded in REX-303;
   worth carrying into M3-B, which will do far more file-tampering (renames) and far more
   prove-it-can-fail probing.

3. 🟡 **An artefact that states a rule should be checked against that rule.** The comment containing
   `export *` would have been caught by no process other than running the gate — which is why the gate
   ran. For M3-B, the naming rule's *documentation* should itself conform to the naming rule.

---

## Deferred — recorded, not actioned

- **`GenerationReport.lint` implementation** — a real LINT is a SPEC-005 feature, not REX's (scope
  guard). Documented as declared; implementation deferred.
- **ADR-006 Phase 1 wiring** — the staged identity resolvers wire up when ADR-006 Phase 1 is
  delivered, not by REX (F-042).
- **`ContextBuilderConfig` field implementation** — profile-weighted ranking, explainability
  rendering, and `outputFormat` dispatch are platform evolution (F-041), deferred to a specification.
- **An exact context-builder manifest** — REX-303 pins the engine boundaries by presence, not the
  whole surface. An exact manifest would re-decide a surface M3-A did not charter; recorded for a
  future review if context-builder's surface is ever formally settled.

---

## What M3-A cost, and its character

**Four commits, two ruled decisions, zero FPCPs, zero behavioural change, +9 tests.** Lighter than
M1 or M2 — because most of the work was proving that the right change was *no change*.

That is the milestone's signature. M1 corrected falsehoods; M2 built gates; **M3-A mostly demonstrated
that the existing design was intentional and then pinned it so it stays that way.** Repository
Excellence rewarded evidence over activity, and the evidence repeatedly said *keep*. A review willing
to conclude *"leave it exactly as it is"* — and to prove that conclusion — is a review that can be
trusted when it does say *change it*.

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.0 | M3-A Retrospective authored after the Milestone Freeze (§4.7 stage 7). Records the Evidence-Review-in-planning wins (line-drift, F-038 100-not-70, F-042 staging), five findings closing with no code removed, F-038's "keep, justified" measurement, F-039's truth-over-reduction judgement, REX-303's proven-able-to-fail enforcement, and two pre-commit process incidents with their lessons. Captures the reviewer's five observations, chiefly that the programme now reads **M1 Truth → M2 Verification → M3-A Public Contract Governance**. |
