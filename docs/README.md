# AJ-OS Documentation

The map of AJ-OS's active documentation. Each document has **one
responsibility**; each concept has **one canonical home**. Everything else links
to it rather than restating it.

Active documentation follows one hierarchy:

```text
VISION  →  Architecture (ARCH)  →  Specifications (SPEC)  →  Implementation
```

Standards (**AJS**) govern the platform across all layers; decision records
(**ADR**) capture *why* significant choices were made.

---

# Start here

```text
../README.md      → VISION.md      → ARCH-001 → ARCH-002 → the relevant SPECs
(what & how to run)  (what it is)     (how it is structured)   (how it is built)
```

Contributors: after VISION and ARCH, read the [standards](standards/) and the
[Knowledge Assistant](../implementation/products/knowledge-assistant/) as a
worked example. Full contribution guide: [CONTRIBUTING.md](../CONTRIBUTING.md).

---

# Map

```text
docs/
├── VISION.md         What AJ-OS is — the source of truth
├── architecture/     ARCH — how the system is structured (+ ADRs)
├── standards/        AJS — the rules that govern the platform
├── specifications/   SPEC — how each subsystem is built (+ products/)
├── guides/           How to install, configure, and develop
├── api/              The Handbook agent and HTTP interface
├── project/          Project governance (versioning & releases)
└── archive/          Superseded implementations (v1) — frozen
```

---

# Architecture (ARCH)

| Document | Purpose |
| --- | --- |
| [ARCH-001](architecture/ARCH-001-AJ-OS-Platform-Architecture.md) | Platform architecture map, principles, and contracts |
| [ARCH-002](architecture/ARCH-002-Knowledge-Platform-Architecture.md) | The knowledge engine: sources → wiki → retrieval → context |
| [architecture/adr/](architecture/adr/) | Architecture Decision Records (ADR-001–006) — the *why* |

# Standards (AJS)

| Document | Governs |
| --- | --- |
| [AJS-001](standards/AJS-001-Daily-Workflow-Standard.md) | The daily operating cadence of a work session |
| [AJS-002](standards/AJS-002-Context-Assembly-Standard.md) | Context assembly |
| [AJS-003](standards/AJS-003-Knowledge-Standard.md) | What knowledge exists, where it lives, who owns it |
| [AJS-004](standards/AJS-004-AJ-OS-Agent-Specification-Standard.md) | How agents are specified |
| [AJS-005](standards/AJS-005-Workflow-Orchestration-Standard.md) | How agents compose into workflows |
| [AJS-006](standards/AJS-006-Knowledge-Governance-Standard.md) | Knowledge lifecycle and governance |
| [AJS-007](standards/AJS-007-Engineering-Lifecycle-Standard.md) | The engineering lifecycle |

# Specifications (SPEC)

| Document | Subsystem |
| --- | --- |
| [SPEC-000](specifications/SPEC-000-Specification-Writing-Standard.md) | How to write specifications |
| [SPEC-001](specifications/SPEC-001-Project-Kickoff-Workflow.md) | Project Kickoff |
| [SPEC-002](specifications/SPEC-002-Context-Builder-Agent.md) | Context Builder |
| [SPEC-003](specifications/SPEC-003-End-of-Session-Workflow.md) | End-of-Session (captures candidate knowledge; **never commits** — see below) |
| [SPEC-004](specifications/SPEC-004-Knowledge-Review-Workflow.md) | Knowledge Review |
| [SPEC-005](specifications/SPEC-005-Wiki-Generator-Agent.md) | Wiki Generator |
| [SPEC-006](specifications/SPEC-006-Source-Connector.md) | Source Connector |
| [SPEC-007](specifications/SPEC-007-Wiki-Store.md) | Wiki Store |

Product specifications live under [specifications/products/](specifications/products/).

> **Nothing in AJ-OS commits, and that is deliberate.** **ADR-002** holds that *version control
> belongs to orchestration* — so the Wiki Generator never commits, and the End-of-Session Workflow
> never commits either. **The orchestration layer that would own it does not exist yet, so no
> component performs it.** SPEC-003 v1 is capture-only: it writes candidates to a non-canonical
> review area and stops. This is a **deliberate gap**, recorded rather than filled — see ADR-002 and
> AJS-005 §7.

# Guides · API · Governance

| Document | Purpose |
| --- | --- |
| [guides/](guides/) | Installation, configuration, development |
| [api/agent.md](api/agent.md) | The Handbook agent and inbox-capture endpoints |
| [project/versioning-and-releases.md](project/versioning-and-releases.md) | How the platform and products are versioned |

n8n orchestration (chat, Telegram) is documented in
[../infrastructure/n8n/README.md](../infrastructure/n8n/README.md).

---

# History

The original AJ-OS was a code-first Notion **business** operating system (v1),
now superseded and preserved, frozen, under
[archive/v1/](archive/v1/README.md). See [archive/README.md](archive/README.md)
for what the archive is and how it relates to AJ-OS today.
