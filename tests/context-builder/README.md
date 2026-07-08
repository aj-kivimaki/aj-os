# Context Builder — Tests

Permanent **contract testing foundation** for the Context Builder (task
**CB-006**). These tests protect the public platform contracts established
during CB-001→CB-005 and are the reference implementation for future AJ-OS
platform services.

## Running

```bash
npm test         # run once (vitest run)
npm run test:watch
```

The suite is deterministic and fast: no filesystem, network, randomness or
timing dependencies; fixed literal timestamps; it runs in tens of milliseconds.

## What is tested

Every test imports from the module's **public entry point**
(`src/context-builder/index.js`) only — never an internal file. Testing through
the public surface makes "test contracts, not implementation" a structural
guarantee.

| File                 | Contract under test                                                        |
| -------------------- | -------------------------------------------------------------------------- |
| `config.test.ts`     | Configuration contract — validation, strictness, immutability, value sets  |
| `package.test.ts`    | Context Package — schema, runtime validation, structural invariants, deep freeze |
| `providers.test.ts`  | `KnowledgeRequest`, `KnowledgeItem`, provider metadata, `KnowledgeProvider` |
| `registry.test.ts`   | Provider Registry — construction, lookup, validation, order, immutability  |
| `factories.test.ts`  | Factory APIs — `createContextBuilder()`, `createProviderRegistry()`        |

Out of scope (per CB-006): provider implementation tests, integration/E2E,
performance and benchmarking.

## Build integration

`tsconfig.json` scopes the compiler to `src` (`"include": ["src"]`), so
`npm run build` (`tsc`) and `npm run typecheck` own production code and never
compile test sources. Vitest transforms and runs the tests under `tests/`,
resolving the codebase's `.js` ESM import specifiers to their `.ts` sources.
This is the separation the CB-001 iteration of this note anticipated: test
sources live outside `rootDir` and are owned by the test runner, keeping
`npm run build` green.
