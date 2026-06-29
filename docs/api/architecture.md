# API Architecture

The AJ-OS API provides a REST interface for consuming business capabilities implemented by the AJ-OS platform.

It is an application interface, not a separate application.

The API shares the same business modules, business rules and repositories as every other AJ-OS interface.

---

# Design Goal

The API exists to expose business capabilities without exposing implementation details.

Client applications should never depend on:

- Notion
- Database identifiers
- Notion property types
- Internal application structure

Instead, they communicate using stable business-oriented endpoints.

For example:

```text
GET /projects

GET /portfolio

GET /dashboard

GET /business-health
```

The implementation behind those endpoints may evolve without affecting clients.

---

# Platform Architecture

AJ-OS is built around a single business layer.

Different interfaces consume the same business capabilities.

```text
                AJ-OS Platform

                    │
                    ▼

            Business Modules
            Business Rules
            Repository Layer

     ┌──────────┼──────────┐
     ▼          ▼          ▼

 Workspace     REST API     Future Interfaces
 Synchronizer               AI • CLI • Automation

     │
     ▼

   Notion
```

The REST API is one interface among several.

Business logic should never be duplicated between interfaces.

---

# Request Lifecycle

A typical API request follows this flow.

```text
HTTP Request

↓

Fastify Route

↓

Application Service

↓

Business Rules

↓

Repository

↓

Business Data

↓

Response Model

↓

HTTP Response
```

Each layer has a single responsibility.

---

# Layer Responsibilities

## Fastify

Responsible for:

- HTTP routing
- Request validation
- Response serialization
- Middleware
- Authentication
- Error handling

Fastify should never contain business logic.

---

## Application Layer

Responsible for coordinating business operations.

Application services orchestrate work between the API and the business layer.

---

## Business Layer

Responsible for:

- Business modules
- Business rules
- Validation
- Decision making

The business layer must remain independent of Fastify and Notion.

---

## Repository Layer

Responsible for retrieving and persisting business data.

The initial implementation uses Notion.

Future implementations may use other storage providers without affecting business logic or API clients.

---

# Core Principles

The API follows these architectural principles.

## Business First

Expose business capabilities rather than infrastructure.

---

## Interface Independence

Business logic should not depend on Fastify.

The API is only one way of interacting with AJ-OS.

---

## Separation of Concerns

Each layer has one responsibility.

Responsibilities should never overlap.

---

## Strong Typing

Every request and response should use well-defined TypeScript types.

Runtime validation should complement compile-time type safety.

---

## Incremental Development

The API evolves through small, reviewable milestones.

Every milestone should leave the platform in a working state.

---

# Future Evolution

The API is intended to become one of several interfaces built on top of the AJ-OS platform.

Future interfaces may include:

- AI Services
- Automation
- Public Websites
- Mobile Applications
- CLI Tools

All interfaces should consume the same business capabilities and repositories.

The business layer remains the single source of business logic.
