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

## Where every module lives

The platform/products rule above is the *dependency* constraint. This table
places **every** top-level `src/` module and states its **expected lifetime**, so
a reader can tell not just where code goes but whether to build on it. Lifetimes
follow the taxonomy in [REX-D1](implementation/phase-3-developer-experience/repository-excellence/decisions/REX-D1.md);
the agent layer's architectural home is a **recommendation** for a future ADR, not
a settled ARCH-001 decision.

| Module | Role | Expected lifetime |
| --- | --- | --- |
| `src/platform/` | Reusable platform capabilities (config service, handbook access, prompt, retrieval) | **Durable** |
| `src/context-builder/` | Platform capability — deterministic context assembly (SPEC-002) | **Durable** |
| `src/knowledge/` | Platform capability — knowledge compilation and wiki generation (ARCH-002, SPEC-005/006) | **Durable** |
| `src/end-of-session/` | Platform capability — the end-of-session workflow (SPEC-003) | **Durable** |
| `src/ingestion/` | Platform capability — source ingestion contracts and connectors | **Durable** |
| `src/handbook/` | Durable capability layer — framework-agnostic handbook access, reusable by a future MCP transport | **Durable** |
| `src/products/` | Products composed on the platform (Knowledge Assistant) | **Durable** |
| `src/cli/` | Entry point — the `aj` command (`CLI → Product → Platform`) | **Durable** |
| `src/agent/` | Durable capability layer — the first AI agent (handbook Q&A + inbox capture) | **Durable** |
| `src/config/` | Process/environment configuration (dotenv + Zod) used by the agent and API transport | **Durable** (distinct from `platform/config`'s `aj.config.json` service; see REX F-055) |
| `src/api/` | **Temporary transport** — the HTTP surface for the agent, supported until an MCP transport replaces it | **Transitional** — supported, not deprecated |

Every top-level `src/` module appears in this table. A test enforces that
(`tests/architecture/module-taxonomy.test.ts`): add a module without a row here
and it turns red.

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
- **File names describe the role of the file's primary export**, in that
  export's own casing:
  - **PascalCase** when the file *is* a type, class, or interface —
    `ConfigService.ts` exports `class ConfigService`.
  - **camelCase** when the file's primary export is a factory, function, or
    executable module — `createContextBuilder.ts`, `wikiKnowledgeProvider.ts`,
    `systemPrompt.ts`. A factory named `createX` lives in `createX.ts`, even when
    it also exports a `XError` or `XOptions`.
  - **lowercase** for conventional role-files: `index.ts`, `types.ts`,
    `schema.ts`, `errors.ts`.
  - **No kebab-case.** A name communicates the export's semantic role, not visual
    uniformity.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org)
  (`feat(context-builder): …`, `docs: …`, `refactor(retrieval): …`).
- **Pull requests:** solve one problem, preserve the architecture, keep the
  project in a working state, and remain easy to review.
- **Documentation is part of the implementation** — if a change affects
  architecture, workflow, or a public interface, update the docs in the same PR.

Questions and design discussions are always welcome — opening a discussion before
a large change is encouraged.
