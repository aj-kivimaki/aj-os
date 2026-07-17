# REX-D3 — Shared-Ownership Criteria Applied to the Duplication Findings

> **Status:** ✅ **ACCEPTED** — ruled by the reviewer (AJ) at the **M4 Planning Review**, 2026-07-17. Planning Freeze declared.
>
> **Type:** Package decision ruled at M4 Planning. Governs REX-401. Consolidation touches no
> frozen surface (below the FPCP threshold); the F-050 fix is a defect repair, not a consolidation.
>
> **Implementation Package:** REX — Repository Excellence Review · **Milestone:** M4
>
> **Related Task(s):** **REX-401** · **Findings:** F-049, F-051, F-052 (F-050 is a defect, ruled here only to decouple it)

---

# Purpose

Three findings allege duplication that *might* warrant shared ownership. **Duplication is evidence,
not a verdict** (the package principle). This decision applies the four shared-ownership criteria to
each, per item, and records the result — **"keep parallel" is a valid outcome, recorded as a result,
not a deferral.**

It also **decouples F-050**: whether the two stores' path guards *should* be shared (a judgement) is
independent of whether one has *drifted into a hazard* (a defect, fixed regardless).

---

# The four criteria (from the frozen plan)

A duplicated implementation qualifies for shared ownership **only if all four hold**: **same
responsibility · same lifecycle · same ownership · same change cadence.** If any fails, keeping the
copies parallel is correct.

---

# Per-item analysis (measured against `HEAD`, `c7f59e1`)

## F-049 — path-guarding triplicated across three stores

`createFilesystemReviewStore.ts`, `createFilesystemWikiStore.ts`, `handbook/paths.ts` each guard a
path against escape.

| Criterion | Holds? | Evidence |
|---|---|---|
| Same responsibility | **No** | The wiki store **writes into** a canonical dir; the review store **rejects** canonical dirs (`CANONICAL_DIRS = {foundation, library, wiki}`, SPEC-003 §17 — a mis-set review path must never point at canonical knowledge); `handbook/paths` guards two **read-only** subtrees (`foundation`, `library`) under the vault. Three different questions about three different roots. |
| Same lifecycle | **No** | The review store's canonical-**rejection** rule is SPEC-003-specific; a correct change to it would be **wrong** for the wiki store, which canonical-**writes**. |
| Same ownership | **No** | Each belongs to its module; a shared guard forces an arbitrary home and a dependency edge from three modules onto it. |
| Same change cadence | **No** | They have **already diverged** (F-050 is the proof). |

**Ruling (proposed): KEEP PARALLEL.** All four criteria fail. Consolidating would couple three
lifecycles that are correctly separate — the exact error EOS-005 ratified against. **This is a result,
not a deferral.** *(The shared *lexical* checks — NUL/`..`/absolute — are trivial and independently
correct in each; extracting them would save ~3 lines per copy at the cost of a shared dependency, and
is not worth it. Recorded, not done.)*

## F-051 — `deepFreeze` defined six times

One in `end-of-session/contracts/immutable.ts` (**excluded by EOS-005**, which it cites) + **five
identical private copies inside `src/context-builder/`** (schema files).

| Criterion (scope: the 5 within context-builder) | Holds? |
|---|---|
| Same responsibility | **Yes** — deep-freeze an arbitrary object graph. Identical. |
| Same lifecycle | **Yes** — a correct change to one is correct for all five. |
| Same ownership | **Yes** — all inside `context-builder`; a single module-internal home is natural, no new dependency edge. |
| Same change cadence | **Yes** — they are byte-identical and have never diverged. |

**Ruling (proposed): CONSOLIDATE the five, within `context-builder` only** — into one module-internal
helper. **`immutable.ts` is untouched (EOS-005).** All four criteria hold, and the home is inside the
module, so no cross-module coupling is introduced.

## F-052 — model-JSON-parse duplicated

