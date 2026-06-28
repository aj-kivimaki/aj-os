# Development

This guide explains how AJ-OS is developed, tested, and extended.

It is intended for contributors and for anyone interested in understanding the project's engineering workflow.

---

# Development Philosophy

AJ-OS follows a documentation-driven, architecture-first development process.

Every significant feature follows the same lifecycle:

```
Architecture

↓

Documentation

↓

Implementation Prompt

↓

Implementation

↓

Review

↓

Testing

↓

Commit

↓

Release
```

The objective is to make every architectural decision intentional, reviewable, and reproducible.

---

# Project Structure

```
src/

├── application/
├── dashboard/
├── modules/
├── notion/
├── registry/
├── schema/
├── translation/
├── validation/
└── index.ts
```

Each directory has a clearly defined responsibility.

Business logic should never depend directly on the Notion SDK.

---

# Architecture Principles

AJ-OS follows a layered architecture.

```
Business Modules

↓

Module Registry

↓

Schema Engine

↓

Translation Layer

↓

Application Layer

↓

Notion
```

Each layer communicates only with adjacent layers.

Responsibilities should never overlap.

---

# Business Modules

Every business capability is implemented as a self-contained module.

A typical module contains:

```
module/

database.ts

properties.ts

template.ts

index.ts
```

Modules describe business concepts only.

They never communicate directly with external services.

---

# Adding a New Module

Adding a business module should require only:

1. Create the module folder.
2. Define the database.
3. Define properties.
4. Define templates.
5. Define relations.
6. Register the module.

Workspace Synchronization automatically discovers registered modules.

Infrastructure should not require modification.

---

# Development Commands

Install dependencies:

```bash
npm install
```

Type check:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Synchronize the workspace:

```bash
npm run sync
```

These commands should succeed before opening a pull request.

---

# Testing

Before committing changes:

```bash
npm run typecheck

npm run build

npm run sync
```

Synchronization should:

- discover existing databases
- create missing databases
- synchronize relations
- generate the CEO Dashboard

The synchronization process should remain deterministic and idempotent.

---

# Coding Standards

When contributing:

- Prefer strong typing.
- Keep modules independent.
- Avoid unnecessary abstractions.
- Document architectural decisions.
- Favor readability over cleverness.
- Reuse existing patterns whenever possible.

The architecture should remain stable as new business modules are added.

---

# Documentation

Documentation is treated as part of the implementation.

Significant architectural changes should update the relevant documentation before or alongside code changes.

Important documentation includes:

- README
- Architecture
- Guides
- Module documentation
- ADRs
- CHANGELOG

---

# Pull Requests

Every pull request should:

- solve a single problem
- compile successfully
- pass type checking
- keep documentation up to date
- maintain architectural consistency

Small, focused changes are preferred over large rewrites.

---

# Release Process

Major milestones follow this workflow:

```
Plan

↓

Implement

↓

Review

↓

Test

↓

Document

↓

Release

↓

Tag
```

Semantic Versioning is used for releases.

Major releases represent stable architectural milestones.

---

# Philosophy

AJ-OS is designed to evolve by expanding business capabilities rather than repeatedly redesigning its architecture.

A successful contribution fits naturally into the existing system instead of introducing unnecessary complexity.

The best code in AJ-OS is often the code that does not need to be written because the existing architecture already supports the new feature.
