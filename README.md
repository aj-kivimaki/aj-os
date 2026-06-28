# AJ-OS

> A code-first business operating system for freelancers, built with TypeScript and powered by the Notion API.

AJ-OS is a modular application that generates and synchronizes an entire Notion workspace from code.

Instead of manually building and maintaining databases inside Notion, AJ-OS treats the workspace as infrastructure. Business modules are defined in TypeScript, translated into Notion-compatible schemas, and synchronized with the Notion API through a clean layered architecture.

AJ-OS is currently developed around the needs of a freelance game audio business, but its modular architecture is designed to support a much broader range of business workflows.

---

# Why AJ-OS?

Traditional productivity systems are created manually.

Over time they become inconsistent, difficult to maintain and increasingly disconnected from the actual business they are supposed to support.

AJ-OS takes a different approach.

The application becomes the single source of truth.

Instead of editing databases manually:

```text
Business Modules
        │
        ▼
Schema Engine
        │
        ▼
Translation Layer
        │
        ▼
Application Layer
        │
        ▼
Notion Workspace
```

Every change is version controlled, documented and reproducible.

Running AJ-OS repeatedly produces the same workspace state without creating duplicate resources.

---

# Current Status

**Current Release**

```text
v0.7.0-alpha
```

Current capabilities:

- ✅ Workspace Synchronization
- ✅ Idempotent database creation
- ✅ Projects module
- ✅ CRM module
- ✅ Schema Engine
- ✅ Notion Translation Layer
- ✅ Application Layer
- ✅ Strong TypeScript typing
- ✅ Documentation-driven architecture
- ✅ Architecture Decision Records (ADRs)

AJ-OS is under active development.

---

# Features

## Code-first Workspace

The complete Notion workspace is generated from TypeScript.

No manual database setup is required.

---

## Modular Architecture

Business capabilities are implemented as independent modules.

Current modules include:

- Projects
- CRM

Future modules include:

- Portfolio
- Production Music
- Finance
- Learning
- Game Jams
- Dashboard

---

## Workspace Synchronization

AJ-OS synchronizes the desired workspace with the existing Notion workspace.

Running synchronization multiple times never creates duplicate databases.

Future releases will add:

- Schema updates
- Property synchronization
- Relations
- Templates
- Dashboard generation

---

## Strongly Typed

Business definitions are expressed using TypeScript rather than raw Notion payloads.

The Schema Engine validates definitions before they ever reach the Notion API.

---

## Clean Architecture

AJ-OS follows a layered architecture.

```text
Business Modules
        │
        ▼
Schema Engine
        │
        ▼
Translation Layer
        │
        ▼
Application Layer
        │
        ▼
Notion API
```

Each layer has a single responsibility.

Business logic never depends directly on the Notion SDK.

---

# Architecture

## Business Modules

Business modules describe real business capabilities.

Examples:

- Projects
- CRM
- Portfolio
- Finance

Modules contain business knowledge only.

They never communicate directly with Notion.

---

## Schema Engine

The Schema Engine defines the language used by AJ-OS.

It provides reusable, strongly typed definitions for:

- Databases
- Properties
- Templates
- Validation

The Schema Engine is completely independent of Notion.

---

## Translation Layer

The Translation Layer converts AJ-OS schema definitions into valid Notion API payloads.

It isolates the rest of the application from external SDK details.

Adding support for new Notion property types only requires extending this layer.

---

## Application Layer

The Application Layer orchestrates workflows.

Examples include:

- Workspace Synchronization
- Database Creation
- Future Schema Updates
- Future Deployment Operations

Application services coordinate existing layers without containing business logic.

---

## Infrastructure

Infrastructure components communicate with external services.

Currently:

- Notion API

Future infrastructure may include:

- Analytics
- Import / Export
- Reporting

---

# Getting Started

## Prerequisites

- Node.js 22+
- npm
- A Notion account
- A Notion Integration
- A Notion workspace with a parent page

---

## Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/aj-os.git

cd aj-os
```

Install dependencies:

```bash
npm install
```

---

## Environment

Create a `.env` file:

```env
NOTION_API_KEY=your_notion_api_key

NOTION_PARENT_PAGE_ID=your_parent_page_id
```

### Getting a Notion API Key

1. Create a Notion Integration.
2. Copy the Internal Integration Token.
3. Paste it into `NOTION_API_KEY`.

### Getting the Parent Page ID

1. Create an empty page in Notion.
2. Connect the page to your AJ-OS integration.
3. Copy the page ID from the page URL.
4. Paste it into `NOTION_PARENT_PAGE_ID`.

---

## Running AJ-OS

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Future releases will also support:

```bash
npm run sync
```

---

# Example Output

First synchronization:

```text
Workspace Synchronization

Projects
✓ Created

CRM
✓ Created

Summary

Created: 2
Skipped: 0
Failed: 0
```

Subsequent synchronizations:

```text
Workspace Synchronization

Projects
✓ Already exists

CRM
✓ Already exists

Summary

