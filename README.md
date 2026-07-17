# AJ-OS

> **AJ-OS is a personal operating system whose purpose is to maintain an
> accurate, evolving working context for its user's work.**

It continuously collects, organizes, maintains, and exposes the **working
context** needed to do the work — so that every project makes the next one
easier.

AJ-OS is not any single tool. It is a platform of subsystems that together turn
one loop:

```text
Work → durable, reviewed knowledge → maintained working context → better work → (repeat)
```

**No subsystem is the point. The point is the loop they form.**

For the full identity — what AJ-OS is, why it exists, and what belongs inside
it — read **[docs/VISION.md](docs/VISION.md)**, the project's source of truth.

> **Built first for its author** (focused on software-development and
> game-audio work), and **developed in the open** so others can adapt it to
> their own work.

---

## How it works

AJ-OS sits underneath the tools where work already happens (GitHub, Jira,
Notion, Obsidian, a calendar) and **connects them through shared context** — it
does not replace them. Each subsystem serves one part of the loop:

| Subsystem | Role | Documented in |
| --- | --- | --- |
| **Context Builder** | Assembles context deterministically (Collection → Selection → Assembly) | [SPEC-002](docs/specifications/SPEC-002-Context-Builder-Agent.md) |
| **Knowledge Platform** | Compiles durable knowledge into a generated wiki | [ARCH-002](docs/architecture/ARCH-002-Knowledge-Platform-Architecture.md), SPEC-005/006/007 |
| **Knowledge Assistant** | Consumes the wiki to answer questions with citations | [PRODUCT-001](implementation/products/knowledge-assistant/README.md) |
| **End-of-Session** | Keeps the context current as work happens | [SPEC-003](docs/specifications/SPEC-003-End-of-Session-Workflow.md) |
| **Knowledge Review** | Governs what becomes durable knowledge | [SPEC-004](docs/specifications/SPEC-004-Knowledge-Review-Workflow.md) |
| **Project Kickoff** | Starts new projects from a consistent baseline | [SPEC-001](docs/specifications/SPEC-001-Project-Kickoff-Workflow.md) |

The architecture, its principles, and its platform contracts are described once,
canonically, in **[ARCH-001 — Platform Architecture](docs/architecture/ARCH-001-AJ-OS-Platform-Architecture.md)**.

---

## Try it today

The **Knowledge Assistant** is the first subsystem you can run — a CLI that
answers questions about a configured handbook, grounded in its generated wiki,
always with citations.

```bash
npm install
cp aj.config.example.json aj.config.json   # then set handbook.path
cp .env.example .env                        # then set ANTHROPIC_API_KEY
aj wiki build                               # compile your handbook into a wiki
aj ask "How does the Context Builder work?"
```

> Your handbook needs a `foundation/` and a `library/` directory — those are the
> two source folders `aj wiki build` reads. See the
> [installation guide](docs/guides/installation.md#what-the-handbook-must-look-like).

> Run `npm run build && npm link` once to install the `aj` command, or use
> `npm run dev -- wiki build` and `npm run dev -- ask "…"` to run from source.

> **The loop is closed.** `aj wiki build` compiles your handbook's sources into a
> generated wiki — including the `index.md` catalog the assistant retrieves from —
> and `aj ask` answers from exactly that wiki. Producer and consumer meet through
> one configuration contract, `handbook.generatedWikiPath` (default
> `wiki-generated/`). The first build calls the model once per source, so it takes
> a few minutes; `aj wiki build --rebuild` regenerates from scratch.

Then, when a coding session ends:

```bash
aj session end --notes "what the diff cannot show"
```

> **Capture, not publication.** `aj session end` reads the session's git changes,
> extracts the reusable knowledge, and writes candidates for you to review at
> `<handbook>/knowledge-review/pending/<session-id>/`. It **never commits, never
> generates the wiki, and never touches canonical knowledge** — every write lands
> in the non-canonical review area. `--since <ref>` measures from a commit instead
> of the working tree. Deciding what becomes durable is a human step, and the
> workflow that governs it (SPEC-004) is still to come — so for now the candidates
> wait for you.

Full instructions: the
[Knowledge Assistant docs](implementation/products/knowledge-assistant/README.md)
and its [usage guide](implementation/products/knowledge-assistant/usage.md).

---

## Current status

**AJ-OS Platform v2.0.0 has shipped** — the first stable release of the reusable
platform, delivered with its first product, **Knowledge Assistant v1.0.0**.

- **Shipped:** the Context Builder (SPEC-002) and the supporting platform
  capabilities (configuration, handbook, retrieval, prompt rendering, AI
  client), plus the Knowledge Assistant that composes them.
- **Wired:** the Knowledge Platform pipeline (ARCH-002) — the sources → wiki
  engine — is now runnable end to end via `aj wiki build`, which generates the
  wiki (and its `index.md` corpus catalog) that `aj ask` reads. This closes the
  first loop: **AJ-OS generates and consumes its own knowledge.**
- **Captured:** the End-of-Session workflow (SPEC-003) — `aj session end` turns a
  finished session into candidate knowledge for review, written only to the
  non-canonical review area. A capture-only v1: it never commits and never
  generates the wiki.
- **Next:** Knowledge Review (SPEC-004) — the governance half of the loop, which
  decides what actually becomes durable knowledge. Automation proposes;
  **humans approve**. Before it starts, a Repository Excellence Review is under
  way (see the [ROADMAP](ROADMAP.md)).

The full itemized history is in the [CHANGELOG](CHANGELOG.md); what to do next is
in the [ROADMAP](ROADMAP.md) under **Resume Here**. Platform and products are
versioned independently — see
[versioning & releases](docs/project/versioning-and-releases.md).

> **On document status.** AJS standards and SPEC specifications carry
> `Status: Draft`, which in AJ-OS means *"approved for implementation, not yet
> frozen."* A shipped release built on Draft documents is by design.

---

## Documentation

Active documentation follows one hierarchy — **VISION → Architecture →
Specifications → Implementation** — and each concept has a single canonical home.

| Area | What it holds |
| --- | --- |
| [docs/VISION.md](docs/VISION.md) | What AJ-OS is (source of truth) |
| [docs/architecture/](docs/architecture/) | ARCH — how the system is structured (+ ADRs) |
| [docs/standards/](docs/standards/) | AJS — the rules that govern the platform |
| [docs/specifications/](docs/specifications/) | SPEC — how each subsystem is built |
| [implementation/](implementation/) | The as-built engineering record |
| [docs/archive/](docs/archive/) | Superseded implementations, preserved (see below) |

Start with the [documentation index](docs/README.md) for the full map and
recommended reading paths.

---

## History

AJ-OS began as something different — a code-first Notion **business** operating
system (v1). That generation is preserved, frozen, under
[docs/archive/v1/](docs/archive/v1/README.md). It is kept for reference, not
carried forward: if AJ-OS needs one of those ideas again, it will be redesigned
for the current architecture rather than revived. A `PROJECT-STORY` narrating the
full evolution will be added once the cleanup is complete.

---

## Contributing

The architecture-first approach is intentional: update the relevant standard or
specification before implementing, then capture reusable knowledge through the
End-of-Session workflow. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Released under the MIT License — see [LICENSE](LICENSE).

---

> **Maintain the context. The work compounds.**
