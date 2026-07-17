# REX-D1 — Architectural Representation of the Agent Layer

> **Status:** **Accepted** — ruled by the reviewer (AJ) at the M1 Planning Review, 2026-07-17
>
> **Specification:** _None (REX)._ Subject: `src/agent/`, `src/handbook/`, `src/api/`, `src/server.ts`.
>
> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Task(s):** REX-106 (blocked on this decision) · M3-B (consumes the taxonomy) · M4 (treats the layer as first-class)

---

# Purpose

The agent layer is **live** and appears in **no architecture document**. Correcting that is REX's
stated objective — *"make the architecture accurately reflect what is actually supported today"* —
but the obvious correction (amend ARCH-001) is **above REX's authority**.

This decision records where the line falls, and why REX stops short of it.

---

# Context

**The layer is live, not legacy.** Verified 2026-07-17:

- Built **2026-07-06**, with locked decisions on record (Claude Sonnet 5, wiki-only reads).
- n8n **actively calls** `/agent/ask` and `/inbox/note`
  (`grep -ohE '"url".*' infrastructure/n8n/workflows/*.json`).
- `src/handbook/` **holds its locked decision** — `grep -rn "fastify\|@anthropic-ai" src/handbook/`
  returns **nothing**. It was deliberately built framework-agnostic so a future MCP transport can
  reuse it.
- It **survived** the v1→v2 transition (`16e66da`) deliberately rather than being archived then.

**And it is architecturally invisible.** It appears in no ARCH document, not in README's subsystem
table, and `CONTRIBUTING.md:31-38`'s "one rule" has no slot for it — nor for `src/knowledge/`,
`src/end-of-session/`, `src/ingestion/`, or `src/config/`. The rule *is* respected where it applies
(verified: nothing under `platform/`/`context-builder/` imports `products/`) — it simply describes
about a third of `src/`.

**The tension.** ARCH-001 is the natural home for a subsystem's architectural description. It is
frozen, and AJS-007 §3 places Architecture/ADR at the **top** of the authority order, above the AJS
layer and far above an implementation package. *"Architecture changes through its own
architectural-decision process, never through this standard."*

An earlier framing of this work called the layer a "legacy Fastify stack" and proposed archiving it.
**That framing was wrong and was withdrawn** — the evidence above contradicts every part of it. The
reviewer replaced it with a three-way lifetime taxonomy, recorded below. It is noted here because
the wrong framing nearly produced a decision to delete a live capability, and the correction came
from evidence rather than from review of the reasoning.

---

# Decision

**REX documents; REX does not amend architecture.**

1. **README and CONTRIBUTING accurately document the repository as it exists today.**
2. **The agent layer is represented using the agreed lifetime taxonomy** (below).
3. **If that representation exposes an architectural mismatch with ARCH-001, M1 produces a
   recommendation for a future ADR rather than authoring one.**
4. **No architecture document is amended in this milestone.**

The authority ordering stays explicit and stays intact:

```text
Repository review  →  recommendation
Architecture       →  ADR
```

## The lifetime taxonomy

The reviewer's classification, which REX applies rather than assumes:

| Category | Members | How it is documented |
|---|---|---|
| **Durable capability layer** | `src/handbook/`, `src/agent/` | **First-class subsystems.** Same documentation, review, and quality standards as the rest of the repository. **Not legacy.** `src/handbook/` is framework-agnostic by design and reusable by a future MCP transport. |
| **Temporary transport** | `src/api/`, `src/server.ts` | **The current transport implementation, not automatically legacy.** Supported until an MCP transport replaces it. **Not archived merely because replacement is expected.** |
| **Genuine duplication** | evaluated in M4 | Identified explicitly and addressed. **Shared names alone are not sufficient evidence of duplicate responsibility.** |

---

# Rationale

**REX has no authority to amend ARCH-001, and inventing one would defeat the review.** §3 is
unambiguous: *"An unresolved conflict is halted and reported, never settled by invention at a lower
layer."* A review whose finding is *"the repository does not follow its own rules"* cannot fix that
by not following them.

**Documenting what exists needs no ADR.** README and CONTRIBUTING describe the repository; ARCH-001
describes the architecture. Recording that `src/agent/` exists, is supported, and has an expected
lifetime is a statement of fact about the code — squarely inside the scope guard. Deciding that the
agent layer *is* a platform layer is a statement about what AJ-OS **is**, and that is an ADR.

**Expected lifetime is the load-bearing part.** Documenting `src/api/` as merely "existing" loses
exactly what a reader needs: whether to build on it. **Recording that something is expected to be
replaced is not the same as recording that it is deprecated**, and conflating them is what produced
the "legacy stack" error in the first place.

**The recommendation is the deliverable, not a consolation.** §3 defines upward feedback as *"a
proposal"* — the receiving layer accepts or rejects it through its own process. A recommendation
that ARCH-001 gain an agent-layer section is a **complete and correct output** of a repository
review, not a failure to finish the job.

---

# Alternatives Considered

## Option A — Amend ARCH-001 within REX

