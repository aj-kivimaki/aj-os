# Security Policy

AJ-OS is a personal project with a single maintainer, **developed in the open**. This policy says
what that means in practice, so you know what to expect before you rely on it.

## Reporting a vulnerability

Please report privately via **[GitHub Security Advisories](https://github.com/aj-kivimaki/aj-os/security/advisories/new)**
rather than opening a public issue.

**What to expect:** a best-effort response. This is one person's project, not a funded product —
there is **no response-time commitment**, and promising one would be dishonest. If a report is
valid and I can fix it, I will; if I cannot, I will say so.

## Supported versions

**Only `main`.** There are no maintained release branches and no backports. If you are running an
older commit, the fix is to update.

## What is in scope

The parts of AJ-OS that handle secrets or touch the filesystem on your behalf:

- **Secret handling** — `ANTHROPIC_API_KEY` and `API_AUTH_TOKEN`. Anything that could log, persist,
  or transmit them.
- **The bearer auth on the Handbook Agent API** (`src/api/`) — `API_AUTH_TOKEN` gates every endpoint
  except `/health`.
- **Path traversal and symlink escape** in the handbook, wiki, and review stores. These deliberately
  confine writes: the wiki generator writes only beneath `handbook.generatedWikiPath`, and
  `aj session end` writes only beneath `handbook.reviewPath` and **refuses a canonical destination**.
  **A way to write outside those roots is a real vulnerability** — please report it.
- **The model boundary** — anything that causes prompt content or model output to escape its intended
  destination.

## What is out of scope

- **The archived v1 code** (`archive/v1/`). Frozen, not maintained, not executed.
- **Your Anthropic API costs.** `aj wiki build` calls the model once per source, by design.
- **Model output quality.** A wrong answer is not a vulnerability.
- **Running the API server on a public interface.** `API_HOST` defaults to `0.0.0.0` so a local
  Docker n8n can reach it. Exposing it beyond your machine is your decision, and the bearer token is
  the only thing between it and the internet.

## Handling secrets

- Never commit `.env`. It is in `.gitignore`; keep it there.
- Generate `API_AUTH_TOKEN` from a strong source — `openssl rand -hex 32`. The server requires at
  least 16 characters and fails fast if it is missing.
