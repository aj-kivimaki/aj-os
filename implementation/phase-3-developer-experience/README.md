# Phase 3 — Developer Experience

**Status:** In progress.

Once the core platform services (Phase 2) are complete, implementation shifts to
workflows and applications that *consume* the platform rather than extend its
foundations.

## Packages

| Package | Status |
| ------- | ------ |
| [repository-excellence/](repository-excellence/) — **REX, Repository Excellence Review** | Package planning **FROZEN** (reviewer: AJ, 2026-07-17). M1 awaiting its Planning Review. |

**REX** is a **non-specification engineering quality package** — the first work in this phase. It
runs between SPEC-003 (complete) and SPEC-004 (not started), and elevates the repository to a
production-quality standard while preserving every frozen architectural decision. It has no SPEC
by design; see [REX-D0](repository-excellence/decisions/REX-D0.md).

## Still planned for this phase

- **Project Kickoff Workflow (SPEC-001)** — intentionally postponed until more of
  the core platform is operational, so it can be built as an early workflow on
  top of the platform.

Supporting platform services (Search, Logging, Agent Registry, Workflow
Registry, Notification Service) may expand as implementation reveals reusable
capabilities.

See the top-level [ROADMAP.md](../../ROADMAP.md) for the current plan.
