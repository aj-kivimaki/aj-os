# ADR-002: Projects as the Core Entity

## Status

Accepted

---

## Context

The freelance business revolves around delivering projects.

Projects generate portfolio pieces, invoices, relationships, learning and content.

---

## Decision

The Project entity is the central object in AJ-OS.

Other entities should relate to projects whenever appropriate.

Examples include:

- Clients
- Portfolio Pieces
- Content Posts
- Weekly Reviews
- Assets

---

## Consequences

Benefits

- Clear business model
- Consistent relationships
- Easier reporting
- Simpler navigation

Trade-offs

Some future modules may require additional abstraction if AJ-OS expands beyond project-based work.
