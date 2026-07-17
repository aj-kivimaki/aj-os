# REX-D9 — FPCP: M1's "no `src/` or `tests/` file" Objective Contradicts REX-105's Frozen Scope

> **Status:** **PROPOSED** — Frozen Plan Change Proposal (AJS-007 §7.2). **Awaiting the reviewer.**
> **REX-105 is halted until this is ruled.**
>
> **Type:** Repository Excellence Frozen Plan Change Proposal — alters an **objective** and an
> **acceptance criterion**, two of the five triggers the reviewer ruled at the REX-101 review.
>
> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Task(s):** REX-105 (blocked) · M1

---

# Purpose

Two statements frozen at the **same** M1 Planning Review contradict each other. REX-105 cannot
satisfy one without violating the other. AJS-007 §3 requires that an unresolved conflict is
*"halted and reported, never settled by invention at a lower layer"*, and
`implementation/CLAUDE.md` requires: *stop implementation · explain the conflict · do not invent a
solution.*

This is that report.

---

# Context — the conflict, verbatim

**M1's Objective** (`MILESTONES.md`, frozen 2026-07-17):

> **No source file changes** — this milestone's diff touches no `src/` or `tests/` file, and that is
> a testable claim.

**M1's Validation** (same document, same freeze):

> - `git diff --stat src/ tests/` is **empty**.

**REX-105's Scope** (`tasks/REX-105.md`, frozen at the same review):

> - **F-005** — `src/end-of-session/README.md:5,7,54` *"No behavior yet"* …
> - **F-012** — `src/context-builder/README.md` M4 *"pending Freeze Review"*.
> - **F-011** — `tests/context-builder/README.md:19` *"**Current** size: **205 tests across 15
>   files**"*.

**REX-105's own Acceptance Criteria** (same document, same freeze):

> - `git diff --stat src/ tests/` → shows **README files only**, no `.ts` file.

**The contradiction is direct.** Three of REX-105's eight findings live in files under `src/` and
`tests/`. Correcting them makes `git diff --stat src/ tests/` **non-empty**, which M1's Validation
forbids in the same breath that REX-105's Validation requires it.

**Neither statement is dead text.** M1's *"no source changes"* is the property that makes M1 safe and
was cited approvingly at the M1 Planning Review. REX-105's scope is the reason F-005 — a **Blocking**
finding, the module README claiming *"No behavior exists yet"* about a shipped, frozen module — is in
M1 at all.

**§3 does not resolve it.** Both statements are Package Documentation, at the same layer, frozen by
the same reviewer at the same review. There is no higher layer to prevail.

---

# The two readings

| Reading | *"No source file changes"* means | Consequence |
|---|---|---|
| **A — literal** | The diff touches **no file whose path starts with `src/` or `tests/`**, of any kind. | **REX-105's frozen scope is impossible.** F-005, F-011, F-012 cannot be closed in M1; three findings — one Blocking — move to a later milestone or out of REX. |
| **B — intent** | The diff changes **no code**: no `.ts` file, no behaviour. READMEs under `src/` are documentation that happens to live next to code. | REX-105 proceeds as frozen. M1's Objective and Validation are **restated precisely** to say `.ts` rather than "src/ or tests/". |

**The author's reading is B, but the author does not get to choose** — that is what §5.3 and the
"do not invent a solution" rule exist to prevent. The evidence for B is offered below; the ruling is
the reviewer's.

---

# Decision requested

**The reviewer is asked to rule which statement governs**, and to accept or reject the proposed
correction.

## Proposed (Reading B)

1. **M1's Objective** is corrected from:
   > *"**No source file changes** — this milestone's diff touches no `src/` or `tests/` file"*

   to:
   > *"**No code changes** — this milestone's diff touches no `.ts` file anywhere. Documentation
   > that lives beside code (`src/*/README.md`, `tests/*/README.md`) is in scope; behaviour is not."*

2. **M1's Validation** is corrected from `git diff --stat src/ tests/` is **empty** to:
   > `git diff --name-only src/ tests/` contains **only `.md` files** — **no `.ts` file is touched
   > by M1**, and that remains a testable claim.

