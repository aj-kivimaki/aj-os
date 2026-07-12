# AJ-OS Prompt

## Milestone

API-001 – Fastify Foundation

---

# Before You Begin

Read the following before writing any code:

- docs/
- docs/api/
- docs/architecture/
- .ai/project-context.md
- .ai/implementation-rules.md
- .ai/coding-standards.md
- .ai/engineering-philosophy.md
- .ai/workflow.md

Implement only this milestone.

Do not redesign the architecture.

---

# Architectural Goal

Introduce the foundation for the AJ-OS REST API.

The purpose of this milestone is to establish AJ-OS as a platform capable of exposing business capabilities through HTTP while preserving the existing architecture.

This milestone should create the minimum infrastructure required for future API development.

No business functionality should be introduced.

---

# Your Role

You are a senior TypeScript engineer extending the AJ-OS platform.

Your primary responsibility is to preserve the existing architecture.

Follow established project conventions.

Reuse existing patterns wherever possible.

Avoid unnecessary abstractions.

---

# Platform Context

AJ-OS is evolving from a command-line application into a modular business platform.

The REST API is another interface to the platform.

It is **not** a separate application.

Future interfaces may include:

- REST API
- AI Services
- Automation
- Public Websites
- Mobile Applications

All interfaces should consume the same business capabilities.

Business logic must never be duplicated between interfaces.

---

# Objective

Create the foundation for the REST API.

The implementation should:

- integrate Fastify
- create an API entry point
- configure a basic HTTP server
- establish the initial API structure
- verify that the server starts successfully

Do not implement business endpoints.

---

# Architecture Boundaries

Maintain the existing architectural separation.

The API should consume business capabilities.

Business logic should remain inside the Business Layer.

Fastify should only provide:

- routing
- request handling
- response handling
- middleware
- future authentication

The API must never expose Notion-specific concepts.

---

# Requirements

The implementation should include only the minimum functionality required to establish the API foundation.

Expected capabilities:

- Fastify installation
- Basic server configuration
- API entry point
- Development startup
- Production startup

Existing synchronization must continue working without modification.

---

# Constraints

Do NOT implement:

- Health endpoint
- Projects endpoint
- Dashboard endpoint
- Repository abstraction
- Controllers
- Authentication
- OpenAPI
- AI services
- Scheduled jobs

Those belong to future milestones.

Do not modify existing business modules.

Do not refactor unrelated code.

---

# Design Goals

The implementation should:

- preserve the current architecture
- remain framework-independent outside the API layer
- use strict TypeScript
- minimize infrastructure changes
- establish a clean platform foundation

The implementation should feel like a natural extension of AJ-OS rather than a separate application.

---

# Deliverables

Expected additions may include:

```text
src/

api/

    server.ts

    index.ts

    plugins/

    routes/
```

Updates only where necessary:

- package.json
- project configuration
- dependency installation

No existing business modules should require modification.

---

# Implementation Strategy

Prefer extending existing architecture over introducing new abstractions.

Favor simple, maintainable solutions.

Keep changes focused on this milestone.

The implementation should be easy to review.

---

# Future Milestones

This milestone intentionally prepares the platform for future work.

Future milestones will introduce:

- Health Endpoint
- Repository Integration
- Business Endpoints
- Authentication
- OpenAPI
- AI Services
- Automation

Do not implement these now.

---

# Before Finishing

Verify:

- TypeScript compiles successfully.
- The project builds successfully.
- Existing synchronization still functions.
- The Fastify server starts successfully.
- No existing business logic has been modified unnecessarily.
- Explain architectural decisions separately.
- Suggest future improvements separately.

---

# Definition of Done

AJ-OS includes a working Fastify foundation.

The platform can start an HTTP server.

Existing functionality remains fully operational.

The implementation follows the documented architecture.

The project is ready for the next milestone: **API-002 – Health Endpoint**.
