# REX-D5 — Frozen-Surface Dead Code: Remove, Implement, or Document (Per Item)

> **Status:** ✅ **ACCEPTED** — ruled by the reviewer (AJ) at the **M3-A Planning Review**, 2026-07-17. Planning Freeze declared.
>
> **Type:** Package decision ruled at M3-A Planning. Each *"remove"* ruling it produces is a
> **frozen-surface change and therefore an FPCP** (AJS-007 §7.2) that must be **ruled before** the
> dependent change in REX-301 begins.
>
> **Implementation Package:** REX — Repository Excellence Review · **Milestone:** M3-A
>
> **Related Task(s):** **REX-301** (executes only the dispositions ruled here) · **Findings:** F-041, F-042, F-043

---

# Purpose

Three exported symbols on the **frozen** public surface are declared but inert. The scope guard is
explicit that **implementing** any of them is platform evolution and **defers**. That leaves two
honest dispositions per item — **remove via FPCP**, or **document as deliberately reserved** — and
the choice is the reviewer's, not the author's.

This decision exists so the choice is made **once, per item, with evidence, before REX-301 changes
anything** — never settled by invention at implementation time.

---

# The governing constraint

**Duplication is evidence, not a verdict** has a sibling here: **an unused export is evidence, not a
verdict.** An inert symbol may be dead weight, or it may be ratified scaffolding staged ahead of its
phase. The two look identical in a `grep`. Only the decision record behind the symbol distinguishes
them — which is exactly why this is the reviewer's call and why *"only the reviewer knows"* appears
against F-042 in the inventory.

Two rulings must never be coupled:

1. *Is this symbol dead, or staged?* — **judgement**, reviewer-owned, this decision.
2. *Does the barrel's doc-comment lie about it?* — a **truth defect**, fixed on its own merits in
   REX-302 regardless of the ruling here (F-039).

---

# The three items — evidence and options

All evidence verified against `HEAD` (`a9f8d48`), **not** the inventory's `9bd051d`, because M2's
formatter moved every line number. Current coordinates are recorded so REX-301 does not transcribe
stale ones.

## F-041 — `ContextBuilderConfig` requires three fields nothing reads

**Frozen by:** [CB-002 — Configuration Contract](../../../phase-2-core-platform/spec-002-context-builder/decisions/CB-002-configuration-contract.md).
The schema is `.strict()` with every field required — *"explicit, with no hidden defaults"*
(`src/context-builder/config/schema.ts:3,36`).

**Evidence (re-measured):** `profile`, `explainability`, `outputFormat` are validated and required,
and **no code outside the schema/types reads any of them** —
`grep -rn '\.profile\b|\.explainability\b|\.outputFormat\b' src/context-builder/ | grep -v schema|types|test`
→ **empty**. `assembleContext.ts:130-131` emits hardcoded placeholders
(`explainability: { summary: "", entries: [] }`, `summary: ""`) with a comment stating assembly
*"neither computes explainability nor renders a summary."* `outputFormat: "json"` therefore produces
output identical to `"markdown"`.

| Option | Consequence |
|---|---|
| **Remove (FPCP)** | Simplifies the contract to what the code honours. **But** it changes a frozen, `.strict()` contract: any existing `aj.config.json` supplying these keys would now fail validation. That is a behavioural change to config acceptance — arguably itself platform evolution. |
| **Document as reserved** | The contract keeps its shape; a doc-comment records that the three fields are **accepted and validated but not yet consumed**, naming the future work (explainability rendering; `outputFormat` dispatch) as deferred. Zero behavioural change. |
| ~~Implement~~ | **Excluded by the scope guard** — rendering explainability and honouring `outputFormat` is new behaviour. Defer to a SPEC. |

**Author recommendation:** **document as reserved.** Removing frozen, strict-validated contract
fields changes what a user's config may contain — closer to platform evolution than to hygiene — and
the inertness is not a defect in what the platform *does*, only in what its contract *promises*.
Recording the gap truthfully is squarely in scope; changing the contract is the reviewer's to weigh.

## F-042 — two identity resolvers exported, fully tested, wired to nothing

**Frozen by:** [ADR-006 — Identity Learning](../../../../docs/architecture/adr/ADR-006-Identity-Learning.md), **Accepted 2026-07-12**.

**Evidence (re-measured):** `createSemanticIdentityResolver` and `createAliasAwareResolver` have
**no consumer outside `src/knowledge/identity/`** — the only composition root wires
`createSlugIdentityResolver` (`createKnowledgePipeline.ts:95`, import `:25`). Their only consumers are
their own two suites, `tests/knowledge/identity/{semantic-resolver,alias-resolver}.test.ts`.

**The decisive evidence the inventory flagged but could not resolve:** ADR-006 §Rollout names
**"the alias-aware resolver decorator"** as a **Phase 1** deliverable. These are **not dead code — they
are Accepted-ADR Phase 1 implementation staged ahead of the composition wiring.** The finding's own
note — *"May be staged for ADR-006 Identity Learning; only the reviewer knows"* — is answered by the
ADR itself.

