# ARCH-001 — AJ-OS Platform Architecture

**Architecture ID:** ARCH-001\
**Version:** 1.2\
**Status:** Draft\
**Owner:** AJ-OS

> **Amended by ADR-002 (2026-07-11).** The Knowledge Layer is detailed in
> **[ARCH-002 — Knowledge Platform Architecture](ARCH-002-Knowledge-Platform-Architecture.md)**.
> Per ADR-002, the Generated Wiki is **persistent but recoverable** (not
> disposable), AJ-OS is its sole producer while it is hosted in the Handbook
> vault, the generator is source/destination-agnostic, and version control
> belongs to orchestration.

---

# 1. Purpose

This document is the **architectural map** of AJ-OS: its major subsystems, how
they interact, and the invariants that constrain their design.

It describes **how** AJ-OS is built. *What* AJ-OS is and *why* it exists are
defined in **[docs/VISION.md](../VISION.md)** and are assumed here. This document
does not restate the vision; it shows the architecture that realizes it.

---

# 2. Architectural invariants

These are the constraints every subsystem is designed against. They are
architectural (they shape structure and dependencies), not philosophy:

- **The Handbook is the single source of truth.** Everything downstream is
  derived from it.
- **Derived artifacts are recomputable.** Most are disposable; the Generated
  Wiki is **persistent but recoverable** (ADR-002).
- **Location and production ownership are separable.** The wiki is *hosted* in
  the Handbook vault but *produced* solely by AJ-OS.
- **The knowledge engine is source- and destination-agnostic.** Sources and
  targets are pluggable providers; neither is baked into the core.
- **Version control belongs to orchestration**, never to knowledge components —
  the generator and store never commit.
- **Components are model-agnostic.** No subsystem depends on a specific model.
- **Small agents compose into workflows.** Behavior is built from focused,
  replaceable units, not monoliths.
- **Standards govern; specifications implement.** AJS defines the rules, SPEC
  defines the components, ADRs record the decisions.

---

# 3. Platform layers

AJ-OS separates concerns into five layers. Each depends only on the layers above
it.

| Layer | Contains | Defined by |
| --- | --- | --- |
| **Governance** | Platform rules and standards | AJS ([docs/standards/](../standards/)) |
| **Design** | Component and workflow blueprints | SPEC ([docs/specifications/](../specifications/)) |
| **Execution** | Agents and workflows | SPEC-001/002/003/004/005 |
| **Knowledge** | Handbook (canonical) and Generated Wiki | ARCH-002, ADR-002 |
| **Development** | Projects and source code | — |

---

# 4. Subsystems and how they interact

AJ-OS is a platform of subsystems that together turn the loop defined in
[VISION](../VISION.md): work becomes durable knowledge, knowledge becomes
maintained context, context improves future work. The architecture that realizes
that loop:

```text
Project Work
      ↓
Project Documentation
      ↓
End-of-Session Workflow ─────────── owns git commits (SPEC-003)
      ↓
Candidate Knowledge
      ↓
Knowledge Review ────────────────── human governance (SPEC-004)
      ↓
Handbook (canonical; sources: foundation/ + library/)
      ↓
Source Connector ────────────────── normalize sources (SPEC-006)
      ↓
Wiki Generator ──────────────────── compile → resolve identity → render → merge (SPEC-005)
      ↓
Wiki Store ──────────────────────── persistence, no git (SPEC-007)
      ↓
Generated Wiki (persistent; hosted in Handbook vault)
      ↓
Context Builder ─────────────────── Collection → Selection → Assembly (SPEC-002)
      ↓
Context Package (immutable)
      ↓
Consumers (Coding Agent, Knowledge Assistant, …)
```

Each subsystem owns one responsibility and points to its specification for
behavior and contracts:

- **Handbook** — canonical, human-governed knowledge. External to this repo
  (a Handbook vault); AJ-OS produces into it but does not contain it.
- **Knowledge Platform** — the sources → wiki engine: **Source Connector**
  (SPEC-006), **Wiki Generator** (SPEC-005), **Wiki Store** (SPEC-007). Its
  internal architecture — compilation, identity resolution (ADR-005/006),
  rendering, and merge — is specified in
  **[ARCH-002](ARCH-002-Knowledge-Platform-Architecture.md)**.
- **Generated Wiki** — the AI-optimized representation of Handbook knowledge;
  persistent but recoverable (ADR-002); produced solely by AJ-OS.
- **Context Builder** — assembles a focused, immutable **Context Package** from
  available knowledge (SPEC-002).
- **Workflows** — orchestration that drives the subsystems and owns side effects:
  **Project Kickoff** (SPEC-001), **End-of-Session** (SPEC-003, owns commits),
  **Knowledge Review** (SPEC-004).
- **Consumers** — anything that reads a Context Package or the wiki (the Coding
  Agent, and the Knowledge Assistant product).

---

# 5. Platform contracts

Subsystems interact through **immutable contracts** rather than shared internals,
which is what keeps them replaceable. The core contracts — Context Builder
Configuration, Context Package, Knowledge Request, Knowledge Provider, Knowledge
Item, Provider Registry, and Collection Result — are defined by **SPEC-002** and
governed by **[AJS-002 — Context Assembly](../standards/AJS-002-Context-Assembly-Standard.md)**.
New platform behavior is built on top of these contracts, not by redefining them.

---

# 6. Technology and model boundaries

The architecture separates responsibility from implementation so that tools can
change without changing the design:

- **Orchestration** (scheduling, side effects) is an outer concern — currently
  n8n over the HTTP interface.
- **Version history** belongs to Git, invoked by orchestration.
- **Models** are consumed behind ports; no subsystem is coupled to a specific
  model or vendor.
- **Sources and targets** (Notion, GitHub, a filesystem, …) are pluggable
  providers, never the center of the platform.

Any of these implementations may be swapped without altering the architecture.

---

# 7. Relationship to other documents

- **[VISION](../VISION.md)** — what AJ-OS is and why (assumed by this document).
- **[ARCH-002](ARCH-002-Knowledge-Platform-Architecture.md)** — the Knowledge
  Layer in detail (ingestion → wiki → retrieval → context).
- **[ADRs](adr/)** — the *why* behind significant architectural decisions.
- **[AJS standards](../standards/)** — the rules that govern the platform.
- **[SPEC specifications](../specifications/)** — how each subsystem is built.
- **[ROADMAP](../../ROADMAP.md)** — what is built, in progress, and planned.

ARCH-001 is the architectural overview; when it and a SPEC disagree on a
component's behavior, the SPEC is authoritative for that component.
