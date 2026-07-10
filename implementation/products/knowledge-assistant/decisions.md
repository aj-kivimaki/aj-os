# PRODUCT-001 — Knowledge Assistant Architecture Decisions

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Architecture Decision Record

---

# Purpose

This is the architecture decision record for PRODUCT-001. It captures the choices
that gave the product its shape — and, now that Version 1.0 is complete, evaluates
honestly whether each one actually worked.

Every decision recorded here meets four conditions. If a choice fails any of them,
it is not in this document:

1. **It had meaningful alternatives.** A real fork in the road, not a foregone
   conclusion.
2. **We consciously chose one.** The path was picked deliberately, not by default.
3. **It significantly shaped the architecture.** Removing or reversing it would
   change the structure of the product, not just a detail.
4. **Understanding it helps someone maintain or extend the product.** A future
   maintainer is better off knowing this.

Each entry follows the same form: **Context · Decision · Alternatives considered ·
Consequences · Did the decision prove successful?** The final question is the
point. Now that the product is built and running, we can grade the decisions
instead of merely recording that we made them.

**Scope.** This document is *architectural* and organized by decision, not by
time. The chronological story — *when* we changed course and why — lives in the
companion [engineering-decisions.md](./engineering-decisions.md). Where a decision
here was the result of a mid-course change, it points there rather than retelling
the timeline. The structural context for every decision is
[architecture.md](./architecture.md).

---

# How the decisions fit together

These are not ten isolated choices. They compose into two reinforcing spines —
one that produces **reuse and model-agnosticism**, and one that produces
**grounding and trust**. Reading them as chains shows that the architecture is
coherent by construction, not by accident.

**The reuse spine — how the platform became reusable:**

```text
Product-first development                     (see engineering-decisions.md)
        ↓
Product / Platform separation                 KA-AD-01
        ↓
Orchestration lives in the product            KA-AD-02
        ↓
Independent, reusable platform capabilities   KA-AD-03, KA-AD-09
        ↓
Prompt Renderer separated from AI Client      KA-AD-05
        ↓
Provider specifics quarantined                KA-AD-06
        ↓
Future products can reuse the same platform
```

**The trust spine — how answers became grounded and citable:**

```text
Generated handbook wiki                        (external, authored artifact)
        ↓
Index-driven retrieval                         KA-AD-04
        ↓
Assembled, immutable context                   KA-AD-03
        ↓
Grounded, citable prompt                       KA-AD-05
        ↓
Honest failure when grounding is impossible    KA-AD-07
        ↓
Reliable answers with reliable citations
```

The two spines cross at **KA-AD-05** (the render/generate seam): the same
decision that makes the product model-agnostic is also what turns assembled
context into a citable prompt. That intersection is why a single seam does so much
work — and why it is worth protecting.

---

# KA-AD-01 — Three layers with a strict one-way dependency direction

**Context.** The product needed a place for user-facing plumbing (a CLI), a place
for reusable capabilities (retrieval, prompting, AI), and a place to wire them
together. The question was how strictly to separate these and which way
dependencies should point.

**Decision.** Three layers — **CLI → Product → Platform** — with dependencies
allowed to point in only one direction: downward. No platform capability may
import the product or the CLI. This is enforced structurally by the import graph.

**Alternatives considered.**
- *A single cohesive application* with modules but no enforced direction — faster
  to write, no ceremony.
- *Two layers* (app + libraries) without a distinct product layer, letting the CLI
  orchestrate directly.

**Consequences.** Every platform capability is reusable because it cannot see its
consumer. The cost is indirection: launching one question touches three layers,
and there is more wiring than a monolith would need. It also puts a burden of
discipline on future work — the direction is only preserved if new code respects
it.

**Did the decision prove successful?** **Yes — this is the load-bearing decision,
and everything good followed from it** (testability, the render/generate seam,
model-agnosticism). One honest caveat: reusability is so far *proven structurally*
(the platform genuinely does not depend on the product) but not yet *proven by a
second consumer*. PRODUCT-002 will be the real exam. Until then, treat "reusable"
as strongly designed-for rather than field-tested.

**Longevity: Permanent.** The layering and dependency direction are foundational;
reversing them would produce a different product, not a refactor of this one.