Created: 0
Skipped: 2
Failed: 0
```

This idempotent behavior is one of the core design goals of AJ-OS.

---

# Project Structure

```
AJ-OS/

├── .ai/                 # AI collaboration workflow
├── docs/                # Documentation and ADRs
├── src/
│   ├── application/     # Application services
│   ├── config/          # Environment configuration
│   ├── modules/         # Business modules
│   ├── notion/          # Notion integration
│   ├── schema/          # Schema engine
│   ├── utils/           # Shared utilities
│   └── index.ts         # Application entry point
│
├── README.md
├── CHANGELOG.md
├── package.json
└── tsconfig.json
```

---

# Current Business Modules

## Projects

The Projects module defines the structure used to manage active work.

Current capabilities include:

- Project metadata
- Status tracking
- Target completion
- Repository links
- Portfolio readiness
- Middleware tracking

Future releases will add:

- Client relationships
- Asset tracking
- Deliverables
- Milestones

---

## CRM

The CRM module is designed specifically for long-term relationship management within the game industry.

Unlike traditional CRMs, it is networking-focused rather than sales-focused.

It helps manage relationships with:

- Game studios
- Indie developers
- Producers
- Audio directors
- Recruiters
- Publishers
- Collaborators

Relationship information includes:

- Contact details
- Relationship status
- Follow-up planning
- Contact source
- Collaboration interests
- Notes

---

# Design Principles

AJ-OS follows a small set of architectural principles.

## Code First

Business logic lives in code.

The generated Notion workspace is a representation of the codebase rather than the source of truth.

---

## Documentation Driven

Architecture decisions are documented before implementation.

Documentation evolves alongside the software.

---

## Strong Typing

Business definitions are expressed using strongly typed TypeScript models.

Validation happens before interacting with external systems.

---

## Separation of Concerns

Every layer has a single responsibility.

Business logic never leaks into infrastructure.

Infrastructure never defines business rules.

---

## Idempotency

Running AJ-OS repeatedly should always produce the same workspace state.

Synchronization should be deterministic and predictable.

This principle guides the design of every future synchronization feature.

---

# Current Architecture

```
Business Modules

↓

Schema Engine

↓

Translation Layer

↓

Application Layer

↓

Notion API

↓

Notion Workspace
```

Every new feature should integrate into this architecture rather than bypass it.

---

# Roadmap

The current development roadmap focuses on expanding AJ-OS from a synchronization platform into a complete business operating system.

## Completed

- ✅ Foundation
- ✅ Schema Engine
- ✅ Notion Translation Layer
- ✅ Projects Module
- ✅ CRM Module
- ✅ Workspace Synchronization
- ✅ Application Layer
- ✅ Architecture Decision Records

## Next Milestones

- Module Registry
- Relations Engine
- Dashboard Foundation
- Portfolio Module
- Production Music Module
- Finance Module
- Learning Module

The long-term goal is a complete operating system capable of managing an entire freelance business from a single synchronized workspace.

---

# AI-Assisted Development

AJ-OS is intentionally developed using an AI-assisted engineering workflow.

Rather than asking AI to generate an entire project, responsibilities are divided clearly.

## Human Responsibilities

The human developer is responsible for:

- Product vision
- Software architecture
- Business requirements
- Technical decisions
- Code review
- Testing
- Final approval

## AI Responsibilities

AI acts as an implementation partner.

Typical tasks include:

- Implementing well-defined milestones
- Refactoring
- Documentation
- Code generation
- Architecture discussions
- Design reviews

Every architectural decision is reviewed before implementation.

This keeps AJ-OS human-directed while accelerating development.

---

# Development Workflow

Every milestone follows the same lifecycle.

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

Small, incremental milestones are preferred over large rewrites.

AJ-OS should remain in a working state after every completed milestone.

---

# Releases

AJ-OS follows semantic versioning.

Major milestones receive GitHub Releases.

Patch releases extend existing functionality without changing architecture.

Example:

```
v0.7.0-alpha

Workspace Synchronization

↓

v0.7.1

Module Registry

↓

v0.8.0-alpha

Relations Engine
```

---

# Architecture Decision Records

Major architectural decisions are documented as ADRs before implementation.

Examples include:

- Layer responsibilities
- Translation architecture
- Business module boundaries
- Application layer
- Synchronization strategy

The ADRs document **why** decisions were made rather than only **how** they were implemented.

---

# Contributing

Although AJ-OS is currently a personal project, contributions, discussions and architectural feedback are welcome.

If you have ideas for improving the architecture, synchronization workflow or developer experience, feel free to open an issue or discussion.

---

# License

This project is licensed under the MIT License.

See the LICENSE file for details.

---

# Acknowledgements

AJ-OS is built with:

- TypeScript
- Node.js
- Notion API
- Zod

It also demonstrates a modern AI-assisted software engineering workflow where architecture, documentation and implementation evolve together through iterative development.

---

> "Treat your business like software.
> Version it.
> Document it.
> Improve it.
> Synchronize it."

— AJ-OS