`knowledge/compiler/extraction.ts:57` and `end-of-session/contracts/knowledge-extraction/schema.ts:140`
— both `JSON.parse(stripCodeFence(raw))`.

| Criterion | Holds? | Evidence |
|---|---|---|
| Same responsibility | **Partly** — both strip a fence and parse, but each raises its **module's own domain error** and the eos copy adds deep-freeze. |
| Same lifecycle | **No** — `schema.ts` **states** it "reuses the extraction.ts pattern, **adapted** to the module convention" — EOS-005's parallel-by-design, explicitly. |
| Same ownership | **No** — two modules, two error taxonomies. |
| Same change cadence | **No** — governed separately. |

**Ruling (proposed): KEEP PARALLEL** (EOS-005). The code itself documents the adaptation; sharing
would re-couple what EOS-005 deliberately separated.

## F-050 — NOT a shared-ownership question

**F-050 is a defect, not a duplication judgement**, and REX-D3 rules on it only to **decouple** it:
the WikiStore's catch-inside-the-loop (`createFilesystemWikiStore.ts:111-133`, which must defensively
re-throw its own `WikiStoreError`) is a **hazard the ReviewStore does not have** — the ReviewStore
factored out `realpathIfExists` (`:88`). **Fixed by bringing the WikiStore to the ReviewStore's
cleaner pattern, regardless of the F-049 ruling.** This is REX-401's, and it is **not held hostage to
the keep-parallel decision.**

---

# Decision — ruled by the reviewer (AJ), M4 Planning Review, 2026-07-17

| Item | Ruling | Reviewer's reasoning |
|---|---|---|
| **F-049** | **Keep parallel — do not merge.** | *"These guards protect different contracts. Different canonicalisation rules imply different security boundaries. Similarity of implementation alone is insufficient reason to consolidate."* |
| **F-050** | **Fix independently.** | *"A correctness issue. It should be resolved regardless of the outcome of any duplication analysis."* |
| **F-051** | **Consolidate — within the context-builder boundary only.** | *"Five identical implementations within the same bounded context are genuine duplication. Keeping the consolidation inside the context-builder boundary respects EOS-005. Do not extend it outside that boundary."* |
| **F-052** | **Keep — intentional divergence.** | *"The code itself documents adaptation rather than copying. That satisfies Repository Excellence's standard for intentional duplication."* |

**The reviewer's standing guidance for implementation:** *"Preserving observed behaviour is a
stronger success criterion than reducing line count. Repository Excellence should continue preferring
intentional duplication over incorrect abstraction."*

---

# Validation

- **F-050 and any consolidation are gated behind characterization tests** written **first** and proven
  green on current behaviour (REX-401), so a refactor that changes behaviour is caught.
- The path guards' **security behaviour is unchanged** — the existing store suites (symlink-escape,
  NUL, `..`, canonical-rejection) stay green; for F-050, the WikiStore's guard is proven to still
  reject every escape it rejected before.
- `immutable.ts` **untouched** (EOS-005), verified by `git diff --name-only`.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 0.1 | **PROPOSED** at M4 Planning. Four criteria applied per item, measured against `HEAD`. **F-049 keep parallel** (three roots, opposite canonicality — fails responsibility + lifecycle); **F-051 consolidate the 5 context-builder copies** (all four hold in-module; `immutable.ts` excluded by EOS-005); **F-052 keep parallel** (the code says "adapted", EOS-005). **F-050 decoupled** as a defect, fixed regardless. |
| 2026-07-17 | 1.0 | ✅ **ACCEPTED** at the M4 Planning Review (reviewer: AJ). All four rulings as proposed: **F-049 keep · F-050 fix independently · F-051 consolidate (context-builder boundary only) · F-052 keep**. Reviewer emphasised behavioural preservation over line-count reduction, and intentional duplication over incorrect abstraction. |

---

> **Engineering Rule**
>
> Duplication is evidence, not a verdict. Test it against the four criteria; "keep parallel" is a
> result. And never hold a defect fix hostage to a consolidation judgement.