---

# KA-AD-02 — Orchestration lives in the product, never in the platform

**Context.** Someone has to run the stages in order: config → handbook → retrieval
→ context → prompt → AI → display. That composition could live in a platform
service, in the CLI, or in the product.

**Decision.** Composition is a **product** responsibility. The single method
`answer()` is the entire pipeline, and it is the only place platform capabilities
are wired together. Platform capabilities never call each other to "advance the
pipeline."

**Alternatives considered.**
- *A platform "pipeline" or "orchestrator" service* that chains the stages — would
  centralize the flow but would have to know about every capability, coupling them.
- *CLI-driven orchestration* — the CLI calls each stage — which would fuse the
  interface to the flow and duplicate logic across one-shot and interactive modes.

**Consequences.** There is exactly one orchestration path, easy to read top to
bottom, and each capability stays ignorant of the others. The product layer
carries real weight (it is the biggest single file), and the flow is not reusable
on its own — but the *pieces* are.

**Did the decision prove successful?** **Yes.** The single-path pipeline is the
clearest thing in the codebase, and it is why both interaction modes provably
behave identically. No regret.

**Longevity: Permanent.** Orchestration will grow richer, but it will always live
in the product layer.

---

# KA-AD-03 — Reuse the Context Builder through its public contract, behind an adapter

**Context.** The assistant needs retrieved articles turned into structured,
citable context. AJ-OS already had a Context Builder platform service (SPEC-002)
that assembles an immutable Context Package. The choice: reuse it, replace it, or
modify it for the product's needs.

**Decision.** Reuse the Context Builder **through its public contract only** — no
coupling to its internals — and bridge the type mismatch with a small product-layer
adapter (`wikiKnowledgeProvider`) that turns retrieval results into knowledge items.
Where integration reveals a genuinely deferred behaviour, complete it as a platform
enhancement behind that same contract rather than work around it in the product.

**Alternatives considered.**
- *A product-specific context assembler* — simpler for this one product, but it
  would duplicate a platform concern and diverge from the shared contract.
- *Modify the Context Builder* to accept retrieval results directly — would couple
  a general platform service to one product's data shapes.

**Consequences.** The product got structured, immutable, citable context for
roughly sixty lines of adapter glue — a strong signal that the platform boundary
was drawn in the right place. Integration did surface **one intentionally deferred
behaviour**: M4 Assembly emitted structural sections but left their bodies empty, so
a rendered prompt would have carried citations but no article text. Completing it
took one small, principled platform enhancement — Assembly now copies each item's
content into its section body — made *in the platform*, behind the same public
contract, with the product coupling to nothing internal. The remaining cost: the
assistant exercises only a thin slice of a general service (Selection has little to
do once Retrieval has already chosen), and the builder's *configuration* knobs
(`documentation` profile, explainability, Markdown output) are still **inert**,
because the rest of v1.0 Assembly is structural only. The product asks for behaviour
the builder does not yet deliver.

**Did the decision prove successful?** **Yes, with an asterisk.** Reuse-through-the-
contract was the right call and validated the platform investment on its first real
consumer — including the healthy sign that when a genuine gap appeared, the fix was a
small *platform* enhancement behind the published contract, not a product-side
workaround reaching into internals. The boundary held; the platform matured slightly
through real use. The asterisk is the still-inert *configuration*: the code implies
capabilities that do not exist yet. Either wire those knobs through or stop passing
them — a cleanup noted for a future version, not a flaw in the decision itself.

