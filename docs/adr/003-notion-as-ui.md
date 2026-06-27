# ADR-003: Notion as the User Interface

## Status

Accepted

---

## Context

AJ-OS requires a flexible interface for viewing and managing information.

Notion provides databases, dashboards and templates while the application manages their creation.

---

## Decision

Notion acts as the presentation layer.

AJ-OS manages all structure through the Notion API.

Users interact with the workspace rather than the source code.

---

## Consequences

Benefits

- Excellent user experience
- Fast iteration
- Flexible dashboards
- Rich databases

Trade-offs

AJ-OS depends on the capabilities of the Notion API.
