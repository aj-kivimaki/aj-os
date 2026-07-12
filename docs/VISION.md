# AJ-OS — Vision

> **AJ-OS is a personal operating system whose purpose is to maintain an
> accurate, evolving working context for its user's work.**

This document defines what AJ-OS *is*. It is not architecture, not
implementation, and not history — those are documented elsewhere and are
expected to change. This document changes rarely. When a decision about
scope, structure, or documentation is unclear, it is settled here.

The test it exists to answer:

> Does this help explain or support the operating system whose purpose is to
> maintain working context? If not, it probably belongs in the project's
> history rather than in the active documentation.

---

## The loop

Everything in AJ-OS exists to turn this loop:

```text
        Work
          ↓
Durable, reviewed knowledge
          ↓
 Maintained working context
          ↓
    Better future work
          ↓
       (repeat)
```

This is the heart of the project. Every subsystem, integration, and workflow
is a means of turning this loop faster, more reliably, and with less effort.
The architecture diagrams elsewhere show *how* the subsystems implement this
loop; this diagram is *why* they exist.

**No subsystem is the point. The point is the loop they form.**

---

## What AJ-OS is

AJ-OS is a personal operating system that continuously **collects, organizes,
maintains, and exposes the working context** its user needs to do their work.

Its unit of value is **working context** — everything you need loaded to do
the next piece of work well. Working context is broader than knowledge. Over
time it spans:

- durable knowledge (the generated wiki),
- project state and history,
- current priorities,
- and live sources such as GitHub, Jira, calendars, and domain databases.

Durable, reviewed **knowledge** is one layer of that context — the long-lived
layer. The generated wiki is *one representation* of durable context, not the
context itself.

AJ-OS is a **platform of subsystems**, not a single application. Each
subsystem serves one part of the loop:

- **Knowledge Platform** — compiles durable knowledge into a generated wiki.
- **Knowledge Assistant** — consumes that knowledge to answer questions.
- **End-of-Session** — keeps the context current as work happens.
- **Knowledge Review** — governs what is allowed to become durable knowledge.
- **Project Kickoff** — starts new projects from a consistent baseline.
- **Context sources & services** — integrations that feed and expose context.

AJ-OS is not a Knowledge Assistant. It is not a Wiki Generator. It is not an
automation framework. It is not a collection of AI agents. Those are all
subsystems serving one purpose: **maintaining an accurate, evolving working
context.**

---

## Why it exists

Most tools start every task from zero. Context earned on one project — why a
decision was made, what worked, how something is set up, what matters right
now — evaporates between sessions and between projects. The person becomes the
only place the context lives, and that does not scale.

AJ-OS exists to make the *work itself* accumulate. Each project should
permanently improve the conditions for the next one, without depending on the
author to remember and re-explain everything.

---

## The problem it solves

Working context today is **scattered, stale, and locked in one head** — spread
across tools that do not talk to each other, out of date the moment it is
written down, and reconstructed by hand at the start of every task.

AJ-OS closes the loop automatically: capturing context as work happens,
governing what becomes canonical, keeping it current, and exposing it wherever
it is needed. The result is context that is **current, trustworthy, and
instantly available.**

---

## What makes AJ-OS different

**AJ-OS is not another productivity tool.**

It does not try to replace GitHub, Jira, Notion, Obsidian, or your calendar.
Those tools are where work happens, and they are good at what they do.

AJ-OS sits underneath them and **connects them through shared context.** It
treats each tool as a source of context to draw from and a surface to expose
context to — not as a competitor to be replaced. The value is not in any one
integration; it is in the connective layer that keeps a single, coherent
working context across all of them.

**AJ-OS automates the context, not the work.** It does not write the code,
compose the audio, or make the decisions. Its automation target is the
*maintenance of the working context* those tasks depend on — capturing it,
governing it, keeping it current, and exposing it. The work stays yours; what
AJ-OS removes is the overhead of staying oriented.

---

## Long-term direction

- **Near term** — close the loop: the Knowledge Platform produces a wiki
  end-to-end, End-of-Session keeps it current, Knowledge Review governs it.
- **Medium term** — more context sources and workflows: GitHub, Jira,
  calendars, domain databases; Project Kickoff and further workflows built on
  the same platform.
- **Long term** — an operating system for work that grows more useful the more
  you work through it.

The goal is **not an AI assistant.** AI is one way context is consumed. The
goal is the working-context substrate underneath all of the work.

---

## What belongs inside AJ-OS

- Anything that **collects, organizes, maintains, or exposes working context.**
- **Subsystems that serve the loop** — knowledge compilation, retrieval,
  governance, session capture, project setup.
- **Context sources and connectors** — integrations treated as pluggable
  providers, never as the center.
- **The standards and governance** defining how context becomes durable.
- **The machinery that produces and maintains the wiki.**

## What does not belong inside AJ-OS

- **The canonical knowledge itself.** The Handbook is the source of truth AJ-OS
  *maintains and exposes* — not a thing AJ-OS contains. It lives outside this
  repository.
- **The work products.** The software, audio, and creative output are the
  *result* of the work — not part of the operating system.
- **Features unconnected to the loop.** A tool that is just a tool, with no
  role in collecting, maintaining, or exposing context, belongs elsewhere.
- **Vendor-specific assumptions baked into the core.** Any one provider —
  Notion, a specific model, a specific tracker — is a source or a target,
  never the center of the platform.

---

## Scope of this implementation

AJ-OS is defined generally — it maintains the working context required for its
*user's* work, whatever that work is. This keeps the architecture broadly
applicable and adaptable by others.

This repository is one implementation, built first for its author and focused
on **software development and game-audio career work.** Those domains shape the
integrations and context sources that get built first, but they are not part of
the core identity. AJ-OS is developed in the open so others can adapt it to
their own work.

---

## The test

For any feature, document, or decision, ask:

> Does this help **collect, organize, maintain, or expose working context** —
> or does it serve a subsystem that does?

If yes, it belongs. If it is a past stage of the project, it belongs in
history. If it is neither, it belongs somewhere other than AJ-OS.
