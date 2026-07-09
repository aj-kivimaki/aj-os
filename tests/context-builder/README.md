# Context Builder — Tests

Permanent, deterministic regression suite for the Context Builder platform
service. The suite began as the **contract testing foundation** (task **CB-006**,
Milestone 1) and now also protects the module's platform *behaviour* —
deterministic knowledge collection (Milestone 2) and deterministic knowledge
selection (Milestone 3). It is the reference test implementation for future AJ-OS
platform services.

## Running

```bash
npm test         # run once (vitest run)
npm run test:watch
```

The suite is deterministic and fast: no filesystem, network, randomness or
timing dependencies; fixed literal timestamps; it runs in well under a second.
Current size: **160 tests across 13 files**.

## What is tested

Every test imports from the module's **public entry point**
(`src/context-builder/index.js`) only — never an internal file. Testing through
the public surface makes "test contracts, not implementation" a structural
guarantee, and keeps internal machinery — most notably the Selection Policy
(comparators, predicates, duplicate helpers) — free to evolve.

### Contracts & foundation (CB-006 — Milestone 1)

| File                | Contract under test                                                              |
| ------------------- | -------------------------------------------------------------------------------- |
| `config.test.ts`    | Configuration contract — validation, strictness, immutability, value sets        |
| `package.test.ts`   | Context Package — schema, runtime validation, structural invariants, deep freeze |
| `providers.test.ts` | `KnowledgeRequest`, `KnowledgeItem`, provider metadata, `KnowledgeProvider`      |
| `registry.test.ts`  | Provider Registry — construction, lookup, validation, order, immutability        |
| `factories.test.ts` | Factory APIs — `createContextBuilder()`, `createProviderRegistry()`              |

### Collection behaviour (Milestone 2)

| File                           | Behaviour under test                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| `collection.test.ts`           | Collection Engine service boundary (CB-007)                            |
| `collection-errors.test.ts`    | CollectionError contract (CB-008)                                      |
| `collection-result.test.ts`    | CollectionResult contract (CB-009)                                     |
| `collection-execution.test.ts` | Provider execution & determinism — `CollectionEngine.collect` (CB-010) |

### Selection behaviour (Milestone 3)

| File                               | Behaviour under test                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| `selection-result.test.ts`         | SelectionResult contract (CB-014)                                     |
| `selection.test.ts`                | Selection Engine service boundary (CB-013)                            |
| `selection-execution.test.ts`      | `SelectionEngine.select` behaviour + Selection Policy (CB-015/CB-016) |
| `context-builder-pipeline.test.ts` | `build(request)` pipeline & end-to-end orchestration (CB-017)         |

The `build(request)` pipeline suite (CB-018) proves the Context Builder is a thin
orchestrator by asserting `build(request)` deep-equals a manual two-engine
composition (`select(collect(request))`) over the same registry. Engine-level
collection behaviour is owned by `collection-execution.test.ts` (CB-010) and is
not re-tested at the builder level; the Milestone 2 era
`context-builder-collection.test.ts` was retired when `ContextBuilder.collect` was
superseded by `build(request)` (CB-017), with no loss of coverage.

## Build integration

`tsconfig.json` scopes the compiler to `src` (`"include": ["src"]`), so
`npm run build` (`tsc`) and `npm run typecheck` own production code and never
compile test sources. Vitest transforms and runs the tests under `tests/`,
resolving the codebase's `.js` ESM import specifiers to their `.ts` sources.
Test sources live outside `rootDir` and are owned by the test runner, keeping
`npm run build` green.
