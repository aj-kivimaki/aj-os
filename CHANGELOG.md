# Changelog

All notable changes to AJ-OS are documented in this file.

The format is based on **Keep a Changelog**, and this project follows **Semantic Versioning**.

---

## [Unreleased]

### Added

- Context Builder foundation (SPEC-002, Milestone 1) — the first platform service module (`src/context-builder/`), exposing immutable platform contracts and core services through a single public entry point:
  - Public configuration contract and `createContextBuilder()` factory (CB-002)
  - Context Package contract implementing AJS-002 Appendix B (CB-003)
  - Knowledge Provider contracts — `KnowledgeRequest`, `KnowledgeItem`, `KnowledgeProvider` (CB-004)
  - Immutable Provider Registry via `createProviderRegistry()` (CB-005)
  - Contract-testing foundation (Vitest, `npm test`) targeting the module's public surface (CB-006)
- Context Builder knowledge collection (SPEC-002, Milestone 2) — the module's first platform *behaviour*: deterministic, partial knowledge collection, built on the frozen Milestone 1 contracts:
  - Collection Engine service via `createCollectionEngine()` (CB-007)
  - Collection Error contract — `CollectionError`, `parseCollectionError()`, closed `FAILURE_CATEGORIES` (CB-008)
  - Collection Result contract — `CollectionResult` aggregating items + errors, `parseCollectionResult()` (CB-009)
  - Deterministic partial provider execution — `CollectionEngine.collect()`; a single provider failure never aborts collection and registry order is authoritative (CB-010)
  - End-to-end Context Builder collection pipeline — `ContextBuilder.collect()` (CB-011)
  - Permanent collection behaviour tests; the suite grew from 63 → 119 tests (CB-012)
- Context Builder knowledge selection (SPEC-002, Milestone 3) — the module's second platform *behaviour*: deterministic knowledge selection over the immutable `CollectionResult`, built on the frozen Milestone 1/2 contracts and introducing no new provider execution or collection:
  - Selection Engine service via `createSelectionEngine()` (CB-013)
  - SelectionResult contract — `SelectionResult` (ordered `selectedItems` + `excludedItems` + provenance metadata), `parseSelectionResult()`; the canonical ordering of `selectedItems` is the contract and there is no explicit priority field (CB-014)
  - Deterministic Selection Policy — an executable comparator chain terminating in an immutable identifier (`KnowledgeItem.id`), with evaluation, filtering, and exact-duplicate elimination; no scoring algorithms or ranking heuristics (CB-015)
  - Selection execution — `SelectionEngine.select()` applies the policy to a `CollectionResult` and returns an immutable `SelectionResult` (CB-016)
  - End-to-end Context Builder selection pipeline — `ContextBuilder.build(request)` runs Collection → Selection and returns the `SelectionResult` unchanged (CB-017)
  - Permanent selection behaviour and `build()` pipeline tests; the suite grew from 119 → 160 tests (CB-018)
- Context Builder context assembly (SPEC-002, Milestone 4) — the module's third platform *behaviour*: deterministic, structural assembly of an immutable `ContextPackage` (AJS-002 Appendix B) over the ordered `SelectionResult`, built on the frozen Milestone 1/2/3 contracts and introducing no new provider execution, collection, or selection:
  - Assembly Engine service via `createAssemblyEngine()` — a stateless, construction-dependency-free boundary (CB-019)
  - Deterministic section-composition strategy — a total, purely structural `source.type → section-kind` mapping with an order-preserving partition and the four always-present empty Appendix B sections (CB-020)
  - Assembly inputs & metadata composition — a closed two-input `assemble` set (`SelectionResult` + injected `generatedAt`, no ambient clock) with single-sourced `contextVersion` and `contextBuilderVersion` (CB-021)
  - Deterministic assembly — `AssemblyEngine.assemble(selectionResult, generatedAt)` constructs the package **through** the frozen `parseContextPackage()` contract; identical inputs yield a deep-equal, deeply-frozen package (CB-022)
  - Full Context Builder pipeline — `ContextBuilder.build(request)` now runs Collection → Selection → Assembly and returns an immutable `ContextPackage`; the timestamp source is injected at construction and the builder remains a thin orchestrator (CB-023)
  - Permanent assembly behaviour tests, validated only through the public API; the suite grew from 160 → 205 tests (CB-024)
  - Assembly is *structural only* — rendering (Markdown/JSON), explainability computation, and context profiles remain deferred to later milestones (AD-003, AD-009)
