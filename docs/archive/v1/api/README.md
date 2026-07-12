# AJ-OS API

> **Archived (AJ-OS v1).** This describes the v1 REST API, designed to expose the
> Notion-backed **business** capabilities (Projects, CRM, Portfolio, Dashboard).
> It is superseded and preserved, frozen, as a historical record. The only
> current API surface is the Handbook agent, documented in
> [`docs/api/agent.md`](../../../api/agent.md). See
> [`docs/archive/v1/`](../README.md) and [`docs/VISION.md`](../../../VISION.md).
> If AJ-OS needs a broader API in v2, it will be designed from the current
> architecture rather than evolved from these documents.

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
| `agent.md`        | The handbook AI agent and inbox-capture endpoints   |

See also `infrastructure/n8n/README.md` for driving the agent from n8n (chat window, Telegram).

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

# Current Status

The API foundation is implemented and running (`npm run serve`). The first interface built on
it is the **handbook AI agent** rather than the Notion-backed business endpoints — see
`agent.md` for details.

Implemented endpoints:

| Method | Path          | Auth   | Purpose                                              |
| ------ | ------------- | ------ | --------------------------------------------------- |
| GET    | `/health`     | none   | Liveness check                                      |
| POST   | `/agent/ask`  | Bearer | Ask the handbook agent → grounded answer            |
| POST   | `/inbox/note` | Bearer | Write a Markdown note to the handbook inbox          |
| POST   | `/inbox/file` | Bearer | Save a file to the handbook inbox                    |

Also in place: Fastify integration, bearer authentication, request validation (Zod), error
handling, and structured logging.

Not yet implemented (planned): repository integration and Notion-backed **business endpoints**
(Projects, Portfolio, CRM, Dashboard, Business Health), and OpenAPI documentation. See
`roadmap.md`.

Each milestone should leave the platform in a working and releasable state.

---

> **The API exposes business capabilities—not infrastructure.**
