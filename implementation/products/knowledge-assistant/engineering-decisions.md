# PRODUCT-001 — Knowledge Assistant Engineering Journal

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Engineering Journal

---

# Purpose

This is the engineering journal of PRODUCT-001 — the story of how the product
*actually evolved*, captured while the build is still fresh.

It is deliberately different from [decisions.md](./decisions.md). That document is
architectural and organized by decision; it asks *"what choices define the
product?"* This document is chronological and organized by time; it asks *"how did
the product get here, and where did our understanding change?"*

It records **turning points** — the moments the shape of the product shifted or an
assumption broke — not every task. If a moment changed how the rest of the work
was approached, it is here. If it was routine execution, it is not.

**A note on dates.** During the build, almost all effort went into the product and
very little into commits or notes, so a precise day-by-day timeline is not
recoverable from git. The honest axis of this journal is therefore the
**implementation milestone** (M1–M7 from the
[implementation plan](../../../implementation/products/PRODUCT-001-implementation.md)),
with approximate ordering. Reconstructing this journal *now*, before the details
fade, is precisely why it exists. The at-a-glance chronology lives in
[architecture-timeline.md](./architecture-timeline.md); this document is the
narrative behind it.

Each entry follows the same shape: **Milestone · Situation · Decision · Why the
change was necessary · What changed · Long-term impact.**

---

# Orientation: the journey at a glance

Before the prose, here is the whole arc — each step tagged with the journal entry
that tells its story. This is a reader's compass, not the map; the polished
one-page version lives in [architecture-timeline.md](./architecture-timeline.md).

```text
Vision                     an AI that answers from a handbook
   ↓
Product-first              let one product pull the platform into being   (EJ-01)
   ↓
CLI                        a runnable front door: aj ask
   ↓
Config                     find out where the handbook lives              (EJ-02)
   ↓
Handbook                   the handbook is its own external project       (EJ-02)
   ↓
Retrieval                  trust the generated index, not the filesystem  (EJ-03)
   ↓
Context Builder            reused via its contract; one small enhancement   (EJ-04)
   ↓
Prompt Renderer            split from the model call — the key seam       (EJ-05)
   ↓
AI Client                  the smallest stage of all                      (EJ-06)
   ↓
CLI Polish                 collapse to `aj ask`; defer memory honestly    (EJ-07, EJ-08)
   ↓
Version 1.0                grounded, cited answers — shipped
```

---

# EJ-01 — Platform-first became product-first

**Milestone:** Before M1 — the founding pivot.
**Type:** Corrective — a course correction of the entire development strategy.

**Situation.** AJ-OS had been built top-down: architecture, then standards, then
specifications, then the first platform service (the Context Builder, SPEC-002).
This produced excellent foundations but no product a person could actually use. The
platform was being built on the assumption that products would arrive later and
find it ready.

**Decision.** Invert the order. Choose one real, user-facing product — the
Knowledge Assistant — and let *its* needs decide which platform capabilities get
built and what they must do. The rule became: *every platform capability exists
because a product needed it.*

**Why the change was necessary.** Platform-first was quietly accumulating risk:
capabilities were being designed against imagined future needs rather than real
ones. Without a product pulling on them, there was no forcing function to reveal
whether the boundaries were right or the abstractions useful. A platform validated
only by more platform is a platform validated by nothing.

**What changed.** The Knowledge Assistant became the driver of the roadmap. Config,
Handbook, Retrieval, Prompt Renderer, and AI Client were each built *because
`aj ask` could not work without them* — not because a specification predicted they
would be nice to have. The existing Context Builder got its first real consumer and
had to prove it could actually be consumed.

**Long-term impact.** This is the single most consequential decision in the entire
product, and everything in [decisions.md](./decisions.md) descends from it. It gave
the platform a reason to be shaped the way it is, and it established the pattern
every future AJ-OS product is expected to follow: **build the product, let it pull
the platform into existence.** It also turned "is the platform reusable?" from a
belief into a testable claim.

---

# EJ-02 — The handbook became its own project

**Milestone:** M2 — Connect a Handbook.
**Type:** Planned — a deliberate boundary chosen as the handbook was connected.

**Situation.** Early on, the knowledge the assistant answers from lived
conceptually *inside* AJ-OS. Connecting a handbook raised the question of where that
knowledge actually belongs and who owns it.

**Decision.** Make the handbook an **external project entirely**, referenced by a
path in `aj.config.json` (it resolves outside the AJ-OS repository). AJ-OS became a
strictly read-only *consumer* of a handbook it does not contain and does not own.

