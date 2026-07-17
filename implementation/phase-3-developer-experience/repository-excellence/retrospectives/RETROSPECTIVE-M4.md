# REX Milestone 4 — Retrospective

> **Milestone:** M4 — Structural Consistency & Genuine Duplication (REX-401 → REX-404)
> **Outcome:** **FROZEN** by the reviewer (AJ) on 2026-07-17.
> **Authored:** 2026-07-17, after the freeze — §4.7 stage 7.

---

## Summary

M4 was the highest-risk milestone in the programme: the first to change behaviour-adjacent
implementation code — security-relevant path guards, a duplicated immutability helper, a live product
class's construction, and untested live agent code — rather than repository structure or governance.
It succeeds on one criterion above all: **did it preserve behaviour while improving implementation
quality?** The evidence says yes. **Six findings closed, one partial (F-054); 738 tests green;
behaviour preserved and demonstrated, not asserted.**

Duplication was treated as evidence, not a verdict: **two findings kept parallel** (F-049, F-052) as
recorded results, **one consolidated** in-boundary (F-051), and the one genuine defect (F-050) **fixed
independently**. `KnowledgeAssistant` gained dependency injection and its first tests; the agent layer
moved off zero coverage.

**The reviewer's framing of the programme after M4:**

> *M1 Repository Truth · M2 Repository Verification · M3-A Public Contract Governance · M3-B Semantic
> Naming & Taxonomy · M4 Implementation Integrity & Testability. Five milestones, each building on the
> capabilities its predecessors established.*

---

## What worked well

- **Characterization-first turned a security refactor into a safe one.** Before touching the
  WikiStore's `assertNoSymlinkEscape`, the escape suite was confirmed to cover symlink / `..` /
  absolute / ENOENT-walk-up, and **the missing NUL case was added and proven green first**. Only then
  did F-050's fix land — the catch-in-loop that could swallow the store's own escape error replaced by
  the ReviewStore's `realpathIfExists` + `isInside` pattern. The reviewer: *"establish behaviour first,
  then implementation."*

- **Duplication-as-evidence produced two honest "keep" results.** F-049's three path guards protect
  different roots with **opposite canonicality** (the wiki store writes canonical; the review store
  rejects canonical per SPEC-003 §17; handbook guards read-only subtrees) — merging them would couple
  security boundaries that are correctly separate. F-052's copy *documents itself* as "adapted." Both
  closed as results, not deferrals, with the failing criterion named.

- **F-050 was decoupled from F-049 and fixed on its own merits.** A correctness issue did not wait on
  an architectural judgement. The two questions — *should these be shared?* and *has one drifted into a
  defect?* — stayed separate, exactly as REX-D3 requires.

- **EOS-005 held under pressure.** F-051 consolidated the five context-builder `deepFreeze` copies
  while leaving `end-of-session/contracts/immutable.ts` untouched — the boundary an earlier milestone
  ratified, respected without a second thought.

- **Dependency injection made the untestable testable, with no behavioural change.** `KnowledgeAssistant`
  now takes injected deps; `ask.ts`'s `new KnowledgeAssistant()` is unchanged. Its first suite drives
  the whole pipeline — real prompt renderer and Context Builder, fake AI — with no key and no vault.

---

## What surprised us

- **The required `verify` gate rejected my own formatting mistake before it reached `main`.** The
  REX-402 commit carried two lines biome wanted rewrapped; CI's Format gate failed the PR. The root
  cause was mine — I read `format:check` through `tail -1`, which truncated the error summary, and
  committed on the misread. **The sequence is the point:** incorrect change introduced → repository
  verification rejected it → correction applied → green obtained → **`main` never observed the
  defect.** This is the failure mode M2 invested in preventing, functioning exactly as designed. The
  reviewer: *"mistakes are increasingly intercepted by process rather than by reviewer memory."*

- **typecheck caught a test-only type error the runtime didn't.** REX-402's suite used vitest v4's old
  two-argument `vi.fn<[args], ret>()` form; the tests *passed* at runtime but `tsc -p tsconfig.test.json`
  failed. M2's "typecheck reaches `tests/`" gate (REX-202) earned its keep on a milestone two after it
  shipped.

- **The env-at-import constraint bounded the agent-layer tests exactly where predicted.** `appEnv.ts`
  freezes `env` on load, so end-to-end characterization of `loop.ts` / routes / `writer.ts` would need
  `HANDBOOK_PATH` at import and risk polluting the real vault. The deterministic control/guard layer
  (dispatcher contract + auth gate) was covered; the rest was recorded as a boundary, not forced.

