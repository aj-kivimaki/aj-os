# PRODUCT-001 — Knowledge Assistant Testing Strategy

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — Testing

---

# Purpose

This document explains **how PRODUCT-001 is tested and why** — the philosophy, not
the framework. It is organized around principles, because the principles are what
transfer to the next product; the specific runner and file names will not.

It is not a catalog of every test. Where a concrete suite illustrates a principle,
it is named, but the point is always the principle behind it.

One idea runs through everything below: **tests exist to protect behaviour and
contracts, not implementations.** A test that breaks when you improve the code
without changing what it does is a liability, not an asset. PRODUCT-001 was tested
so that its internals stay free to change.

---

# The shape of the suite, in one look

Just enough orientation to make the principles concrete. Tests run under one
command (`npm test`, Vitest) and fall into three tiers:

| Tier | Location | What it protects |
| --- | --- | --- |
| **Platform capabilities** | `tests/platform/` — one file per capability (config, handbook, retrieval, prompt, ai) | Each capability's behaviour and contract, in isolation. |
| **Product glue** | `tests/products/knowledge-assistant/` | The one piece of product logic worth isolating: the `wikiKnowledgeProvider` adapter. |
| **Reused platform service** | `tests/context-builder/` — the established SPEC-002 suite (207 tests, 15 files) | The Context Builder's contracts and behaviour; the reference suite the others follow. |

The Context Builder suite predates the product and set the house style. The
platform and product tests written for PRODUCT-001 follow its lead.

---

# The testing pyramid

The suite is shaped like a pyramid, and the shape carries the strategy. Most tests
sit at the wide, stable base; very few sit at the narrow product apex.

```text
                       ╱╲
                      ╱  ╲          Product integration — few, broad
                     ╱ 5  ╲         (product ↔ Context Builder)
                    ╱──────╲
                   ╱ product ╲       Product orchestration — intentionally thin
                  ╱  (thin)   ╲      (covered by its parts, not heavy E2E)
                 ╱────────────╲
                ╱  platform     ╲     Platform capability tests — 32, isolated
               ╱  capabilities   ╲
              ╱──────────────────╲
             ╱  deterministic /    ╲   Contract & unit tests — 207 (Context Builder)
            ╱   contract tests       ╲  the broad, stable base
           ╱_________________________╲

     confidence  ▲ most, narrowest scope at the base │ fewest, broadest at the apex
```

The message: **most confidence comes from testing stable platform capabilities and
contracts** — the wide base — while **the product itself stays intentionally thin at
the apex.** This is deliberate. The product is a composition of well-tested parts,
so it needs little testing of its own; piling integration tests onto a thin
orchestrator would add cost without adding much confidence.

---

# The testing principles

## 1. Test behaviour through public interfaces

Tests import a capability the way a real consumer would — through its public entry
point — and assert what it *does*, never how it does it. The Context Builder suite
makes this a structural guarantee: every test imports from
`src/context-builder/index.js` only, never an internal file, which keeps internal
machinery (the selection policy, the assembly composition strategy) free to evolve
without touching a single test.

*Applied in PRODUCT-001:* the platform tests exercise each capability's public
surface — `ConfigService.load()`, `HandbookService.locateWiki()`,
`RetrievalService.search()`, `PromptRenderer.render()`, `AIClient.answer()` — and
assert on the returned values and the raised errors, not on private helpers. The
naive keyword scorer, the wiki-link parsing, the section-rendering details are all
unpinned internals: they can be rewritten as long as the observable behaviour holds.

## 2. Keep platform capabilities independently testable

