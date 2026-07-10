# PRODUCT-001 — Knowledge Assistant Architecture Timeline

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Canonical Timeline

---

# What this is

The **canonical one-page history** of PRODUCT-001, from idea to Version 1.0.

It is built to be understood in under two minutes and to fit on a single slide.
Release notes, presentations, the README, and the portfolio case study should all
reference *this* timeline rather than inventing their own.

It is intentionally terse. The *story* behind these steps — the reversals, the
surprises, the honest deferrals — lives in
[engineering-decisions.md](./engineering-decisions.md). This page is the skeleton;
that document is the flesh.

---

# The timeline

```text
             IDEA
              │
   ┌──────────▼──────────┐
   │ M0  VISION &         │   answer handbook questions with citations,
   │     PRODUCT-FIRST    │   and let one product decide the platform
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M1  LAUNCH           │   a runnable front door
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M2  CONNECT          │   find and validate a handbook
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M3  SEARCH           │   retrieve the most relevant wiki articles
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M4  CONTEXT          │   assemble retrieved knowledge into a package
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M5  ANSWER           │   render a grounded prompt and generate an answer
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M6  CITE             │   make every answer traceable
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M7  CONVERSE         │   an interactive loop (memory deferred, openly)
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ M8  POLISH & RELEASE │   collapse to `aj ask`; add debug; harden errors
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │     VERSION 1.0      │   grounded, cited answers — shipped
   └─────────────────────┘
```

> **Numbering note.** M1–M7 match the
> [implementation plan](../../../implementation/products/PRODUCT-001-implementation.md)
> exactly, so a reference to "M3" means the same thing here, in the plan, and in
> [engineering-decisions.md](./engineering-decisions.md). M0 (pre-build framing)
> and M8 (post-M7 polish and release) bracket them.

---

# The same timeline, with outcomes

Each step, its purpose, and the one architectural thing it left behind.

| # | Stage | Purpose | Major architectural outcome |
| --- | --- | --- | --- |
| **M0** | Vision & Product-First | Define the product and let it drive the platform. | The read-only knowledge flow (handbook → wiki → answer); every capability exists *because a product needed it*. |
| **M1** | Launch | Make something runnable. | The three layers appear: **CLI → Product → Platform**, one-way. |
| **M2** | Connect | Locate a handbook. | **Config** and **Handbook** split into two capabilities; the handbook becomes an external project. |
| **M3** | Search | Retrieve relevant knowledge. | **Retrieval** trusts `index.md` as the corpus authority, not the filesystem. |
| **M4** | Context | Turn articles into usable context. | The existing **Context Builder** is reused through its public contract, behind a small adapter (plus one small assembly enhancement: it now emits article bodies). |
| **M5** | Answer | Produce an answer. | The **render/generate seam**: a pure **Prompt Renderer** separate from a provider-isolated **AI Client**. |
| **M6** | Cite | Make answers verifiable. | Numbered references thread from context → prompt → citations, end to end. |
| **M7** | Converse | Support follow-up. | An interactive loop; true conversation memory consciously deferred. |
| **M8** | Polish & Release | Make it usable and honest. | `aj ask` becomes the front door; debug is presentation-only; a typed error taxonomy. |
| **—** | Version 1.0 | Ship. | A complete, reusable platform proven by its first real product. |

---

# The product stays small; the platform accumulates

The most important thing the timeline communicates is not any single milestone —
it is the **shape of the growth**. As the milestones pass, the product stays
roughly constant in size while reusable platform capabilities pile up beneath it.
Each capability, once built, persists and is reused by every later stage.

