# AJ-OS Documentation

Welcome to the AJ-OS documentation.

The documentation is organized into focused sections, each with a single responsibility.

Whether you want to use, understand or contribute to AJ-OS, the documents below provide a recommended path.

---

# Documentation Structure

```text
docs/

├── guides/
├── architecture/
├── modules/
└── adr/
```

Each section serves a different purpose.

---

# Getting Started

If you are new to AJ-OS, begin here.

1. `../README.md`
2. `guides/installation.md`
3. `guides/configuration.md`

These documents explain what AJ-OS is and how to get it running.

---

# Guides

The Guides explain how to use and develop AJ-OS.

| Document                  | Purpose                         |
| ------------------------- | ------------------------------- |
| `guides/README.md`        | Guide overview                  |
| `guides/installation.md`  | Installation                    |
| `guides/configuration.md` | Configuration                   |
| `guides/development.md`   | Development workflow            |
| `guides/ai-workflow.md`   | AI-assisted engineering process |

---

# Architecture

The Architecture documents explain how AJ-OS works internally.

Recommended reading order:

1. `architecture/README.md`
2. `architecture/module-registry.md`
3. `architecture/schema-engine.md`
4. `architecture/translation-layer.md`
5. `architecture/application-layer.md`
6. `architecture/workspace-synchronization.md`
7. `architecture/business-rules.md`
8. `architecture/ceo-dashboard.md`

Together these documents describe the complete architecture of the system.

---

# Business Modules

Business Modules describe the business capabilities managed by AJ-OS.

Current modules include:

- Projects
- CRM
- Portfolio
- Production Music
- Finance
- Game Jams

Each module is documented independently.

---

# Architecture Decision Records

Architecture Decision Records (ADRs) explain why significant architectural decisions were made.

Unlike the Architecture documentation, which explains how the system works, ADRs capture the reasoning behind important design choices.

They provide historical context for contributors and future maintainers.

---

# Recommended Reading Paths

## New Users

```text
README

↓

Installation

↓

Configuration
```

---

## Contributors

```text
README

↓

Development Guide

↓

Architecture

↓

Modules

↓

ADRs
```

---

## Architecture Review

```text
Architecture Overview

↓

Architecture Documents

↓

Modules

↓

ADRs
```

---

# Documentation Principles

The AJ-OS documentation follows a simple philosophy:

- Every document has a single responsibility.
- Every concept has one canonical location.
- Documentation evolves together with the software.
- Architecture is documented before implementation.

This structure helps keep the documentation consistent, discoverable and maintainable as the project grows.