---

## Engineering discoveries

- **Behaviour preservation is the primary success metric for implementation refactoring.** Reduced
  duplication is valuable *only* when accompanied by demonstrated behavioural equivalence. A smaller
  diff that changes behaviour is a worse outcome than a larger one that does not.

- **Characterization-first is the default for security-sensitive change.** Establish behaviour with a
  test that passes on the *current* code — including the case nobody wrote down (NUL) — before altering
  the implementation. The test is the contract the refactor must honour.

- **Partial closure is a first-class outcome when the boundary is understood.** F-054 closed partial:
  what is testable, what is env-bound, why the limit exists, and why solving it exceeds M4's scope are
  all recorded. **Artificial completeness — test scaffolding built only to satisfy a metric — is less
  valuable than an honest boundary.** This is the F-030 principle, reapplied.

- **Verification compounds.** M3-A's public-surface manifests validated M3-B's renames; here M2's CI
  gate caught a formatting slip and M2's typecheck-reaches-tests caught a test type error. Each
  milestone's investment keeps paying the next one's bills.

---

## Reviewer observations — recorded for the programme

The reviewer asked that these be recorded (M4 Freeze Review, 2026-07-17):

1. **Behaviour preservation is the primary success metric for implementation refactoring.** Reduced
   duplication is valuable only with demonstrated behavioural equivalence.

2. **Characterization-first testing significantly reduced implementation risk.** Where behaviour is
   security-sensitive, characterization should precede abstraction.

3. **Repository verification continues to compound in value.** The format-gate incident shows mistakes
   are increasingly intercepted by process rather than reviewer memory.

4. **Partial closure is acceptable when the remaining limitation is understood, documented, and
   intentionally deferred.** Artificial completeness is less valuable than honest boundaries.

---

## Process improvements — recommendations only

1. 🔴 **Verify a gate by its exit code or a full `npm run ci`, never a truncated `tail`.** The
   format-gate incident traces entirely to reading `format:check` through `tail -1`. The commands that
   report pass/fail must be read completely — this is the M4 analogue of M2's "a config change is done
   when the property is demonstrated, not when the command exits 0." **Carry into M5**, which touches
   many files (comments, errors) and will run gates often.

2. 🟡 **Record env-bound test limits as explicit follow-on work, not as failures.** F-054's boundary is
   a legitimate deferral; the repository should carry it as visible technical work (a future test-env
   harness) rather than let it read as an untested gap. Already recorded; noted here so M5 and beyond
   treat it as a known, owned item.

---

## Deferred — recorded, not actioned

- **F-054 end-to-end characterization** — `loop.ts`, the route handlers, `handbook/writer.ts`,
  `server.ts` against a live handbook. Needs a test-env harness (`HANDBOOK_PATH` at import) that does
  not touch the real vault. Reviewer-approved as an explicit follow-on concern, **not** a freeze
  blocker.
- **Config-system unification** (F-055) — documented and bounded; merging is platform evolution, likely
  resolved at the MCP migration.
- **The WikiStore's nested `assertNoSymlinkEscape`** — a SonarLint "move to outer scope" advisory,
  pre-existing and outside F-050's hazard; left as-is (IDE-only, not the biome gate).

---

## What M4 cost, and its character

**Five commits plus a format fix, one ruled decision, +15 tests, one CI rejection-and-correction,
zero behavioural change.** Heavier than M3-B, as befits the highest-risk milestone — and the one
rejection is not a blemish but the clearest evidence the safety net works.

M4's signature is **safe change to code that matters**. Earlier milestones taught the repository to
describe, verify, and govern itself; M4 spent that capital on the first genuinely risky implementation
work — security guards, live product wiring — and came through with behaviour demonstrably intact. The
compounding the programme was built to produce is now visible: the investments of M1–M3 are what made
M4's risk manageable.

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.0 | M4 Retrospective authored after the Milestone Freeze (§4.7 stage 7). Records characterization-first as the discipline that made the security refactor safe (NUL test added and proven green before F-050's fix), duplication-as-evidence producing two honest "keep" results, EOS-005 respected, and F-054 closed partial by an understood boundary. Documents the **format-gate incident** — my own misformatted commit rejected by the required `verify` check before reaching `main`, the reviewer's clearest demonstration yet that M2's verification layer catches ordinary mistakes by process, not memory. Captures the reviewer's four observations and the programme framing: **M1 Truth → M2 Verification → M3-A Public Contract Governance → M3-B Semantic Naming & Taxonomy → M4 Implementation Integrity & Testability**. |
