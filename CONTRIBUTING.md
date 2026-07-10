# Contributing to AJ-OS

Thank you for your interest in AJ-OS.

Contributions of all sizes are welcome, including bug reports, documentation improvements, architectural discussions and code contributions.

The goal of AJ-OS is to remain a clean, maintainable, and well-documented
knowledge-driven developer operating system — a reusable platform, with products
built on top of it.

---

# Before You Start

Before contributing, please familiarize yourself with the project documentation.

Recommended reading order:

1. `README.md` — what AJ-OS is, what has shipped, and how to run it.
2. `docs/project/versioning-and-releases.md` — how the platform and products are versioned and released.
3. `docs/architecture/` — the platform architecture (ARCH).
4. `docs/standards/` — the engineering standards (AJS).
5. `docs/specifications/` — platform and product specifications (SPEC); product specs live under `docs/specifications/products/`.
6. `implementation/products/knowledge-assistant/` — the first product's engineering documentation, a worked example of building on the platform.

Understanding the architecture and the platform/product distinction (below) before making changes helps keep the project consistent.

---

# Platform and Products

AJ-OS is a **reusable platform** with **products** built on top of it. Keeping these
separate is the core architectural rule of the repository.

- **Platform capabilities** live in `src/platform/` (and `src/context-builder/`).
  Each is independent, single-purpose, and **knows nothing about any product**.
- **Products** live in `src/products/` and are the only place platform capabilities
  are composed together. Product-specific glue belongs here, never in the platform.
- The dependency direction is one-way: **CLI → Product → Platform**. Nothing in the
  platform may import a product.

When a product needs something new, **build it as a reusable platform capability**,
not a product-specific shortcut — assume a future product will reuse it. If a piece
of logic would only ever serve one product, it is probably product composition and
belongs in the product layer.

The platform and each product are **versioned independently** — see
[`docs/project/versioning-and-releases.md`](docs/project/versioning-and-releases.md).

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

Run the test suite:

```bash
npm test
```

Run the Knowledge Assistant from source:

```bash
npm run dev -- ask "…"
```

Synchronize the Notion workspace (legacy sync CLI):

```bash
npm run sync
```

Before opening a pull request, ensure `npm run typecheck`, `npm run build`, and
`npm test` all pass.

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
feat(context-builder): add explainability to assembled sections

feat(product-001): support follow-up questions in the Knowledge Assistant

docs: update the versioning & releases governance

refactor(retrieval): simplify index parsing
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