Because each platform capability depends on nothing but its own inputs (see the
[architecture](./architecture.md#platform-capabilities)), each can be tested
completely alone — no pipeline, no product, no other capability present.

*Applied in PRODUCT-001:* there is one test file per capability, and each stands on
its own. `RetrievalService` is tested against a small wiki fixture with no config,
no handbook service, and no AI in sight. `PromptRenderer` is tested against a
hand-built Context Package with no Context Builder involved. This independence is
not an accident of testing — it is the architecture's one-way dependency rule
showing up as a testing property.

## 3. Prefer deterministic tests

A test should give the same result every run, on every machine, forever. That means
no reliance on wall-clock time, randomness, network, or ambient environment.

*Applied in PRODUCT-001:* the Context Builder suite is the exemplar — no filesystem,
network, randomness or timing dependencies, fixed literal timestamps, running in
well under a second. The design makes this possible: the Context Builder takes its
timestamp as an *injected* input rather than reading a clock, so "what did assembly
produce?" has one deterministic answer. The platform tests follow suit, using small
fixed fixtures rather than live data.

## 4. Avoid mocking unless it is genuinely necessary

Mocks couple a test to the shape of a collaboration, and they quietly assert that
the collaboration *looks* a certain way rather than that the behaviour *is* correct.
The strategy is to prefer real inputs and real small fixtures, and to reserve
mocking for the one true boundary that cannot be crossed in a test: the external AI
provider.

*Applied in PRODUCT-001:* most capabilities need no mocks at all — they are pure
functions over data (`PromptRenderer`) or thin readers over a tiny fixture tree
(`Retrieval`, `Handbook`, `Config`). The only place an external dependency is
unavoidable is the **AI Client**, which talks to Anthropic; there, the design keeps
the untestable part as small as possible (one request, one extraction) so that very
little needs to be stood in for. The seam between the Prompt Renderer and the AI
Client (KA-AD-05) is what makes this possible: everything *up to* the network is
real and deterministic, and only the network call itself is a boundary.

## 5. Keep tests fast

A suite that is fast gets run; a suite that is slow gets skipped. Speed is a
feature, and it follows directly from determinism and the absence of I/O.

*Applied in PRODUCT-001:* the reference suite runs its 207 tests with no I/O at all,
and the full Version 1.0 suite — 243 tests across 21 files — finishes in about two
seconds. The same discipline keeps the platform tests quick — small fixtures, no
network, no sleeps — so `npm test` stays something you run constantly, not something
you avoid.

## 6. Separate platform tests from product tests

Platform capabilities and the product that composes them are different concerns,
and their tests live apart (`tests/platform/` vs. `tests/products/`). This mirrors
the source layout and keeps each tier's tests focused on that tier's job.

*Applied in PRODUCT-001:* platform tests never assert anything about the Knowledge
Assistant — they cannot, because the capabilities do not know the product exists.
The product tier tests only what is genuinely product logic: the `wikiKnowledgeProvider`
adapter that bridges retrieval results into knowledge items. The orchestration
itself (the `answer()` pipeline) is deliberately kept thin enough that it is covered
by its parts rather than by heavy end-to-end tests through a mocked AI.

## 7. Test configuration through behaviour, not hardcoded values

Where behaviour depends on configuration or environment, the test should assert the
*behaviour* ("falls back to the default when unset") rather than a *magic value*
("equals `claude-sonnet-5`"). Hardcoding the value into the test just duplicates the
constant and couples the test to a decision it should be verifying, not restating.

*Applied in PRODUCT-001:* the AI Client exports its `DEFAULT_MODEL` as the single
source of truth precisely so a test can assert the *fallback behaviour* against that
exported constant rather than pasting a model string of its own. The test verifies
"when `ANTHROPIC_MODEL` is unset, the client targets the documented default" — which
stays correct even if the default changes. This is the principle that turned a
brittle test into a behavioural one (see the architectural lesson below).

---

# Why fast tests matter (an architectural goal, not a convenience)

Speed was treated as an *architectural* goal, not merely a developer comfort,
because a fast suite starts a positive feedback loop that a slow suite kills:

```text
        fast tests
            │  get run constantly (they cost nothing to run)
            ▼
     frequent execution
            │  makes change cheap and safe to verify
            ▼
    confident refactoring
            │  keeps boundaries clean and capabilities small
            ▼
   preserved architecture
            │  stays reusable and easy to build on
            ▼
  easier future products
            └────────────┐  which start with the same fast tests …
                         ↺  (the loop reinforces itself)
```

Each step depends on the one before it. If the tests are slow, they get run less;
if they get run less, refactoring becomes risky; if refactoring is risky, the
architecture quietly rots; and once the architecture rots, the next product no
longer starts from a clean, reusable platform. **A slow suite breaks the loop at
step one.** That is why "keep tests fast" (Principle 5) is not a nicety — it is what
protects every other property this documentation set celebrates. The suite is fast
by design so that the architecture stays good by habit.

---

# Testing boundaries — what is intentionally NOT tested

A test suite is defined as much by what it refuses to test as by what it covers.
PRODUCT-001 draws a firm line: **it tests its own contracts and assumes external
libraries fulfil theirs.** The boundary of testing is the boundary of ownership.

The following are deliberately *not* tested:

- **Anthropic's API and model behaviour.** The AI Client's tests verify that the
  product *calls the provider correctly* and *maps the response faithfully* — not
  that Anthropic returns good answers. The provider is a boundary to be mocked, not
  a system under test.
- **The Anthropic SDK's internals.** We trust the SDK to do what it documents; we
  test only our use of it.
- **Node.js built-ins** (`fs`, `path`, `readline`). Reading files, resolving paths,
  and prompting for input are assumed correct. Tests exercise *our* logic over them
  via small fixtures, never the runtime itself.
- **The filesystem.** We test how Retrieval and the Handbook Service *interpret* a
  directory layout (through fixture trees), not that the operating system reads
  files correctly.
- **Text-parsing primitives.** The regexes that extract headings and wiki-links are
  tested through their *behaviour* (does the right title come back?), not by
  auditing a parser or the regex engine.

The engineering decision underneath is important: chasing coverage of things you do
not own produces slow, brittle tests that fail for reasons you cannot fix. By
testing only its own contracts, PRODUCT-001 keeps the suite fast, stable, and
meaningful — every failure points at something the team can actually act on.

---

# Testing as an architectural tool

The most valuable thing the tests did was not catch bugs — it was **shape the
architecture and give the confidence to leave good things alone.** Four moments
show testing acting as a design force, not just a safety net.

### Independent capabilities became easy to test — and easy testing proved the boundaries were right

When a capability turned out to be trivial to test in isolation — no scaffolding, no
other capability present — that was direct evidence the boundary around it was drawn
correctly. Difficulty testing a unit is usually the architecture complaining;
PRODUCT-001's units were easy to test because they were genuinely independent. The
test suite was, in effect, a continuous audit of the one-way dependency rule.

### Reusing — and safely enhancing — the Context Builder, because tests guarded it

Reusing the Context Builder through its contract, and making the one small assembly
enhancement it needed (KA-AD-03, EJ-04), was only safe because its 207-test suite
already guaranteed its behaviour. The product could build on it — and the enhancement
could land — without fear of silent regressions, because the contract was locked down
by tests written before the product existed. Good tests are what let a platform
service be *safely evolved* rather than *frozen* — that guarantee is what made
changing it, when a real gap appeared, a low-risk move rather than a gamble.

### The AI Client tests exposed a configuration assumption, not an implementation bug

When an AI Client test behaved unexpectedly, the cause was not a defect in the code —
it was a hidden assumption about the environment (which model the client would target
depends on whether `ANTHROPIC_MODEL` is set). The fix was not to patch the
implementation but to make the *test* honest: assert the fallback behaviour against
the exported `DEFAULT_MODEL` and control the environment, rather than hardcoding a
model string that silently assumed an unset variable. The test surfaced a
configuration assumption and forced it into the open — which is exactly what a good
test should do.

### Retrieval could change freely because downstream stages were protected by contracts

The retrieval algorithm is deliberately naive and expected to be replaced (KA-AD-10).
That replacement is safe *specifically because* the downstream stages test against
the `RetrievalResult` contract, not against the current scorer's output. Retrieval
can switch from keyword frequency to BM25 to embeddings, and nothing downstream needs
a new test — the contract between stages is the thing under test, so the stages are
insulated from each other's internals.

The through-line: **the tests protected contracts and boundaries, and because they
did, the architecture stayed free to change where it needed to and stayed still where
it was already right.**

---

# Test suite at a glance (Version 1.0)

A quick numeric picture of the suite, for readers who want the shape without the
prose. Figures are the verified Version 1.0 counts (`npm test`).

| Tier | Files | Tests |
| --- | ---: | ---: |
| Platform capability tests (config · handbook · retrieval · prompt · ai) | 5 | 32 |
| Product tests (incl. product ↔ Context Builder integration) | 1 | 5 |
| Context Builder tests (reused SPEC-002 service) | 15 | 207 |
| **Total** | **21** | **243** |

- **Runtime:** ~2.1 seconds for the full suite.
- **External services mocked:** 1 (Anthropic — the only true external boundary).
- **Dedicated end-to-end orchestrator tests:** 0, by design — the product apex is
  thin and covered by its parts. Of the 5 product tests, 2 are product ↔ Context
  Builder integration.
- **I/O in the reference suite:** none — no filesystem, network, randomness, or
  clock; time is injected.

The distribution *is* the strategy made visible: **~98% of the tests live at or
below the platform line**, and the product carries only the handful it truly needs.

---

# If we rewrote PRODUCT-001 today, what would we keep exactly the same?

Not everything about the current suite is sacred — product-level orchestration
coverage is thin, and an honest end-to-end test with a faked provider would be a
reasonable addition. But if starting over, these choices would be kept without a
second thought, because they earned their place:

1. **Test through public entry points, always.** The single most valuable rule.
   It is why internals stayed free to evolve and why the tests never became a tax on
   refactoring. Non-negotiable in a rewrite.
2. **Determinism with injected time and no I/O.** Injecting the timestamp rather than
   reading a clock, and using tiny fixtures instead of live data, is what made the
   suite fast, portable, and trustworthy. Keep exactly as-is.
3. **One isolated suite per platform capability.** The one-file-per-capability,
   no-collaborators structure is what turned the dependency rule into a testable
   property. Keep it.
4. **Mock only the external provider.** Reserving mocking for the true external
   boundary — and shrinking that boundary with the render/generate seam so almost
   everything before it is real — kept the tests honest. Keep it.
5. **Configuration tested through behaviour, via a single exported source of truth.**
   The `DEFAULT_MODEL` pattern (assert the fallback, not the magic value) is small but
   correct, and it prevented a class of brittle, environment-coupled tests. Keep it.

What we would *not* keep is any temptation to add heavy, mock-laden end-to-end tests
of the orchestrator; the parts are better tested than the whole, and the whole is
thin by design. The lesson worth carrying forward is that **a well-drawn
architecture makes for a small, fast, honest test suite — and the test suite, in
turn, is what proves the architecture was well-drawn.**

---

# Relationship to the specifications

The [User Flows](../../../docs/specifications/products/PRODUCT-001-user-flows.md)
say each flow "should eventually be supported by automated acceptance tests." This
document records the strategy underneath that goal: rather than one heavy acceptance
test per flow through a mocked AI, PRODUCT-001 verifies the flows' *building blocks*
— retrieval's empty result (flow 2), the config/handbook error paths (flows 6, 7),
the citable prompt (flows 1, 4) — at the level where they can be tested
deterministically. The behaviour the specs promise is protected; it is simply
protected at the seams rather than only at the surface.
