# PRODUCT-001 — Knowledge Assistant System Walkthrough

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Guided Tour

---

# Purpose

This is a guided tour through **one complete execution** of the Knowledge
Assistant. It follows a single question from the moment it is typed to the moment
a grounded, cited answer is printed — as if you were stepping through the running
system in a debugger.

Its goal is approachability. A reader should finish this document able to
*mentally execute* PRODUCT-001 without opening a single source file.

It assumes you already understand the system's shape. That is the job of
[architecture.md](./architecture.md), and this document does not repeat it.
Architecture answers *how is the system structured?* This document answers a
different question:

> **What actually happens when I ask a question?**

Where structure matters, this document links back to architecture.md rather than
restating it.

---

# System at a glance

If you read nothing else, read this. One question travels top to bottom; each row
names the stage and where it lives in the codebase.

```text
User                                          you, at a terminal
   ↓
CLI                                           src/cli
   ↓
Knowledge Assistant                           src/products/knowledge-assistant
   ↓
Config                                        src/platform/config
   ↓
Handbook                                      src/platform/handbook
   ↓
Retrieval                                     src/platform/retrieval
   ↓
Context Builder                               src/context-builder
   ↓
Prompt Renderer                               src/platform/prompt
   ↓
AI Client                                     src/platform/ai
   ↓
Grounded Answer + Citations                   back at your terminal
```

**In one paragraph:** a thin CLI receives your question and launches the Knowledge
Assistant, which runs a single linear pipeline. It loads configuration to learn
where the handbook is, confirms the handbook has a generated wiki, retrieves the
handful of wiki articles most relevant to the question, assembles them into an
immutable Context Package, renders that package into a grounded prompt, and sends
that prompt to the AI client for an answer. The answer is printed with a numbered
citation list pointing back at the exact wiki articles it was drawn from. If any
prerequisite is missing — no config, no wiki, nothing relevant, or no AI — the
pipeline stops early with a plain-language message instead of guessing. The rest
of this document is that paragraph, slowed down to walking pace.

---

# The running example

Throughout, we follow exactly one command:

```bash
aj ask "Who am I?"
```

This is the **one-shot** form: a question is supplied, so the assistant answers
it once and exits. (The other form, `aj ask` with no question, starts an
interactive session — the same execution described here, looped once per typed
question.)

The worked examples below assume a personal handbook — the real one AJ-OS is
configured against — whose generated wiki contains an `about-me` article. The
concrete values are **illustrative**: actual titles, scores, and answer text
depend on the handbook and the model. The *shapes* are exact.

---

# The data as it moves

Before the tour, here is the whole journey on one line. Each arrow is a stage,
and the label is the shape of the data leaving it:

```text
"Who am I?"                 the question (a string)
      ↓   Config
AjConfig                    where the handbook lives
      ↓   Handbook
HandbookInfo                where the generated wiki lives
      ↓   Retrieval
RetrievalResult[]           the handful of most relevant articles
      ↓   Context Builder
ContextPackage              those articles assembled as citable context
      ↓   Prompt Renderer
RenderedPrompt              a system + user message the model can answer
      ↓   AI Client
AIResponse                  the generated answer text
      ↓   Display
Terminal output            the answer, followed by its citations
```

The data **narrows and transforms** at every step. Nothing ever flows backward.
The product is the only thing that sees the entire chain; each stage sees only
its own input and output. We now walk it, stage by stage.

---

# 1. The user enters the command

**What happens:** You type `aj ask "Who am I?"` and press Enter.

`aj` is the command the product installs (in development it is `npm run dev`; when
built and installed it is the `aj` binary). The shell hands the process two
meaningful pieces of information: the sub-command `ask`, and the single argument
`"Who am I?"`. No `--debug` flag is present, so diagnostics stay off.

At this moment the system knows nothing except *a question was asked*. It does not
yet know where the handbook is, whether a wiki exists, or whether an answer is
possible. Everything after this point is the work of discovering those things in
order.