**Why the change was necessary.** Knowledge and the tool that reads it are
different things with different lifecycles. Embedding the handbook would have fused
a personal, ever-growing knowledge base to a software repository, made the tool
specific to one person's content, and blurred the read-only boundary the product
depends on. Separating them kept AJ-OS *about the software*, not about the
knowledge.

**What changed.** Configuration became the seam between the tool and the knowledge.
The Config Service validates a path; the Handbook Service validates the structure
at that path. Neither contains any handbook content. The product can point at any
handbook that follows the expected structure.

**Long-term impact.** This is why AJ-OS is a *platform* and not a personal script.
The same product could serve a different handbook tomorrow with a one-line config
change. It also cemented the one-directional knowledge flow (handbook → wiki →
answer) as a physical fact of the repository layout, not just a principle.

---

# EJ-03 — Retrieval switched from recursive discovery to index-driven

**Milestone:** M3 — Search the Wiki.
**Type:** Corrective — replaced a first approach that had already been built.

**Situation.** The first instinct for "search the wiki" was the obvious one: walk
the wiki directory recursively, collect every Markdown file, and score them all.
This worked — and immediately started surfacing the wrong things. Maintainer files
that happen to live in the wiki tree (`README.md`, `log.md`, `CLAUDE.md`) are not
knowledge, but a recursive scan treats them as fair game.

**Decision.** Stop discovering the corpus from the filesystem. Instead, read
`wiki/index.md` — the catalog the handbook generator maintains — and search **only
the articles the index links to**. The filesystem is consulted only to find *where*
each linked article lives, never to decide *what* counts as knowledge.

**Why the change was necessary.** The recursive approach forced a losing game of
maintaining an exclusion list — every new kind of non-knowledge file would need
another rule. Worse, it treated the wiki as a pile of files rather than as the
authored, curated artifact it actually is. The generated index already encodes the
answer to "what is knowledge here?"; rediscovering it by scanning was both
redundant and wrong.

**What changed.** Retrieval became an *index reader* first and a *file reader*
second. Non-knowledge files became structurally invisible with zero exclusion rules.
The corpus is now exactly what the generator says it is.

**Long-term impact.** This became one of the cleanest ideas in the product
(recorded as KA-AD-04) and a small philosophical statement: **trust the generated
artifact.** It aligned Retrieval with the broader AJ-OS belief that the wiki is
authored, not incidental. The scoring algorithm behind it is still naive and will
be replaced — but *what* it searches was settled correctly here and has not needed
to change since.

---

# EJ-04 — The Context Builder fit behind its contract — with one small enhancement

**Milestone:** M4 — Build Context.
**Type:** Discovered — near-zero friction, and the one gap was a deferred platform behaviour, not a coupling.

**Situation.** The plan called for connecting retrieval to the Context Builder. The
open worry was how much the existing platform service — built earlier, under
SPEC-002, without this product in mind — would have to be bent to accept
retrieved wiki articles.

**Decision.** Consume the Context Builder only through its public entry point — the
product couples to nothing internal — via a small adapter (`wikiKnowledgeProvider`)
that turns retrieval results into the knowledge items the builder already accepts.
And where integration revealed a genuinely deferred behaviour, complete it *in the
platform*, behind the same contract, rather than work around it in the product.

