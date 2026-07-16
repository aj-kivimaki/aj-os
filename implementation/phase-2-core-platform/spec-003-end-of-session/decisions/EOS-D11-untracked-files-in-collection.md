# EOS-D11 — Untracked Files Belong to the Session's Change Stream

> **Status:** **Accepted** — **APPROVED by the reviewer (AJ) on 2026-07-17** as a Frozen Plan
> Change Proposal (AJS-007 §7.2): *"this qualifies as a narrowly scoped Frozen Plan Change
> Proposal because it restores consistency with the already-approved semantics of the default
> working range rather than introducing new functionality."* Implemented by
> **[EOS-411](../tasks/EOS-411.md)**, adapter-only, with the analyzer and every contract
> untouched.
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Frozen artifacts this proposes to change:** **M2** — the `createGitPort` adapter
> (EOS-103), frozen 2026-07-16. **Nothing else.**
>
> **Related Task(s):** EOS-103 (the adapter), EOS-102 (the analyzer — *unchanged*), EOS-402
> (the range semantics this restores), EOS-409 (which would pin the behaviour), proposed
> **EOS-411**
>
> **Date:** 2026-07-17

---

# Purpose

A session that creates a new file and ends before `git add` captures **nothing about that
file**. New files are where new knowledge most often lives. This proposal makes the git
observation match the range semantics EOS-402 already ratified — changing one adapter method
and nothing else.

---

# Context — the inconsistency

Found by driving `aj session end` for real at EOS-408, and verified directly:

```text
git status --porcelain          git diff --name-status -M HEAD
 M a.ts                         M   a.ts
A  staged.ts                    A   staged.ts
?? untracked.md                 (absent)
?? newdir/nested.ts             (absent)
```

The workflow therefore contradicts itself within a single `Session`:

- **`Session.gitState.dirty` is `true`** — it comes from `git status --porcelain` (EOS-401),
  which sees untracked files;
- **the `ChangeSet` omits them** — the analyzer reads `git diff --name-status -M HEAD`
  (EOS-103), which does not.

The run reports a dirty working tree and then analyzes a session in which those files do not
exist. Nothing downstream can recover them: no finding can cite a path it never saw, and no
candidate can be generated from it.

**This is a gap against ratified intent, not a new requirement.** EOS-402's Branch/range
semantics fixed the default range as **"the uncommitted + staged work"** — the complete
uncommitted working state. An untracked file *is* uncommitted. The reviewer confirmed this
reading (2026-07-17): untracked files are within the intended semantics.

The gap survived four milestones because **every unit test supplies its own `ChangeSet`** —
only a real run over a real repository could show it.

---

# Proposed change (the whole of it)

**One adapter method. `createGitPort.changes(range)` gains a second read.**

When the range is a **working-tree comparison**, `changes` also runs:

```text
git ls-files --others --exclude-standard
```

and maps each returned path to an ordinary `GitFileChange`: `{ path, status: "A" }`.

That is all. Specifically:

- **`GitPort` is unchanged** — same interface, same signature, no new method, no new port.
- **`createGitChangeAnalyzer` is unchanged** — not one line. It stays a **pure translator**:
  it receives more `GitFileChange`s and translates them exactly as it already translates an
  `A` from the diff (`changeType: "added"`, `kind` from the path heuristic, id `git:<path>`,
  summary `added <path>`). The analyzer never learns that untracked files exist.
- **Every contract is unchanged** — `GitFileChange`, `SessionChange`, `ChangeSet`, `Session`,
  and everything downstream.
- **No new stage.**

## Distinguishing a working-tree range from a commit range

Untracked files belong to the working tree, **not** to a commit range. With
`--since main`, the session is `main..HEAD` — a commit-to-commit diff that deliberately
excludes *all* uncommitted work, modifications included. Adding untracked files there would
be incoherent: the reviewer would see brand-new files but not the unstaged edits beside them.

The adapter distinguishes them by a **git** rule, not a domain rule: **a range containing
`..` is a commit range; anything else is a comparison against the working tree.** That is
git's own vocabulary — `git diff HEAD` compares the working tree, `git diff main..HEAD`
compares two commits — and the adapter is the component that speaks git.

This keeps the decision where the M2 seam already puts it: the adapter owns **invocation
strategy** (EOS-102's own words — "git orchestration/policy (repository discovery, range
construction, retries, invocation strategy) live behind this port"). Choosing *which git
commands answer a range* is precisely that. It is not domain policy, and it does not leak
into the analyzer.

## What the extra read gives us — verified, not assumed

```text
$ git ls-files --others --exclude-standard
newdir/nested.ts
untracked.md
```

- **Files, not directories** — `newdir/nested.ts`, not `newdir/`. Each becomes one
  `SessionChange`, exactly like every other change.
