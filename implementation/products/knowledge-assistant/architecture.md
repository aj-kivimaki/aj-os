# PRODUCT-001 — Knowledge Assistant Architecture

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Architecture

---

# Purpose

This document describes the **as-built** architecture of the Knowledge Assistant
as shipped in Version 1.0.

It is not a plan and not a proposal. It records how the running product is
actually structured: its layers, the direction its dependencies point, the
capabilities it composes, and the invariants that hold the design together.

The implementation is the source of truth. Where this document and the code ever
disagree, the code is correct and this document is a bug.

The specification documents describe *what* the product does and *why it matters
to a user*:

- [PRODUCT-001 — Knowledge Assistant](../../../docs/specifications/products/PRODUCT-001-knowledge-assistant.md)
- [Principles](../../../docs/specifications/products/PRODUCT-001-principles.md)
- [User Flows](../../../docs/specifications/products/PRODUCT-001-user-flows.md)
- [Roadmap](../../../docs/specifications/products/PRODUCT-001-roadmap.md)

This document describes *how those requirements are realized in code*.

---

# The one-sentence architecture

A thin **CLI** launches one **product** (`KnowledgeAssistant`) that composes a
handful of independent, single-purpose **platform capabilities** into a linear
pipeline that turns a question into a cited answer — and nothing in the platform
knows the product exists.

---

# Architecture goals

The architecture of PRODUCT-001 was designed around a small set of goals. They
explain *why* the architecture is shaped the way it is before the rest of this
document describes *what* it contains. Every structural decision later in this
record traces back to one of these:

- **Separate Product from Platform.** The thing a user runs and the reusable
  capabilities it stands on are different concerns and live in different layers.
- **Keep platform capabilities independently reusable.** Each capability solves
  one problem and knows nothing about who consumes it, so a future product can
  reuse it through its published contract.
- **Maintain a strict one-way dependency direction.** `CLI → Product → Platform`,
  always. Reuse is only possible if the platform cannot see its consumer.
- **Ground every answer in handbook knowledge.** The pipeline is built so an
  answer can only be produced from retrieved, cited context — never from the
  model's own prior knowledge.
- **Make every stage independently testable.** Each stage has a narrow, typed
  contract and no hidden state, so it can be exercised in isolation.
- **Let future AJ-OS products reuse the platform without modifying it.** New
  products should add their own orchestration, not edit the platform.

---

# The canonical architecture diagram

This is the **canonical** diagram of PRODUCT-001. It is the single picture meant
to be reused across the project — README, portfolio, presentations, and future
documentation should all point back to this one. Every other diagram in this
document is a detailed view of a slice of it.

```text
                        User
                          │
                          ▼
                        CLI                       aj ask [question] [--debug]
                          │
                          ▼
                 Knowledge Assistant              the product: owns orchestration
                          │
   ┌──────────────────────┴───────────────────────────────────────┐
   │                     Platform                                  │
   │                                                               │
   │      Config            load & validate aj.config.json         │
   │        │                                                      │
   │        ▼                                                      │
   │      Handbook          locate the generated wiki/             │
   │        │                                                      │
   │        ▼                                                      │
   │      Retrieval         rank index.md articles for the question│
   │        │                                                      │
   │        ▼                                                      │
   │      Context Builder   assemble an immutable ContextPackage   │
   │        │                                                      │
   │        ▼                                                      │
   │      Prompt Renderer   render a grounded, citable prompt      │
   │        │                                                      │
   │        ▼                                                      │
   │      AI Client         generate the answer (Anthropic)        │
   │                                                               │
   └──────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
                    Grounded Answer
                     + Citations
```

The layers above the box (`User → CLI → Knowledge Assistant`) are the entry path;
everything inside the box is the reusable platform the product composes; the
output below the box is what the user receives. The sections that follow expand
each part of this picture.

---

# Three layers

The code is organized into three layers with a strict, one-way dependency rule.

