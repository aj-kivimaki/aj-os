# Installation

How to install AJ-OS and run the Knowledge Assistant for the first time. For what
AJ-OS _is_, see [VISION](../VISION.md); for every setting, see the
[configuration guide](configuration.md).

## Requirements

- **Node.js 22+** and npm
- An **[Anthropic API key](https://console.anthropic.com/)** — the Assistant uses it to generate answers
- A **handbook with a generated `wiki/`** (see the prerequisite note below)

## Install

```bash
git clone https://github.com/aj-kivimaki/aj-os.git
cd aj-os
npm install
```

## Configure the minimum to run

Two settings are enough to ask your first question; the
[configuration guide](configuration.md) covers the rest.

```bash
cp aj.config.example.json aj.config.json   # set handbook.path
cp .env.example .env                        # set ANTHROPIC_API_KEY
```

- `aj.config.json` → `handbook.path` — the path to your handbook.
- `.env` → `ANTHROPIC_API_KEY` — your Anthropic key.

## Run

Install the `aj` command once, then ask a question:

```bash
npm run build && npm link
aj ask "How does the Context Builder work?"
```

Or run straight from source, without linking:

```bash
npm run dev -- ask "How does the Context Builder work?"
```

> **Prerequisite — a generated wiki.** The Assistant reads a handbook's generated
> `wiki/`, not raw notes. Producing that wiki is the Knowledge Platform's job,
> which is implemented but not yet wired to a runnable command (see the
> [ROADMAP](../../ROADMAP.md)). Until then a pre-generated wiki is required — if
> you see "no generated wiki," that is a known limitation, not a setup mistake.

## Troubleshooting

- **"No generated wiki."** Expected until the wiki generator is wired (see above).
- **Missing or invalid API key.** The Assistant needs a valid `ANTHROPIC_API_KEY`
  in `.env` and reports this clearly.
- **Wrong handbook path.** Ensure `aj.config.json` → `handbook.path` points at a
  handbook that contains a `wiki/` directory.

## Next steps

- [Configuration guide](configuration.md) — every setting, plus the Handbook Agent/API.
- [Development guide](development.md) — build, test, and run from source.

> The original v1 Notion implementation is preserved, frozen, in the
> [v1 archive](../archive/v1/README.md) — it is no longer part of the active system.