- **`.gitignore` respected** — `--exclude-standard` excludes ignored files, so build output,
  logs, and `node_modules` never enter the change stream. (Verified: a `*.log` file was
  excluded.)
- **Disjoint from the diff** — `git diff` reports tracked paths, `ls-files --others` reports
  untracked ones. No overlap, so **no deduplication is needed** and none is added.
- **Sorted output**, and the analyzer sorts by path regardless.

---

# How each of the reviewer's constraints is met

| Constraint | How |
| --- | --- |
| **Modify only the Git adapter/analyzer implementation** | **Adapter only** — `createGitPort.changes`. The analyzer is not touched. |
| **Preserve all existing contracts** | No contract changes at all. An untracked file becomes a `GitFileChange` with `status: "A"` — a shape the contract already defines and the analyzer already handles. |
| **Avoid new stages or ports** | None. `GitPort`'s interface is untouched; the change is inside one existing method. |
| **Preserve deterministic ordering** | The analyzer already sorts by path (EOS-102), and that is unchanged. `ls-files` output is itself sorted. The same repository state yields the same `ChangeSet`, every time. |
| **Keep the analyzer a pure translator** | It stays *literally* unchanged. It cannot tell an untracked file from a staged one — both arrive as `status: "A"`. |

---

# Rationale

- **It removes a self-contradiction.** One `Session` currently says "the tree is dirty" and
  "these are all the changes", and both cannot be true. Whichever way this is resolved, they
  should agree.
- **It restores ratified semantics.** EOS-402 fixed the default range as the complete
  uncommitted working state; `git diff HEAD` simply does not implement that. The gap is
  between intent and implementation, not between intent and desire.
- **It captures what matters most.** A new file is the strongest signal a session produced
  something new. Silently dropping it undercuts the workflow's entire purpose.
- **The cost is one git read, on one branch of one adapter method.** No contract, no port,
  no stage, no analyzer change — and `.gitignore` keeps the noise out for free.
- **The seam already anticipated this.** EOS-102 assigned invocation strategy to the adapter
  precisely so that *how* an observation is obtained could change without disturbing anything
  above it. This is that mechanism working as designed.

---

# Alternatives Considered

## Option A (proposed) — the adapter adds `ls-files --others` for working-tree ranges

Selected for proposal — adapter-only, contracts untouched, analyzer untouched, ordering
preserved, `.gitignore` honoured.

Cost: the adapter now issues two commands for a working-tree range, and it interprets `..` to
tell the range kinds apart.

## Option B — `git status --porcelain` instead of `git diff`

Description: one command reporting the complete uncommitted state (modified, staged,
untracked).

Pros
- A single read; exactly "the working state".

Cons
- Its output format differs (two-column XY status codes, quoting rules, rename arrows), so
  the adapter's parser would be **rewritten** rather than extended — a much larger change to
  frozen M2 code than this gap warrants.
- It cannot express a commit range at all, so `--since <ref>` would need a *second* code path
  anyway.

Rejected: bigger blast radius, no benefit over Option A.

## Option C — a new `GitPort.untracked()` read, merged by the analyzer

Cons
- Adds a port method **and** forces the analyzer to decide *when* untracked files apply —
  i.e. to inspect the range. That makes it a policy-holder rather than a pure translator, and
  the reviewer's constraints forbid both.

Rejected.

## Option D — include untracked files for every range

Cons
- Incoherent for `--since main`: the reviewer would see brand-new files but not the unstaged
  modifications sitting beside them, because a commit range excludes those.

Rejected.

## Option E — do nothing; document the limitation

Pros
- No change to frozen M2.

Cons
- Leaves `dirty: true` beside a `ChangeSet` that contradicts it, and silently drops the
  session's new files. The reviewer has stated untracked files are within intended semantics.

Rejected — but recorded, because it is the honest alternative: if this is not approved, the
limitation must be **documented in EOS-409's acceptance suite and the README**, not left for a
user to discover.

---

# Consequences

## Positive

- `Session.gitState.dirty` and the `ChangeSet` finally agree.
- New files — the likeliest carriers of new knowledge — reach extraction.
- Ratified range semantics hold in fact, not just on paper.

## Trade-offs

- **A working-tree run costs one extra git process.** Once per run; negligible beside a model
  call.
- **The adapter now interprets `..`.** A narrow, well-defined piece of git vocabulary, but it
  is the first time the adapter branches on the range's *shape*. Named here so it is a
  deliberate cost. (`git diff main` — no `..`, still a working-tree comparison — is handled
  correctly by this rule.)
- **More changes reach extraction**, and a session with many new files produces a longer
  prompt. `.gitignore` already excludes the bulk sources of noise; no truncation is added,
  because truncation is a policy judgement this proposal deliberately does not make.

---

# Impact

## Affected Tasks

