# ADR-006: Business Modules

## Status

Accepted

---

## Context

AJ-OS is organized into multiple architectural layers.

The Schema layer defines the language used to describe business entities.

The Translation layer converts those definitions into Notion-compatible payloads.

The application also requires modules that represent real business concepts such as Projects, CRM, Portfolio, Finance and Production Music.

Without clear boundaries, business modules could become coupled to Notion-specific implementation details, making them harder to maintain and reuse.

---

## Decision

Business modules are responsible only for describing the business domain.

A business module defines:

- Business entities
- Business terminology
- Properties
- Default templates
- Module-specific configuration

Business modules must never communicate directly with the Notion API.

They should only use the AJ-OS Schema layer.

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
Notion SDK
        │
        ▼
Notion API
```

Business modules know only about the Schema layer.

The Schema layer knows nothing about Notion.

The Translation layer is the boundary between AJ-OS and external systems.

---

## Responsibilities

Business modules may define:

- Database definitions
- Property definitions
- Templates
- Default values
- Module-specific types
- Business terminology

Business modules must not:

- Import Notion SDK types
- Build Notion payloads
- Call the Notion API
- Perform synchronization
- Contain infrastructure logic

---

## Consequences

### Benefits

- Clear separation of concerns
- Business logic remains independent of infrastructure
- Easier testing
- Easier maintenance
- Highly reusable modules
- Consistent architecture across AJ-OS

### Trade-offs

Business modules require supporting infrastructure before they become operational.

This introduces additional architectural layers but significantly improves long-term maintainability and scalability.

---

## Future Implications

Every future module should follow this same pattern.

Examples include:

- CRM
- Portfolio
- Production Music
- Game Jams
- Learning
- Finance
- Assets
- Goals

Each module should describe its business domain while remaining completely independent of the underlying storage implementation.

---

## Rationale

AJ-OS is designed as a business operating system rather than a collection of Notion scripts.

Business knowledge should remain stable even if the underlying platform changes.

By keeping business modules independent of infrastructure, AJ-OS remains modular, maintainable and adaptable to future translation targets beyond Notion.
