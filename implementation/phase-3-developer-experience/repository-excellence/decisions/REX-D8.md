# REX-D8 — Extend the Public-Surface Manifest Beyond `end-of-session`?

> **Status:** ✅ **ACCEPTED — Option A** — ruled by the reviewer (AJ) at the **M3-A Planning Review**, 2026-07-17.
>
> **Type:** Package decision ruled at M3-A Planning. Adds test-only enforcement (no runtime
> behaviour) — below the FPCP threshold.
>
> **Implementation Package:** REX — Repository Excellence Review · **Milestone:** M3-A
>
> **Related Task(s):** **REX-303** (executes the ruling) · **Findings:** F-044

---

# Purpose

M3-A's Definition of Done requires *"every dead export removed or justified in writing."* **Nothing
in the repository can enforce that.** This decision rules whether M3-A's settled surface is
**machine-pinned** — the M2 ratchet applied to the public surface — or left as a reviewed assertion
that will decay.

---

# The evidence that makes this load-bearing, not optional

Measured against `HEAD` (`a9f8d48`):

- **No dead-export detector is installed** — `ls node_modules/.bin | grep -E 'knip|ts-prune|unimported'`
  → none.
- **`noUnusedLocals` cannot help.** It flags unused *locals*; an unused *export* is invisible to it
  by design (TypeScript assumes an external consumer may exist). Verified: the two orphaned identity
  resolvers (F-042) and the inert config fields (F-041) pass a clean `tsc` today.
- **Exactly one machine-check for a public surface exists in the whole repo:**
  `tests/end-of-session/foundation.test.ts` (EOS-007). It pins `end-of-session`'s operations manifest
  (`EXPECTED_OPERATIONS`, `:27-53`) and enforces barrel-only imports (`~:100`). **F-044 names this
  "the repo's best idea," used by exactly one module** — while AJS-007 §6.1 lists Public-Surface
  Validation as a **validated principle**.

**Consequence:** without extending this test, M3-A closes F-037/F-038/F-039 by review, and the next
PR can silently re-leak a symbol or re-add an `export *`. That is precisely the "policy stated,
enforcement zero" failure M2 was built to end — reappearing one milestone later on the surface M3-A
just cleaned.

---

# Options

| Option | What it buys | What it costs |
|---|---|---|
| **A — Extend to the modules M3-A settles** (recommended) | The surfaces M3-A actually changes (`context-builder`, and the `platform/*` + `products/*` barrels touched by F-037/F-039) become **non-regressible**. M3-A's own DoD gets a machine check. | One manifest test per settled module — modelled on `foundation.test.ts`, mechanical. |
| **B — Extend to all of `src/`** | Every module pinned. | **Scope creep.** Pinning modules M3-A never touched is a new work-set the closed inventory forbids; it also freezes surfaces before anyone has decided what they *should* be. |
| **C — Do not extend** | Zero test work. | M3-A's central property stays **asserted, not enforced.** Reintroduces the exact gap M2 closed. |

---

# Decision — ruled by the reviewer (AJ), M3-A Planning Review, 2026-07-17

**✅ Option A approved.** Extend surface enforcement only to the public surfaces M3-A actually
settles. The reviewer's reasoning:

> *"Option B extends beyond milestone scope. Option C leaves an identified repository gap
> intentionally open despite the repository now possessing the machinery to close it. Option A is
> therefore the proportional engineering solution."*

The surface is pinned **in the same milestone that decides it**, and no untouched module is frozen
prematurely.

**Scope-guard check (Option A):** extending a test adds **no runtime behaviour** and changes nothing
the platform *does* — it makes an existing, ratified validation principle cover more of the surface it
was written for. **In scope.** Pinning untouched modules (Option B) *would* be the guard's target —
recorded as post-REX, not actioned.

**REX-303 is the last M3-A task by construction:** a manifest can only pin a surface after REX-301
and REX-302 have settled it. Pinning first would encode the surface we are trying to change.

---

# Validation

- Each new manifest test is **proven able to fail**: add a stray `export` to the module, the test
  goes red; remove it, green. *A pin never seen red is not known to pin anything* — the M2 gate
  lesson.
- The manifests assert the surface **REX-302 deliberately chose**, cross-checked against the consumer
  inventory — never the surface that merely happens to exist at authoring time.
- Barrel-only-import enforcement (the second half of `foundation.test.ts`) extended with the same
  proof.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 0.1 | **PROPOSED** at M3-A Planning. Establishes by measurement that **no dead-export detector exists** and **`noUnusedLocals` structurally cannot cover exports**, so `foundation.test.ts` is the repo's only public-surface machine-check and M3-A's DoD is otherwise unenforceable. Recommends **Option A** — extend the manifest to the modules M3-A settles, making the milestone's own outcome non-regressible without freezing untouched surfaces. |
| 2026-07-17 | 1.0 | ✅ **ACCEPTED — Option A** at the M3-A Planning Review (reviewer: AJ): *"the proportional engineering solution — B extends beyond milestone scope, C leaves an identified gap open despite the machinery now existing to close it."* REX-303 extends the manifest to the surfaces REX-302 settles. |

---

> **Engineering Rule**
>
> A cleaned surface with no pin is a surface waiting to re-leak. Enforce the property in the milestone
> that establishes it, or it decays the next PR.