```text
┌──────────────────────────────────────────────────────────────┐
│  CLI            src/cli/                                       │
│                 Parses argv, picks a mode, launches the        │
│                 product. Owns no orchestration.                │
└───────────────────────────┬──────────────────────────────────┘
                            │ depends on
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  PRODUCT        src/products/knowledge-assistant/             │
│                 The only layer that composes platform          │
│                 capabilities. Owns the pipeline, the session,  │
│                 the display, and the error presentation.       │
└───────────────────────────┬──────────────────────────────────┘
                            │ depends on
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  PLATFORM       src/platform/*   +   src/context-builder/     │
│                 Independent, single-purpose capabilities.      │
│                 None of them imports the product or the CLI,   │
│                 and none imports another platform capability   │
│                 (with one deliberate exception, below).        │
└──────────────────────────────────────────────────────────────┘
```

**The dependency rule:** `CLI → Product → Platform`. Dependencies only ever point
downward. No platform capability imports the product or the CLI; the product is
free to know about the platform, never the reverse. This is enforced structurally
by the import graph, and it is the single most load-bearing decision in the
product — every other property (testability, reuse, model-agnosticism) follows
from it.

## Why the layers exist

- **CLI** ([src/cli/index.ts](../../../src/cli/index.ts),
  [src/cli/commands/ask.ts](../../../src/cli/commands/ask.ts)) decides *which*
  mode to run (one-shot vs. interactive) and whether `--debug` is on. It adds no
  behaviour of its own — with a question it calls `answer()` once and exits;
  without one it calls `run()`. A second, deprecated command
  (`aj knowledge ask`) is kept as a backward-compatible alias.

- **Product** ([src/products/knowledge-assistant/](../../../src/products/knowledge-assistant/))
  is the *only* place the platform capabilities are wired together. Composition
  is a product responsibility on purpose: it keeps every platform capability
  unaware of how it is used, so the same capability can be reused by a future
  product with a completely different pipeline.

- **Platform** ([src/platform/](../../../src/platform/) and
  [src/context-builder/](../../../src/context-builder/)) is a set of capabilities
  that each solve exactly one problem and know nothing about the product. They
  are the reusable substrate the roadmap calls "the platform enables user value."

---

# Platform capabilities

Five product-facing platform capabilities were built or consumed for v1.0. Each
is a self-contained module with a narrow contract and its own user-facing error
type where relevant.

| Capability | Module | Responsibility | Knows nothing about |
| --- | --- | --- | --- |
| **Config Service** | [config/ConfigService.ts](../../../src/platform/config/ConfigService.ts) | Read, parse, and validate `aj.config.json` into a typed `AjConfig`, or raise a `ConfigError`. | The product; the handbook's internals. |
| **Handbook Service** | [handbook/HandbookService.ts](../../../src/platform/handbook/HandbookService.ts) | Given a handbook root, confirm its structure and locate the generated `wiki/`, or raise a `HandbookError`. | Where the path came from (it does not know Config Service exists). |
| **Retrieval Service** | [retrieval/RetrievalService.ts](../../../src/platform/retrieval/RetrievalService.ts) | Given a wiki directory and a question, return the most relevant articles. | Handbooks, configuration, context, prompts, AI. Imports no other platform module. |
| **Prompt Renderer** | [prompt/PromptRenderer.ts](../../../src/platform/prompt/PromptRenderer.ts) | Turn a `question` + `ContextPackage` into a `{ system, user }` `RenderedPrompt`. Pure and synchronous. | Any AI provider, model, API, or transport. |
| **AI Client** | [ai/AIClient.ts](../../../src/platform/ai/AIClient.ts) | Turn a `RenderedPrompt` into an `AIResponse` using Anthropic's API, or raise an `AIError`. | Retrieval, context, prompt construction — everything upstream. |

Plus one **reused platform service**:

- **Context Builder** ([src/context-builder/](../../../src/context-builder/)) —
  a pre-existing platform module (SPEC-002) that assembles a validated,
  immutable `ContextPackage` from supplied knowledge. The product consumes it
  **only through its public entry point** ([index.ts](../../../src/context-builder/index.ts)),
  never by reaching into its internals. It calls no AI, renders no prompt, and
  knows nothing about this product.

## The one deliberate platform-to-platform dependency