| Option | Consequence |
|---|---|
| **Remove (FPCP)** | Deletes Accepted-ADR Phase 1 code **and two passing test suites**, to be re-authored when Phase 1 wires up. Net-negative unless ADR-006 is being abandoned. |
| **Document as staged** | A doc-comment (and the barrel) records these as **ADR-006 Phase 1, implemented and tested, not yet wired**. Preserves the work and its intent. |
| ~~Implement~~ | Wiring the decorator into the composition root is **ADR-006 Phase 1 delivery — a SPEC/ADR execution, not REX's.** Defer. |

**Author recommendation:** **document as staged**, citing ADR-006 Phase 1. This is the clearest of
the three: removing ratified, tested scaffolding to satisfy a "no unused export" rule would be the
scope guard failing in reverse.

## F-043 — `GenerationReport.lint` is a declared-but-unimplemented capability

**Frozen by:** [SPEC-005 — Wiki Generator Agent](../../../../docs/specifications/SPEC-005-Wiki-Generator-Agent.md); `GenerationReport` is its public report type.

**Evidence (re-measured):** `createWikiGenerator.ts:171-172` defines `async function noLint(): Promise<LintReport> { return { findings: [] }; }`; `:466` returns a hardcoded `lint: { findings: [] }`; `:471` returns `{ run, lint: noLint }`. The public `GenerationReport` advertises a `lint` capability that always reports nothing.

| Option | Consequence |
|---|---|
| **Remove (FPCP)** | Drops `lint` from `GenerationReport` and the `noLint` stub. Honest, but forecloses the capability the type was designed to carry. |
| **Document as declared** | A doc-comment records `lint` as a **declared SPEC-005 capability, not yet implemented**, so the always-empty report is understood rather than mistaken for "clean." |
| ~~Implement~~ | Writing a real linter is a **feature**. Defer. |

**Author recommendation:** **document as declared** (lightest touch), unless the reviewer judges the
always-empty capability more misleading than a smaller report type — in which case **remove (FPCP)**.
Genuinely balanced; recorded as such.

---

# Decision — ruled by the reviewer (AJ), M3-A Planning Review, 2026-07-17

| Item | Ruling | Reviewer's reasoning |
|---|---|---|
| **F-041** | **Document as reserved. Do not remove.** | *"Insufficient evidence that removal would improve the repository, and sufficient evidence that the surface is intentionally reserved."* |
| **F-042** | **Document as ADR-006 Phase 1 staging. Do not remove.** | *"The Evidence Review demonstrates this is intentional architectural staging rather than abandoned implementation."* |
| **F-043** | **Document *if* repository evidence supports the declaration; otherwise raise an FPCP to remove it.** REX-301 **determines which** before any change. | *"Repository Excellence should preserve intentional contracts, not speculative ones."* |

**No frozen-surface change is authorised for F-041 or F-042** — both route to REX-302's truth pass as
doc-comments citing CB-002 and ADR-006 respectively. **F-043 is the only open question**, and it is a
question of evidence, not preference: REX-301 reads SPEC-005 to decide whether `GenerationReport.lint`
is an **intentional contract** (→ document) or **speculative** (→ FPCP to remove).

**An outcome of zero source modification is fully acceptable** — the reviewer, restating REX-D3: *"A
task that legitimately concludes 'the correct implementation is no code change' should be considered
just as successful as one that removes or rewrites source. The protected outcome — not the amount of
code changed — is the measure of completion."*

---

# Validation

- Each item's inertness re-verified against `HEAD` by the command in its row — **not** transcribed
  from the inventory's pre-formatter line numbers.
- For any **remove** ruling: the FPCP is recorded and ruled **before** REX-301 touches the file
  (§7.2), and the removal is shown to leave the build, typecheck, and full suite green.
- For any **document** ruling: the doc-comment cites the ratifying decision (CB-002 / ADR-006 /
  SPEC-005) and the symbol's status is left **behaviourally unchanged** — verified by the suite.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 0.1 | **PROPOSED** at M3-A Planning. Per-item evidence re-measured against `HEAD` (F-042 wiring at `:95` not `:101`; F-043 stub at `:171/:466` not `:173/:479`). Establishes that **F-042 is Accepted-ADR-006 Phase 1 staging, not dead code** — the evidence the inventory said only the reviewer held. Author recommendations recorded (document/document/document-or-remove); rulings reserved to the reviewer. |
| 2026-07-17 | 1.0 | ✅ **ACCEPTED** at the M3-A Planning Review (reviewer: AJ). **F-041 document as reserved; F-042 document as ADR-006 Phase 1 staging; F-043 document if evidence supports the declaration, else FPCP-remove — REX-301 determines which from SPEC-005.** No frozen-surface removal authorised for F-041/F-042. Reviewer affirmed a zero-source-change outcome is fully successful when it is the correct one — the protected outcome, not the code delta, measures completion. |

---

> **Engineering Rule**
>
> An unused export is evidence, not a verdict. Some scaffolding is staged, not dead — and the
> difference lives in a decision record, not in a `grep`.
