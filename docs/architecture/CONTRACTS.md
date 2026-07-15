# AJ-OS — Inter-Specification Contracts

> **Status:** Living reference · **Level:** Architecture (cross-specification)
>
> This document maps the **boundaries between AJ-OS subsystems** — what each
> specification *produces* and what the next one *consumes*. It is descriptive:
> it records boundaries that [ARCH-001](ARCH-001-AJ-OS-Platform-Architecture.md)'s
> loop and the individual SPECs already imply, so they can be reasoned about in
> one place. It defines **architectural boundaries, not implementation details** —
> field-level schemas live with the producing specification's code.
>
> It does not supersede ARCH-001/ARCH-002 or any ADR. Where this document and a
> SPEC disagree on a component's behavior, the SPEC is authoritative.

---

## Why this document exists

AJ-OS is a pipeline of independently specified systems. Each transforms an input
contract into an output contract and hands off to the next. As the pipeline
grows, the **seams between specifications** — not the internals — are what keep
the platform replaceable. This document is the single place those seams are
named, so a change to one system's output is visibly a change to another
system's input.

**Ownership convention (the rule this document assumes).** *The producing
specification owns its output contracts.* Consumers import them; they never
redefine them. This matches the existing precedent — `SourceRecord` is owned by
SPEC-006 (producer) and consumed by SPEC-005; the `ContextPackage` is owned by
SPEC-002 and consumed by every reader. The dependency always points from
consumer to producer, never the reverse (see ARCH-002 §5, and the SPEC-002
retrospective's dependency-direction observation).

---

## The pipeline and its contracts

```text
Project Work
    │
    │  (git changes, docs, session notes, optional Context Package)
    ▼
┌─────────────────────────────────────────────────────────────┐
│ SPEC-003 — End-of-Session Workflow            (orchestration)│
│   produces ▶ CandidateKnowledge[]   ← canonical output        │
│   produces ▶ SessionReport          ← execution log           │
│   produces ▶ ReviewPackage          ← human-readable projection│
└─────────────────────────────────────────────────────────────┘
    │  written to  <handbook-vault>/knowledge-review/pending/<session-id>/
    ▼
┌─────────────────────────────────────────────────────────────┐
│ SPEC-004 — Knowledge Review Workflow          (human gate)   │
│   consumes ◀ CandidateKnowledge[] (+ Session, ReviewPackage) │
│   produces ▶ Review decisions (approve/edit/merge/reject/defer)│
│   produces ▶ Approved Handbook updates · Publication queue    │
└─────────────────────────────────────────────────────────────┘
    │  approved knowledge is written into
    ▼
Handbook (canonical; foundation/ + library/)      ← human-owned
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ SPEC-006 Source Connector → SPEC-005 Wiki Generator →         │
│ SPEC-007 Wiki Store                            (knowledge engine)│
│   consumes ◀ Handbook sources                                 │
│   produces ▶ SourceRecord → Generated Wiki                    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Generated Wiki (persistent; hosted in vault)
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ SPEC-002 — Context Builder                                    │
│   consumes ◀ Wiki + Handbook + sources                        │
│   produces ▶ ContextPackage (immutable)                       │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Consumers (Coding Agent, Knowledge Assistant, and — full circle —
the optional Context Package input to SPEC-003)
```

---

## Contract register

| Contract | Owned by (producer) | Consumed by | Kind | Notes |
| --- | --- | --- | --- | --- |
| **SessionContext** | SPEC-003 | SPEC-003 (input) | Input request | Project, repository, branch (required); commit, notes, task id, Context Package ref (optional). SPEC-003 §7. |
| **Session** | SPEC-003 | SPEC-003, SPEC-004 | Identity + metadata | Stable opaque `id`; `startedAt`/`endedAt`/`trigger`/`gitState`/`branch` are metadata. Identity is independent of trigger source. (EOS-D3) |
| **CandidateKnowledge** | **SPEC-003** | **SPEC-004** | **Canonical boundary output** | The durable unit of proposed knowledge. Governance state = `candidate` (AJS-006). The primary SPEC-003→004 handoff. (EOS-D1, EOS-D4) |
| **ReviewPackage** | SPEC-003 | Human reviewer (SPEC-004) | Projection (derived) | Human-readable markdown rendered *from* `CandidateKnowledge[]` + `Session`. Non-canonical; never parsed as data. (EOS-D4) |
| **SessionReport** | SPEC-003 | Orchestration / audit | Execution log | Observability record: trigger, duration, files analyzed, candidates produced, errors, result. SPEC-003 §16. |
| **Review decisions / Approval queue / Publication queue** | SPEC-004 | Handbook maintainer, SPEC-005 | Governance output | Out of scope for SPEC-003; listed for completeness. SPEC-004 §8. |
| **SourceRecord** | SPEC-006 | SPEC-005 | Normalized source | Existing, implemented. SPEC-006 §6. |
| **ContextPackage** | SPEC-002 | Coding agents, SPEC-003 (optional input) | Immutable package | Existing, implemented (Platform v2.0.0). AJS-002 Appendix B. |

---

## Boundary invariants

These hold across every seam above:

1. **Producer owns the contract.** Consumers import; they never redefine. Change
   a contract only in its producing specification.
2. **Contracts are immutable and provenance-preserving.** Every artifact traces
   back to its source (AJS-006 §Traceability).
3. **Canonical vs. projection.** Structured data is canonical; any markdown
   rendering is a derived projection of it, never the source of truth. (Mirrors
   ADR-002's wiki model; applied to SPEC-003 by EOS-D4.)
4. **Automation proposes; humans approve.** No SPEC-003 output is canonical
   knowledge. The `candidate` → `approved` transition is SPEC-004's human gate
   (AJS-005 §6, AJS-006 §3).
5. **Version control belongs to orchestration**, never to an engine (ADR-002 §4,
   AJS-005 §7).
6. **Non-canonical write locations.** SPEC-003 writes only to the review area
   (`knowledge-review/pending/`), never to canonical `foundation/`, `library/`,
   or generator-owned `wiki/`.

---

## Related documents

- [ARCH-001 — AJ-OS Platform Architecture](ARCH-001-AJ-OS-Platform-Architecture.md) (§4 the loop, §5 platform contracts)
- [ARCH-002 — Knowledge Platform Architecture](ARCH-002-Knowledge-Platform-Architecture.md)
- [ADR-002 — Wiki Ownership and Persistence](adr/ADR-002-Wiki-Ownership-and-Persistence.md)
- Standards: [AJS-004](../standards/AJS-004-AJ-OS-Agent-Specification-Standard.md), [AJS-005](../standards/AJS-005-Workflow-Orchestration-Standard.md), [AJS-006](../standards/AJS-006-Knowledge-Governance-Standard.md)
- Specifications: [SPEC-002](../specifications/SPEC-002-Context-Builder-Agent.md), [SPEC-003](../specifications/SPEC-003-End-of-Session-Workflow.md), [SPEC-004](../specifications/SPEC-004-Knowledge-Review-Workflow.md), [SPEC-005](../specifications/SPEC-005-Wiki-Generator-Agent.md), [SPEC-006](../specifications/SPEC-006-Source-Connector.md), [SPEC-007](../specifications/SPEC-007-Wiki-Store.md)

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-15 | 1.0 | Created during SPEC-003 planning; establishes the inter-spec contract register and boundary invariants. Introduced by decision EOS-D5. |