The Prompt Renderer and the Context Builder share a type boundary: the renderer
reads the `ContextPackage` contract the Context Builder produces. This is the
*only* coupling between two platform capabilities, and it is a one-directional
dependency on a **frozen data contract**, not on behaviour. Every other platform
capability is an island.

---

# The product

The product is two files with two very different jobs.

- **`KnowledgeAssistant`**
  ([KnowledgeAssistant.ts](../../../src/products/knowledge-assistant/KnowledgeAssistant.ts))
  owns the entire experience: the welcome screen, the interactive read loop, the
  session lifecycle, the seven-stage pipeline, the answer/citation display, the
  debug diagnostics, and the mapping of known platform errors to friendly
  messages. It holds the three stateless capabilities (`ConfigService`,
  `PromptRenderer`, `AIClient`) as fields and constructs the two path-bound
  capabilities (`HandbookService`, `RetrievalService`) per question, once their
  paths are known.

- **`wikiKnowledgeProvider`**
  ([wikiKnowledgeProvider.ts](../../../src/products/knowledge-assistant/wikiKnowledgeProvider.ts))
  is **product composition glue**, not a platform capability. It bridges two
  independent platform contracts that do not know about each other — the
  Retrieval Service's `RetrievalResult` (`path` + `title` + `score`) and the
  Context Builder's `KnowledgeItem` (`id` + citable `source` + `content`). It
  lives in the product layer precisely because only the product composes platform
  capabilities. Its one job is to read each already-selected article's body and
  present it as a `wiki` knowledge item; it does not rank, filter, or re-retrieve.

---

# The pipeline

Every question — whether from the one-shot CLI form or the interactive loop —
flows through a single method,
[`KnowledgeAssistant.answer()`](../../../src/products/knowledge-assistant/KnowledgeAssistant.ts).
There is exactly one orchestration path.

```text
question
   │
   ▼
1. Config Service      load & validate aj.config.json     → handbook path
   │
   ▼
2. Handbook Service    locate the generated wiki/          → wikiPath
   │
   ▼
3. Retrieval Service   keyword-score index.md articles     → RetrievalResult[]  (top 5)
   │
   ├─ (no results) ─────────────────────────────► friendly "nothing found" notice, stop
   │
   ▼
4. Context Builder     wikiKnowledgeProvider → build()      → ContextPackage
   │                   (Collection → Selection → Assembly)
   ▼
5. Prompt Renderer     question + ContextPackage            → RenderedPrompt { system, user }
   │
   ▼
6. AI Client           Anthropic Messages request           → AIResponse { text, model }
   │
   ▼
7. Display             answer  +  numbered citations
```

The data narrows and transforms at each stage, and each stage speaks only to its
immediate neighbours through a typed contract:

```text
question:string
  → AjConfig
  → HandbookInfo
  → RetrievalResult[]
  → ContextPackage
  → RenderedPrompt
  → AIResponse
  → stdout
```

No stage reaches backward, and no stage knows more than its own inputs and
outputs. The product is the only thing that sees the whole chain.

---

# Boundaries and invariants

These are the properties the architecture guarantees. They are what make the
product testable, model-agnostic, and honest.

## 1. One-way dependencies

`CLI → Product → Platform`, always. The platform is reusable because it cannot
see its consumer.

## 2. Rendering is pure; generation is isolated

The **Prompt Renderer** reads no clock, no randomness, and no environment, and
awaits nothing — identical inputs always produce the identical prompt. All
provider-specific concerns (SDK, model selection, transport, API key) live in the
**AI Client** and nowhere else. This render/generate seam is why the product is
model-agnostic: swapping providers touches one file.

## 3. The generated index defines the corpus

Retrieval scores **only the articles linked from `wiki/index.md`**, in the order
the index lists them. It does not rediscover the corpus by walking the
filesystem, so maintainer files the index deliberately omits (`CLAUDE.md`,
`README.md`, `log.md`, …) are never searchable. The human-curated index is
treated as the authority on *what* is knowledge; the filesystem is consulted only
for *where* each linked article lives.

## 4. Debug is presentation-only