**Next stage receives:** the raw argv — sub-command plus question string.

---

# 2. CLI routing

**Lives in:** `src/cli`

**Responsibility:** decide *which* mode to run and launch the product. Nothing
more. The CLI is the thin top layer of the [architecture](./architecture.md#three-layers);
it owns no orchestration.

**Input:** the parsed command line (`ask`, `"Who am I?"`, no `--debug`).

**Output:** a single call into the product.

The CLI recognizes the `ask` sub-command, reads the optional question argument and
the optional `--debug` flag, and calls the product's entry point with them. Two
tiny decisions live here and nowhere else:

- **Which mode?** A question was supplied, so this is one-shot: answer once and
  exit. (No question would mean: start the interactive loop.)
- **Debug on?** No, so presentation stays plain.

**What it deliberately does NOT do:** it does not load configuration, touch the
handbook, retrieve anything, or format output. It adds no behaviour of its own —
if it did, the one-shot and interactive modes could drift apart. There is also a
deprecated `aj knowledge ask` alias that prints a warning and then routes to the
exact same product call, so old muscle memory keeps working.

**Next stage receives:** the trimmed question `"Who am I?"` and the options
`{ debug: false }`, handed to the Knowledge Assistant.

---

# 3. Knowledge Assistant orchestration

**Lives in:** `src/products/knowledge-assistant`

**Responsibility:** run the whole pipeline for one question and present the
result. This is the product layer — the *only* layer that composes platform
capabilities.

**Input:** the question and options.

**Output:** printed to the terminal — either an answer with citations, a friendly
"nothing found" notice, or a friendly error.

Because this is the one-shot form, the assistant calls a single method that *is*
the entire pipeline end to end. (The interactive session is just this same method
called once per typed question — there is exactly one orchestration path.)

The orchestrator does three things and delegates everything else:

1. It calls each platform capability **in order**, passing the output of one as
   the input of the next.
2. It **measures** each stage's duration as it goes. These timings are gathered
   whether or not `--debug` is on; they are simply not shown unless it is. This is
   the "debug is presentation-only" invariant from
   [architecture.md](./architecture.md#4-debug-is-presentation-only) in action —
   the pipeline runs identically either way.
3. It **catches only the errors it recognizes** (`ConfigError`, `HandbookError`,
   `AIError`) and turns them into friendly messages. Anything unrecognized is
   re-thrown loudly, because that is a bug, not a user problem.

Think of the orchestrator as the conductor: it knows the running order and the
tempo, but it plays none of the instruments. We now follow the baton.

**Next stage receives:** control passes to the first capability — Config.

---

# 4. Configuration loading

**Lives in:** `src/platform/config`

**Responsibility:** find out *where the handbook lives*, from a validated
configuration file.

**Input:** none from the pipeline — the Config Service reads `aj.config.json` from
the project root itself.

**Output:** an `AjConfig` — conceptually, *a validated handbook path*.

The service reads `aj.config.json`, parses it, and checks it says what it must:
a `handbook` object with a non-empty `path`. It then confirms that path actually
exists on disk and is a directory. Only if all of that holds does it return the
configuration.

For our run, the file contains a handbook path of `../../handbook`, which resolves
to a real directory. The service hands back an `AjConfig` whose single useful
value is that path.

**Why this stage exists:** the product must not assume where knowledge lives.
Configuration is the seam that lets the *same* product point at *any* handbook.

**What it deliberately does NOT do:** it does not look inside the handbook, does
not know what a wiki is, and does not know which product asked. It validates a
path and stops.

**Branch point — bad configuration.** If the file is missing, is invalid JSON,
lacks `handbook.path`, or points somewhere that does not exist, the service
raises a `ConfigError` with a message written for a human ("Configuration file
not found…", "Configured handbook path does not exist…"). The orchestrator
catches it, prints it plainly, and execution **stops here** — no handbook, no
retrieval, no AI call.

**Next stage receives:** the validated handbook path, `../../handbook`.

---

# 5. Handbook discovery

**Lives in:** `src/platform/handbook`

**Responsibility:** confirm the handbook is well-formed and locate the *generated
wiki* inside it.

**Input:** the handbook path from the previous stage.

**Output:** a `HandbookInfo` — conceptually, *the handbook root and the wiki
directory within it*.

The Handbook Service resolves the handbook directory, defensively confirms it
exists, and then looks for the one thing the assistant actually reads from: a
`wiki/` sub-directory holding the generated, AI-optimized articles. Recall the
product **never reads handbook source material directly** — it only ever consumes
the generated wiki. This stage is where that boundary is enforced.

For our run, `../../handbook/wiki/` exists, so the service returns the resolved
handbook root and that wiki path.

**Why this stage exists:** "a handbook path is valid" and "this handbook has a
wiki we can search" are two different facts. Separating them lets the product give
a precise message for each failure.

**What it deliberately does NOT do:** it does not read any articles, does not know
how they will be searched, and does not know where the path came from — it has
never heard of the Config Service.

**Branch point — no wiki.** If the handbook directory is missing, or it has no
`wiki/` sub-directory, the service raises a `HandbookError` ("The configured
handbook does not contain a generated wiki."). The orchestrator catches it, prints
it, and execution **stops here**. This is the concrete realization of user-flow 7
("Wiki Not Generated").

**Next stage receives:** the wiki directory path.

---

# 6. Retrieval

**Lives in:** `src/platform/retrieval`

**Responsibility:** find the handful of wiki articles most relevant to the
question.

**Input:** the wiki directory path, and the question `"Who am I?"`.

**Output:** a `RetrievalResult[]` — conceptually, *a short, ranked list of
articles*, each carrying its file path, its human title, and a relevance score.

This is the first stage that engages with the question's meaning. It works in
three moves:

1. **Break the question into search terms.** `"Who am I?"` becomes the distinct
   lowercase words `who`, `am`, `i`.
2. **Decide what the corpus even is.** Crucially, retrieval does **not** scan the
   wiki folder for every Markdown file. It reads `wiki/index.md` — the catalog the
   handbook generator maintains — and searches **only the articles that index
   links to**, in the order it lists them. Maintainer files the index omits
   (`README.md`, `log.md`, and so on) are invisible to search. The human-curated
   index is the authority on *what* counts as knowledge; the filesystem is
   consulted only to find *where* each linked article lives. (This is the
   "index-defined corpus" invariant from
   [architecture.md](./architecture.md#3-the-generated-index-defines-the-corpus).)
3. **Score and rank.** Each indexed article gets a simple keyword score — the
   total number of times the search terms appear in it. Articles that score zero
   are dropped; the rest are sorted best-first (ties broken by title) and the top
   five are returned.

**A realistic result for our run.** In a personal handbook, the `about-me`
article is written in the first person and repeats words like *I* and *am* often,
so "Who am I?" ranks it near the top:

```text
[1] About Me            score 41   (wiki/about-me.md)
[2] Career Timeline     score 18   (wiki/entities/career.md)
[3] Working Style       score 12   (wiki/concepts/working-style.md)
```

Each entry is a *pointer plus a title and a score* — note it does **not** yet
carry the article's text. Reading the bodies is deliberately left to the next
stage.

**Why this stage exists:** an answer can only be grounded if the right knowledge
is in front of the model. Retrieval is what makes the difference between "the
whole wiki" and "the three articles that matter."

**What it deliberately does NOT do:** it does not read configuration, does not
know about handbooks, does not build context, and does not talk to any AI. It also
does not do *semantic* search — the keyword scorer is intentionally naive, and is
sealed behind the service's contract so it can later be replaced (BM25,
embeddings, hybrid) without any other stage noticing.

**Branch point — nothing retrieved.** If no indexed article contains any search
term — or the question tokenizes to nothing — the list comes back empty. The
orchestrator does not call the AI at all; it prints *"No relevant handbook
articles were found for that question."* and stops. This is user-flow 2 ("Unknown
Topic"): the assistant would rather say nothing than invent an answer.

**Next stage receives:** the ranked `RetrievalResult[]` — for us, the three
articles above.

---

# 7. Context Builder

**Lives in:** `src/context-builder` (adapter glue in `src/products/knowledge-assistant`)

**Responsibility:** turn a set of chosen articles into an assembled, citable
**Context Package** — a single immutable object a model can be grounded in.

**Input:** the question and the `RetrievalResult[]`.

**Output:** a `ContextPackage` — conceptually, *a structured bundle of context
sections plus a de-duplicated, ordered list of the sources behind them*.

This stage reuses an existing AJ-OS platform service — the **Context Builder**
(SPEC-002) — consumed only through its public entry point; the product does not
reach inside it. (Integration did complete one deferred behaviour *in* the Context
Builder — Assembly now emits article bodies, not just structural sections — as a
small platform enhancement behind the same contract; the product itself couples to
nothing internal.) Two things happen:

1. **Adapting articles into knowledge.** The retrieval results and the Context
   Builder speak different languages: retrieval produces *article pointers*, the
   builder consumes *knowledge items*. A small piece of **product glue** — the
   `wikiKnowledgeProvider` — bridges them. For each retrieved article it now reads
   the article body from disk (the text retrieval deliberately left out), and
   presents it as a `wiki` knowledge item carrying an id, a citable source
   (title + type), and the content. Empty articles are skipped, since a knowledge
   item must actually carry knowledge. This adapter lives in the product layer
   precisely because only the product composes platform capabilities.

2. **Assembling the package.** The Context Builder runs its own internal pipeline
   — Collection → Selection → Assembly — and returns an immutable Context Package.
   Because every article is a `wiki` source, they are filed together under a
   single canonical section. The package also carries the **references**: the
   ordered, de-duplicated list of sources, which is what makes citations possible
   downstream.

**A realistic package for our run.** Conceptually:

```text
ContextPackage
  summary   : a short, structural description of what was assembled
  sections  : ├─ Wiki References  ── the About Me / Career / Working Style
             │                        article bodies, grouped as context
             └─ (canonical empty sections reserved by the contract)
  references: [1] About Me        (wiki)
              [2] Career Timeline (wiki)
              [3] Working Style   (wiki)
```

The references keep the **same order and numbering** the retrieval produced, and
that numbering is the thread that ties the eventual answer back to its sources.

**Why this stage exists:** grounding is not just "hand the model some text." It is
"hand the model text *together with the identity of every source*, in a stable
structure, immutably." That is a reusable platform concern, not a
Knowledge-Assistant feature — which is exactly why it is a shared service.

**What it deliberately does NOT do:** it calls no AI, renders no prompt, and knows
nothing about this product or the CLI. It assembles context and stops. (In v1.0 it
also does not yet re-rank or trim the supplied articles for the assistant —
retrieval has already chosen them.)

**Next stage receives:** the immutable `ContextPackage`.

---

# 8. Prompt Renderer

**Lives in:** `src/platform/prompt`

**Responsibility:** turn the question and the Context Package into a concrete
prompt a model can answer — grounded, and structured so it *can* cite.

**Input:** the question and the `ContextPackage`.

**Output:** a `RenderedPrompt` — conceptually, *two blocks of text*: a fixed
**system** instruction and a **user** message.

The renderer is a pure translation step. It reads the package and produces text;
it awaits nothing, calls no model, and — given the same inputs — always produces
the identical prompt. (This determinism is a core
[invariant](./architecture.md#2-rendering-is-pure-generation-is-isolated).)

It builds two things:

- **The system message** is fixed text — the same for every question. It encodes
  the assistant's behavioural contract: *use only the supplied context; if the
  answer is not there, say so and do not guess; be honest about uncertainty;
  never fabricate; and cite sources with their bracketed labels.* This is where
  the [Principles](../../../docs/specifications/products/PRODUCT-001-principles.md)
  become an instruction the model actually receives.

- **The user message** is assembled in a stable order: first the **question**,
  then the **context** (the assembled sections), then a numbered **sources** list.
  Each source is numbered once — `[1]`, `[2]`, `[3]` — and the sections refer back
  to those same numbers. That shared numbering is what lets the model attach a
  claim to a source and lets us resolve it later.

**A realistic prompt for our run**, shown as shape, not verbatim:

```text
SYSTEM:
  You are the AJ-OS Knowledge Assistant.
  Use only the supplied context. If it isn't there, say so.
  Cite sources with their bracketed labels ([1], [2]). …

USER:
  # Question
  Who am I?

  # Context
  ## Wiki References
  …the About Me / Career / Working Style article text…
  Sources: [1], [2], [3]

  # Sources
  [1] About Me (wiki)
  [2] Career Timeline (wiki)
  [3] Working Style (wiki)
```

**Why this stage exists:** it is the boundary between *"what context did we
assemble?"* and *"how do we ask a model about it?"* Keeping it separate from the
AI client is what makes the product model-agnostic — the prompt is built once and
would be identical no matter which provider ran it.

**What it deliberately does NOT do:** it is *not* an AI client. It knows no
provider, no model, no API, and no transport. It never invents context, and it
never emits an absolute file path or provider internal — only the logical source
information the package allows.

**Next stage receives:** the `RenderedPrompt` (`{ system, user }`).

---

# 9. AI Client

**Lives in:** `src/platform/ai`

**Responsibility:** turn the rendered prompt into a generated answer.

**Input:** the `RenderedPrompt`.

**Output:** an `AIResponse` — conceptually, *the answer text plus the model that
produced it*.

This is the single stage that knows anything provider-specific. It maps the
neutral `{ system, user }` prompt onto one Anthropic Messages request, sends it,
and extracts the text back out — so the provider's request and response shapes
never leak into the rest of the system. The model is chosen from the environment
(falling back to a documented default), and the answer length is deliberately
capped, because PRODUCT-001 wants concise answers.

**A realistic response for our run:** the model, reading only the supplied
`about-me` / career / working-style context, produces a short first-person summary
of who AJ is, with bracketed markers like `[1]` and `[2]` where it leans on a
particular source — because the system message told it to, and the user message
gave it the numbered sources to cite.

**Why this stage exists:** every provider-specific concern — the SDK, model
selection, transport, the API key — is quarantined here and nowhere else. Swapping
providers is a one-file change.

**What it deliberately does NOT do:** it does not render prompts, assemble
context, or retrieve knowledge — everything upstream is invisible to it. In v1.0
it also makes a single non-streaming request with **no conversation memory**: it
is handed one prompt and returns one answer. (See the observations at the end and
[lessons-learned.md](./lessons-learned.md) for what this means for follow-up
questions.)

**Branch point — AI unavailable.** Two failures live here. If no API key is
configured, the client raises an `AIError` explaining that before any request is
made. If the request itself fails (network, provider error, rate limit), that too
becomes a single `AIError`. Either way the orchestrator catches it, prints the
friendly message, and stops — after first showing any diagnostics already gathered
if `--debug` was on.

**Next stage receives:** the `AIResponse`.

---

# 10. Response rendering

**Lives in:** `src/products/knowledge-assistant`

**Responsibility:** show the answer.

**Input:** the `AIResponse`.

**Output:** the answer text, printed to the terminal.

There is almost nothing clever here, and that is the point. The orchestrator
prints the model's answer text as-is, framed by blank lines for readability. If
`--debug` was on, a diagnostics block is printed *first* — the handbook path, the
retrieved article titles, the number of included sources, the serialized context
size, a rough token estimate, the model used, and the per-stage timings gathered
along the way. Every number in that block is either something the pipeline already
produced or something trivially derived from it; nothing is invented.

**Next stage receives:** the answer is on screen; only the citations remain.

---

# 11. Citations

**Lives in:** `src/products/knowledge-assistant`

**Responsibility:** make the answer traceable by listing the sources behind it.

**Input:** the `ContextPackage` (specifically its references).

**Output:** a `Citations:` list printed under the answer.

The orchestrator prints each reference from the package, numbered in the same
order the Prompt Renderer used:

```text
Citations:
  [1] About Me
  [2] Career Timeline
  [3] Working Style
```

Because this numbering is the *same* `[1]`, `[2]`, `[3]` the model saw and cited,
the inline markers in the answer resolve directly to these lines. The reader can
follow any claim back to the wiki article it came from. This is the concrete
realization of Principle 2 ("Always Cite Sources") and user-flow 1's promise that
"the user can verify the information using the cited wiki articles."

If, in some other run, the package carried no references, the citation list is
simply omitted rather than printed empty.

**Next stage receives:** nothing — the response is complete.

---

# 12. End of execution

For the one-shot form, that is the whole life of the process: the question was
answered, the citations were shown, and the command exits cleanly.

Had this been the interactive session (`aj ask` with no question), the only
difference is the loop: after printing the answer and citations, the assistant
returns to its prompt and waits for the next question, running this exact pipeline
again. Typing `exit` or `quit`, or sending end-of-input (Ctrl-D), ends the session
with a short goodbye.

Zooming back out, here is the full journey we just traced, with the branch points
marked:

```text
"Who am I?"
   │
   ▼
CLI routing ─────────────────────────────► (one-shot mode chosen)
   │
   ▼
Config          ──✗ bad config ───────────► ConfigError → friendly message, stop
   │
   ▼
Handbook        ──✗ no wiki ──────────────► HandbookError → friendly message, stop
   │
   ▼
Retrieval       ──✗ nothing found ────────► "No relevant articles" notice, stop
   │
   ▼
Context Builder
   │
   ▼
Prompt Renderer
   │
   ▼
AI Client       ──✗ no key / API fails ───► AIError → friendly message, stop
   │
   ▼
Answer  +  Citations                        ← the grounded, cited result
```

Every early exit is deliberate: the system would rather stop with a clear
explanation than continue toward an answer it cannot ground.

---

# What PRODUCT-001 does *not* do

Now that you have followed a full execution, it is worth being precise about the
edges of Version 1.0 — in **functional** terms, from a user's point of view.
(This is the behavioural companion to architecture.md's
["What is intentionally not in the architecture"](./architecture.md#what-is-intentionally-not-in-the-architecture),
which covers the *structural* omissions. Same boundaries, seen from the other
side.)

- **It does not remember previous questions.** Every question is answered on its
  own. The interactive session loops, but no earlier turn is carried into the
  next prompt — so "explain that in more detail" has no "that" to refer to. A
  genuine follow-up conversation (user-flow 5) is not yet real.
- **It does not search the Internet.** The only knowledge it can use is the
  configured handbook's generated wiki. Ask it about anything outside that wiki
  and it will say it doesn't know, rather than reach outward.
- **It does not modify the handbook or the wiki.** The product is strictly
  read-only. It has no path to write, edit, or regenerate knowledge.
- **It uses simple keyword retrieval.** Relevance is raw term-frequency matching,
  not semantic search. It finds articles that share words with your question, not
  necessarily the ones that best *mean* what you asked.
- **It answers one question at a time.** No batching, no parallel questions, no
  background jobs — a single question in, a single answer out.
- **It does not ask clarifying questions.** Faced with an ambiguous question, it
  answers as best it can from what it retrieves rather than pausing to disambiguate
  (user-flow 3 is not yet implemented).
- **It streams nothing.** The answer appears once, whole, after the model
  finishes — there is no token-by-token display.

None of these are defects; they are the deliberate scope of a first version. They
are listed here so a reader finishes with a realistic, un-oversold picture of what
v1.0 actually is. The reasoning behind several of them — and what changes in later
versions — is taken up in [decisions.md](./decisions.md),
[engineering-decisions.md](./engineering-decisions.md), and the
[v1.0.0 release notes](./release/v1.0.0.md).

---

# How this document complements architecture.md

[architecture.md](./architecture.md) is a **map**; this document is a **journey
across the map**. The map shows the layers, the dependency direction, and the
invariants that always hold, no matter what happens. The journey shows one
specific thing happening: a single question moving through those layers in real
time, taking on a new shape at each step.

Concretely, the division of labour is:

- Architecture answers *why is Retrieval a separate capability, and what may it
  depend on?* This document answers *what does Retrieval receive for "Who am I?",
  and what exactly does it hand onward?*
- Architecture states the invariants (index-defined corpus, pure renderer,
  presentation-only debug, error taxonomy) as guarantees. This document shows each
  invariant *being used* as the question flows through.
- Architecture lists the branch points as structure. This document walks each one
  as a lived alternative ending.

Neither is complete without the other, and — by design — neither repeats the
other. Where this document needed a structural fact, it linked back rather than
restating it.

---

# Observations from writing this walkthrough

Three things surfaced while tracing the execution end to end. They are recorded
here so they are not lost; the deeper treatment belongs in
[lessons-learned.md](./lessons-learned.md) and
[engineering-decisions.md](./engineering-decisions.md).

### 1. Did any stage feel unnecessarily complicated?

No stage felt over-engineered — the striking thing is how *thin* most stages are.
The one place with genuine conceptual weight is **Context Builder**, and it earns
it: it is a full internal pipeline (Collection → Selection → Assembly) doing work
that, for the assistant's current needs, could look like overkill — the articles
have *already* been chosen by Retrieval, so Selection has little to decide. It
feels heavy only because the assistant uses a small slice of a capability built to
be general. That is the correct trade (reuse a real platform service rather than
hand-roll a lesser one), but a reader tracing *just this product* will notice they
are paying for generality they don't yet exercise.

### 2. The example question quietly exposes the naive scorer

`"Who am I?"` tokenizes to `who`, `am`, `i` — all extremely common words. The
keyword scorer counts raw term frequency, so it can rank an article highly simply
because it says "I" and "am" a lot, not because it is genuinely *about* identity.
For this handbook the right article (`about-me`) still wins, but the mechanism is
fragile: a different question dominated by common words could easily surface noise.
This is not a bug — the scorer is deliberately naive and sealed behind a
replaceable contract — but the walkthrough made its limits vivid.

### 3. Opportunities to simplify (or sharpen) PRODUCT-001 later

- **Retrieval quality is the highest-leverage upgrade.** Stopword handling, or a
  move to BM25/embeddings, would improve grounding more than any other single
  change — and the sealed contract means only one file changes.
- **The Context Builder configuration is currently aspirational.** The product
  asks for a `documentation` profile, explainability, and Markdown output, but
  v1.0 Assembly is structural only, so those knobs do not yet shape the package.
  Either wire them through or drop them until they do something, so the code does
  not imply behaviour it lacks.
- **Conversation memory is the biggest gap between plan and reality.** The
  interactive loop *looks* conversational but answers each question in isolation —
  the AI Client carries no history. Closing that gap (threading prior turns into
  the prompt) is the most valuable functional addition, and the render/generate
  seam is already the natural place to do it.

None of these block v1.0. All three are recorded so the next iteration starts from
what the execution actually revealed, not from what the plan assumed.
