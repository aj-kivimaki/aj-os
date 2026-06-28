# Business Modules

Business Modules represent the core capabilities of a business.

Each module models a specific business domain independently from the underlying infrastructure.

Modules are defined in TypeScript and become the single source of truth for the generated Notion workspace.

---

# Design Principles

Every module follows the same structure.

```
Module

↓

Database

↓

Properties

↓

Templates

↓

Relations

↓

Registration

↓

Synchronization
```

Business modules never communicate directly with the Notion API.

Instead, they describe the business domain in a platform-independent way.

---

# Current Modules

## Projects

Manage active work, milestones, repositories and project status.

Purpose:

- Track ongoing work
- Organize development
- Connect related business information

---

## CRM

Manage professional relationships.

Purpose:

- Studios
- Clients
- Recruiters
- Publishers
- Collaborators

The CRM focuses on long-term relationship management rather than sales.

---

## Portfolio

Manage publicly visible work.

Purpose:

- Showcase projects
- Track published work
- Organize portfolio entries
- Highlight featured work

Portfolio connects business work with public presentation.

---

## Production Music

Manage licensable music.

Purpose:

- Track cues
- Organize catalogues
- Prepare submissions
- Monitor publication status

This module supports long-term passive income through production music libraries.

---

## Finance

Track financial activity.

Purpose:

- Income
- Expenses
- Invoices
- Royalties
- Recurring costs

Finance models business events rather than static business entities.

---

## Game Jams

Manage networking and collaborative events.

Purpose:

- Track participation
- Organize projects
- Record outcomes
- Build portfolio opportunities

---

# Module Independence

Modules should remain independent whenever possible.

Relationships are declared explicitly rather than relying on implementation details.

Current relations include:

```
CRM

↓

Projects

↓

Portfolio

↓

Production Music

↓

Finance

Game Jams

↓

Projects
```

Additional relationships may be introduced without changing the architecture.

---

# Adding a Module

Adding a new module should require only:

1. Create the module.
2. Define its database.
3. Define its properties.
4. Define templates.
5. Define relations.
6. Register the module.

Workspace Synchronization automatically discovers registered modules.

No infrastructure changes should be required.

---

# Future Modules

Possible future business modules include:

- Learning
- Assets
- Marketing
- Contracts
- Publishing
- Equipment
- Goals

The architecture is designed so that new business domains can be added without modifying the underlying synchronization framework.

---

# Guiding Principle

Business Modules describe **what the business is**.

They do not define how information is stored or synchronized.

This separation allows AJ-OS to evolve independently of any single platform while keeping business logic clean, reusable and strongly typed.
