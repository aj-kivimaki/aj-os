# AJ-OS Development Workflow

AJ-OS is developed using an architecture-first workflow.

The goal is to keep implementation aligned with documentation and avoid architectural drift.

---

# Team Roles

## Product Owner

Responsible for:

- Business requirements
- Priorities
- Workflow validation
- Product decisions

---

## Architect

Responsible for:

- System architecture
- Documentation
- Roadmap
- Database design
- Code reviews
- Long-term maintainability

---

## AI Engineer

Responsible for implementing one milestone at a time.

The AI should never invent new architecture.

The AI should follow the existing documentation.

---

# Development Cycle

Every milestone follows the same process.

## 1. Architecture

Design the feature.

Update documentation only if the architecture changes.

---

## 2. Prompt

Create a milestone-specific implementation prompt.

Store it inside:

.ai/prompts/

---

## 3. Implementation

Open a NEW AI conversation.

Read the project documentation.

Implement ONE milestone only.

---

## 4. Review

Review the implementation.

Check:

- Architecture
- Simplicity
- Maintainability
- Type Safety
- Readability

---

## 5. Test

Run locally.

Verify functionality.

---

## 6. Commit

Use Conventional Commits.

Every milestone should leave the project in a working state.

---

## 7. Push

Push changes to GitHub.

---

## 8. Repeat

Start a new AI conversation for the next milestone.

---

# Documentation Rule

Architecture documentation should remain stable.

Documentation changes only when the architecture changes.

Implementation should evolve without constantly modifying documentation.

---

# AI Philosophy

ChatGPT designs.

Cursor implements.

Humans make architectural decisions.

AI assists implementation.
