# AJ-OS Implementation

This directory is the **engineering-tracking layer** of AJ-OS. It records how
specifications were turned into working code: milestones, tasks, decisions, and
retrospectives.

It complements — but never overrides — the source-of-truth documents. The order
of authority is defined in [CLAUDE.md](CLAUDE.md):

```
Architecture (ARCH) → Standards (AJS) → Specifications (SPEC) → Implementation → Code
```

---

## How this directory is organized

```text
implementation/
├── CLAUDE.md            The implementation playbook (engineering workflow)
├── phase-2-core-platform/   Core platform services (Context Builder, Knowledge Platform)
├── phase-3-developer-experience/  Workflows built on the platform (not yet started)
├── products/            Product engineering docs (Knowledge Assistant)
├── backlog/             Work intentionally deferred, with the reason
├── review/              Milestone/spec review checklists
├── prompts/             The prompt history behind each milestone
└── templates/           Reusable engineering templates
```

Not every delivered spec has a task-by-task folder here. Where one exists (see
`phase-2-core-platform/spec-002-context-builder/`), it is the detailed record.
Where one does not, the authoritative record is the combination of the SPEC, the
relevant ADRs, the [CHANGELOG](../CHANGELOG.md), and git history.

---

## Where to start reading

1. [CLAUDE.md](CLAUDE.md) — the engineering workflow every task follows.
2. [phase-2-core-platform/README.md](phase-2-core-platform/README.md) — what the
   core platform has delivered.
3. [products/knowledge-assistant/README.md](products/knowledge-assistant/README.md)
   — the first shipped product.

For where the project stands and what to do next, see the top-level
[ROADMAP.md](../ROADMAP.md).
