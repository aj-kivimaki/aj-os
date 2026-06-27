# AJ-OS Architecture

## Overview

AJ-OS is a code-first Notion Operating System for managing a freelance game audio business.

The TypeScript application is the single source of truth.

The Notion workspace is generated and maintained entirely through the Notion API. Manual structural changes inside Notion should be avoided.

Git stores the project history, documentation, and implementation.

---

# High-Level Architecture

```
AJ-OS
    │
    ▼
TypeScript Application
    │
    ▼
Notion SDK
    │
    ▼
Notion API
    │
    ▼
Notion Workspace
```

---

# Layers

## Presentation Layer

The Notion workspace.

Responsible for:

- Dashboards
- Databases
- Templates
- Views
- User interaction

---

## Application Layer

The AJ-OS application.

Responsible for:

- Creating databases
- Updating schemas
- Creating pages
- Creating templates
- Creating relations
- Synchronization
- Validation

---

## Infrastructure Layer

External services.

- Notion API
- GitHub
- Local filesystem
- Environment configuration

---

# Project Structure

```
src/

config/
builders/
databases/
dashboards/
templates/
notion/
types/
utils/

docs/
```

Each folder has a single responsibility.

---

# Core Modules

- Projects
- CRM
- Portfolio
- Game Jams
- Production Music
- Learning
- Knowledge Base
- Finance
- Goals
- Reviews
- Assets
- Content

Each module owns its own schema, templates and business logic.

---

# Core Entity

Projects are the central entity of AJ-OS.

Everything else either supports a project or is generated from one.

Examples:

Project
→ Client

Project
→ Portfolio Piece

Project
→ Content Post

Project
→ Invoice

Project
→ Weekly Review

---

# Design Goals

- Code-first
- Modular
- Strongly typed
- Idempotent
- Easily extensible
- Documentation-driven
- Production quality
- Maintainable for many years

---

# Development Philosophy

Documentation defines the architecture.

The implementation follows the documentation.

No feature should be implemented before it has been documented.
