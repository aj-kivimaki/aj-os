# SPEC-003 — End-of-Session Workflow: Retrospective

> **Milestones:** M1–M5 (EOS-001..007, 101..103, 201..202, 301..303, 401..411)
> **Outcome:** All five milestones frozen by the reviewer (AJ), 2026-07-15 → 2026-07-17. SPEC-003 complete and merged (`9bd051d`, PR #11).
> **Authored:** 2026-07-17, under REX-101.

---

## ⚠️ Provenance — read this first

**This retrospective is reconstructed, not contemporaneous.**

AJS-007 §4.7 stage 7 makes the Retrospective a lifecycle phase and §8.1 makes it a Lifecycle
Deliverable. **It was skipped at all five SPEC-003 milestone freezes.** SPEC-002 produced four; this
specification produced none. The omission was found on 2026-07-17 during the Repository Excellence
Review and recorded as finding **F-018**. This document discharges that debt **late**, and its
provenance must be weighed accordingly.

**What it is reconstructed from** — a genuinely rich record:

- `MILESTONES.md` v1.0 → v1.33 — 39 change-log entries, most written at task completion, many
  recording review findings and their disposition.
- 26 task documents (`EOS-*.md`), each with Lessons Learned and a change log.
- 11 decision records (`EOS-D1..D11`), including two Frozen Plan Change Proposals.
- The **M5 Freeze Review Evidence** section, including *"What the reviewer should weigh"* — the
  author's case *against* a freeze.
- `git log` across PRs #6–#11.

**What is lost, and cannot be recovered:**

- **Contemporaneous surprise.** The record says what was found; it rarely says what was expected.
  A retrospective written at the freeze would have captured the gap between the two.
- **Alternatives considered and discarded in the moment** — except where a decision record
  preserved them (D10 and D11 do; most tasks do not).
- **The reviewer's reasoning at each freeze**, beyond the ratification sentence.
- **Per-milestone separation.** M1–M4's lessons are reconstructed through the lens of knowing how
  M5 ended. That is hindsight, and it flatters the earlier milestones.

**Why this is one document and not five.** Fabricating five separate retrospectives, each written
as if at its freeze, would overstate their provenance — the precise failure this document is meant
to correct. One honest document beats five plausible ones.

---

## Summary

SPEC-003 delivered the End-of-Session Workflow as a validated vertical slice: `aj session end`
observes a session's git changes, extracts reusable knowledge through an injected model port,
generates canonical `CandidateKnowledge`, persists it, renders a human-readable projection, and
reports — writing **only** beneath `<vault>/knowledge-review/pending/<session-id>/`.

Five milestones, 26 tasks, 11 decisions, two Frozen Plan Change Proposals, five plan amendments
during M5. At the freeze: the full suite green across three consecutive runs; 26 public operations,
each a deliberate manifest edit; no git write and no wiki generation anywhere in the module,
verified by grep *and* at runtime; canonical knowledge proven byte-identical by a snapshot that was
itself verified able to fail.

**The headline:** the practice held, and the two places it failed were both places where the
standard has no verification step — **Documentation Synchronization (§7.4)** and **the Retrospective
(§4.7 stage 7)**. Both are Mandatory. Both failed silently. Neither failure was caught by the Freeze
Decision checklist that lists them.

---

## The §9.2 question — does the practice generalise beyond SPEC-002?

AJS-007 §9.2 designated SPEC-003 as the evidence that would validate or revise the standard, noting
that *"a specification whose shape differs from SPEC-002 carries particular evidentiary weight,
because it tests whether the practice generalises."* **This is the question the document exists to
answer, and it has never been answered — because this document was never written.**

**The answer is: partially, and less than it first appears.**

### Where SPEC-003 genuinely differs from SPEC-002 — and the practice held

| Difference | Evidence |
|---|---|
| **A non-deterministic seam.** SPEC-002 was deterministic throughout; SPEC-003 calls a model. | Contract-First held. The `TextGenerator` port isolated non-determinism at exactly one seam, and every stage either side stayed deterministic and stub-testable. Determinism by Construction survived contact with an LLM. |
| **Real I/O.** SPEC-002 was in-memory; SPEC-003 touches git and the filesystem. | Ports and adapters held. `GitPort` stayed read-only; the store stayed a persistence adapter. The M2 analyzer never learned what git is. |
| **A live CLI.** SPEC-002 had no user-facing entry point. | The Thin CLI Invariant (EOS-408) held, verified by grep: no git, no filesystem, no stage construction. |
| **Frozen foundations under real pressure.** | See below — this is the interesting one. |

### Where it does *not* differ — and this matters

**SPEC-003 is pipeline-shaped, exactly like SPEC-002.** That single fact substantially limits its
evidentiary weight, and the standard is explicit about why.

§6.2 says of **Single Public Entry Point**: *"Additional validation is required because it was
demonstrated in a single milestone and is **specific to a pipeline-shaped design**; it must recur in
a **structurally different context** before it can be promoted."* SPEC-003 does exhibit the pattern —
`run(context)` stayed the frozen entry point across five milestones without churning. But it is
**the same shape**, so it is **not** the structurally different context §6.2 asks for.

**Recommendation: do not promote it.** The temptation to read SPEC-003 as a second confirmation is
real and should be resisted; two observations of the same shape is one observation, twice.

The same reasoning disposes of **Orchestration Proven by Equality** — §6.2 calls it *"a narrow,
pipeline-shaped technique whose generality beyond composition pipelines is unproven"*, and SPEC-003
is a composition pipeline. EOS-409 did prove the returned report byte-equal to the persisted
`report.json`, which is adjacent evidence, but not the structurally different context required.

**Ordering as the Contract** is the one candidate with a genuine case. §6.2 defers it because *"it
was demonstrated for a single behaviour, and whether it generalises to other domains is not yet
established."* SPEC-003 demonstrated it in **two further, distinct behaviours**: deterministic change
ordering in collection (EOS-101), and the order-preserving 1:1 Candidate Generation Invariant
(EOS-301). Both expose canonical ordering as the guarantee instead of a priority or score field.
**Recommendation for the reviewer's consideration: `Ordering as the Contract` now has evidence from
three behaviours across two specifications.** Whether that clears §9.3's bar is the reviewer's call
at the AJS layer, under §10.2. This retrospective proposes; it does not promote.

### The verdict

SPEC-003 **strengthens** confidence in the §6.1 validated principles — they held against
non-determinism, real I/O, and a live user entry point, which SPEC-002 never tested. It provides
**one candidate-principle promotion case** (Ordering as the Contract) and **explicitly fails to
provide** the structurally-different-context evidence the other two candidates need.

And it provides **two pieces of evidence that the standard should be revised** — below.

---

## What worked well

- **The FPCP mechanism (§7.2) worked, twice, under real pressure.** Both proposals were raised
  rather than absorbed, scoped to the minimum, and **approved before dependent work began**:
  - **EOS-D10** (session notes → extraction) — surfaced by a *code review finding* in EOS-402, not
    by a test. Approved as *"restores an intended input… without introducing new architectural
    concepts."*
  - **EOS-D11** (untracked files) — surfaced by EOS-408's *real run*. Approved as *"restoring
    consistency with the already-approved semantics of the default working range rather than
    introducing new functionality."* Verified adapter-only **by diff: one file changed**, with M2's
    38 analyzer tests passing unmodified as the proof of confinement.
  This is the strongest positive evidence in the specification. §7.2 is Mandatory and it earned it.

- **The reviewer required invariants to be written down *before* implementation — five times.**
  Execution determinism (EOS-101), Extractor (EOS-202), Candidate Generation (EOS-301), Orchestrator
  (EOS-406), Report Builder (EOS-405). Each was recorded at the reviewer's requirement **at the
  Planning Review**, then verified at code review. **This is the single most repeated pattern in the
  specification, and it is not in AJS-007.** See Recommendations.

- **Invariants verified by *shape*, not by vigilance.** The Orchestrator Invariant was proven by
  counting the module's value imports — **exactly two**, both pure stage functions. The Report
  Builder Invariant by its single non-type import. A property that a reviewer must *remember* to
  check will eventually not be checked; a property that shows up in the import list checks itself.

- **Guarantees were proven *able to fail*.** The canonical-unchanged snapshot was tampered with to
  confirm it detects modified, added, *and* deleted files. The byte-identical prompt guarantee
  (EOS-D10) was proven by hashing the prompt from the built module **before any edit**
  (`07bda1107e3159c0…`) and matching SHA-256 after. **A vacuous guarantee is worse than none**,
  because it converts an unknown into a false known.

- **The author did not self-certify.** MILESTONES v1.32: *"M5 stays ⬜ in every progress table — a
  freeze is a reviewer decision, not a consequence of the author finishing the work (§5.3/§5.4)."*
  The Freeze Review Evidence went further and included *"What the reviewer should weigh"* — the case
  **against** a freeze. That section is why the record is trustworthy, and it is the one most easily
  dropped.

- **Contract-First and Scope Discipline held across all five milestones.** No milestone implemented
  the next one's work. M1 shipped contracts with **no behaviour**, deliberately, and the later
  milestones populated them rather than redesigning them.

---

## What surprised us

- **After four frozen milestones, the central object could not be constructed.** M5 planning
  discovered that **no `Session` was constructible**: `Session.gitState.head`/`dirty`/`branch` are
  required, but M2's `GitPort` exposed only `changes(range)`, and EOS-002 had recorded that access
  as M2's. Four milestones froze on a foundation with a hole in the middle of it, and **every test
  passed the whole time**, because each milestone tested its own stage against its own stubs. It
  took *composition* to find it. (→ EOS-D7.)

- **The same defect, three consecutive stages.** `summaryFor` computed twice (EOS-403) →
  `durationFor` computed twice (EOS-405) → notes-presence decided twice (EOS-410). The record names
  it at the third occurrence: ***one decision derived twice***. When a stage emits structured data
  *and* prose about that data, deriving the prose from upstream inputs instead of from the assembled
  structure makes divergence representable. The fix is structural — derive the prose from the
  assembled fields — not vigilance.

- **The determinism tests were not deterministic.** EOS-409's tests compared two *fresh* fixture
  repos and passed only when both landed in the same second, because git bakes the commit timestamp
  into the hash. In the author's own words: *"they were comparing two different repositories and
  calling it determinism."* **A determinism test must be paranoid about what it holds fixed** — the
  fixture *was* the assumption.

- **`npm run typecheck` cannot see `tests/`, and it hid three real defects in one milestone.**
  EOS-401 (the `GitPort` extension silently broke two M2 stubs into type errors), EOS-405 (an
  `exactOptionalPropertyTypes` error), EOS-407 (an import of `type AIResponse`, which the barrel
  does not export). Each was invisible to **both** checks: Vitest strips types, and `tsconfig`'s
  `include: ["src"]` excludes tests. The gap is not exotic — it is the default consequence of
  scoping the compiler to `src`, which was itself a *correct* decision for `build`.

- **Tests that cannot fail were the most common review finding.** `toContain("no")` — which passes
  because "no" hides inside "knowledge". A circular acceptance test that could not fail for its
  stated reason. A `.strict()`-guaranteed assertion. A UUID asserted not to contain a timestamp.
  **Ask of every guard: what would make this fail?**

- **Only the real thing found the real gaps.** Every M5 gap — no `Session` constructible, notes
  silently dropped, untracked files invisible — was invisible to unit tests. EOS-408's *real run*
  exposed a session that reports `dirty: true` while the file that made it dirty is invisible to
  extraction. **New files are where new knowledge most often lives**, and the pipeline could not see
  them.

---

## Engineering discoveries

- **A port that reports reality; a factory that applies policy.** EOS-401's `branch()` initially
  returned the literal `"HEAD"` when detached — a non-empty string that would satisfy
  `Session.branch`'s `.min(1)` and record a branch that does not exist. The fix split it: the port
  returns `Promise<string | null>` (git's actual state), and the factory applies the ratified Branch
  Policy (`detached@<short-head>`). **Nullable handling stops at the factory** rather than
  propagating into candidates, projection, report, and SPEC-004.

- **"If a rule wants to live in the orchestrator, a stage is missing."** (EOS-406.) The most
  portable sentence SPEC-003 produced.

- **Stub drift is invisible to both the runner and the compiler.** Extending a port silently breaks
  every stub of it, and nothing catches it. EOS-407 introduced an explicit stub-drift check; it
  caught a defect immediately.

- **Persistence at two points, not one — deliberately.** EOS-D4 requires canonical candidates stored
  *before* the projection renders a view of them, so a projector failure still leaves candidates
  durable. Pinned by a test. The obvious single-write design would have been wrong.

- **The boundary held where it was inconvenient.** EOS-404: `review-package.md` lacked a trailing
  newline; the fix went in **the projector, not the store**, because adding it in the store would
  make persistence responsible for content. A `writeSessionFile` DRY helper was **declined** because
  it would modify frozen M4 internals beyond what EOS-D8 authorized.

- **A failed run must still produce a report.** The report is how a failure stays observable; `run`
  rarely rejects, so **callers must read `report.result`**.

---

## Process improvements — recommendations only

Per AJS-007 §3, a retrospective *"produces a recommendation"* and changes no layer. Each of these is
**a proposal for the reviewer at the AJS layer**, under §10.2.

1. 🔴 **§7.4 Documentation Synchronization is Mandatory and has no verification step. It failed
   silently.** MILESTONES v1.32 states *"Documentation synchronized per AJS-007 §7.4"* while
   `src/end-of-session/README.md` still said *"No behavior exists yet"* (F-005) — and
   `src/context-builder/README.md` had the same class of defect from SPEC-002's M4 (F-012). The
   mechanism is a checklist item that certifies itself. **Recommend: §7.4 requires evidence, in the
   same way the Integration Check does** — the freeze names the documents it synchronized and the
   check that proves it.

2. 🔴 **The Retrospective was skipped five times and the Freeze Decision checklist that lists it did
   not catch it.** `SPEC-FREEZE-REVIEW.md`'s decision box contains *"[ ] Retrospective completed
   (accumulated, not overwritten)"*, and five freezes were declared with it unticked. **The strongest
   evidence in this document is its own absence.** A Mandatory deliverable enforced only by an
   unticked checkbox is not enforced. **Recommend: a freeze cannot be declared while a Lifecycle
   Deliverable is missing — the reviewer needs the artifact in hand, not a box.**

3. 🟠 **Widen the compiler to `tests/`.** Already argued in the record at v1.27: *"an argument for
   widening the compiler to `tests/` once SPEC-003 closes."* SPEC-003 has closed. Three defects in
   one milestone is the case. *(Now REX F-026/F-027 — measured 2026-07-17: **0** test files
   type-checked, **46** errors hidden.)*

4. 🟠 **Promote "record the invariant before implementing" into the standard.** It happened **five
   times**, always at the reviewer's requirement, never at the author's initiative — which is the
   signature of a practice that works and isn't written down. It is Contract-First applied to
   *properties* rather than data shapes. **Recommend the reviewer consider it for §6.1** on this
   evidence plus SPEC-002's.

5. 🟡 **Five plan amendments in M5 is worth examining, not apologising for.** MILESTONES v1.32
   flagged this for the retrospective explicitly. The honest reading: **four of the five were
   discovered by composition and real runs, not by planning** — and no amount of additional planning
   would have found "no `Session` is constructible", because every stage was individually correct.
   The amendments are evidence that **the FPCP mechanism is load-bearing**, not that the planning was
   poor. The one genuine planning gap: M1 recorded git-state access as M2's responsibility, and M2
   did not implement it. **Nothing checked that hand-off.**

6. 🟡 **`SessionContext` is nearly inert.** Only `sessionNotes` is consumed; `taskId`,
   `contextPackageRef`, and `commitMessage` reach nothing. Contract-First's cost, visible: contracts
   defined before their consumers can define fields no consumer ever wants. Worth watching in
   SPEC-004, not fixing here.

---

## Deferred improvements — reviewer-accepted, recorded

Do **not** re-raise these without the reviewer; each was ruled on at a freeze.

1. **`createGitPort` `execFile` `maxBuffer`** — accepted at the M2 freeze; degrades correctly into a
   recoverable `AnalyzerError`.
2. **Non-ASCII path quoting** — git returns `"caf\303\251.ts"` from both reads; **pre-existing in
   M2's frozen parser since EOS-103**, inherited identically by EOS-411 rather than introduced.
   Recorded as Future Hardening.
3. **The git seam's location under `analyzers/`** — contradicts EOS-D7's *"the seam is not any one
   consumer's"*. Reviewer ruled: **unchanged for SPEC-003**; reconsider after the specification
   completes.
4. **Two representations of detached HEAD** — `SessionContext.branch = "detached"` vs
   `Session.branch = detached@<short-head>`; `SHORT_HEAD_LENGTH` duplicated across two stages. Every
   alternative was worse.
5. **M4's duplicated write logic** — left as-is for SPEC-003.

---

## Recommendations for future specifications

- **Compose early, even if only in a throwaway.** Four milestones froze before composition revealed
  the central object was unconstructible. Every stage was correct; the *seam* was not, and only
  assembly could show it.
- **Keep the "what the reviewer should weigh" section.** Stating the case *against* your own freeze
  is what makes the case *for* it credible.
- **Prove the load-bearing guarantee can fail before trusting it.** Hash before and after. Tamper
  with the fixture. A green test over two empty directories proves nothing.
- **Write the retrospective at the freeze.** This document is the argument. Reconstructed lessons
  are weaker lessons, and the evidence AJS-007 asked for sat unwritten for a month while the standard
  it was meant to validate stayed Draft on a single specification.

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.0 | Retrospective authored under **REX-101**, reconstructed from the surviving engineering record. Discharges AJS-007 §4.7 stage 7 / §8.1 for M1–M5, late, and closes REX findings F-018 and F-020. Answers the §9.2 question directly: the practice **partially** generalises — it held against non-determinism, real I/O, and a live CLI, but SPEC-003 is **pipeline-shaped like SPEC-002** and therefore does **not** supply the structurally-different context §6.2 requires for two of the three candidate principles. Recommends `Ordering as the Contract` for the reviewer's consideration on evidence from three behaviours across two specifications. All recommendations are proposals under §3; no higher-layer document is modified. |
