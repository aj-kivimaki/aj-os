# Changelog

All notable changes to AJ-OS are documented in this file.

The format is based on **Keep a Changelog**, and this project follows **Semantic Versioning**.

---

## [Unreleased]

### Added

- **End-of-Session Workflow (SPEC-003) — AJ-OS can now capture what a session
  taught it.** Complete and frozen 2026-07-17 across five milestones
  (EOS-001..007, 101..103, 201..202, 301..303, 401..411).
  - **`aj session end` command** — `[--since <ref>] [--notes <text>]`. Observes
    the session's git changes, extracts reusable knowledge through an injected
    model port, generates canonical candidates, persists them, renders a
    human-readable review package, and reports. A thin entry point: it performs no
    git access and constructs no stage.
  - **Capture only, by design.** The workflow **never commits, never generates the
    wiki, and never modifies canonical knowledge** — every write lands beneath
    `<handbook>/knowledge-review/pending/<session-id>/`. Commits remain an
    orchestration concern (ADR-002); that orchestration layer does not exist yet,
    so **no component performs them**.
  - **`CandidateKnowledge` is the canonical output; the review package is a
    projection** rendered from it (EOS-D4). SPEC-004 will consume the structured
    candidates, never the markdown. The boundary contract is published in
    [CONTRACTS.md](docs/architecture/CONTRACTS.md) and is producer-owned by
    SPEC-003 (EOS-D1, EOS-D5).
  - **A Session is first-class** (EOS-D3) — a stable opaque id; trigger, branch,
    and git state are metadata, never identity.
  - **Review Store** (`src/end-of-session/store/`) — a domain-aware persistence
    adapter (EOS-D6, EOS-D8) that owns the session directory's layout and
    serialization, refuses non-canonical destinations at construction, and guards
    every write against symlink and traversal escape.
  - **Configuration** — `handbook.reviewPath` (default `knowledge-review`),
    mirroring the `generatedWikiPath` pattern.
  - **Automation proposes; humans approve** — every candidate is persisted as a
    candidate, awaiting the review workflow that SPEC-004 will provide.
- **Closed the first loop — AJ-OS generates and consumes its own knowledge.**
  The Knowledge Platform is no longer just a library; a thin entry point now runs
  it end to end.
  - **`aj wiki build` command** — composes the connectors, store, compiler,
    resolver, renderer and merge engine from configuration and runs one
    generation cycle, printing a report. `--rebuild` regenerates from scratch. The
    command performs no git (commits remain an orchestration concern, SPEC-003).
  - **Knowledge Platform Composition Root** (`src/knowledge/composition/`) — the
    single place that assembles the platform into a ready-to-run pipeline, reused
    by the CLI and future callers (End-of-Session, CI, automations).
  - **Configuration contract** — `handbook.generatedWikiPath` (default
    `wiki-generated`) is the shared seam between producer and consumer: the Wiki
    Generator writes it and the Knowledge Assistant reads it, neither aware of the
    other.
  - **Corpus catalog generation** — the Wiki Generator now writes `index.md`, the
    catalog RetrievalService reads, so `aj ask` answers from the generated wiki.
  - **`--rebuild` reset semantics** — a rebuild first clears exactly the
    generator-owned outputs (`GENERATED_WIKI_ARTIFACTS`, one shared definition)
    via a new path-guarded `WikiStore.removeTree`, preserving anything else in the
    destination. The engine still never deletes headless.
- **Knowledge Platform pipeline (library level)** — the sources → wiki engine
  specified by **ARCH-002** and SPEC-005/006/007, implemented as tested library
  code and now wired to the `aj wiki build` entry point above.
  - **Source Connector (SPEC-006)** — enumerates and normalizes source documents
    into `SourceRecord`s with stable ids and content hashes; filesystem
    implementation (`src/ingestion/`).
  - **Wiki Store (SPEC-007)** — persistence-only read/write of wiki pages, no git
    (`src/knowledge/wiki-store/`).
  - **Wiki Generator (SPEC-005)** — orchestrates the incremental cycle
    (INGEST → RECONCILE → LINT) via `WikiGenerator.run()`, returning a
    `GenerationReport`; never commits and never deletes pages headless
    (`src/knowledge/wiki-generator/`).
  - **Knowledge Compiler** — extracts renderer-agnostic structured knowledge from
    a source behind an LLM port, with an Anthropic implementation
    (`src/knowledge/compiler/`).
  - **Identity Resolvers (ADR-005, ADR-006)** — map candidate entities/concepts to
    canonical identities: deterministic slug baseline, LLM-based semantic
    resolver, and an alias-aware decorator (`src/knowledge/identity/`).
  - **Wiki Renderer & Merge Engine** — render pages from the extraction using
    canonical identities and enrich existing pages without rewriting human-owned
    regions (`src/knowledge/renderer/`, `src/knowledge/compiler/merge.ts`).
- Architecture and decisions for the pipeline: **ARCH-002**, **ADR-002**–**ADR-006**.
- The automated test suite covers the platform, the knowledge pipeline, the
  End-of-Session workflow, the composition roots, and the product — validated
  through each module's public surface, with the model stubbed so the suite runs
  offline and deterministically.

