# REX-D6 — The Rule Separating a Load-Bearing Comment from Noise

> **Status:** ✅ **ACCEPTED** — ruled by the reviewer (AJ) at the **M5 Planning Review**, 2026-07-17. Planning Freeze declared.
>
> **Type:** Package decision ruled at M5 Planning. Governs REX-501. Comment edits are
> behaviour-neutral; below the FPCP threshold.
>
> **Implementation Package:** REX — Repository Excellence Review · **Milestone:** M5
>
> **Related Task(s):** **REX-501** · **Findings:** F-056, F-057, F-058, F-059, F-066

---

# Purpose

M5's named risk: *"a comment cleanup is the single easiest way to delete irreplaceable knowledge."*
This decision records the rule that decides, for every comment, **keep / rewrite / delete** — so the
cleanup removes noise without touching the knowledge that only a comment can carry. It exists to be
**conservative on purpose**: when in doubt, keep.

---

# The rule

A comment **earns its place only if it states something the code cannot**:

| Keep — the comment is load-bearing | Delete — the comment is noise |
|---|---|
| **Why**, not what: a constraint, an invariant, a rejected alternative, a non-obvious consequence. | Restates the next line (`// increment i`). |
| **An absence**: why something is *not* done, *not* caught, *not* reimplemented (the hardest knowledge to recover). | A section label above an obvious declaration (`// Public factory` над `export { … }`). |
| A pointer to the decision/spec that governs the code (`EOS-402`, `SPEC-003 §17`). | Prose that duplicates JSDoc already present at the definition (it will drift — F-056 proves it did). |
| Terse and irreplaceable — deleting it loses information not in the code. | Stale: describes code that no longer exists or a constraint since removed. |

**The tie-breaker: when a comment's value is uncertain, keep it.** The cost of keeping a marginal
comment is a line; the cost of deleting a load-bearing one is unrecoverable. This asymmetry is the
whole reason the rule leans conservative.

---

# The preserve-list is absolute

The six comments in [FINDINGS.md § Comments that must be preserved](../FINDINGS.md#comments-that-must-be-preserved--an-explicit-anti-finding)
are **protected by name** and **removed only if the code they describe is provably gone**. Their
coordinates drifted under M3-B's renames and M4's refactors and are **refreshed at the start of
REX-501** before any comment is touched — deleting the wrong line is the exact failure this list
exists to prevent.

---

# How it applies to M5's comment findings

| Finding | Ruling under the rule |
|---|---|
| **F-056** | *"services … land in later M1+ tasks"* — **stale** (they landed). Delete. |
| **F-057** | comments defending the **deleted** `NOTION_*` constraint — **stale**. Rewrite to state the actual current reason the fields are optional, or delete if the code already says it. |
| **F-058** | section-label noise (`// Public factory` above an obvious `export`) — **noise**. Delete. |
| **F-059** | ~150 lines of barrel prose duplicating JSDoc at each definition — **noise that drifts**. Thin to what the barrel adds beyond the definitions; **keep any line that documents the manifest itself** (why the surface is what it is). |
| **F-066** | agent layer near-zero comments — **add** where a constraint or a why is currently unstated; **do not** add noise to hit a density number. The rule forbids comment-for-comment's-sake as firmly as it forbids noise. |

---

# Scope guard

Editing comments changes **no behaviour**. Making a comment true, or deleting one that restates code,
is engineering hygiene — in scope. **Writing new explanatory comments for the agent layer (F-066) is
in scope only where a real constraint is currently undocumented**; inventing commentary to raise a
coverage-style metric is the noise the rule exists to prevent, and defers to nothing because it should
not be done at all.

---

# Validation

- **The preserve-list is verified line-by-line before and after REX-501** — every protected comment
  still present (or its code provably gone).
- Every deletion is justified against the rule's right-hand column; every rewrite makes a stale comment
  true.
- Behaviour unchanged: full suite green (comments do not execute — the proof is that nothing else
  moved).

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 0.1 | **PROPOSED** at M5 Planning. States the keep/rewrite/delete rule (why-not-what; absences are load-bearing; noise restates code) with a **conservative tie-breaker** (when uncertain, keep). Makes the six-comment preserve-list absolute and requires its coordinates refreshed before any edit. Rules F-066's "add comments" **in scope only for genuinely-undocumented constraints** — never comment-for-metric. |
| 2026-07-17 | 1.0 | ✅ **ACCEPTED** at the M5 Planning Review (reviewer: AJ). *"When uncertain, keep"* governs **both deletion and addition**. The protected comment inventory is a **repository contract for the duration of M5** — deleting any protected comment requires explicit evidence its constraint has disappeared: *"absence of evidence is not evidence of obsolescence."* F-066 approved as scoped — the same evidence standard justifies addition as deletion. |

---

> **Engineering Rule**
>
> A comment earns its place only by saying what the code cannot. When in doubt, keep — a deleted
> load-bearing comment is unrecoverable; a kept marginal one costs a line.
