# ADR-004: AJ-OS Defines Its Own Schema Language

## Status

Accepted

---

## Context

AJ-OS generates and manages a Notion workspace.

Directly modeling the Notion SDK throughout the application would tightly couple the business logic to the API and make future changes difficult.

The system requires an abstraction that represents business databases independently of any specific storage or presentation technology.

---

## Decision

AJ-OS defines its own schema language.

The schema language describes business entities such as databases and properties without depending on the Notion SDK.

The schema is expressed through:

- DatabaseDefinition
- PropertyDefinition
- Validation
- DatabaseBuilder

The Notion API becomes an implementation detail responsible for translating AJ-OS schema definitions into Notion resources.

Future translators may target other formats without changing the schema layer.

Examples include:

- Notion
- JSON
- Markdown
- Documentation generation

---

## Consequences

### Benefits

- Strong separation of concerns
- Easier testing
- Vendor independence
- Improved maintainability
- Clear business language
- Reusable architecture

### Trade-offs

AJ-OS now maintains its own abstraction layer in addition to the Notion API.

This introduces a small amount of additional code but significantly improves long-term flexibility.
