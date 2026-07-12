# Development

Practical guide to building, testing, and running AJ-OS from source.

This guide is *how-to* only. For the engineering **lifecycle**, see
[AJS-007](../standards/AJS-007-Engineering-Lifecycle-Standard.md); for
**contribution rules** (PRs, commits, the platform/product boundary), see
[CONTRIBUTING](../../CONTRIBUTING.md); for **architecture**, see
[ARCH-001](../architecture/ARCH-001-AJ-OS-Platform-Architecture.md).

## Commands

```bash
npm install        # install dependencies
npm run typecheck  # type-check (tsc --noEmit)
npm run build      # compile to dist/
npm test           # run the test suite (vitest)
npm run test:watch # tests in watch mode
```

## Running from source

```bash
# Knowledge Assistant (CLI)
npm run dev -- ask "…"      # from source
aj ask "…"                   # after `npm run build && npm link`
aj ask "…" --debug           # with retrieval/assembly diagnostics

# Handbook Agent / API server
npm run serve                # development (tsx)
npm run serve:prod           # after `npm run build`
```

Settings for each are in the [configuration guide](configuration.md).

## Orchestration (optional)

n8n runs in Docker for chat/Telegram access to the agent:

```bash
npm run infra:up     # start
npm run infra:logs   # tail logs
npm run infra:down   # stop
```

Setup: [infrastructure/n8n/README.md](../../infrastructure/n8n/README.md).

## Repository workflow

- Branch for your change; keep it small and focused on one problem.
- Before opening a pull request, ensure `npm run typecheck`, `npm run build`, and
  `npm test` pass.
- Follow the commit and PR conventions in [CONTRIBUTING](../../CONTRIBUTING.md).

## Debugging

- `aj ask "…" --debug` prints retrieval and assembly diagnostics.
- The API server fails fast with a clear message when a required environment
  variable is missing — see the [configuration guide](configuration.md).