3. **REX-105 proceeds as frozen**; its existing acceptance criterion (*"README files only, no `.ts`
   file"*) already states the corrected property and needs no change.

4. **No finding moves.** F-005, F-011, F-012 close in M1 as planned.

## If the reviewer rules Reading A instead

REX-105 is re-scoped to the four findings outside `src/`+`tests/` (F-006, F-007, F-020, F-021,
F-024), and **F-005, F-011, F-012 are deferred** — with F-005 recorded as a Blocking finding
knowingly left open, since `src/end-of-session/README.md` would continue to state that a shipped,
frozen module *"has no behavior."* **The author recommends against this**, but it is a coherent
outcome and is the reviewer's to choose.

---

# Rationale for Reading B

- **The frozen plan already contains Reading B, explicitly.** REX-105's acceptance criterion — *"shows
  **README files only**, no `.ts` file"* — was frozen at the same review as the Objective it
  contradicts. The plan is not silent between two readings; it **states both**. B is the one written
  where the actual work is specified.

- **The property M1 is protecting is "no behaviour change", not "no path prefix".** The scope guard
  defers anything that *"expands behaviour rather than improving an existing implementation."* A
  README correction under `src/` changes no behaviour whatsoever. Reading A protects the letter of a
  sentence at the cost of a Blocking finding.

- **Reading A would produce an absurd result.** `src/end-of-session/README.md` is a **document**. It
  is in M1's scope by every substantive criterion — it makes a false claim, it is Blocking, it is
  named in `FINDINGS.md`, and `SPEC-FREEZE-REVIEW.md` Step 6 explicitly requires *"Module README
  updated (status line + milestone/focus table)"* as a synchronization item. Excluding it because of
  its **directory** would let a filesystem layout decide a review's scope.

- **The corrected claim is strictly stronger as evidence.** *"No `.ts` file is touched"* is a
  sharper, more falsifiable statement than *"the src/ directory is untouched"* — it says exactly what
  the reader cares about (**no behaviour changed**) instead of a proxy for it.

- **This is the third planning defect of the same family**, and the reviewer has already named the
  cause at the REX-103 review: *"Repository findings are not guaranteed to partition the repository.
  Future review planning should allocate ownership by intended outcome rather than assuming each
  finding maps cleanly onto an isolated section of text."* F-020 and F-004/F-008 were **findings
  colliding with each other**; this is a **finding colliding with a milestone-level property**. Same
  root: the plan reasoned about paths and identifiers rather than outcomes.

---

# Why this is an FPCP when the earlier corrections were not

The reviewer ruled at the REX-101 review that an FPCP is required only for changes altering
**milestone scope, objectives, sequencing, acceptance criteria, or reviewer decisions** — and that
task-ownership corrections fall below that threshold.

**This clears it on two counts:**

- It alters **M1's Objective** ("No source file changes → No code changes").
- It alters **M1's Validation**, an **acceptance criterion** (`empty` → `only .md files`).

F-020 and F-004/F-008 changed *which task* closed a finding, leaving every milestone-level statement
intact. **This changes a milestone-level statement.** That is precisely the line the reviewer drew.

**Note what is *not* proposed:** no finding is added, removed, or re-severitied; no task is added or
resequenced; no reviewer decision is revisited; the scope guard is untouched. **The proposal is to
make the Objective say what the plan's own acceptance criteria already say.**

---

# Impact

## If accepted (B)

- REX-105 proceeds; F-005, F-011, F-012, F-006, F-007, F-020, F-021, F-024 all close in M1.
- `MILESTONES.md` M1 Objective + Validation corrected; change log records the FPCP.
- M1's freeze evidence carries the sharper claim: **no `.ts` file touched by M1**.

## If rejected (A)

- REX-105 re-scoped; three findings deferred, one of them **Blocking**.
- `FINDINGS.md` records F-005 as knowingly-open, with the reason.

## Either way

- **No code changes.** Both readings agree M1 touches no `.ts` file.
- **No behaviour changes.**
- The M1 retrospective records this as the third instance of the allocation-by-identifier planning
  defect.

---

# Validation

- **If B:** `git diff --name-only src/ tests/` at the M1 Freeze Review lists **only `.md` files** —
  and the check is run to confirm it *can* fail (touch a `.ts`, confirm it reports).
- **If A:** `git diff --stat src/ tests/` is empty, and `FINDINGS.md` shows F-005/F-011/F-012 as
  deferred with a recorded reason.

---

# Related Documents

Standards
- **AJS-007 §7.2** — Frozen Plan Change Proposal (Mandatory): *"the single sanctioned path to change
  something already frozen… reviewed and approved **before any implementation dependent upon the
  change begins**."*
- **AJS-007 §3** — *"An unresolved conflict is halted and reported, never settled by invention at a
  lower layer."*
- **AJS-007 §5.3/§5.4** — the author does not self-certify; the freeze is the reviewer's.

Implementation
- `implementation/CLAUDE.md` — *"stop implementation · explain the conflict · do not invent a
  solution."*
- [MILESTONES.md](../MILESTONES.md) — M1 Objective and Validation; the REX FPCP threshold.
- [REX-105](../tasks/REX-105.md) — blocked.
- `implementation/review/SPEC-FREEZE-REVIEW.md` Step 6 — requires module READMEs to be synchronized.

---

# Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-17 | 1.0     | **PROPOSED.** Raised by REX-105 before any edit. The M1 Objective/Validation ("touches no `src/` or `tests/` file" / "diff is empty") contradicts REX-105's frozen scope (three findings in `src/*/README.md` and `tests/*/README.md`) and REX-105's own acceptance criterion ("README files only, no `.ts` file"). Both frozen at the same review, same layer — §3 offers no resolution. **Not implemented; REX-105 halted pending the ruling.** |

---

> **Engineering Rule**
>
> When the plan contradicts itself, the author's job is to notice and report — not to pick the half
> that makes the work possible.
