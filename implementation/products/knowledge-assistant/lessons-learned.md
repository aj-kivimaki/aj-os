# PRODUCT-001 — Knowledge Assistant Lessons Learned

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Retrospective

---

# Purpose

This is the honest retrospective for PRODUCT-001. It is deliberately the least
polished document in the set, because its value comes from candor, not from making
the project look finished and wise.

It is organized around four questions:

1. **What we got right.**
2. **What we got wrong.**
3. **What surprised us.**
4. **What PRODUCT-002 should do differently.**

Every lesson follows the same four fields — **Original assumption · What actually
happened · What changed in our understanding · What future work should do** — so
each one is a genuine before/after, not a verdict.

This document is about **engineering learning**, not architecture. The standing
architectural decisions live in [decisions.md](./decisions.md) and are not
re-argued here; where a lesson touches one, it links rather than repeats. What
follows is what the *experience of building* taught, which is a different and more
perishable kind of knowledge — which is exactly why it is written down now.

---

# 1. What we got right

## 1.1 — Letting a real product decide what to build

- **Original assumption:** building solid platform foundations first would pay off
  when products arrived to use them.
- **What actually happened:** the moment a real product started pulling on the
  platform, the *right* capabilities and boundaries became obvious in a way they
  never were while building in the abstract. Every capability earned its place by
  being needed for `aj ask` to work.
- **What changed in our understanding:** a platform with no consumer is not a
  validated platform — it is a set of untested guesses. The product is not a
  *client* of the platform; it is the platform's *proof*.
- **What future work should do:** keep building product-first. Never add a platform
  capability that no current product needs.

## 1.2 — Separating the tool from the knowledge

- **Original assumption:** the handbook and the software that reads it were part of
  the same effort and could live together.
- **What actually happened:** making the handbook a fully external project, reached
  only through a config path, kept AJ-OS *about the software* and made the same
  product able to serve any handbook.
- **What changed in our understanding:** knowledge and the tool that reads it have
  different owners and different lifecycles; fusing them would have quietly made the
  tool personal and un-reusable.
- **What future work should do:** keep the tool/knowledge boundary sacrosanct. Any
  future product should still treat the handbook as an external, read-only source.

## 1.3 — Trusting the generated artifact instead of rediscovering it

- **Original assumption:** to "search the wiki," the software should look at the
  wiki's files.
- **What actually happened:** trusting the generated `index.md` as the authority on
  *what counts as knowledge* — rather than scanning the filesystem — turned out to
  be dramatically cleaner and eliminated a whole class of "exclude this file"
  problems.
- **What changed in our understanding:** a generated, curated artifact is a
  *contract*, not just output. Treating it as authoritative is more robust than
  re-deriving its meaning from raw files.
- **What future work should do:** when a generator already encodes an answer, read
  the answer — do not recompute it from first principles.

## 1.4 — Keeping the product thin

- **Original assumption:** the product would need substantial logic to tie the
  pipeline together.
- **What actually happened:** the product ended up being a thin composition — a
  single orchestration method plus a ~60-line adapter — because the platform
  capabilities did the real work behind clean contracts.
- **What changed in our understanding:** "how much code is in the product?" is a
  health metric. A thin product means the platform is carrying its weight.
- **What future work should do:** treat product bloat as a smell. If a product grows
  fat, ask which platform capability is missing.

---

# 2. What we got wrong

## 2.1 — Starting platform-first

- **Original assumption:** the disciplined path was architecture → standards →
  specs → platform services, with products much later.
- **What actually happened:** platform work accumulated without a product to
  validate it, and it took a conscious course-correction to invert the order (see
  [engineering-decisions.md](./engineering-decisions.md), EJ-01).
- **What changed in our understanding:** discipline applied in the wrong order is
  still the wrong order. Foundations built without a consumer risk being
  well-engineered answers to the wrong questions.
- **What future work should do:** start every future effort from a product need and
  let it reach *down* into the platform, not the reverse.

## 2.2 — Passing configuration the pipeline does not honor

- **Original assumption:** asking the Context Builder for a `documentation` profile,
  explainability, and Markdown output would shape the assembled context.
- **What actually happened:** v1.0 Assembly is structural only, so those knobs are
  currently inert. The product asks for behaviour the platform does not yet deliver
  — the code *implies* capabilities it lacks.
