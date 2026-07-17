# Installation

How to install AJ-OS and run the Knowledge Assistant for the first time. For what
AJ-OS _is_, see [VISION](../VISION.md); for every setting, see the
[configuration guide](configuration.md).

## Requirements

- **Node.js 22+** and npm
- An **[Anthropic API key](https://console.anthropic.com/)** — used to generate the
  wiki and to answer questions
- A **handbook** — a directory with `foundation/` and `library/` inside it (see
  below). You do **not** need to bring a pre-generated wiki; AJ-OS builds it.

### What the handbook must look like

`aj wiki build` reads its sources from two directories, and **both must exist**:

```text
<handbook.path>/
├── foundation/        your durable notes — read as sources
├── library/           reference material — read as sources
└── wiki-generated/    created by `aj wiki build`; do not hand-edit
```

Put your markdown notes in `foundation/` and/or `library/`. **If either directory
is missing, `aj wiki build` fails** with `Source directory does not exist` — so
create both, even if one starts empty. Anything else in the handbook is left
alone: AJ-OS only reads those two directories and only writes the generated wiki.

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

Install the `aj` command once, then build the wiki and ask a question:

```bash
npm run build && npm link
aj wiki build                               # compile your handbook into a wiki
aj ask "How does the Context Builder work?"
```

Or run straight from source, without linking:

```bash
npm run dev -- wiki build
npm run dev -- ask "How does the Context Builder work?"
```

> **`aj wiki build` comes first.** The Assistant answers from a **generated wiki**,
> not from raw notes — so the wiki must exist before `aj ask` can cite anything.
> `aj wiki build` compiles your handbook's sources into it, including the
> `index.md` catalog the Assistant retrieves from. Producer and consumer meet
> through one setting, `handbook.generatedWikiPath` (default `wiki-generated`);
> neither knows about the other. **The first build calls the model once per
> source, so it takes a few minutes and costs money.** It is incremental
> afterwards — unchanged sources are skipped. `aj wiki build --rebuild`
> regenerates from scratch, clearing only the generator's own outputs.

## Capture a session

Once you are working in a repository, `aj session end` turns the session into
candidate knowledge for review:

```bash
aj session end --notes "what the diff cannot show"
```

It reads the session's git changes, extracts the reusable knowledge, and writes
candidates to `<handbook>/knowledge-review/pending/<session-id>/`.

| Flag | Purpose |
| ---- | ------- |
| `--notes <text>` | Your account of the session — what the diff cannot show. Reaches the model verbatim, as context rather than instruction. |
| `--since <ref>` | Measure from `<ref>` instead of the working tree. Absent, the range is the complete uncommitted working state. |

**It never commits, never generates the wiki, and never modifies canonical
knowledge** — every write lands in the non-canonical review area.

Reviewing those candidates is a human step today; the workflow that will govern
it is [SPEC-004](../specifications/SPEC-004-Knowledge-Review-Workflow.md).

## Troubleshooting

- **"No generated wiki."** Run `aj wiki build`. The Assistant reads the generated
  wiki, and on a fresh install it does not exist yet.
- **Missing or invalid API key.** Both `aj wiki build` and `aj ask` need a valid
  `ANTHROPIC_API_KEY` in `.env`, and report this clearly.
- **`Source directory does not exist: foundation`** — or `library`. `aj wiki build`
  requires **both** directories inside `handbook.path`. Create them and re-run;
  an empty one is fine. This currently surfaces as an uncaught stack trace rather
  than a friendly message, which is a known rough edge, not a broken install.
- **Wrong handbook path.** Ensure `aj.config.json` → `handbook.path` points at
  your handbook directory. AJ-OS creates the generated wiki inside it, at
  `handbook.generatedWikiPath` (default `wiki-generated`).
- **`aj: command not found`.** Run `npm run build && npm link`. `npm link` points
  at the compiled output, so a build must come first.

## Next steps

- [Configuration guide](configuration.md) — every setting, plus the Handbook Agent/API.
- [Development guide](development.md) — build, test, and run from source.

> The original v1 Notion implementation is preserved, frozen, in the
> [v1 archive](../archive/v1/README.md) — it is no longer part of the active system.
