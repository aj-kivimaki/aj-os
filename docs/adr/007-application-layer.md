# ADR-007: Application Layer

## Status

Accepted

---

## Context

AJ-OS is organized into multiple architectural layers.

Each layer has a specific responsibility:

- Business Modules describe the business domain.
- The Schema Layer defines the AJ-OS data model.
- The Translation Layer converts AJ-OS definitions into Notion-compatible payloads.
- The Infrastructure Layer communicates with external systems such as the Notion API.

The application also requires orchestration logic that coordinates these layers without introducing business logic or infrastructure concerns into the wrong place.

---

## Decision

AJ-OS introduces an Application Layer.

The Application Layer coordinates existing components to perform complete workflows.

Examples include:

- Create a database
- Synchronize a database
- Update an existing database
- Preview pending changes
- Import external data
- Export workspace data

The Application Layer does not define business rules.

Instead, it orchestrates the existing architecture.

---

## Architecture

```text
Business Modules
        │
        ▼
Schema Layer
        │
        ▼
Translation Layer
        │
        ▼
Application Layer
        │
        ▼
Infrastructure
        │
        ▼
Notion API
```

Each layer has a single responsibility.

Business Modules never communicate directly with the Application Layer.

The Application Layer coordinates existing services without modifying the business model.

---

## Responsibilities

The Application Layer may:

- Coordinate workflows
- Execute business operations
- Compose existing services
- Handle application-level errors
- Return useful results to callers

The Application Layer must not:

- Define business entities
- Define schemas
- Translate schemas
- Contain Notion-specific business logic
- Duplicate functionality from lower layers

---

## Consequences

### Benefits

- Clear separation of concerns
- Small, focused components
- Reusable workflows
- Easier testing
- Easier maintenance
- Consistent orchestration of business operations

### Trade-offs

An additional architectural layer introduces more files and abstractions.

However, it prevents orchestration logic from leaking into business modules or infrastructure code as the project grows.

---

## Future Implications

Future application services may include:

- Synchronize Workspace
- Update Database Schema
- Preview Changes
- Validate Workspace
- Export Workspace
- Import Workspace
- Reset Development Workspace

Each service should coordinate existing layers rather than implementing business logic.

---

## Rationale

AJ-OS is designed as a business operating system.

Business knowledge belongs in Business Modules.

Translation belongs in the Translation Layer.

Infrastructure belongs in the Infrastructure Layer.

The Application Layer exists to connect these components into complete user workflows while preserving the independence and clarity of each architectural layer.

Keeping orchestration separate from business logic allows AJ-OS to grow without accumulating tightly coupled code.