- **What changed in our understanding:** passing configuration that has no effect is
  worse than passing none: it misleads the next reader into thinking a feature
  exists. Wiring should be honest about what is actually connected.
- **What future work should do:** either wire a capability's configuration end to
  end, or do not pass it until it does something. No aspirational parameters.

## 2.3 — Letting a loop look like a conversation

- **Original assumption:** the final milestone ("support conversations") would be
  satisfied by an interactive loop that reads question after question.
- **What actually happened:** the loop was built, but it carries no memory — each
  question is answered in isolation. It *looks* conversational without *being*
  conversational (EJ-08).
- **What changed in our understanding:** "conversational UI" and "conversational
  behaviour" are different features, and shipping the first while implying the
  second is a subtle form of dishonesty with the user.
- **What future work should do:** decide the memory scope explicitly and up front.
  If memory is deferred, make the single-turn nature visible rather than letting the
  loop imply continuity.

## 2.4 — Documenting almost nothing during the build

- **Original assumption:** the important thing was to build the product; the
  documentation could come afterward.
- **What actually happened:** the build shipped with very little recorded — few
  commits, almost no decision notes — and this entire documentation set had to be
  *reconstructed* after the fact, while memories were still fresh (and some details,
  like exact chronology, were already unrecoverable from git).
- **What changed in our understanding:** the engineering story is perishable.
  Reconstruction works, but it is lossy and expensive, and it only worked here
  because it was done immediately.
- **What future work should do:** capture decisions and turning points *as they
  happen* — a lightweight running journal during the build, not a reconstruction
  after it. This retrospective is evidence of both the cost and the value.

## 2.5 — Organizing the CLI for a scale that did not exist

- **Original assumption:** nesting the command as `aj knowledge ask` would pay off
  when a family of `knowledge` sub-commands appeared.
- **What actually happened:** there was exactly one flagship interaction, and the
  nesting was pure friction on the primary path until it was collapsed to `aj ask`
  (EJ-07).
- **What changed in our understanding:** taxonomy should follow real members, not
  anticipate imaginary ones. Organizing for scale you do not have is a cost you pay
  now for a benefit that may never come.
- **What future work should do:** keep the front door as short as possible; add
  hierarchy only when there is more than one real thing to organize.

---

# Mistakes vs. conscious trade-offs

Not everything in "what we got wrong" is a *mistake*. Some of it was deliberately
postponed with eyes open. Conflating the two would be unfair in both directions —
it would excuse the real mistakes and shame the reasonable trade-offs. Future
readers should know which things we **regret** and which things we **chose**.

**Genuine mistakes — things we would do differently even knowing what we knew
then:**

- **Starting platform-first (2.1).** Building foundations before a product existed
  to validate them. A real ordering error, corrected mid-course.
- **Passing configuration the pipeline doesn't honor (2.2).** Aspirational
  parameters that imply features the code lacks. Simply wrong, and cheap to have
  avoided.
- **Documenting almost nothing during the build (2.4).** The perishable engineering
  story was nearly lost and had to be reconstructed. A process mistake.
- **Speculative CLI taxonomy (2.5).** Organizing `aj knowledge ask` for a scale that
  did not exist. Premature structure.
- **Letting the loop *imply* memory (part of 2.3).** The mistake here is narrow: not
  the deferral itself, but shipping an interactive loop that *reads* as
  conversational without signaling that it has no memory.

**Conscious trade-offs — things we deliberately postponed, and would postpone
again:**

- **Deferring conversation memory (the other part of 2.3).** Not a mistake — a
  release decision. Shipping an honest single-turn assistant beat holding v1.0 for a
  larger feature, and the seam to add memory later already exists.
- **Naive keyword retrieval.** An intentional placeholder behind a stable contract
  ([decisions.md](./decisions.md) KA-AD-10). Chosen to ship, designed to be replaced.
- **No provider abstraction yet.** Deliberately declined for a single provider
  (KA-AD-06); building it now would have been guesswork.
- **No streaming, retries, or rate-limit handling.** Scoped out of v1.0 on purpose,
  not overlooked.