### Planned

- Knowledge Review Workflow (SPEC-004) — human governance of what becomes durable
  knowledge, consuming the candidates `aj session end` produces
- Repository integration and Notion-backed business endpoints (Projects, Portfolio, CRM, Dashboard, Business Health)
- Additional Business Rules
- Morning Brief
- Automation
- Analytics
- Additional business modules

---

## [2.0.0] - 2026-07-11

This release marks the first stable version of the AJ-OS Version 2 platform. It introduces the reusable platform architecture together with the first complete product built upon it: **Knowledge Assistant v1.0.0**.

Version 1.0.0 was the final release of the *original* AJ-OS architecture (the code-first Notion business operating system). Version 2.0.0 begins the AJ-OS Platform architecture introduced by the Version 2 redesign: a reusable, product/platform knowledge platform. Platform and product versions are independent — see `docs/project/versioning-and-releases.md`.

### Included products

- **Knowledge Assistant v1.0.0** — the first AJ-OS product: a command-line assistant (`aj ask`) that answers questions about a configured handbook with grounded, cited responses. One-shot and interactive modes, `--debug` diagnostics, and honest handling of missing knowledge and configuration. Detailed release notes: `implementation/products/knowledge-assistant/release/v1.0.0.md`.

> **Two handbook assistants, one release.** The Handbook AI Agent (`POST /agent/ask`, listed below) is an API/service endpoint intended for integrations and automation; the Knowledge Assistant (`aj ask`) is the first end-user product built on the AJ-OS platform.
>
> As of this release, the repository contains **243 automated tests** across the platform and the product.

### Added

- **Product / Platform architecture** — a three-layer structure (CLI → Product → Platform) with a strict one-way dependency direction, established by building the first product on the platform.
- **Reusable platform capabilities** (introduced with, and consumed by, Knowledge Assistant v1.0.0), each an independent single-purpose service under `src/platform/`:
  - Configuration service — reads and validates `aj.config.json` into a typed config (`src/platform/config/`)
  - Handbook service — locates and validates a handbook's generated `wiki/` (`src/platform/handbook/`)
  - Retrieval service — index-driven keyword retrieval scoped to `wiki/index.md` (`src/platform/retrieval/`)
  - Prompt Renderer — pure, deterministic rendering of a Context Package into a grounded, citable prompt (`src/platform/prompt/`)
  - AI Client — provider-isolated answer generation via Anthropic (`src/platform/ai/`)
- **`aj` command-line interface** — `aj ask` (one-shot and interactive, with `--debug`); `commander`-based entry point and `aj` bin (`src/cli/`)
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
- REST API server built on Fastify (`npm run serve`), the first runtime interface alongside the sync CLI
- `GET /health` liveness endpoint
- Handbook AI agent (Claude, via `POST /agent/ask`) that answers questions grounded in the handbook wiki using a tool-use loop
- Handbook capability layer (`src/handbook/`) with path-safe, wiki-scoped reads and inbox-scoped writes, reused by the agent and the API
- Inbox capture endpoints `POST /inbox/note` and `POST /inbox/file` for writing to the handbook `workspace/inbox/`
- Bearer-token authentication (`API_AUTH_TOKEN`) on all API routes except `/health`
- n8n workflows for driving the agent from a chat window and from a phone via Telegram (`infrastructure/n8n/workflows/`)
- Agent/API configuration (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `HANDBOOK_PATH`, `API_PORT`, `API_HOST`, `API_AUTH_TOKEN`) and `serve` / `serve:prod` scripts
- Engineering documentation set for PRODUCT-001 (`implementation/products/knowledge-assistant/`) — architecture, system walkthrough, decisions, engineering journal, timeline, testing strategy, lessons learned, usage guide, and release notes
- Project governance: **Versioning & Releases** (`docs/project/versioning-and-releases.md`) — the two-axis (platform vs. product) versioning and release policy adopted for AJ-OS

### Changed

- Context Builder Assembly now carries each selected item's content into the assembled section body (previously structural-only), completing a deferred Milestone 4 behaviour behind the existing Context Builder public contract
- `createContextBuilder(config)` → `createContextBuilder(config, registry)` — the factory now takes a required Provider Registry, from which it composes the Collection Engine it owns (SPEC-002, CB-011; a reviewed, approved contract evolution)
- `ContextBuilder.collect(request)` → `ContextBuilder.build(request)` — the Context Builder now exposes a single public pipeline entry point, `build(request)`, which runs Collection → Selection and returns the `SelectionResult` unchanged; the Milestone 2 collection behaviour is preserved unchanged as the internal `CollectionEngine.collect(request)` stage operation (SPEC-002, CB-017; a reviewed, approved public API evolution)
- `ContextBuilder.build(request)` return type advanced `SelectionResult` → `ContextPackage` — with Milestone 4, `build(request)` runs the full Collection → Selection → Assembly pipeline and returns an immutable `ContextPackage`; the `build` **input** signature is unchanged (the timestamp source is injected at construction as an optional, backward-compatible third `createContextBuilder` argument) (SPEC-002, CB-023; the pre-approved CB-017 return-type evolution)

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
