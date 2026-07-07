# Decision: CB-001 Scaffold Scope

> **Task:** CB-001 — Establish Context Builder Module
> **Date:** 2026-07-07
> **Status:** Accepted

---

## Context

CB-001's *Expected Outputs* shows a full nine-folder module tree and lists a
top-level `tests/` directory. Its *Implementation Notes* also say to "avoid
premature abstractions" and to not "create placeholder classes or unnecessary
files." Git cannot track empty folders, and `tsconfig.json` sets
`rootDir: ./src` with no test runner installed. These constraints pull in
opposite directions, so the breadth of the scaffold was an explicit decision.

## Decision

1. **Minimal folder scaffold.** Create only `src/context-builder/index.ts`
   and `src/context-builder/README.md`. Subfolders (`config/`, `providers/`,
   `collector/`, `ranking/`, `package/`, `profiles/`, `explainability/`,
   `types/`, `utils/`) are created by the later tasks that introduce their
   code, rather than pre-created as empty `.gitkeep` placeholders.

2. **Tests folder as placeholder.** Create `tests/context-builder/README.md`
   with no test code. A top-level `tests/` tree containing `.ts` files would
   break `npm run build` (`tsc`, `rootDir: ./src`), and no test runner exists
   yet. The testing framework is a separate M1 foundation deliverable.

## Rationale

- Honours the task's explicit guidance against unnecessary files and premature
  abstraction.
- Keeps `npm run build` green with no configuration changes to frozen tooling.
- Matches the existing `src/agent/` module convention (flat module, barrel
  `index.ts`), keeping the repository structure consistent.

## Consequences

- The example's full tree is not materialised up front; each future task owns
  the creation of its own folder. The module README documents this intent so
  the structure remains discoverable.
- A later M1 task must configure the test runner and its compilation path
  before test files can live under `tests/`.

## Alternatives Considered

- **Full nine-folder scaffold with `.gitkeep` markers** — matches the example
  literally but introduces nine empty placeholder files with no code, which the
  task guidance discourages.
- **Co-locating tests under `src/context-builder/__tests__/`** — keeps tests
  under `rootDir`, but diverges from the example's top-level `tests/` location
  and would still lack a runner.
