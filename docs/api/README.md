# AJ-OS API

The AJ-OS API extends the business operating system by exposing business capabilities through a REST interface.

The API is not a wrapper around the Notion API.

Instead, it provides a stable interface for applications that consume business data managed by AJ-OS.

Current consumers may include:

- Web applications
- Portfolio websites
- Mobile applications
- AI services
- Automation workflows
- Future integrations

The API is designed to expose business capabilities rather than implementation details.

---

# Philosophy

AJ-OS follows a code-first architecture.

Business logic is implemented once and reused by multiple interfaces.

The REST API is one of those interfaces.

It consumes the same business modules, business rules and repositories that power workspace synchronization and future AI services.

The API should never expose infrastructure-specific concepts such as Notion databases or API payloads.

Instead, it exposes business concepts such as:

- Projects
- Portfolio
- CRM
- Production Music
- Finance
- Dashboard
- Business Health

This keeps client applications independent of the underlying storage implementation.

---

# Architectural Principles

The API follows the same engineering principles as the rest of AJ-OS.

- Business capabilities over infrastructure
- Documentation before implementation
- Strong typing
- Small, incremental milestones
- Clear separation of concerns
- Production-quality software

Every architectural decision should preserve the independence of the business layer.

---

# Documentation

This section documents the API architecture and its evolution.

## Documents

| Document          | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `architecture.md` | Overall API architecture and layer responsibilities |
| `roadmap.md`      | Planned evolution of the API platform               |

Additional documentation will be introduced as the API grows.

Documentation should evolve together with the architecture.

---

# Development Workflow

The API follows the same engineering workflow used throughout AJ-OS.

```text
Product Vision

↓

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

Implementation begins only after the architecture has been reviewed and documented.

---

# Scope

The first milestone focuses only on establishing the API foundation.

No business endpoints are implemented yet.

Future milestones will introduce:

- Fastify integration
- Health endpoint
- Repository integration
- Business endpoints
- Authentication
- OpenAPI documentation
- AI-powered services

Each milestone should leave the platform in a working and releasable state.

---

> **The API exposes business capabilities—not infrastructure.**
