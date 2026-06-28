# Contributing to AJ-OS

Thank you for your interest in AJ-OS.

Although the project is currently maintained by a single developer, the engineering workflow is intentionally documented and reproducible.

## Philosophy

AJ-OS follows a documentation-first development process.

Architecture is designed before implementation.

Every significant decision is recorded as an Architecture Decision Record (ADR).

Business requirements drive implementation.

---

# Development Process

Each milestone follows the same workflow.

1. Define the architecture.
2. Update documentation.
3. Create an implementation task.
4. Implement the milestone.
5. Review the implementation.
6. Test the application.
7. Commit.
8. Publish a release.

The project should remain functional after every milestone.

---

# AI-Assisted Development

AJ-OS intentionally combines human architectural decisions with AI-assisted implementation.

## Human responsibilities

- Product vision
- Business requirements
- Architecture
- Reviews
- Testing
- Final approval

## AI responsibilities

- Implementation
- Refactoring
- Documentation
- Code suggestions
- Design discussions

AI assists the engineering process but does not replace architectural decision-making.

---

# Code Style

- Strong TypeScript typing
- Small focused modules
- Clear separation of concerns
- Documentation-first
- Single responsibility

Avoid unnecessary abstractions.

Prefer readability over cleverness.

---

# Pull Requests

Every pull request should:

- Solve one problem.
- Preserve architecture.
- Include documentation updates when necessary.
- Keep AJ-OS in a working state.

Small iterative improvements are preferred over large rewrites.
