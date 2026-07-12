# AJ-OS v1 — Archived Implementation

> **Status: Archived (superseded).** This documents an earlier generation of
> AJ-OS and does **not** describe how the project works today. It is preserved,
> frozen, as a technical record. For AJ-OS as it exists now, see
> [`docs/VISION.md`](../../VISION.md) and
> [`docs/architecture/`](../../architecture/).

## What v1 was

AJ-OS v1 was a **code-first Notion business operating system.** The business was
modeled in TypeScript as the single source of truth and synchronized into a
Notion workspace: business modules → schema engine → translation layer →
application layer → a generated CEO dashboard. Notion was treated as an
execution target, not the source of truth.

This generation has been superseded by the current platform, whose purpose is to
maintain **working context** (see [`docs/VISION.md`](../../VISION.md)). Notion is
now understood as one possible context source, rather than the center of the
system.

## What is archived here

- [`architecture/`](architecture/README.md) — the v1 layered architecture:
  schema engine, module registry, translation layer, application layer,
  workspace synchronization, CEO dashboard, and business rules.
- [`adr/`](adr/README.md) — the v1 architecture decision records (001–007).
- [`modules/`](modules/README.md) — the v1 business modules: Projects, CRM,
  Portfolio, Production Music, Finance, and Game Jams.

These documents are frozen. References inside them point to other v1 documents
as they existed at the time.
