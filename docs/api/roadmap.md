# API Roadmap

The AJ-OS API is developed through small, architecture-driven milestones.

Each milestone introduces one new capability while preserving a stable and maintainable platform.

The objective is to expose AJ-OS business capabilities through a REST interface without coupling clients to implementation details.

---

# Guiding Principles

Every milestone should:

- Solve one clearly defined problem.
- Preserve existing architecture.
- Keep business logic independent of the API.
- Maintain strong typing.
- Leave the platform in a working state.

The API evolves incrementally alongside the rest of AJ-OS.

---

# Status Snapshot

Development has followed these phases with one deliberate deviation: the first interface built
on the platform is a **handbook AI agent** (Phase 7) plus **n8n orchestration** (Phase 8),
delivered ahead of the Notion-backed business endpoints (Phases 4–5).

- Phase 1 — API Foundation ✅
- Phase 2 — Fastify Integration ✅
- Phase 3 — Health Endpoint ✅
- Phase 4 — Repository Integration — planned
- Phase 5 — Business Endpoints — planned
- Phase 6 — Platform Services — partial (auth, validation, error handling, logging done; OpenAPI planned)
- Phase 7 — AI Services — started (handbook agent + inbox capture; see `agent.md`)
- Phase 8 — Automation — started (n8n runtime + chat/Telegram workflows)

---

# Phase 1 — API Foundation

Establish the architectural foundation for the REST API.

Goals:

- Define API architecture.
- Select the HTTP framework.
- Document the development approach.
- Prepare the project for implementation.

No API code is introduced during this phase.

---

# Phase 2 — Fastify Integration

Introduce Fastify as the HTTP server.

Goals:

- Create the API entry point.
- Configure the Fastify server.
- Establish the project structure.
- Verify the server starts successfully.

Business logic remains unchanged.

---

# Phase 3 — Health Endpoint

Expose the first public endpoint.

Goals:

- Implement `GET /health`
- Verify request/response flow.
- Establish endpoint conventions.
- Validate the API infrastructure.

This milestone intentionally contains no business functionality.

---

# Phase 4 — Repository Integration

Connect the API to the AJ-OS business layer.

Goals:

- Introduce repository interfaces.
- Reuse existing application services.
- Prevent duplication of business logic.
- Keep infrastructure isolated.

The API should consume business capabilities rather than implement them.

---

# Phase 5 — Business Endpoints

Expose business capabilities through REST endpoints.

Initial endpoints may include:

- Projects
- Portfolio
- CRM
- Dashboard
- Business Health

Responses should represent business concepts rather than storage structures.

---

# Phase 6 — Platform Services

Expand the platform with shared infrastructure.

Potential additions include:

- Request validation
- Error handling
- Logging
- Configuration
- OpenAPI documentation
- Authentication

These services support the API without affecting business logic.

---

# Phase 7 — AI Services

Expose analytical capabilities powered by AJ-OS business data.

Potential capabilities include:

- Business summaries
- Daily briefings
- Weekly reports
- Recommendations
- Business health analysis
- Opportunity analysis

AI services should consume structured business data rather than interact directly with Notion.

---

# Phase 8 — Automation

Introduce scheduled and event-driven workflows.

Potential capabilities include:

- Scheduled reports
- Opportunity monitoring
- Reminder generation
- Business notifications
- Synchronization tasks
- External integrations

Automation should build upon existing business capabilities instead of duplicating them.

---

# Long-Term Vision

The REST API is one interface within the AJ-OS platform.

Future interfaces—including AI services, automation, public websites, mobile applications and other integrations—should consume the same business capabilities through a shared architecture.

Business logic remains the foundation of the platform, regardless of how it is presented or consumed.
