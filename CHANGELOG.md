# Changelog

All notable changes to AJ-OS are documented in this file.

The format is based on **Keep a Changelog**, and this project follows **Semantic Versioning**.

---

## [Unreleased]

### Added

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