```text
        PRODUCT                          PLATFORM  (each ▪ persists and is reused)
        (stays small)                    (accumulates)
  ───────────────────────────────  │  ────────────────────────────────────────────
  M1  CLI · KnowledgeAssistant     │  (none yet)
  M2  ·  (unchanged)               │  ▪ Config   ▪ Handbook
  M3  ·                            │  ▪ Config   ▪ Handbook   ▪ Retrieval
  M4  ·  (+ ~60-line adapter)      │  ▪ Config   ▪ Handbook   ▪ Retrieval   ▫ Context Builder*
  M5  ·                            │  ▪ Config   ▪ Handbook   ▪ Retrieval   ▫ Context Builder*   ▪ Prompt Renderer   ▪ AI Client
  M6  ·  (citation display)        │  (references thread through — no new capability)
  M7  ·  (interactive loop)        │  (no new capability)
  ───────────────────────────────  │  ────────────────────────────────────────────
  TOTAL   ~2 product files +       │  6 platform capabilities in the pipeline:
          1 small adapter          │  5 built here (▪) + 1 reused via contract (▫*)

  ▫* Context Builder pre-existed (SPEC-002); PRODUCT-001 consumed it through its
     public contract (with one small assembly enhancement: it now emits article bodies).
```

The message in one line: **the product is a thin composition that barely grew,
while the durable, reusable platform grew to six capabilities.** The value created
by PRODUCT-001 lives mostly *below* the product line — which is exactly why the
next product can start small too.

---

# From idea to Version 1.0, in one sentence

> A vision for grounded, cited answers was turned — **product-first** — into a
> seven-stage pipeline, built one runnable milestone at a time, that composes
> independent platform capabilities behind stable seams; the result is a shipped
> Version 1.0 whose real achievement is **a reusable platform validated by its
> first product.**

---

# How to read the shape

Three things are visible in the timeline at a glance, and they are the points
worth making from a slide:

1. **It starts with a product decision, not a technical one.** "Product-first"
   sits above M1 for a reason — it set everything below it.
2. **The middle is a straight pipeline.** M2 → M6 is the data's journey (config,
   handbook, retrieval, context, answer, citation) turned into a build order. The
   architecture and the timeline are the *same shape* — which is the point.
3. **The end is about honesty, not features.** The final steps hardened, simplified,
   and openly scoped the product rather than piling on capability.

---

# Legacy of PRODUCT-001

What did the first product leave behind? More than a working `aj ask` — it left the
foundations every future AJ-OS product starts from:

- **The first complete AJ-OS product.** The point where the platform stopped being
  specifications and started carrying a real, usable product end to end.
- **The Product / Platform architecture.** The three layers and the one-way
  dependency rule (`CLI → Product → Platform`) are now the template for the next
  product, not a one-off.
- **Six reusable platform capabilities in the pipeline** — five *created* here
  (Config, Handbook, Retrieval, Prompt Renderer, AI Client) and a sixth (Context
  Builder) *proven* reusable by being consumed through its public contract (with one
  small assembly enhancement).
- **Validated handbook-driven knowledge retrieval.** The index-as-authority
  approach (M3) proved that a generated, curated wiki can ground trustworthy,
  citable answers.
- **An established engineering workflow.** Product-first development, milestone
  vertical slices, stable boundaries over clever implementations, and honest
  scoping — now a repeatable way of working, captured in
  [engineering-decisions.md](./engineering-decisions.md).
- **A documentation standard.** This document set itself is part of the legacy: the
  bar for how a completed AJ-OS product should be recorded.

In one line: **PRODUCT-001 delivered a small product and, underneath it, a reusable
platform and a way of working that outlast the product itself.**

---

# Canonical references

This timeline is the single source other documents should point back to:

- **[engineering-decisions.md](./engineering-decisions.md)** — the narrative behind
  each step (this page is its skeleton).
- **[decisions.md](./decisions.md)** — the standing architectural decisions the
  outcomes column names (KA-AD-01 … KA-AD-10).
- **[architecture.md](./architecture.md)** — the *structural* view; note the middle
  of this timeline matches the seven-stage pipeline there, by design.
- **[release/v1.0.0.md](./release/v1.0.0.md)** and the README — should reference
  this timeline rather than restating history.