The line between the two lists is the line between *regret* and *sequencing*. The
mistakes are lessons about judgment; the trade-offs are lessons about scope. Both
are worth recording, but only one is worth regretting.

---

# 3. What surprised us

## 3.1 — The AI was the easy part

- **Original assumption:** the "AI" in an AI product is the hard, central part; the
  model integration is where the effort would concentrate.
- **What actually happened:** the AI Client is one of the *smallest* files in the
  product. By the time the pipeline reached it, all the real work — deciding what
  knowledge to trust, retrieving it, assembling and rendering it — was done. The
  model just had to be asked (EJ-06).
- **What changed in our understanding:** the intelligence of an AI product lives in
  everything *upstream* of the model call. Most of the engineering budget goes to
  architecture, not AI.
- **What future work should do:** budget accordingly. Expect the model integration
  to be small and the knowledge/context plumbing to be where the work is.

## 3.2 — The Context Builder fit behind its contract (with one small enhancement)

- **Original assumption:** consuming a platform service built earlier, without this
  product in mind, would require bending it to fit.
- **What actually happened:** the product coupled to nothing internal — a small
  adapter over its public contract was enough. One intentionally deferred behaviour
  did surface (Assembly emitted sections but not article bodies) and was completed
  with a single small platform enhancement; the integration itself stayed entirely
  on the published contract (EJ-04).
- **What changed in our understanding:** this was the first *hard evidence* that the
  platform boundaries were drawn correctly. A boundary you can build against later
  through its published contract alone — even when the platform needs one small,
  honest completion — is a boundary that was right.
- **What future work should do:** treat "did the *product* have to reach past the
  contract?" as the real test of a platform boundary — and recognize that a platform
  maturing through contract-preserving enhancements is success, not failure.

## 3.3 — The naive instinct (scan the files) was the wrong one

- **Original assumption:** the obvious way to find articles is to walk the directory
  and read every file.
- **What actually happened:** that instinct immediately surfaced non-knowledge files
  and forced brittle exclusions; trusting the index instead was both simpler and
  more correct (EJ-03).
- **What changed in our understanding:** the first, most obvious implementation was
  the wrong one, and the better answer was to do *less* — read the curated list
  rather than rediscover it.
- **What future work should do:** be suspicious of the obvious "just scan
  everything" approach when a curated source of truth already exists.

## 3.4 — Debug wanted to be presentation, not platform

- **Original assumption:** observability (timings, context sizes, what was
  retrieved) sounds like a platform or infrastructure concern.
- **What actually happened:** it landed most naturally as a *presentation* choice in
  the product — the same pipeline runs either way, and debug only changes what is
  *shown* (KA-AD-08).
- **What changed in our understanding:** not every cross-cutting concern belongs in
  the platform. Diagnostics that describe a run belong next to whoever presents that
  run, so they can never drift from reality.
- **What future work should do:** default to putting observability at the
  presentation edge unless there is a concrete reason to push it into the platform.

## 3.5 — Ease of testing was a design signal

- **Original assumption:** tests are something you write after the code to protect
  it.
- **What actually happened:** how *easy* a unit was to test turned out to be a live
  readout of whether its boundary was right — easy isolation meant a clean boundary;
  friction would have meant a leak (see [testing.md](./testing.md)).
- **What changed in our understanding:** the test suite is not just a safety net; it
  is a continuous audit of the architecture. Testability is an architectural metric.
- **What future work should do:** when a unit is hard to test, treat it as the
  architecture complaining — and fix the boundary, not the test.

---

# 4. What PRODUCT-002 should do differently

These are the concrete, forward-looking commitments — the payload of the whole
retrospective.

## 4.1 — Keep a running engineering journal during the build

- **What future work should do:** record decisions and turning points as they
  happen, not afterward. The reconstruction that produced this document set worked,
  but it was expensive and slightly lossy (2.4). PRODUCT-002 should arrive at its
  freeze with its journal already written.

## 4.2 — Never pass configuration that isn't wired

- **What future work should do:** treat inert parameters as a defect. Before passing
  a capability any option, confirm it changes behaviour; otherwise leave it out
  until it does (2.2).

## 4.3 — Decide conversational scope explicitly and early