**Pros**
- Fixes the gap at its natural home in one step.
- No follow-up work.

**Cons**
- **Violates AJS-007 §3.** Architecture is the highest layer and changes only through an ADR.
- Would have REX self-certify an architectural change — the exact inversion §5.3 exists to prevent.
- Sets a precedent that a quality review may edit frozen architecture when the edit seems obvious.
  Every bad architectural edit seems obvious to its author.

## Option B — Author ADR-007 within REX

**Pros**
- Follows the correct *mechanism*.
- Closes the gap fully.

**Cons**
- **Right mechanism, wrong layer.** An ADR is an architecture-layer artifact; REX is a package.
- The scope guard defers anything that *"materially changes architecture."* An ADR is definitionally
  that.
- Precedent already exists for restraint: ADR-007 (producer-owned contracts) was **deliberately
  deferred** at SPEC-003 M1 by reviewer decision, with CONTRACTS.md ruled sufficient *"until more
  specifications emerge."*

## Option C — Leave it undocumented

**Pros**
- Zero risk of overreach.

**Cons**
- Abandons REX's stated objective.
- README and CONTRIBUTING stay actively wrong about the repository's shape — cheap to fix, and
  wrong for no reason.

## Selected Option — D: Document at README/CONTRIBUTING; recommend the ADR

The only option that closes the documentation gap **and** leaves the architectural question with the
layer that owns it. It is Option C's restraint with Option A's honesty.

---

# Consequences

## Positive

- The repository's documentation becomes accurate without any frozen artifact being touched.
- The authority ordering is demonstrated, not just asserted — REX is the first work in AJ-OS to hit
  the §3 ceiling and stop.
- The lifetime taxonomy gives M3-B a rule that covers **all** of `src/`, closing F-023.
- M4 inherits an unambiguous mandate: the agent layer is first-class and gets first-class tests.

## Trade-offs

- **The architectural gap remains open** at the end of REX. ARCH-001 still will not describe the
  agent layer; only README and CONTRIBUTING will. That is a real, accepted cost — the gap is
  *recorded* rather than *closed*.
- Two documents will describe the subsystem landscape at different altitudes, and they could drift.
  M1's assertion inventory is the mitigation.
- A future reader may ask why the obvious fix wasn't made. The recommendation, and this record,
  are the answer.

---

# Impact

## Affected Tasks

- **REX-106** — unblocked by this ruling; its shape is defined by it.
- **M3-B** — consumes the taxonomy for CONTRIBUTING's architecture rule and README's subsystem table.
- **M4** — treats `src/handbook/` and `src/agent/` as first-class (tests, comments), and `src/api/`
  as supported.

## Affected Components

- None. This decision changes no code.

## Documentation Requiring Updates

- `README.md` (subsystem table — M3-B), `CONTRIBUTING.md` (architecture rule — M3-B),
  `docs/README.md` + `ROADMAP.md` (REX-106).
- **`docs/architecture/ARCH-001-*.md` — deliberately NOT updated.** That is the decision.

---

# Validation

- `git diff --stat docs/architecture/` is **empty** at the M1 Freeze Review.
- No ADR is authored by REX.
- The agent layer is documented with its **expected lifetime**, not merely its existence.
- If a recommendation is produced, it is recorded as a recommendation and changes no higher-layer
  document.

---

# Future Review

**Yes — at the architecture layer, not here.**

The recommendation this milestone may produce is *input* to a future ADR decision. Whether ARCH-001
gains an agent-layer section is the reviewer's call **at the AJS/Architecture layer**, exercised
through the ADR process, on evidence.

Two natural triggers: the **MCP transport** landing (which changes the transport story and would
force the question anyway), or a **second consumer** of `src/handbook/` appearing — which would make
the capability layer's architectural status impossible to leave implicit.

Note the parallel: **ADR-007** was deferred on the same reasoning — *"sufficient until more
specifications emerge."* Both are open architectural questions being held, deliberately, until
evidence forces them. That is the pattern, and it is working.

---

# Related Documents

Architecture
- **ARCH-001 — AJ-OS Platform Architecture** — frozen; the document this decision declines to amend.

Standards
- **AJS-007** — §3 (authority order; *"halted and reported, never settled by invention at a lower
  layer"*; upward feedback as proposal), §5.3 (author does not self-certify), §7.2 (FPCP).

Implementation
- [REX-106](../tasks/REX-106.md) — the task this decision unblocks and bounds.
- [FINDINGS.md](../FINDINGS.md) — F-022 (the gap), F-023 (CONTRIBUTING's partial rule).
- [MILESTONES.md](../MILESTONES.md) — the governing scope guard.

---

# Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-17 | 1.0     | Decision created and **Accepted** — ruled by the reviewer (AJ) at the M1 Planning Review. Recommendation adopted as proposed. |

---

> **Engineering Rule**
>
> When the honest answer lives above your layer, recommend it. Do not write it.
>
> A review that finds "the repository does not follow its own rules" cannot fix that by not
> following them.
