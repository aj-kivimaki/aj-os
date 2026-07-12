# AJ-OS v1 — Archived Implementation (source code)

> **Status: Archived (superseded).** This is the source code of AJ-OS v1 — the
> code-first Notion **business** operating system. It is preserved, frozen, for
> historical reference.
>
> It is **not part of the active build**: it lives outside `src/`, so `tsc` /
> `npm run build` and the Vitest suite do not include it, and **no active v2 code
> imports it**.

For AJ-OS as it exists today, see [`docs/VISION.md`](../../docs/VISION.md) and
[`docs/architecture/`](../../docs/architecture/). For the v1 **documentation**
(architecture, ADRs, modules, API, AI context), see
[`docs/archive/v1/`](../../docs/archive/v1/README.md).

## What is here

`src/` mirrors the v1 application's original layout, so its internal relative
imports remain intact:

- `index.ts` — the sync entry point (invoked by `npm run sync` in v1).
- `application/` — the workspace synchronization orchestrator.
- `modules/` — business modules: Projects, CRM, Portfolio, Production Music,
  Finance, Game Jams.
- `notion/` — the Notion client/translation layer.
- `schema/` — the schema engine.
- `dashboard/` — the CEO Dashboard generator.
- `config/env.ts` — the v1 environment loader (Notion configuration).

## Why it is frozen, not maintained

This code depends on `@notionhq/client` and on the v1 architecture throughout.
Per the project's guiding principle, the archive preserves history but does not
keep historical designs active: if AJ-OS needs Notion again, it will be
redesigned as a context **provider** from the current architecture, not revived
from this code.
