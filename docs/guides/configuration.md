# Configuration

Reference for AJ-OS settings. To get running quickly, follow the
[installation guide](installation.md) first.

AJ-OS reads configuration from two places:

- **`aj.config.json`** — where the handbook is, and where AJ-OS writes inside it.
  Used by every `aj` command.
- **`.env`** — secrets and service settings (API keys, the Agent/API server).

## The `aj` CLI (`aj ask`, `aj wiki build`, `aj session end`)

`aj.config.json`:

```json
{
  "handbook": {
    "path": "/path/to/your/handbook",
    "generatedWikiPath": "wiki-generated",
    "reviewPath": "knowledge-review"
  }
}
```

| Setting | Required | Purpose |
| ------- | -------- | ------- |
| `handbook.path` | yes | The handbook directory. Must exist. |
| `handbook.generatedWikiPath` | no | Where the generated wiki lives, **relative to `handbook.path`**. Default **`wiki-generated`**. |
| `handbook.reviewPath` | no | Where candidate knowledge awaits review, **relative to `handbook.path`**. Default **`knowledge-review`**. |

Only `handbook.path` is required — `aj.config.example.json` shows the minimum.
The other two have working defaults, and you only set them if your vault is laid
out differently.

**The two optional settings are contracts, not preferences.**

- **`generatedWikiPath` is the producer → consumer seam.** `aj wiki build` writes
  the wiki there; `aj ask` reads it from there. Neither knows about the other —
  they meet only through this setting. Change it and both follow.
- **`reviewPath` is the capture → review seam.** `aj session end` writes
  candidates to `<handbook>/<reviewPath>/pending/<session-id>/`, and the Knowledge
  Review workflow ([SPEC-004](../specifications/SPEC-004-Knowledge-Review-Workflow.md))
  will read them from there.

Both resolve **inside** the handbook, so AJ-OS remains the sole producer of what
it generates. `aj session end` refuses to write to a canonical knowledge area, and
that refusal is enforced at the boundary rather than by convention.

`.env`:

| Variable            | Required | Purpose                                       |
| ------------------- | -------- | --------------------------------------------- |
| `ANTHROPIC_API_KEY` | yes      | Anthropic key used to generate the wiki, answer questions, and extract session knowledge |
| `ANTHROPIC_MODEL`   | no       | Model id; a built-in default is used if unset |

The CLI locates its handbook via `aj.config.json` — **not** `HANDBOOK_PATH`. That
variable belongs to the Handbook Agent / API server below, which is a separate
subsystem with its own configuration.

## Handbook Agent / API server (`npm run serve`)

Only needed to run the REST API and Handbook agent; the Assistant CLI does not use
these. The agent itself is documented in [api/agent.md](../api/agent.md).

| Variable            | Required | Purpose                                                                 |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | yes      | Powers the agent                                                        |
| `ANTHROPIC_MODEL`   | no       | Model id (default applied if unset)                                     |
| `HANDBOOK_PATH`     | yes      | Absolute path to the handbook the agent reads/writes                    |
| `API_PORT`          | no       | HTTP port (default `3000`)                                              |
| `API_HOST`          | no       | Bind address (default `0.0.0.0`; keep so Docker n8n can reach the host) |
| `API_AUTH_TOKEN`    | yes      | Bearer token clients must send; at least 16 characters                  |

The server fails fast with a clear message if a required variable is missing.

## Why there are two configuration systems

AJ-OS has **two configuration mechanisms on purpose**, one per transport:

| System | Governs | Source | Code |
| --- | --- | --- | --- |
| `aj.config.json` service | the **CLI / platform** (`aj ask`, `aj wiki build`, `aj session end`) | a committed `aj.config.json` (`handbook.path`, `handbook.generatedWikiPath`, `handbook.reviewPath`) | `src/platform/config` (`ConfigService`) |
| dotenv / env | the **Agent + HTTP API transport** (`npm run serve`) | `.env` process variables (`HANDBOOK_PATH`, `API_AUTH_TOKEN`, …) | `src/config` (`appEnv`, `agentEnv`) |

They are **separate because they serve separate transports** — a locally-run CLI
configured by a project file, and a long-running server configured by its
environment (Docker/n8n). Each has its own handbook-path variable
(`handbook.path` vs `HANDBOOK_PATH`) and its own validation style.

**Unifying them is deliberately deferred**, not overlooked: merging two working
config systems is platform evolution, not a quality cleanup (Repository
Excellence scope guard), and the split is most likely to resolve naturally when
the API transport is replaced by an MCP transport. Until then, use `aj.config.json`
for the CLI and `.env` for the server; they do not share state.
*(Recorded by REX-404; see also the `src/config` row in [CONTRIBUTING § module map](../../CONTRIBUTING.md#where-every-module-lives).)*

## Security

- Never commit `.env`, API keys, or tokens; ensure `.env` is in `.gitignore`.
- Generate `API_AUTH_TOKEN` from a strong source, e.g. `openssl rand -hex 32`.
