# Decision: CB-006 Contract Testing Foundation

> **Task:** CB-006 — Establish Contract Testing Foundation
> **Date:** 2026-07-08
> **Status:** Accepted

---

## Context

CB-006 establishes the permanent testing foundation that protects the public
platform contracts created during CB-001→CB-005 (configuration, Context Package,
Knowledge contracts, Provider Registry, factory APIs). Until now those contracts
were validated only by throwaway ad-hoc runtime harnesses (never committed);
CB-006 makes that validation permanent and becomes the reference implementation
for future AJ-OS platform services.

The task requires a modern TypeScript test framework, contract-oriented tests,
runtime-validation tests, factory tests, build integration and documentation.
It excludes provider-implementation tests, integration/E2E, performance and
benchmarking, and forbids testing private implementation or introducing
filesystem/network/randomness/timing dependencies. It also forbids modifying
platform contracts unless implementation exposes a genuine defect. The suggested
layout was `tests/context-builder/{config,package,providers,registry,factories}.test.ts`.

Several choices were open and are recorded here.

## Decision

1. **Framework: Vitest.** The task's stated preference, and the right fit — native
   ESM + TypeScript (matches the repo's `type: module`, `nodenext`,
   `verbatimModuleSyntax` setup), fast, and zero configuration ceremony. Added as
   a devDependency with `vitest.config.ts` (node environment,
   `tests/**/*.test.ts`, `globals: false`) and `test` / `test:watch` scripts.

2. **Tests import the public entry point only.** Every test imports from
   `src/context-builder/index.js` — never an internal file. This makes "test
   public contracts, not implementation details" a structural property rather
   than a review-time judgement.

3. **Compiler scoped to `src`; runner owns tests.** The build uses `rootDir:
   ./src`; a `.ts` file under `tests/` would fail `tsc` ("not under rootDir").
   Added `"include": ["src"]` to `tsconfig.json` so `npm run build` and
   `npm run typecheck` own production code, and Vitest owns test
   transform/execution. `npm run typecheck` therefore covers `src` (the shipped
   contract); tests are type-aware in-editor and executed (type-stripped) by the
   runner.

4. **Layout matches the task's five files.** `config`, `package`, `providers`,
   `registry`, `factories`. `factories.test.ts` owns the factory *pattern*
   (frozen plain handle, input validation) to avoid duplicating the schema and
   behaviour assertions that live in `config.test.ts` and `registry.test.ts`.

5. **The `KnowledgeProvider` interface is tested with an in-test stub.** It is a
   behavioural contract (it has a `provide` method), so a minimal fixture
   documents its shape and proves it is implementable — without adding any
   provider behaviour to `src`.

6. **No platform contract was modified.** Implementation exposed no defect; every
   contract validated exactly as authored.

## Rationale

- **Public-surface testing keeps the architecture honest.** If a contract can be
  validated only by reaching into an internal, that is a design smell — the test
  path surfaces it instead of hiding it.
- **Build/runner separation is the standard TS-ESM split.** The build compiles
  shipped code; the runner transforms tests. Scoping `include` is the minimal,
  conventional way to keep both green without a second emit configuration.
- **Determinism by construction.** Pure contracts with fixed literal timestamps
  need no mocks, clocks or fakes; the suite is inherently deterministic and runs
  in tens of milliseconds.

## Consequences

- Every public Milestone-1 contract now has permanent, fast, deterministic
  contract tests (63 tests across 5 files). Milestone 2+ extends this foundation
  rather than re-establishing it.
- `npm run typecheck` covers `src` only. If test type-safety needs to be enforced
  in CI later, add a dedicated test typecheck (e.g. Vitest `--typecheck` or a
  `tsconfig.test.json`) — additive, owned by the task that needs it.
- Deep-immutability contracts (CB-003) are guarded by nested `Object.isFrozen`
  assertions, so a regression in the deep-freeze recursion would fail a test.

## Alternatives Considered

### Option A — Vitest (selected)

Pros: native ESM/TS, fast, minimal config, first-class watch. Matches the repo's
module settings without extra transform wiring.
Cons: another devDependency (acceptable; it is the test toolchain).

### Option B — Node's built-in test runner (`node:test`) + tsx

Pros: no new dependency.
Cons: rougher TS-ESM ergonomics, weaker assertion/reporter story, more manual
wiring. The task explicitly prefers Vitest; no architectural reason overrode it.

### Option C — Jest

Cons: ESM/TS support is heavier to configure and slower here; a poor fit for a
`nodenext` + `verbatimModuleSyntax` codebase. Rejected.

### Selected Option

Option A (Vitest), for the reasons above.

## Other alternatives

- **Placing tests under `src/` (co-located).** Would pull test files into the
  `tsc` build and `dist/`. Rejected — tests must not ship. `tests/` + scoped
  `include` keeps `dist/` free of test artifacts (verified).
- **Testing internal files directly for finer granularity.** Rejected — violates
  the contract-oriented principle; internals are covered transitively through the
  public surface.
- **`.strict()`-parsing a provider as its metadata in registry tests.** Rejected
  for the same reason CB-005 rejected it in implementation: a real provider also
  carries `provide`, so strict parsing would wrongly reject it.

## Validation

- `npm test` — 63 tests across 5 files, all green (~60ms).
- `npm run typecheck` and `npm run build` pass; `dist/` contains no test
  artifacts.
- Contract validation is deterministic: no filesystem, network, randomness or
  timing; timestamps are fixed literals.

## Future Review

- Revisit if CI needs test-source type enforcement (add a dedicated test
  typecheck) or coverage reporting. Both are additive and unnecessary for the
  foundation itself.
- M2 provider tests, M3 collection tests, etc. extend this foundation using the
  same public-entry, deterministic conventions.

## Related Documents

Architecture

- ARCH-001

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-001→CB-005 (contracts protected here), CB-006 (this task). Completes
  Milestone M1.

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *A test's import path is an architectural assertion.*
Import contract tests exclusively from a module's public entry point. When a test
can reach its target only through an internal file, treat it as a signal to fix
the design or the public surface — not as license to deepen the import. This
makes "test contracts, not implementation" enforceable by inspection rather than
by reviewer discretion.

**Carried-forward recommendation (from CB-004/CB-005):** the insertion-order +
`Object.freeze` / `deepFreeze` + `DeepReadonly` immutability idiom now recurs
across `config/`, `package/`, `providers/` and `registry/`, and is now also the
subject of repeated immutability assertions in the tests. When those utilities
are promoted to a shared internal module, the corresponding test helpers are a
candidate to consolidate too. Recorded as a recommendation only; no AJS document
is modified.

## Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-08 | 1.0     | Decision created |