**Why the change was necessary.** Almost none of the feared friction materialized:
the Context Builder's public contract was general enough that roughly sixty lines of
adapter fed it, with the product coupling to nothing internal. But integration did
surface **one intentionally deferred behaviour** — M4 Assembly emitted structural
sections but not their article bodies (`content` was empty), so the rendered prompt
would have carried citations and no text. Completing that took one small, principled
platform enhancement (Assembly now copies each item's content into its section body).
Its right home was the platform, behind the contract — not a product-side workaround
reaching into internals.

**What changed.** The integration turned out to be *composition through the
contract*, not *surgery on internals*. The product gained structured, immutable,
citable context for a small adapter, and the Context Builder needed just one small,
honest enhancement — completing a behaviour it had deliberately deferred — rather
than any product-driven internal coupling.

**Long-term impact.** This was the moment the product-first bet (EJ-01) visibly paid
off: a platform service built earlier was consumed by a product built later
*entirely through its published contract*, and when a real gap appeared the platform
matured to meet it — the honest signature of a boundary drawn in the right place, not
a violation of one. (The caveats — that the assistant uses only a thin slice of the
builder, and asks for configuration it does not yet honor — are recorded honestly in
KA-AD-03.)

---

# EJ-05 — Prompt rendering was pulled out of the AI client

**Milestone:** M5 — Generate Answers.
**Type:** Planned — a principled boundary chosen over the convenient default.

**Situation.** The natural, lazy shape for "generate an answer" is one component:
hand it context, it builds a prompt internally and calls the model. As the AI stage
came into view, that single-component design was the default path.

**Decision.** Split the stage in two. A pure, synchronous **Prompt Renderer** turns
context into a `{ system, user }` prompt and does nothing else; a separate **AI
Client** is the only thing that talks to a provider. The prompt is built *before*
and *independently of* any model call.

**Why the change was necessary.** Folding prompt construction into the AI client
would have made the most testable, most important part of answer quality — the
prompt itself — impossible to test without a live API, and would have welded the
prompt's shape to one provider. The behavioural guarantees the product makes
(answer only from context, cite sources, admit uncertainty) live in the prompt;
they deserved a home that could be exercised deterministically.

**What changed.** Prompt construction became pure and unit-testable with no network,
and the exact same prompt would be produced no matter which provider ran it. The
render/generate *seam* was born here.

**Long-term impact.** This seam (KA-AD-05) turned out to be one of the highest-value
structural choices in the product. It is what makes PRODUCT-001 model-agnostic, and
it is the pre-built home for the biggest deferred feature — threading conversation
history into the prompt. A convenience decision resisted in one milestone became a
foundation for several later ones.

---

# EJ-06 — The AI integration was the smallest stage

**Milestone:** M5 — Generate Answers.
**Type:** Discovered — a realization about where the complexity actually lived.

**Situation.** Intuitively, "the AI part" sounds like the hard, central part of an
AI product. The whole thing is *called* a Knowledge Assistant; surely the model
integration is where the complexity lives.

**Decision.** Keep the AI Client deliberately tiny: one class, one non-streaming
request, map a neutral prompt onto one Messages call, extract the text back out.
No provider abstraction, no streaming, no retries, no conversation memory.

**Why the change was necessary.** By the time the pipeline reached the AI stage,
almost all the real work — deciding what knowledge to trust, retrieving it,
assembling it, rendering a grounded prompt — was already done. The model call had
nothing left to do but *ask*. Adding machinery there would have been complexity in
the one place that didn't need it.

**What changed.** The realization, more than the code: the AI Client is one of the
shortest files in the product, and it stayed that way. The intelligence of the
product is not in the model call — it is in everything upstream that decides what to
put in front of the model.

**Long-term impact.** This reframed how the whole product is understood, and it is
one of the clearest stories the build has to tell: **most of the complexity was
architecture, not AI.** For a portfolio case study this is the counterintuitive
headline — the "AI product" spends almost none of its engineering budget on the AI.
It also validated quarantining the provider (KA-AD-06): there was so little there
that a premature abstraction would have been pure speculation.

---

# EJ-07 — The CLI surface was simplified to `aj ask`

**Milestone:** M6–M7 and CLI polish.
**Type:** Corrective — undid a speculative command taxonomy.

**Situation.** An earlier CLI shape nested the command as `aj knowledge ask`,
anticipating a family of `knowledge` sub-commands. In practice there was one
flagship interaction, and the extra nesting was friction on the primary path.

**Decision.** Promote the flagship to the top level: `aj ask` (one-shot with a
question, interactive without). Keep `aj knowledge ask` as a **deprecated alias**
that prints a warning and routes to the same product call, so existing muscle memory
and any scripts keep working.

**Why the change was necessary.** The primary action a user takes should be the
shortest thing to type. Nesting it under a category that had exactly one member was
speculative taxonomy — organizing for products that did not exist yet. At the same
time, silently breaking the old command would have been rude, hence the alias.

**What changed.** The product's front door became a single obvious command, while
backward compatibility was preserved through a thin deprecation shim. The CLI stayed
a *launcher* — the deprecation warning is the only behaviour it owns beyond routing.

**Long-term impact.** A small but honest lesson in not organizing for imagined
scale: the taxonomy should grow when there are things to put in it, not before. The
deprecation-alias discipline also set a precedent for how AJ-OS evolves user-facing
surfaces without breaking them.

---

# EJ-08 — Conversation memory was consciously deferred

**Milestone:** M7 — Support Conversations.
**Type:** Corrective — a conscious scope trim against the plan's assumption.

**Situation.** The implementation plan's final milestone was conversational
follow-up. An interactive loop was built, and it *looks* conversational — it reads
question after question in one session. But wiring genuine memory (carrying prior
turns into each prompt) turned out to be a larger, subtler task than the loop
itself.

**Decision.** Ship the interactive loop **without** true conversation memory for
v1.0. Each question is answered independently; the AI Client carries no history. Do
not fake it, and do not hold the release for it.

**Why the change was necessary.** Half-built memory is worse than none — it invites
users to rely on continuity that isn't there. The honest options were "do it
properly" or "defer it and say so." Doing it properly would have delayed a
product that was already delivering its core value (grounded, cited answers), and
the render/generate seam (EJ-05) means it can be added later without redesign.
Better to ship an honest single-turn assistant than a misleading pseudo-conversation.

**What changed.** The scope of v1.0 was consciously trimmed: the loop is a
convenience for asking several questions in a row, not a memory. This is stated
plainly wherever a reader might assume otherwise (the walkthrough's "what it does
not do," the release notes).

**Long-term impact.** This is the largest gap between plan and reality, and naming
it honestly is more valuable than hiding it. It is the clearest candidate for the
first functional upgrade after v1.0, it has a pre-built home (the render/generate
seam), and it is a lasting lesson about the difference between *looking*
conversational and *being* conversational. The deeper reflection belongs in
[lessons-learned.md](./lessons-learned.md).

---

# The story in one arc

Read end to end, the turning points tell a single story:

```text
Platform-first was building foundations with no product to validate them   (EJ-01)
        ↓  invert
A real product (aj ask) becomes the forcing function
        ↓  and it needs knowledge…
The handbook is pushed out into its own project, consumed read-only        (EJ-02)
        ↓  …searched correctly
Retrieval learns to trust the generated index, not the filesystem          (EJ-03)
        ↓  …assembled
The Context Builder is consumed via its contract; one enhancement completes it (EJ-04)
        ↓  …turned into a prompt
Prompt rendering is split from the model call — the key seam is born       (EJ-05)
        ↓  …and finally asked
The AI stage turns out to be the smallest — complexity was architecture    (EJ-06)
        ↓  …then polished and made honest
The CLI collapses to `aj ask`; conversation memory is deferred openly      (EJ-07, EJ-08)
```

The through-line: **product-first pulled a coherent platform into existence, most
of the hard work turned out to be architecture rather than AI, and the places we
fell short of the plan were deferred openly rather than faked.** That is the story
worth carrying into the case study — and the reason [case-study-notes.md](./case-study-notes.md)
draws heavily on this journal.

---

# Engineering themes

Stepping back from the individual events, the same handful of principles kept
reappearing across the build — in different milestones, on different problems.
These are higher-level than any single journal entry; they are what PRODUCT-001
taught as *engineering practice*, and they are the most portable thing to carry
into PRODUCT-002 and beyond.

- **Build the product first; let it extract the platform.** Every capability
  earned its place by being needed, not predicted. Product-first was not just a
  roadmap choice — it was the forcing function that kept the platform honest.
  *(EJ-01, EJ-04)*
- **Prefer stable boundaries over clever implementations.** The decisions that
  drew lines — where the handbook lives, what the corpus is, where the provider is
  sealed, where rendering ends and generation begins — outlasted every clever
  detail. Boundaries are cheap to keep and expensive to move; implementations are
  the reverse. *(EJ-02, EJ-03, EJ-05)*
- **Keep capabilities small and independently testable.** Each capability solved
  one problem and could be exercised alone. Smallness was what made the seams
  possible and the pipeline legible. *(EJ-05)*
- **One component, one responsibility.** The renderer renders; the client calls;
  the retriever retrieves. The moment two responsibilities wanted to share a
  component was the moment to split them. *(EJ-05, EJ-06)*
- **Delay complexity until it is actually necessary.** No provider abstraction for
  one provider, no semantic retrieval before the shape was proven, no faked
  conversation memory. Complexity was spent only where the product had already
  earned it. *(EJ-06, EJ-08)*
- **The simplest solution was often the most reusable.** The sixty-line adapter,
  the index-as-authority rule, the tiny AI client — the least clever answers
  turned out to be the ones that composed and lasted. *(EJ-03, EJ-04, EJ-06)*

## Planned, discovered, or corrected?

Tagging the eight turning points by origin tells its own small story:

| Origin | Count | Entries |
| --- | --- | --- |
| **Planned** | 2 | EJ-02, EJ-05 |
| **Discovered** | 2 | EJ-04, EJ-06 |
| **Corrective** | 4 | EJ-01, EJ-03, EJ-07, EJ-08 |

Half of the pivotal moments were **corrections** — including the two biggest ones
(inverting to product-first, and deferring conversation memory). That balance is
the real lesson: a Version 1.0 is shaped as much by what it learns and undoes as by
what it plans. A build with *no* corrective turning points would be a build that
never discovered anything — and this journal exists precisely to keep those
corrections from being quietly forgotten once the code looks inevitable.