- **AJS-007 — Engineering Lifecycle Standard** (Draft) — a new AJ-OS platform standard that consolidates the validated milestone-delivery engineering practice (planning → planning freeze → implementation → freeze review → milestone freeze → retrospective) into a single canonical reference, derived from SPEC-002 implementation experience (`docs/standards/AJS-007-Engineering-Lifecycle-Standard.md`)

### Changed

- `createContextBuilder(config)` → `createContextBuilder(config, registry)` — the factory now takes a required Provider Registry, from which it composes the Collection Engine it owns (SPEC-002, CB-011; a reviewed, approved contract evolution)
- `ContextBuilder.collect(request)` → `ContextBuilder.build(request)` — the Context Builder now exposes a single public pipeline entry point, `build(request)`, which runs Collection → Selection and returns the `SelectionResult` unchanged; the Milestone 2 collection behaviour is preserved unchanged as the internal `CollectionEngine.collect(request)` stage operation (SPEC-002, CB-017; a reviewed, approved public API evolution)
- `ContextBuilder.build(request)` return type advanced `SelectionResult` → `ContextPackage` — with Milestone 4, `build(request)` runs the full Collection → Selection → Assembly pipeline and returns an immutable `ContextPackage`; the `build` **input** signature is unchanged (the timestamp source is injected at construction as an optional, backward-compatible third `createContextBuilder` argument) (SPEC-002, CB-023; the pre-approved CB-017 return-type evolution)
- REST API server built on Fastify (`npm run serve`), the first runtime interface alongside the sync CLI
- `GET /health` liveness endpoint
- Handbook AI agent (Claude, via `POST /agent/ask`) that answers questions grounded in the handbook wiki using a tool-use loop
- Handbook capability layer (`src/handbook/`) with path-safe, wiki-scoped reads and inbox-scoped writes, reused by the agent and the API
- Inbox capture endpoints `POST /inbox/note` and `POST /inbox/file` for writing to the handbook `workspace/inbox/`
- Bearer-token authentication (`API_AUTH_TOKEN`) on all API routes except `/health`
- n8n workflows for driving the agent from a chat window and from a phone via Telegram (`infrastructure/n8n/workflows/`)
- Agent/API configuration (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `HANDBOOK_PATH`, `API_PORT`, `API_HOST`, `API_AUTH_TOKEN`) and `serve` / `serve:prod` scripts

### Planned

- Repository integration and Notion-backed business endpoints (Projects, Portfolio, CRM, Dashboard, Business Health)
- Additional Business Rules
- Morning Brief
- Automation
- Analytics
- Additional business modules

---

## [1.0.0] - 2026-06-28

### Added

- Code-first business operating system architecture
- Workspace Synchronization
- CEO Dashboard
- Module Registry
- Schema Engine
- Translation Layer
- Application Layer
- Projects module
- CRM module
- Portfolio module
- Production Music module
- Finance module
- Game Jams module

### Changed

- Replaced one-time database creation with Workspace Synchronization
- Added automatic relation synchronization
- Updated the Notion SDK integration to use the supported public API surface
- Reorganized the documentation into a layered architecture with dedicated guides, module documentation and Architecture Decision Records (ADRs)

### Fixed

- Restored compatibility with clean installations after dependency updates
- Eliminated reliance on private Notion SDK imports
- Improved compatibility with the current `@notionhq/client` API

### Documentation

- Complete architecture documentation
- Business module documentation
- Installation, configuration and development guides
- AI-assisted engineering workflow documentation
- Documentation index
- Updated README
- CONTRIBUTING guide
- ROADMAP
- CHANGELOG
