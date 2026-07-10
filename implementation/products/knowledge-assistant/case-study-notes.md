# PRODUCT-001 — Case Study Notes (Engineering Notebook)

**Status:** Working notebook — not polished documentation
**Version:** 1.0.0
**Owner:** AJ
**Category:** Raw material for a future portfolio case study

---

> **What this is.** This is my engineering notebook for PRODUCT-001 — raw material
> for a future portfolio article and interview prep, captured while it's all still
> fresh. It is *not* a case study and it is *not* official documentation. It's
> allowed to be informal, fragmentary, and first-person. The goal is to preserve
> the thoughts that would otherwise evaporate; polishing comes later.
>
> Every story points back to where the *evidence* now lives in the documentation
> set, so this notebook doubles as an index. Stories that would play well in an
> interview are marked **🎯 interview**.

---

# Initial vision

- The idea: stop *browsing* my handbook and start *asking* it. Type a question,
  get an answer grounded in my own knowledge, with citations so I can trust it.
- Not a chatbot. Not "ChatGPT for my notes." Something narrower and more honest:
  answers only from the handbook, always cited, never invented.
- It was also meant to be the *first real product* on AJ-OS — the thing that proves
  the whole platform idea is worth anything.
- See: [PRODUCT-001 spec](../../../docs/specifications/products/PRODUCT-001-knowledge-assistant.md),
  [principles](../../../docs/specifications/products/PRODUCT-001-principles.md).

---

# The original assumptions

What I believed going in — some held, some didn't:

- ❌ "Build the platform first, products later." (This flipped completely.)
- ❌ "The AI integration will be the hard part." (It was the smallest.)
- ❌ "To search the wiki, scan the wiki." (Trusting the index was far better.)
- ❌ "The interactive loop = conversation." (A loop without memory isn't one.)
- ✅ "Knowledge and the tool should be separate projects." (Held perfectly.)
- ✅ "Small, single-purpose capabilities will compose." (Held.)
- ✅ "Citations are non-negotiable." (Still the heart of the product.)
- See: [lessons-learned.md](./lessons-learned.md),
  [engineering-decisions.md](./engineering-decisions.md).

---

# Major turning points

The moments where the project changed shape (the full journal is the real source):

1. **Platform-first → product-first.** The founding pivot. Let one product decide
   what to build. **🎯 interview**
2. **Handbook became its own external project.** The tool reads knowledge it
   doesn't own.
3. **Recursive file scan → index-driven retrieval.** Trust the generated catalog.
   **🎯 interview**
4. **Context Builder mostly fit.** Reused via its public contract, ~60 lines of glue + one small assembly enhancement. **🎯 interview**
5. **Prompt Renderer split out of the AI Client.** The seam that made everything
   model-agnostic. **🎯 interview**
6. **Realized the AI stage was tiny.** Complexity was architecture, not AI.
   **🎯 interview**
7. **CLI collapsed to `aj ask`; conversation memory deferred openly.**
- See: [engineering-decisions.md](./engineering-decisions.md) (EJ-01…EJ-08),
  [architecture-timeline.md](./architecture-timeline.md).

---

# Biggest architectural challenges

- **Where does orchestration live?** Getting it *out* of the platform and *into*
  the product took discipline — the lazy move is to let a platform service chain
  the stages. Keeping the platform ignorant of its consumer was the whole game.
- **Drawing the retrieval corpus boundary.** "What counts as knowledge?" turned out
  to be the hard question, not "how do I score relevance?"
- **Resisting premature abstraction.** Not building a provider interface for one
  provider. Not building semantic retrieval before the shape was proven. Saying
  "not yet" is harder than saying "yes."
- **Keeping the product thin.** Every time logic wanted to creep into the product,
  the right question was "which platform capability is actually missing?"
- See: [architecture.md](./architecture.md), [decisions.md](./decisions.md).

---

# Biggest surprises

The three that genuinely caught me off guard (fuller list under "Things that
surprised me" below):

- **The AI was the easy part.** I budgeted for the model integration to be the
  centerpiece. It's one of the shortest files in the repo.
- **The Context Builder needed only one small change.** I braced for surgery; it was
  composition through the contract, plus a single deferred behaviour completed (Assembly
  now emits article bodies).
- **Doing *less* was the better answer for retrieval.** Reading a curated index beat
  cleverly scanning everything.

---

# Engineering decisions I'm most proud of

- **Index-as-authority for retrieval.** Clean, principled, and it deleted a whole
  class of "exclude this file" problems. **🎯 interview** — See: [decisions.md](./decisions.md) KA-AD-04.
- **The render/generate seam.** One boundary that bought model-agnosticism *and*
  testability *and* a home for future conversation memory. **🎯 interview** — See: KA-AD-05.
- **Reusing the Context Builder instead of rewriting it.** Trusting the platform
  boundary and paying ~60 lines instead of reimplementing. **🎯 interview** — See: KA-AD-03, EJ-04.
- **Keeping the product thin.** The whole product is a composition. Proud that it
  stayed that way.
- **Deferring conversation memory honestly** instead of faking it. **🎯 interview**
- **Reconstructing this documentation immediately** so the story wasn't lost. Meta,
  but I'm proud of it.

---

# Mistakes that improved the product

Mistakes I'm glad I made, because the fix taught the better design:

- **Scanning the filesystem first.** The wrong instinct is what revealed the right
  one (trust the index). The mistake *was* the lesson. **🎯 interview**
- **Starting platform-first.** Uncomfortable to admit, but the course-correction to
  product-first is the best decision in the project — and I only found it by feeling
  the pain of the wrong order. **🎯 interview**
- **Passing Context Builder config that does nothing.** Taught me the rule "never
  imply a feature you haven't wired."
- **Letting the loop imply memory.** Taught me the difference between *looking*
  conversational and *being* conversational — and the value of stating the gap out
  loud.
- See: [lessons-learned.md](./lessons-learned.md) ("Mistakes vs. conscious trade-offs").

---

# Things I would explain in an interview

Ranked by how much they show engineering judgment:

1. **"The AI product where almost none of the work was AI."** The hook. Then explain
   *why*: the intelligence lives upstream, in what you put in front of the model.
   **🎯 interview**
2. **Product-first as a forcing function.** How building the product validated the
   platform in a way no amount of speculative platform work could. **🎯 interview**
3. **Choosing architecture over convenience.** The render/generate seam and the
   orchestration-in-the-product decision, both against the lazier default.
   **🎯 interview**
4. **Knowing when to *stop* abstracting.** No provider interface, no semantic
   retrieval yet — and why that restraint was correct. **🎯 interview**
5. **Reuse over rewrite.** Consuming an existing service through its published contract
   (with one small enhancement) as evidence the boundary was right. **🎯 interview**
6. **Honesty as an engineering value.** Deferring memory openly; documenting the
   inert config and the stale banner instead of hiding them.

---

# Things I would show visually

The diagrams that carry the story on a slide (all already drawn):

- **The canonical architecture diagram** — the whole system at a glance.
  → [architecture.md](./architecture.md) ("The canonical architecture diagram").
- **The platform-grows-while-product-stays-small view** — the single best picture of
  the core insight. → [architecture-timeline.md](./architecture-timeline.md).
- **The seven-stage pipeline** — data changing shape from question to cited answer.
  → [system-walkthrough.md](./system-walkthrough.md).
- **The testing pyramid** — confidence at the base, thin product at the apex.
  → [testing.md](./testing.md).
- **The evolution timeline** — idea → v1.0 on one page.
  → [architecture-timeline.md](./architecture-timeline.md).

---

# Questions a reviewer might ask (and my honest answers)

Prep for the hard ones:

- **"Keyword retrieval? Really?"** Yes — a deliberate placeholder behind a stable
  contract, so it's a one-file upgrade. Shipping beat gold-plating. (KA-AD-10)
- **"You reuse the Context Builder but only use a slice of it — waste?"** It cost
  ~60 lines of adapter plus one small platform enhancement (Assembly emitting content).
  Reusing a proven service beat hand-rolling a lesser one, and the product never
  reached past the contract. The unused generality is the platform's, not the
  product's problem.
- **"You call it done but there's no conversation memory."** The interactive loop
  ships; memory was a conscious deferral, stated openly, with the seam to add it
  already in place. Honest scope, not a hidden gap. (EJ-08)
- **"One product doesn't prove a platform is reusable."** Correct — reuse is so far
  proven *structurally*, not by a second consumer. PRODUCT-002 is the real test.
  I'm careful not to overclaim this. (KA-AD-01)
- **"Anthropic-only — vendor lock-in?"** All provider specifics are quarantined in
  one class behind the render/generate seam; swapping is a contained change. No
  abstraction yet because there's no second provider to design against.
- **"Why is the orchestrator barely tested?"** The product is thin by design and
  covered by its parts; the one honest gap is a single end-to-end smoke test, which
  I've flagged. (testing.md)
- **"Config you pass does nothing?"** A real mistake, documented not hidden — either
  wire it or drop it next version.

---

# Things that surprised me

The raw discovery list — the stuff that's easy to forget and most valuable later:

- **Product-first development completely changed the project.** It wasn't a process
  tweak; it reorganized everything.
- **The Context Builder needed only one small enhancement** — and integration stayed
  entirely on its public contract. The clearest proof the platform boundaries were right.
- **Retrieval should trust the generated index instead of rediscovering files.**
  The curated artifact *is* the contract.
- **Most complexity came from architecture, not AI.** The defining realization.
- **The AI integration itself was relatively small** compared to the platform work
  around it.
- **How easy something is to test is a readout of whether its boundary is right.**
  Testability as an architecture signal.
- **"Not yet" is a harder, more valuable engineering skill than "yes."** Restraint
  did more for this product than cleverness.
- See: [lessons-learned.md](./lessons-learned.md) (sections 3 & "surprises").

---

# What building PRODUCT-001 changed about how I engineer software

*(Personal — about me, not the product.)*

- I stopped trying to build the perfect foundation first. I used to think good
  engineering meant getting the base right before anything else. Now I think good
  engineering means letting something *real* pull the base into existence, so it's
  validated instead of imagined.
- I got more comfortable **not building things.** Declining the provider abstraction,
  the semantic retrieval, the conversation memory — and being *right* to decline —
  taught me that restraint is a skill, not laziness. "What's the least I can build
  and still deliver value?" is now my default question.
- I started treating **boundaries as the real design work.** The clever
  implementations barely mattered; where I drew the lines mattered enormously. I now
  spend my design energy on seams, not internals.
- I learned to be **publicly honest about gaps.** Documenting the stale banner, the
  inert config, the missing memory — instead of quietly hoping no one notices —
  actually made the work *more* credible, not less. Honesty is an engineering
  feature.
- I finally internalized that **the story is perishable.** I nearly lost the whole
  engineering history because I didn't write it down as I went. Next time, the
  journal is part of the build, not an archaeology project after it.
- Biggest shift, in one line: **I used to optimize for building things well; now I
  optimize for building the right things in the right order, and trusting the
  boundaries I draw.**

---

# Future article ideas

Seeds for actual posts / portfolio pieces later:

- **"The AI Product Where the AI Was the Easy Part."** The counterintuitive headline
  piece — where the real engineering went.
- **"Product-First: How Building One Product Fixed My Platform."** The strategy
  reversal as a story.
- **"Trust the Index: Why I Deleted My File Scanner."** A tight technical piece on
  the retrieval decision.
- **"Boundaries Over Cleverness."** The through-line of the whole project — debt
  behind stable seams, evolve-without-redesign.
- **"How I Documented a Product I Forgot to Document."** A meta piece on
  reconstructing the engineering story, and why to journal as you go.
- **"Knowing When to Stop Abstracting."** Restraint as senior-engineer judgment.

---

# Future presentations

Talk ideas — different from the article ideas above; these are *stage* material
(conference talks, meetups, portfolio walkthroughs, technical interviews):

- **"Product-first vs. platform-first."** A talk about ordering: why I inverted the
  approach and what it fixed. Works for a meetup or a system-design interview.
- **"Why architecture mattered more than AI."** The counterintuitive keynote-ish
  one — great for a general engineering audience.
- **"Building reusable platform capabilities from a real product."** How to extract
  a platform without designing it in a vacuum. Good conference talk.
- **"Trusting generated knowledge instead of rediscovering it."** A focused
  technical talk on the retrieval decision.
- **"Separating prompt rendering from AI providers."** A short, sharp talk on the
  one seam that bought model-agnosticism + testability. Good for an interview
  whiteboard.
- See: [architecture-timeline.md](./architecture-timeline.md),
  [engineering-decisions.md](./engineering-decisions.md).

---

# Visual assets to create

Diagrams worth making for a future case study while it's fresh. *Don't build them
now — just record which ones would earn their place.* (Several already exist as
ASCII in the docs and could be redrawn cleanly.)

- **Final architecture diagram** — polished version of the canonical one.
  → source: [architecture.md](./architecture.md).
- **Evolution timeline** — idea → v1.0, one clean graphic.
  → source: [architecture-timeline.md](./architecture-timeline.md).
- **Product vs. Platform illustration** — the thin product on the accumulating
  platform. → source: [architecture-timeline.md](./architecture-timeline.md).
- **Pipeline diagram** — question → cited answer, seven stages.
  → source: [system-walkthrough.md](./system-walkthrough.md).
- **Retrieval: before vs. after** — filesystem scan → index-driven. The single most
  "gettable" technical visual.
- **Prompt-rendering boundary** — the render/generate seam, provider on one side.
- **Context Builder integration** — RetrievalResult[] → adapter → ContextPackage.
- **Documentation map** — how this whole doc set fits together (pairs with the
  README's documentation map).

---

# Future measurements

Not about collecting numbers today — about knowing *what evidence* would make the
future story stronger, so I can start capturing it if the project continues:

- **Retrieval quality** — before/after when the naive scorer is replaced (precision
  of top-5, "found the right article?" rate). The headline metric for a v0.2 story.
- **Context size** — bytes / sources assembled per question (already shown in
  `--debug`).
- **Token usage** — prompt + completion tokens per answer; cost per question.
- **Response latency** — per-stage timings (already gathered in `--debug`); where
  the time actually goes (spoiler: the AI call).
- **Test suite growth** — tests over time (started at 243; watch it climb per
  product). → baseline: [testing.md](./testing.md).
- **Platform capability reuse** — how many of the six capabilities PRODUCT-002
  reuses through their published contracts. *The* number that proves the platform thesis. **🎯 interview**
- **Number of products built on the platform** — the ultimate reuse metric; each new
  product that starts small is evidence.
- See: [testing.md](./testing.md), [architecture-timeline.md](./architecture-timeline.md).

---

> **Reminder to self:** don't polish this. Add to it. When it's time to write the
> case study, this notebook is the quarry — pull the stories, keep the honesty, and
> let the evidence links do the fact-checking.
