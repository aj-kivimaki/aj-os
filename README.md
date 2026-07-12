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
aj ask "How does the Context Builder work?"
```

> Run `npm run build && npm link` once to install the `aj` command, or use
> `npm run dev -- ask "…"` to run from source.

> **Prerequisite — a pre-generated wiki.** The assistant reads a handbook's
> generated `wiki/`, not raw notes. Producing that wiki is the Knowledge
> Platform's job, which is implemented but **not yet wired to a runnable
> command** (see [status](#current-status)). Until it is, a pre-generated wiki
> is required — "no generated wiki" is a known limitation, not a setup mistake.

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
- **In progress:** the Knowledge Platform pipeline (ARCH-002) — the sources → wiki
  engine — is implemented at the library level and tested, but **not yet wired to
  a runnable command**. Wiring it is the top of the roadmap.

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