`--debug` changes what the product *shows*, never what it *does*. The diagnostics
are gathered by measuring the same platform calls the pipeline would make anyway;
every stage runs identically in either mode. There is no separate "debug path."

## 5. A deliberate error taxonomy

Three error types are **user-facing** — `ConfigError`, `HandbookError`, and
`AIError`. The product catches these and prints a friendly explanation. Anything
else is re-thrown loudly, because an unrecognized error is a bug, not a user
problem. The boundary between "the user needs to fix something" and "the
developer needs to fix something" is encoded in the type system.

## 6. Read-only, one-directional knowledge

The product never writes to the handbook or the wiki. Knowledge flows in one
direction only: handbook → generated wiki → retrieval → answer. This realizes
Principle 9 ("Keep Knowledge Read-Only") structurally — there is no write path to
misuse.

---

# What is intentionally *not* in the architecture

Version 1.0 draws its boundaries as deliberately as its capabilities. The
following are absent by design, not by omission:

- **Conversation memory.** The interactive loop reads many questions, but each
  question is answered independently — no prior turns are carried into the prompt.
  The AI Client holds no history. (See
  [lessons-learned.md](./lessons-learned.md) and the v1.0 release notes for the
  honest accounting of this versus the planned Milestone 7.)
- **A provider abstraction.** There is exactly one provider (Anthropic), reached
  through one class. No pluggable-provider interface exists yet; the render/
  generate seam is where one would go.
- **Streaming, retries, and rate-limit handling.** The AI Client makes a single
  non-streaming request and maps failure to a single `AIError`.
- **Ranked/semantic retrieval.** Retrieval is a deliberately naive keyword score,
  isolated behind `search()` so it can be replaced (BM25, embeddings, hybrid)
  without changing the service contract.

Each of these has a natural home in the architecture already — which is the point
of documenting them here.

---

# Relationship to the specification documents

| This document records… | …the realization of |
| --- | --- |
| The three-layer separation and dependency rule | The spec's separation of "product defines value, platform enables it" ([Roadmap → Product Strategy](../../../docs/specifications/products/PRODUCT-001-roadmap.md)) |
| The seven-stage pipeline | The spec's abstract "Knowledge Flow" and "User Journey" ([Knowledge Assistant spec](../../../docs/specifications/products/PRODUCT-001-knowledge-assistant.md)) |
| Read-only, one-directional knowledge; index-defined corpus | Principles 5 & 9 ([Principles](../../../docs/specifications/products/PRODUCT-001-principles.md)) |
| The error taxonomy and "nothing found" notice | Flows 2, 6, 7 ([User Flows](../../../docs/specifications/products/PRODUCT-001-user-flows.md)) |
| The five platform capabilities | The spec's "Platform Dependencies" (Context Builder, Retrieval, Prompt Renderer, AI Client), now built rather than "future" |

The specifications remain the authority on intent. This document is the authority
on structure.

---

# PRODUCT-001's role in AJ-OS

This architecture represents the **first complete product built on AJ-OS**. It is
the point where the platform stopped being a set of specifications and started
carrying a real user-facing product end to end.

Its lasting contribution is a template for how products relate to the platform:

- The platform capabilities it built or consumed — Config, Handbook, Retrieval,
  Context Builder, Prompt Renderer, AI Client — are **not** Knowledge-Assistant
  features. They are reusable AJ-OS capabilities that happen to have had their
  first consumer here.
- The product-specific parts — the seven-stage orchestration, the session and
  display, the `wikiKnowledgeProvider` glue — live entirely in the product layer.

Future AJ-OS products are expected to follow the same shape: **reuse platform
capabilities wherever appropriate, and introduce their own product-specific
orchestration rather than modifying the platform.** When a future product finds a
capability it needs that does not yet exist, the answer is to build a new
platform capability (independent, unaware of its consumer) — not to bend an
existing one toward a single product. PRODUCT-001 is the proof that this
division works in practice, and the reference the next product should measure
itself against.

The next document, [system-walkthrough.md](./system-walkthrough.md), traces a
single question through this structure end to end.
