# CLAUDE.md

# AJ-OS Implementation Playbook

This document defines how Claude Code should operate while implementing AJ-OS.

It complements the platform architecture and specifications by describing the expected engineering workflow.

---

# Primary Goal

Your responsibility is to implement AJ-OS according to the approved architecture.

Implementation must follow:

```
Architecture
    ↓
Standards
    ↓
Specifications
    ↓
Implementation Tasks
    ↓
Code
```

Do not bypass this process.

---

# Source of Truth

The order of authority is:

1. Architecture (ARCH)
2. Standards (AJS)
3. Specifications (SPEC)
4. Implementation Package
5. Task Document

If documents conflict:

- stop implementation
- explain the conflict
- do not invent a solution

---

# Scope of Work

Implement **only** the assigned task.

Do not implement future tasks.

Do not anticipate future milestones.

Do not introduce features outside the task scope.

Small completed tasks are preferred over partially completed large tasks.

---

# Before Starting

Before implementing any task:

Read:

- referenced ARCH documents
- referenced AJS documents
- referenced SPEC documents
- the implementation README
- the milestone document
- the task document

Ensure the objective is understood before writing code.

---

# Implementation Principles

Prefer:

- deterministic behaviour
- modular design
- small interfaces
- composition
- readability
- maintainability
- testability

Avoid:

- premature optimization
- unnecessary abstractions
- speculative features
- hidden behaviour
- duplicated logic

---

# Architecture Discipline

The architecture is considered frozen.

Do not:

- redesign services
- rename major components
- invent new workflows
- change platform structure

If implementation reveals a problem:

Stop.

Explain the issue.

Suggest possible solutions.

Do not modify the architecture yourself.

---

# Engineering Workflow

Every task follows:

```
Read
    ↓
Understand
    ↓
Implement
    ↓
Test
    ↓
Review
    ↓
Document
```

Never skip validation.

---

# Code Quality

Code should:

- compile
- be formatted
- pass linting
- pass tests
- follow project conventions

Do not leave partially implemented functionality.

---

# Testing

Whenever practical:

- add tests
- update tests
- verify existing behaviour

Implementation is not complete until validation succeeds.

---

# Documentation

If implementation changes documentation:

Update only the documents affected by the current task.

Do not update unrelated documentation.

---

# Worklog

When a task is completed, be able to summarize:

- what was implemented
- important decisions
- challenges
- lessons learned

This information feeds the durable capture points, which are, in practice:

- the **task change log** (per-task record of what changed),
- **decision records** under `decisions/` (significant implementation decisions), and
- the **milestone retrospective** (consolidated lessons learned at freeze).

A session **Worklog** (`templates/WORKLOG.template.md`) is an **optional**
per-session artifact for engineers who want one; it is not a required per-task
output. On this project, task knowledge has been captured through the task
change logs, decision records, and milestone retrospectives rather than
per-session worklogs, and the `worklog/` directory may therefore be empty.

---

# Task Completion

When a task satisfies its acceptance criteria:

Update:

- the task status
- the task change log
- the milestone task progress
- any decision records for significant decisions (see Decision Making)

Optionally, record a session Worklog (see Worklog) — this is not required for
every task.

Do **not** mark the milestone complete unless every task assigned to that milestone has been completed and validated.

If implementation reveals improvements to the engineering process, document them separately rather than modifying unrelated implementation documents.

---

# Decision Making

If a significant implementation decision is required:

Do not silently choose.

Explain:

- available options
- trade-offs
- recommendation

If accepted:

Record it in the implementation decision log.

---

# Communication

If uncertain:

Ask.

Do not guess.

Do not assume.

Do not invent missing requirements.

---

# Definition of Success

A successful task:

- satisfies the task objective
- satisfies acceptance criteria
- follows the specification
- keeps the architecture intact
- leaves the project in a working state
- updates all implementation tracking documents affected by the completed task

---

# Philosophy

AJ-OS is built through disciplined engineering.

Architecture defines **what**.

Specifications define **how**.

Tasks define **what to implement now**.

Code validates the design.

Every completed implementation should make the next implementation easier.

Prioritize correctness over speed.

Build foundations that future services can reuse.
