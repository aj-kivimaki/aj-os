# AJ-OS Documentation

Welcome to the AJ-OS documentation.

The documentation is organized into focused sections, each with a single
responsibility. Whether you want to use, understand, or contribute to
AJ-OS, the documents below provide a recommended path.

---

# Documentation Structure

```text
docs/
├── guides/          How to install, configure, and develop AJ-OS
├── standards/       AJS — what AJ-OS is and the rules that govern it
├── architecture/    ARCH — how the system is structured (+ ADRs)
├── specifications/  SPEC — how components are implemented
├── api/             REST API and agent services
├── modules/         Business capabilities (legacy v1)
└── adr/             Legacy v1 architecture decision records
```

Taxonomy:

- **AJS (Standards)** define **what** AJ-OS is and the governing rules.
  They change infrequently.
- **ARCH (Architecture)** describes **how** the system is structured
  internally.
- **SPEC (Specifications)** define **how** components are implemented.
  They evolve with the code.
- **ADR (Decision Records)** capture **why** significant decisions were
  made.

---

# Getting Started

1. `../README.md`
2. `guides/installation.md`
3. `guides/configuration.md`

---

# Guides

| Document                  | Purpose                         |
| ------------------------- | ------------------------------- |
| `guides/installation.md`  | Installation                    |
| `guides/configuration.md` | Configuration                   |
| `guides/development.md`   | Development workflow            |
| `guides/ai-workflow.md`   | AI-assisted engineering process |

---

# Standards (AJS)

| Document                                             | Purpose                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| `standards/AJS-001-AJ-OS-Developer-Operating-System.md` | The developer operating system            |
| `standards/AJS-002-Context-Assembly-Standard.md`     | How context is assembled                  |
| `standards/AJS-003-Knowledge-Standard.md`            | What knowledge exists, where it lives, who owns it |
| `standards/AJS-004-AJ-OS-Agent-Specification-Standard.md` | How agents are specified              |
| `standards/AJS-005-Workflow-Orchestration-Standard.md` | How agents compose into workflows       |
| `standards/AJS-006-Knowledge-Governance-Standard.md` | Knowledge lifecycle and governance        |
| `standards/AJS-007-Engineering-Lifecycle-Standard.md` | Engineering lifecycle                    |

---

# Architecture (ARCH)

| Document                                             | Purpose                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| `architecture/ARCH-001-AJ-OS-Platform-Architecture.md` | Platform architecture map               |
| `architecture/ARCH-002-Knowledge-Platform-Architecture.md` | The knowledge engine: sources → wiki → retrieval → context |

Architecture Decision Records:

| Document                                             | Decision                                  |
| ---------------------------------------------------- | ----------------------------------------- |
| `architecture/adr/ADR-001-Architecture-Freeze.md`   | Freeze the architecture before implementation |
| `architecture/adr/ADR-002-Wiki-Ownership-and-Persistence.md` | Wiki ownership, location, and persistence |
| `architecture/adr/ADR-003-Knowledge-Reconciliation-and-Page-Lifecycle.md` | Page lifecycle, staleness, and RECONCILE policy |

Recommended reading order: ARCH-001 → ARCH-002 → the relevant SPECs.

---

# Specifications (SPEC)

| Document                                             | Component                                 |
| ---------------------------------------------------- | ----------------------------------------- |
| `specifications/SPEC-000-Specification-Writing-Standard.md` | How to write specifications         |
| `specifications/SPEC-001-Project-Kickoff-Workflow.md` | Project kickoff workflow                 |
| `specifications/SPEC-002-Context-Builder-Agent.md`   | Context Builder                           |
| `specifications/SPEC-003-End-of-Session-Workflow.md` | End-of-Session workflow (owns commits)    |
| `specifications/SPEC-004-Knowledge-Review-Workflow.md` | Knowledge review (governs Handbook entry) |
| `specifications/SPEC-005-Wiki-Generator-Agent.md`    | Wiki Generator                            |
| `specifications/SPEC-006-Source-Connector.md`        | Source Connector (source-agnostic ingest) |
| `specifications/SPEC-007-Wiki-Store.md`              | Wiki Store (persistence, no git)          |

Product specifications live under `specifications/products/`.

---

# API & Agent

| Document              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `api/README.md`       | API overview and current status             |
| `api/architecture.md` | API architecture and layer responsibilities |
| `api/agent.md`        | Handbook AI agent and inbox-capture endpoints |
| `api/roadmap.md`      | Planned evolution of the API platform       |

n8n orchestration (chat, Telegram) is documented in
`../infrastructure/n8n/README.md`.

---

# Business Modules (legacy v1)

Business Modules describe capabilities managed by the legacy Notion-sync
platform: Projects, CRM, Portfolio, Production Music, Finance, Game Jams.
Each is documented independently under `modules/`. Legacy v1 architecture
notes live under `architecture/v1/` and `adr/001`–`adr/007`; their
migration is governed by ADR-001.

---

# Recommended Reading Paths

## Architecture Review

```text
ARCH-001 (platform map)
    ↓
ARCH-002 (knowledge engine)
    ↓
ADR-002 (wiki ownership & persistence)
    ↓
SPEC-005 / SPEC-006 / SPEC-007 (contracts)
```

## Contributors

```text
README → Development Guide → Standards (AJS) → Architecture (ARCH) → Specifications (SPEC) → ADRs
```

---

# Documentation Principles

- Every document has a single responsibility.
- Every concept has one canonical location.
- Documentation evolves together with the software.
- Architecture is documented before implementation.
- Significant architectural changes are recorded as new ADRs.