- **EOS-411 (new, proposed)** — implements it; must run **before EOS-409** finalizes
  acceptance behaviour, or EOS-409 must be re-run against the new behaviour.
- **EOS-103** — the frozen adapter being changed.
- **EOS-102** — the analyzer: explicitly **unchanged**, and its tests must pass untouched.
- **EOS-409** — asserts the end-to-end consequence (a new file reaches a candidate).

## Affected Components

- `src/end-of-session/analyzers/git/createGitPort.ts` — **only**.

## Not Affected

`GitPort`, `createGitChangeAnalyzer`, `collectChanges`, every contract, every other stage,
and every other milestone.

---

# Validation (what EOS-411 would have to prove)

- **The analyzer is untouched** and every EOS-102 test passes **unmodified** — the proof the
  change is confined to the adapter.
- Fixture repo: an untracked file appears in the `ChangeSet` as `added`, alongside the
  modified and staged files, with its `git:<path>` id.
- **`.gitignore`d files never appear.**
- **Untracked files are excluded for a commit range** (`<ref>..HEAD`), and included for
  working-tree ranges (`HEAD`, and a bare `<ref>`).
- **Deterministic**: the same repository state yields a deep-equal, path-sorted `ChangeSet`
  across runs.
- **No duplication**: a staged-new file appears exactly once (from the diff), not twice.
- Still read-only: no git write is invoked (the EOS-401 read-only proof still holds).

---

# Approval

A **Frozen Plan Change Proposal** (AJS-007 §7.2) against the M2-frozen `createGitPort`.

- [x] **Approved (reviewer: AJ, 2026-07-17)** — adapter change authorized; **EOS-411**
      implemented it; EOS-409's acceptance suite was extended with an untracked-file scenario
      and the full M5 acceptance re-validated (713 tests / 58 files, green). This decision is
      **Accepted**.
- [ ] ~~Rejected~~ — would have required documenting the limitation. Not taken.

**Delivered exactly as proposed**, and verified: one adapter file changed; the analyzer and
`GitPort` byte-untouched; M2's tests passing unmodified.

---

# Related Documents

Architecture
- PIPELINE-ARCHITECTURE.md (Collection stage — "Determines *what changed* in the session")

Standards
- AJS-007 §7.2 (Frozen Plan Change Proposal), AJS-004 (single responsibility), ADR-002 §4
  (read-only git in an engine)

Decisions
- EOS-D7 (the read-only git seam this extends the use of), EOS-D10 (the first FPCP — same
  narrow shape)

Specifications
- SPEC-003 §13 (Consumes — git repository), §19 (Acceptance — candidates identified)

Implementation Tasks
- EOS-103 (frozen adapter), EOS-102 (analyzer — unchanged), EOS-402 (range semantics),
  EOS-408 (found the gap), EOS-409, EOS-411 (proposed)

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-17 | 1.1 | **APPROVED and Accepted (reviewer: AJ).** The FPCP passed as "narrowly scoped… restores consistency with the already-approved semantics of the default working range rather than introducing new functionality". Implemented by **[EOS-411](../tasks/EOS-411.md)** exactly as proposed — adapter-only, analyzer and contracts untouched, M2's tests unmodified. EOS-409's acceptance suite gained an untracked-file scenario asserting on the prompt the model was actually shown, and the full M5 acceptance was re-validated (**713 / 58**, three consecutive runs). The workflow no longer contradicts its own `dirty` flag. |
| 2026-07-17 | 1.0 | **Proposed** (not implemented). Second FPCP, raised at the reviewer's request after EOS-408's real run showed `Files analyzed : 1` for a two-file session. The workflow contradicts itself: `Session.gitState.dirty` is `true` (from `git status`, which sees untracked files) while the `ChangeSet` omits them (from `git diff HEAD`, which does not) — so a session that creates a file and ends before `git add` captures nothing about it. Proposes **one change to one adapter method**: `createGitPort.changes` also runs `git ls-files --others --exclude-standard` for **working-tree ranges** (distinguished from commit ranges by git's own `..` vocabulary — invocation strategy, which EOS-102 assigns to the adapter), mapping each untracked path to an ordinary `{ path, status: "A" }`. **`GitPort`, the analyzer, and every contract are untouched**; the analyzer stays a pure translator and cannot tell an untracked file from a staged one. Verified: `ls-files` lists files not directories, respects `.gitignore`, is disjoint from the diff (no dedupe needed), and is sorted. Alternatives rejected: `git status --porcelain` (rewrites the parser, cannot express a commit range), a new `untracked()` port read (adds a port *and* makes the analyzer hold policy), including untracked for every range (incoherent for `--since`), and do-nothing (then the limitation must be documented). **Awaiting review.** |

---

> **Engineering Rule**
>
> A session cannot be dirty and unchanged at the same time. If the workflow says the tree has
> new work in it, the change stream has to contain that work.
</content>
