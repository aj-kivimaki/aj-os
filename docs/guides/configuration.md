# Configuration

Reference for AJ-OS settings. To get running quickly, follow the
[installation guide](installation.md) first.

AJ-OS reads configuration from two places:

- **`aj.config.json`** — the Knowledge Assistant's handbook location.
- **`.env`** — secrets and service settings (API keys, the Agent/API server).

## Knowledge Assistant (`aj ask`)

`aj.config.json`:

```json
{
  "handbook": { "path": "/path/to/your/handbook" }
}
```

`.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Anthropic key used to generate answers |
| `ANTHROPIC_MODEL` | no | Model id; a built-in default is used if unset |

The Assistant locates its handbook via `aj.config.json` — **not** `HANDBOOK_PATH`.

## Handbook Agent / API server (`npm run serve`)

Only needed to run the REST API and Handbook agent; the Assistant CLI does not use
these. The agent itself is documented in [api/agent.md](../api/agent.md).

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Powers the agent |
| `ANTHROPIC_MODEL` | no | Model id (default applied if unset) |
| `HANDBOOK_PATH` | yes | Absolute path to the handbook the agent reads/writes |
| `API_PORT` | no | HTTP port (default `3000`) |
| `API_HOST` | no | Bind address (default `0.0.0.0`; keep so Docker n8n can reach the host) |
| `API_AUTH_TOKEN` | yes | Bearer token clients must send; at least 16 characters |

The server fails fast with a clear message if a required variable is missing.

## Security

- Never commit `.env`, API keys, or tokens; ensure `.env` is in `.gitignore`.
- Generate `API_AUTH_TOKEN` from a strong source, e.g. `openssl rand -hex 32`.

## Legacy — Notion sync

`NOTION_API_KEY` and `NOTION_PARENT_PAGE_ID` configure only the **v1** Notion sync
CLI (`npm run sync`), preserved with the v1 record in
[docs/archive/v1/](../archive/v1/README.md). They are not used by the Assistant or
the agent.
