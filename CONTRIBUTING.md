# Contributing to AJ-OS

Contributions of all sizes are welcome — bug reports, documentation, design
discussion, and code.

This document answers **how to work in this repository.** For _what AJ-OS is_,
read [docs/VISION.md](docs/VISION.md); for _how it is structured_, read
[docs/architecture/](docs/architecture/).

---

# Before you start

Read, in order:

1. [README.md](README.md) — what AJ-OS is and how to run it.
2. [docs/VISION.md](docs/VISION.md) — the identity every change is measured against.
3. [docs/architecture/](docs/architecture/) — the platform architecture (ARCH).
4. [docs/standards/](docs/standards/) — the engineering standards (AJS).
5. [docs/specifications/](docs/specifications/) — platform and product specs (SPEC).
6. [implementation/products/knowledge-assistant/](implementation/products/knowledge-assistant/)
   — a worked example of building on the platform.

---

# The one rule: platform vs. products

AJ-OS is a **reusable platform** with **products** built on top of it. Keeping
them separate is the core architectural constraint of the repository:

- **Platform capabilities** live in `src/platform/` (and `src/context-builder/`)
  and know nothing about any product.
- **Products** live in `src/products/` and are the only place platform
  capabilities are composed together.
- Dependency direction is one-way: **CLI → Product → Platform.** Nothing in the
  platform may import a product.

When a product needs something new, build it as a reusable platform capability,
not a product-specific shortcut. The platform and each product are versioned
independently — see
[versioning & releases](docs/project/versioning-and-releases.md).

---

# Workflow

AJ-OS is architecture-first: update the relevant standard or specification before
implementing, keep changes small and focused, and update affected documentation
in the same change. The full engineering lifecycle is defined canonically in
[AJS-007](docs/standards/AJS-007-Engineering-Lifecycle-Standard.md).

Every contribution should:

1. Define the problem and design the solution.
2. Update the relevant AJS/SPEC when platform rules or behavior change.
3. Implement, keeping the change small.
4. Verify the project builds and tests pass.
5. Open a focused pull request.

---

# Commands

```bash
npm install        # install dependencies
npm run typecheck  # type check
npm run build      # build
npm test           # run the test suite
npm run dev -- ask "…"   # run the Knowledge Assistant from source
```

Before opening a pull request, ensure `npm run typecheck`, `npm run build`, and
`npm test` all pass.

---

# Conventions

- **Code:** strong TypeScript typing, focused single-responsibility modules,
  clear separation of concerns, readability over cleverness.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org)
  (`feat(context-builder): …`, `docs: …`, `refactor(retrieval): …`).
- **Pull requests:** solve one problem, preserve the architecture, keep the
  project in a working state, and remain easy to review.
- **Documentation is part of the implementation** — if a change affects
  architecture, workflow, or a public interface, update the docs in the same PR.

Questions and design discussions are always welcome — opening a discussion before
a large change is encouraged.
