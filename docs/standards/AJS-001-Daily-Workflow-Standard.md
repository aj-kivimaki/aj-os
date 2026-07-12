# AJS-001 — Daily Workflow Standard

**Standard ID:** AJS-001\
**Status:** Draft v2.0\
**Owner:** AJ-OS

---

## Purpose

Define the **operating cadence of a single AJ-OS work session** — how a person
works *with* AJ-OS from the user's perspective: what happens before work, during
work, and after work, and how each step interfaces with the automated system.

This standard is the **human counterpart** to the automated platform:

- **[VISION](../VISION.md)** defines the loop AJ-OS turns.
- **[ARCH-001](../architecture/ARCH-001-AJ-OS-Platform-Architecture.md)** defines the subsystems.
- The **SPECs** define the mechanisms.
- **AJS-001 defines how a human turns that loop in a normal work session.**

It describes the cadence, not the internals: it does not define *what* AJ-OS is,
*how* any subsystem works, or *how* any mechanism is implemented.

---

## Scope

**In scope:** the session cadence and the human's responsibilities within it.

**Out of scope** (owned elsewhere, referenced here, never restated):

- Identity and purpose → [VISION](../VISION.md).
- Subsystems and their internals → [ARCH-001](../architecture/ARCH-001-AJ-OS-Platform-Architecture.md) / [ARCH-002](../architecture/ARCH-002-Knowledge-Platform-Architecture.md).
- Context assembly, end-of-session, knowledge review *mechanisms* → SPEC-002 / SPEC-003 / SPEC-004.
- Knowledge classification and governance → [AJS-003](AJS-003-Knowledge-Standard.md) / [AJS-006](AJS-006-Knowledge-Governance-Standard.md).
- Milestone delivery across many sessions → [AJS-007](AJS-007-Engineering-Lifecycle-Standard.md). This standard governs the day-to-day cadence *within which* milestone work is carried out (see AJS-007 §11.2).

---

## Responsibilities, not tools

The cadence is described in terms of **responsibilities**, independent of any
model, vendor, or application — consistent with the model-agnostic definition of
an agent in [AJS-004](AJS-004-AJ-OS-Agent-Specification-Standard.md). No stage
names a specific tool; implementations may change without changing this cadence.

| Responsibility | Who leads | Defined / automated in |
| --- | --- | --- |
| **Planning** — objective, approach, success criteria | Human | this standard |
| **Context maintenance** — assembling and refreshing working context | AJ-OS assembles; human curates | SPEC-002 |
| **Implementation** — doing the work toward the objective | Human | — |
| **Review** — verifying the work; governing what becomes durable | Human | SPEC-004 |
| **Orchestration** — side effects: capture, commits, scheduling | AJ-OS (automated) | AJS-005, SPEC-003 |

---

## The session cadence

### 1. Before work — Prepare

- **Set one objective.** Small enough for a single session, with explicit success
  criteria.
- **Obtain the working context.** Request an assembled context package (SPEC-002)
  rather than gathering context by hand; review it and curate what is missing or
  wrong. The human decides the approach; AJ-OS provides the context.

### 2. During work — Execute

- **Stay on the one objective.** Defer unrelated work to its own session.
- **Keep context current.** Record decisions, rationale, and notes into project
  documentation as understanding changes, so the automated capture has accurate
  material to work from.
- **Verify.** Check the work against the success criteria before closing the
  session.

### 3. After work — Capture and hand off

- **Trigger End-of-Session.** The automated system (SPEC-003) collects the
  session's outputs and proposes *candidate* knowledge; orchestration owns the
  commit — knowledge components never commit (AJS-005).
- **Govern what becomes durable.** In Knowledge Review (SPEC-004) the human
  accepts, edits, or rejects candidates. **Nothing enters the Handbook
  automatically** — automation prepares, the human curates.
- **Let the system refresh.** Approved knowledge flows into the Handbook and the
  regenerated wiki, so the next session begins from better context.

---

## The human / automation interface

At every stage the division is the same:

> **The human sets intent and governs. AJ-OS maintains context and captures the
> work.**

The human is never responsible for remembering or re-assembling context by hand —
that is the system's job. The system is never responsible for deciding what is
true or what matters — that is the human's. This standard exists to keep that
division consistent from one session to the next.

---

## Cross-references

- [VISION](../VISION.md) — what AJ-OS is (the loop this cadence turns).
- [ARCH-001](../architecture/ARCH-001-AJ-OS-Platform-Architecture.md) — the subsystems.
- SPEC-002 — context assembly · SPEC-003 — end-of-session (owns commits) · SPEC-004 — knowledge review.
- [AJS-003](AJS-003-Knowledge-Standard.md) / [AJS-006](AJS-006-Knowledge-Governance-Standard.md) — knowledge classification and governance.
- [AJS-005](AJS-005-Workflow-Orchestration-Standard.md) — orchestration and side effects.
- [AJS-007](AJS-007-Engineering-Lifecycle-Standard.md) — milestone delivery (distinct from this daily cadence).