- **What future work should do:** if a product is interactive, decide *before
  building the loop* whether it will carry memory, and make the answer visible in
  the UX. The render/generate seam is already the home for threading history when
  the time comes (2.3, [decisions.md](./decisions.md) KA-AD-05).

## 4.4 — Invest in retrieval quality when the product leans on it

- **What future work should do:** the naive keyword scorer was the right *placeholder*
  (KA-AD-10), but any product whose value depends on relevance should upgrade it
  early (stopwords at minimum, then BM25/embeddings). The sealed contract makes this
  a one-file change; use that affordance.

## 4.5 — Add one honest end-to-end smoke test

- **What future work should do:** the product apex is intentionally thin, but a
  *single* end-to-end test through a faked provider — question in, cited answer out —
  would guard the orchestration wiring cheaply. This is the one gap in the testing
  strategy worth closing (see [testing.md](./testing.md)).

## 4.6 — Start from the platform this product left behind

- **What future work should do:** PRODUCT-002 should begin by composing the existing
  capabilities (Config, Handbook, Retrieval, Context Builder, Prompt Renderer, AI
  Client) and only build new platform capability where a genuine new need appears —
  and it should *measure* how much it reused, as the real test of the platform's
  value.

---

# Lessons that changed AJ-OS

Some lessons are bigger than PRODUCT-001. The improvements in Section 4 are
*product-level* — things the next product should do. The ones below are
*organization-level* — they permanently changed **how AJ-OS itself will be built**,
and every future product inherits them whether or not it thinks about them. These
are candidates to be promoted into a formal AJ-OS standard.

- **Build products before platforms.** Platform capability is earned by a product
  needing it, never anticipated. Product-first is now the default order of work, not
  a one-time experiment.
- **Keep the handbook independent from AJ-OS.** Knowledge and the tools that read it
  are separate projects with separate lifecycles, always. No future product folds
  the handbook back in.
- **Preserve strict architectural boundaries.** The one-way dependency direction and
  the platform/product split are non-negotiable structure, not stylistic preference.
  New capabilities are built independent and unaware of their consumers.
- **Treat documentation as part of implementation.** A build is not "done" when the
  code runs; it is done when the decisions and story are captured. Documentation is
  a deliverable of the work, produced alongside it — not an afterthought recovered
  later (2.4 is the cautionary tale behind this one).
- **Prefer reusable capabilities over product-specific shortcuts.** When a product
  needs something, the default is a clean platform capability that the *next* product
  can reuse — not a shortcut that solves only today's case.

Presented as principles, these are the inheritance PRODUCT-001 leaves to every
AJ-OS product that follows. They are the difference between building one good
product and building a system that makes the next product easier.

---

# The meta-lesson

If the whole retrospective compressed to a single sentence, it would be this:

> **The hard part of an AI product was not the AI — it was drawing boundaries, and
> then having the discipline to trust them.**

Almost every "right" was a boundary that held; almost every "wrong" was a place
where honesty lagged behind the code (inert config, a loop posing as a
conversation, undocumented decisions); and almost every "surprise" was the same
realization from a new angle — that the intelligence, the effort, and the risk all
live in the architecture, not in the model call.

That is the knowledge most worth carrying into PRODUCT-002, and it is the reason
this document was written honestly rather than triumphantly.

---

# If I could only keep one lesson

Strip everything else away, and one lesson made all the others possible:

> **Build the product first.**

It is tempting to name the more quotable discovery — that architecture mattered
more than the AI, or that stable boundaries simplified everything. But those are
*consequences*, not the cause. There were only boundaries to draw because a real
product was pulling on the platform and demanding them. There was only a reason to
put the intelligence upstream of the model because a user with an actual question
needed it there. Product-first is the decision that created the conditions for every
other lesson in this document.

What I did not expect is how much of good engineering turned out to be *ordering*.
The same disciplines — clean boundaries, small capabilities, honest scope — would
have produced a far worse result applied in the wrong sequence. Starting from a
product did not just tell me *what* to build; it told me *what not to build yet*,
and that restraint is most of why the platform stayed small, reusable, and
coherent.

If PRODUCT-002 remembers nothing else from PRODUCT-001, I hope it remembers to start
with the product, let it pull the platform into existence, and trust the boundaries
that emerge. Everything good here grew from that one root — and, honestly, so did
the confidence to leave the rest for later.
