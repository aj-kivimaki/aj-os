# REX-D4 — Test Helpers: Consolidate or Reaffirm Per-Suite Inlining

> **Status:** ✅ **ACCEPTED** — ruled by the reviewer (AJ) at the **M5 Planning Review**, 2026-07-17.
>
> **Type:** Package decision ruled at M5 Planning. Governs REX-503 (test-only; below the FPCP
> threshold).
>
> **Implementation Package:** REX — Repository Excellence Review · **Milestone:** M5
>
> **Related Task(s):** **REX-503** · **Findings:** F-064

---

# Purpose

Several test helpers are duplicated across suites — but the repository has a **documented, deliberate
convention** of per-suite inlining. This decision applies the REX-D3 shared-ownership criteria to test
helpers so consolidation happens only where it is genuinely warranted, and **reaffirming per-suite
inlining is a valid recorded result**, exactly as "keep parallel" was for production code.

---

# The existing convention (measured, `HEAD`)

`tests/end-of-session/support.ts` states it explicitly:

> *"Intentionally minimal — a single cross-cutting inspector, not a factory library. Per the module's
> test convention, each suite keeps its own inline `valid*` fixtures; only the deep-immutability check
> … is consolidated here."*

So the repository already distinguishes **contract fixtures** (kept per-suite, deliberately) from
**cross-cutting inspectors** (shared). REX-D4 extends that distinction to the F-064 helpers.

# The duplicated helpers (measured)

| Helper | Suites | Kind |
|---|---|---|
| `stubGenerator` | 4 | infrastructure stub |
| `makeProvider` | 3 | infrastructure stub |
| `stubGitPort` | 2 | infrastructure stub |
| `candidate`, `item` | 3 each | **contract fixtures** (data builders) |

---

# The criteria (REX-D3, applied to helpers)

A duplicated helper qualifies for consolidation **only if all four hold**: same responsibility · same
lifecycle · same ownership · same change cadence. The reframing for tests:

- **Contract fixtures** (`candidate`, `item`, `valid*`) usually **fail** the criteria — each suite
  tunes its fixture to the contract under test, and coupling them makes one suite's change ripple into
  another's. The `support.ts` convention already ratified keeping these inline.
- **Infrastructure stubs** (`stubGenerator`, `makeProvider`, `stubGitPort`) usually **pass** when they
  are byte-identical and stub the *same* collaborator the same way — they answer one question ("give me
  a no-op X") across suites.

---

# Decision — deferred to the M5 Planning Review

Proposed, per item, to be confirmed after REX-503 measures whether each stub is genuinely identical:

- **Consolidate** the infrastructure stubs that are byte-identical and stub the same collaborator
  (`stubGenerator`, `makeProvider`, `stubGitPort`) into a shared support module — **only where the
  criteria all hold**.
- **Reaffirm per-suite inlining** for the contract fixtures (`candidate`, `item`), recorded as a result
  citing the `support.ts` convention — not a deferral.

**A "keep inline" outcome for any helper is a valid result.** If a stub turns out to differ per suite,
it stays inline and the difference is the reason.

---

# Validation

- Each consolidation is proven behaviour-neutral: the suites that adopt the shared stub stay green,
  and the stub is confirmed byte-identical to the copies it replaces **before** the merge.
- No contract fixture is coupled across suites (the `support.ts` convention holds).
- Full suite green; test count does not fall; no `.skip`/`.only` introduced.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 0.1 | **PROPOSED** at M5 Planning. Applies the REX-D3 criteria to test helpers, using the documented `support.ts` convention as the precedent: **consolidate byte-identical cross-cutting infrastructure stubs; reaffirm per-suite contract fixtures as a recorded result.** Per-item consolidation confirmed only after REX-503 verifies each stub is genuinely identical. |
| 2026-07-17 | 1.0 | ✅ **ACCEPTED** at the M5 Planning Review (reviewer: AJ): *"Consolidate genuinely identical cross-cutting helpers; preserve suite-specific fixtures where they communicate distinct behavioural contracts. Uniformity is not the objective; reducing duplicated maintenance responsibility is. The `support.ts` convention remains the governing boundary."* |

---

> **Engineering Rule**
>
> A shared stub is worth it only when every suite wants the *same* stub. A per-suite fixture that each
> test tunes is not duplication — it is the test doing its job.