**Longevity: Expected to evolve.** Reuse-via-adapter stays; the *depth* of the
integration (wiring the currently inert configuration, or trimming context for the
assistant's needs) is expected to change.

---

# KA-AD-04 — Retrieval trusts the generated index, not the filesystem

**Context.** Retrieval must decide *what the searchable corpus is*. The wiki is a
directory tree of Markdown files, but it also contains maintainer files
(`README.md`, `log.md`, `CLAUDE.md`) that are not knowledge. How should the corpus
be determined?

**Decision.** The corpus is defined by **`wiki/index.md`** — the catalog the
handbook generator maintains. Retrieval scores only the articles the index links
to, in the order it lists them. The filesystem is consulted only to locate where
each linked article lives, never to discover *what* belongs.

**Alternatives considered.**
- *Recursive filesystem scan* — walk the wiki tree and search every `.md` file.
  Simple and self-updating, but it would sweep in non-knowledge files and force
  brittle name-based exclusions.
- *A hardcoded folder convention* (e.g. only `concepts/`) — rigid, and coupled to
  one generator's layout.

**Consequences.** A human/generator-curated index is the single authority on what
counts as knowledge, so maintainer files are *structurally* invisible to search
with no exclusion list to maintain. The dependency is that the index must be
accurate and complete; an article missing from the index is invisible even if the
file exists. (This was a deliberate mid-course reversal — see
[engineering-decisions.md](./engineering-decisions.md).)

**Did the decision prove successful?** **Yes — one of the best decisions in the
product.** It replaced a fuzzy, exclusion-list-driven scan with a clean rule:
*trust the index*. It aligns perfectly with the AJ-OS principle that the generated
wiki is an authored artifact, not just a pile of files. The only care required is
keeping the generator's index honest, which is the generator's job anyway.

**Longevity: Permanent.** "Trust the generated index" is a principle, not an
implementation detail. The scorer behind it may change (KA-AD-10); the authority of
the index should not.

---

# KA-AD-05 — Separate the Prompt Renderer from the AI Client

**Context.** Between "we have assembled context" and "we have an answer" sit two
distinct concerns: shaping the context into a prompt, and sending that prompt to a
model. These could be one component or two.

**Decision.** Two capabilities with a hard seam. The **Prompt Renderer** is a
pure, synchronous function from `(question, ContextPackage)` to a
`{ system, user }` prompt — it calls no model and awaits nothing. The **AI Client**
is the only thing that talks to a provider.

**Alternatives considered.**
- *One "AI service"* that takes context and returns an answer, building the prompt
  internally — fewer moving parts, but prompt construction would be untestable
  without a live API and welded to one provider.

**Consequences.** Prompt construction is deterministic and unit-testable with no
network, and the exact same prompt would be produced regardless of which provider
ran it. The cost is one more capability and one more contract (`RenderedPrompt`).

**Did the decision prove successful?** **Yes — unambiguously.** The seam is why
the product is model-agnostic and why prompt behaviour can be tested cheaply. It is
also the natural home for future work (e.g. threading conversation history into
the prompt). No regret.

**Longevity: Permanent seam, evolving contents.** The render/generate *separation*
is fixed; the prompt the renderer *produces* is expected to evolve (formatting,
conversation history, richer citations).

---

# KA-AD-06 — Quarantine all provider specifics in the AI Client, with no provider abstraction yet

**Context.** The product talks to Anthropic through an SDK. Provider concerns — the
SDK, model selection, transport, the API key, request/response shapes — have to
live somewhere. A related question: should there be a provider-agnostic interface
now, anticipating other models?

**Decision.** Put **all** provider specifics in the single AI Client class, and
build **no** provider abstraction yet. One provider, reached through one class that
maps the neutral prompt onto one Messages request and extracts text back out.

**Alternatives considered.**
- *A provider-abstraction layer now* (interface + Anthropic implementation) —
  future-proof, but speculative generality for a single provider with no second
  provider to validate the abstraction against.
- *Scatter provider calls* wherever convenient — no.

**Consequences.** Swapping or adding a provider is a contained, one-file change,
and nothing upstream knows a provider exists. The deferred cost is that adding a
*second* provider will require introducing the abstraction then, under real
requirements — which is the point.

**Did the decision prove successful?** **Yes.** Quarantine succeeded completely
(the SDK genuinely appears in one file). Declining the premature abstraction was
also correct: designing a provider interface against one provider would have been
guesswork. The render/generate seam (KA-AD-05) already gives us the seam we would
extend when a real second provider arrives.

**Longevity: Expected to evolve.** The quarantine is permanent; the "no provider
abstraction yet" half is explicitly temporary and ends the day a second provider
is added.

---

# KA-AD-07 — A deliberate, type-based error taxonomy

**Context.** Failures come in two moral categories: *the user needs to fix
something* (no config, no wiki, no API key) and *the developer needs to fix
something* (an unexpected bug). The product needs to treat these differently.

**Decision.** Three user-facing error types — `ConfigError`, `HandbookError`,
`AIError` — each carrying a message written for a human. The product catches
exactly these and prints them plainly; **anything else is re-thrown loudly**. The
"is this the user's problem?" boundary is encoded in the type system.

**Alternatives considered.**
- *Catch-all error handling* that prints any error as a friendly message — would
  hide real bugs behind reassuring text.
- *Return-value error signalling* (result objects) instead of typed exceptions —
  more plumbing, and easy to ignore a returned error.

**Consequences.** Users get clear, actionable messages for the problems they can
actually fix, while genuine bugs surface loudly instead of being swallowed. The
discipline required: every new *expected* failure must be wrapped in one of these
types, or it will (correctly, but perhaps surprisingly) crash the process.

**Did the decision prove successful?** **Yes.** The taxonomy makes the failure
UX predictable and keeps the product honest about what it does and does not
understand. The one thing to watch is drift — a future capability that forgets to
wrap an expected error will produce a crash where a friendly message was intended.
That is a maintenance rule to state clearly, not a defect.

**Longevity: Permanent.** The two-category model (user problem vs. bug) is
foundational; only the *number* of user-facing error types is expected to grow.

---

# KA-AD-08 — Debug is presentation-only, over a single orchestration path

**Context.** The product needed introspection — what was retrieved, how big the
context was, how long each stage took. The risk with diagnostics is a forked "debug
mode" that behaves differently from the real one.

**Decision.** `--debug` changes only what is **shown**, never what is **done**. The
timings and diagnostics are gathered on every run by measuring the same platform
calls the pipeline already makes; they are simply not printed unless debug is on.
There is one pipeline, not two.

**Alternatives considered.**
- *A separate debug/verbose execution path* — easy to bolt on, but it would risk
  the diagnostics describing a run that differs from the real one.
- *No introspection at all* — leaves the naive retrieval and context sizes opaque.

**Consequences.** Diagnostics are trustworthy because they describe the exact run
the user got. The negligible cost is that timing wrappers always execute, whether
or not their output is shown.

**Did the decision prove successful?** **Yes.** It gave real observability into an
otherwise opaque pipeline (especially the naive retrieval) at essentially zero
behavioural risk. Small decision, clean payoff.

**Longevity: Permanent.** Presentation-only diagnostics over a single execution
path is a principle worth holding as the product grows.

---

# KA-AD-09 — Config and Handbook are two capabilities, not one

**Context.** Two nearby facts must be established before retrieval: *the
configuration is valid and points somewhere real*, and *that somewhere is a
handbook with a generated wiki we can search*. These could be one "setup" step.

**Decision.** Two separate capabilities. The **Config Service** validates
`aj.config.json` and the path it names. The **Handbook Service** takes a path it is
handed and confirms the handbook structure and the presence of `wiki/`. The
Handbook Service does not know configuration exists.

**Alternatives considered.**
- *One combined service* that reads config and validates the handbook in a single
  step — fewer pieces, but it would conflate two failure modes and couple handbook
  knowledge to configuration.

**Consequences.** Each failure gets a precise, distinct message ("config not found"
vs. "handbook has no wiki"), and the Handbook Service is reusable by any caller
that already has a path (not just this product). The cost is two constructs and one
extra hand-off where one might have done.

**Did the decision prove successful?** **Yes.** The precise error messages
directly realize user-flows 6 and 7, and the clean split kept the Handbook Service
free of configuration concerns. A small but genuinely correct separation.

**Longevity: Permanent.** Two capabilities with distinct failure modes; no reason
to expect them to merge.

---

# KA-AD-10 — Keep retrieval scoring naive, but sealed behind the service contract

**Context.** Retrieval quality is the hardest part of a knowledge assistant.
Version 1.0 had to ship, and building good relevance ranking (BM25, embeddings)
was more than the first release needed.

**Decision.** Use a **deliberately naive** keyword score (term frequency), but seal
the algorithm entirely behind the Retrieval Service's contract so it can be
replaced later without any other stage noticing. Ship the simple thing; make it
easy to replace.

**Alternatives considered.**
- *Invest in semantic/embedding retrieval now* — better answers, but a large scope
  increase for v1.0 and premature before the product's shape was proven.
- *Naive scoring with no encapsulation* — quick, but it would leak the algorithm's
  assumptions into callers and make replacement a cross-cutting change.

**Consequences.** The product shipped a working end-to-end pipeline quickly, and
retrieval can be upgraded as a **one-file** change behind a stable contract. The
accepted cost is real: raw term frequency is fragile — common-word questions (the
walkthrough's own `"Who am I?"`, tokenizing to `who`/`am`/`i`) can rank on
stopword frequency rather than genuine relevance.

**Did the decision prove successful?** **Yes as an architecture decision, even
though the algorithm itself is weak.** The decision was never "keyword scoring is
good" — it was "ship a replaceable placeholder behind a firm seam," and that seam
is exactly what makes the highest-leverage future upgrade cheap and safe. The
scorer will be replaced; the decision to isolate it is what proved right.

**Longevity: Temporary (by design).** The naive scorer is a placeholder built to be
replaced; only the sealing contract around it is permanent.

---

# Summary scorecard

| # | Decision | Verdict |
| --- | --- | --- |
| KA-AD-01 | Three layers, one-way dependencies | ✅ Load-bearing; reuse proven structurally, awaits a 2nd product |
| KA-AD-02 | Orchestration in the product | ✅ Clearest thing in the codebase |
| KA-AD-03 | Reuse Context Builder via adapter | ✅ with asterisk (config knobs currently inert) |
| KA-AD-04 | Index-driven retrieval | ✅ One of the best calls |
| KA-AD-05 | Renderer separate from AI Client | ✅ Unambiguous win |
| KA-AD-06 | Provider quarantine, no premature abstraction | ✅ Correct on both counts |
| KA-AD-07 | Type-based error taxonomy | ✅ Watch for drift |
| KA-AD-08 | Presentation-only debug | ✅ Clean payoff |
| KA-AD-09 | Config and Handbook split | ✅ Precise failures |
| KA-AD-10 | Naive-but-sealed retrieval | ✅ as a decision; algorithm is the known weak spot |

The pattern across all ten: the decisions that **drew boundaries** (layers,
seams, quarantine, index-as-authority) proved strongest, and the two asterisks
(inert Context Builder config, weak keyword scorer) are both *implementation debt
behind good boundaries* rather than bad decisions — which is the most forgivable
kind of debt to carry into a Version 1.0.

---

# Relationship to the specifications

The specifications say the product should be model-agnostic, trustworthy, grounded,
and read-only. This document records the *structural bets* that make those
qualities true rather than aspirational: the render/generate seam (model-agnostic),
the error taxonomy and grounded pipeline (trustworthy), index-defined retrieval
(grounded), and the absence of any write path (read-only). Where the
[Principles](../../../docs/specifications/products/PRODUCT-001-principles.md) state
*what the assistant should be*, this document explains *why the architecture makes
it so* — and, uniquely, whether the bet paid off.

---

# Closing reflection

Looking back across all ten decisions, one lesson stands out above the rest:

> **The strongest decisions were the ones that established *boundaries* rather than
> *implementations*.**

The layering, the render/generate seam, the provider quarantine, and treating the
generated index as the authority on knowledge were all decisions about *where a
line goes* — not about *what fills the space inside it*. Those are the decisions
that have no asterisk.

The corollary is just as important. Where PRODUCT-001 carries technical debt — the
inert Context Builder configuration, the naive keyword scorer — that debt sits
**behind stable architectural seams**. The scorer can be replaced without any other
stage noticing; the context configuration can be wired through without touching the
pipeline. The debt is contained by the very boundaries the good decisions drew.

The practical consequence is the property most worth preserving from this build:

> **PRODUCT-001 can evolve internally without requiring architectural redesign.**

Its known weaknesses are all *replaceable implementations behind firm contracts*,
not structural flaws. That is the difference between a Version 1.0 that becomes a
foundation and one that becomes a rewrite — and it is the single most valuable
outcome of taking the architecture seriously before writing the product.
