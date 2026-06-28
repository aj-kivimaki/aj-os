# Contributing to AJ-OS

Thank you for your interest in AJ-OS.

Contributions of all sizes are welcome, including bug reports, documentation improvements, architectural discussions and code contributions.

The goal of AJ-OS is to remain a clean, maintainable and well-documented code-first business operating system.

---

# Before You Start

Before contributing, please familiarize yourself with the project documentation.

Recommended reading order:

1. `README.md`
2. `docs/guides/development.md`
3. `docs/architecture/`
4. `docs/modules/`

Understanding the architecture before making changes helps keep the project consistent.

---

# Development Workflow

AJ-OS follows an incremental development process.

Every contribution should:

1. Define the problem.
2. Design the solution.
3. Update documentation when necessary.
4. Implement the change.
5. Verify the project builds successfully.
6. Submit the change for review.

Small, focused contributions are preferred over large rewrites.

---

# Development Commands

Install dependencies:

```bash
npm install
```

Type check:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Synchronize the workspace:

```bash
npm run sync
```

Before opening a pull request, ensure all commands complete successfully.

---

# Coding Standards

AJ-OS follows a small set of architectural principles.

- Prefer strong TypeScript typing.
- Keep modules focused and independent.
- Maintain clear separation of concerns.
- Avoid unnecessary abstractions.
- Prefer readability over cleverness.
- Keep documentation up to date.

If an architectural decision requires explanation, document it.

---

# Pull Requests

A good pull request should:

- Solve a single problem.
- Preserve the existing architecture.
- Include documentation updates when appropriate.
- Keep the project in a working state.
- Remain easy to review.

Smaller pull requests are generally easier to review and merge.

---

# Commit Messages

AJ-OS follows the Conventional Commits specification where practical.

Examples:

```text
feat: add finance module

fix: resolve relation synchronization

docs: update architecture guide

refactor: simplify schema validation
```

Clear commit history makes the project easier to understand and maintain.

---

# Documentation

Documentation is considered part of the implementation.

If a change affects the architecture, workflow or public API, the relevant documentation should be updated as part of the same contribution.

Documentation should remain consistent with the implementation.

---

# Questions and Discussions

Questions, suggestions and architectural discussions are always welcome.

If you are unsure about a design decision, opening a discussion before implementing a large change is encouraged.

Thoughtful discussion is often the best way to improve both the software and its documentation.

---

Thank you for helping improve AJ-OS.
