# ADR-005: Translation Layer

## Status

Accepted

---

## Context

AJ-OS defines its own schema language through `DatabaseDefinition`, `PropertyDefinition`, and related schema components.

The Notion API requires a different data model for creating and configuring databases.

Allowing the rest of the application to depend directly on the Notion SDK would tightly couple business logic to a specific external API and make future changes more difficult.

A dedicated translation layer is required to isolate AJ-OS from implementation-specific details.

---

## Decision

AJ-OS introduces a dedicated translation layer.

The translation layer is the only part of the application responsible for understanding both the AJ-OS schema language and the Notion API.

Its responsibilities include:

- Translating `DatabaseDefinition` into Notion database payloads.
- Translating `PropertyDefinition` into Notion property configurations.
- Performing translation-specific validation.
- Isolating all Notion-specific implementation details from the rest of the application.

The Schema layer must remain completely independent of the Notion SDK.

Business modules should only interact with the Schema layer.

---

## Architecture

```
Business Modules
        │
        ▼
AJ-OS Schema
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

---

## Consequences

### Benefits

- Clear separation of concerns.
- Business logic remains independent of Notion.
- Easier testing.
- Easier maintenance.
- Vendor independence.
- Simple extension to support additional translation targets.
- Cleaner module boundaries.

### Trade-offs

AJ-OS maintains an additional abstraction layer.

This introduces a small amount of implementation complexity in exchange for significantly improved long-term maintainability.

---

## Future Implications

The translation layer establishes a stable boundary between AJ-OS and external systems.

Future translators may target additional outputs without changing the schema or business modules.

Potential future translation targets include:

- JSON
- Markdown
- Documentation generation
- Alternative database providers
- Import/export formats

---

## Rationale

AJ-OS is not a collection of Notion scripts.

It is a business operating system that currently uses Notion as its presentation and storage platform.

By isolating the Notion SDK behind a dedicated translation layer, the architecture remains focused on the business domain rather than a specific vendor implementation.
