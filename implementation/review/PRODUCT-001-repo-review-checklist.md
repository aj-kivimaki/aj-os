# PRODUCT-001 — Repository Review Checklist

**Status:** Review — audit only, no changes made
**Prepared:** 2026-07-10
**Owner:** AJ
**Category:** Product Engineering — Release Readiness Audit

---

> **Historical note.** This checklist was created *before* the AJ-OS Platform v2.0.0
> release-preparation work. Many findings recorded here were intentionally resolved
> during the v2.0.0 release-preparation commit. It is retained as a **historical
> engineering audit**, not a description of the repository's current state; the
> findings below are deliberately left untouched.

---

# Purpose

This is a **repository-wide audit** performed after completing PRODUCT-001 (the
Knowledge Assistant, product version 1.0). Its job is to find everything in the
AJ-OS repository that is now **inconsistent because PRODUCT-001 shipped**, and to
turn those findings into a prioritized plan for bringing the repository into
alignment before a release is tagged.

**No files were modified.** This document is a checklist only. It deliberately does
**not** propose speculative improvements — only inconsistencies created or exposed
by completing PRODUCT-001.

Every finding was verified against the actual repository state on the date above.

**How to read a finding:** each has a **Priority** (Critical / High / Medium /
Low), the **affected file(s)**, the **current state**, **why it is now
inconsistent**, a **recommended action**, an **effort** estimate (S ≈ <30 min,
M ≈ 1–2 h, L ≈ half-day+), and a **timing** call (**Before tag** or **Can wait →
next release**).

---

# The central issue: what does "Version 1.0" mean?

This must be read first, because several findings depend on it.

There are **two different "1.0"s** in play, and completing PRODUCT-001 collided
them:

- **Repository semver.** The repo *already released* `1.0.0` on **2026-06-28** — see
  [CHANGELOG.md](../../CHANGELOG.md) line 68. That release was the **Notion
  code-first business operating system** (Workspace Sync, CEO Dashboard, the Notion
  modules). `package.json` is still `1.0.0`.
- **PRODUCT-001's product version.** The Knowledge Assistant is documented as
  *product* version **1.0.0** throughout its
  [documentation set](../products/knowledge-assistant/README.md).

So the tag `v1.0.0` is, in effect, already claimed by the June Notion release, while
the work since then — Context Builder (SPEC-002), the API/agent, **and PRODUCT-001**
— sits unreleased with no version number. "Freeze Version 1.0" is therefore
ambiguous: PRODUCT-001's 1.0 is a *product* milestone, not the *repository's* next
semver.

**This is the first thing to decide, and it shapes the tag.** It is finding
**C1** below.

---

# Findings summary

| ID | Priority | Area | Timing |
| --- | --- | --- | --- |
| C1 | Critical | Version scheme is ambiguous (repo `1.0.0` already used) | Before tag |
| C2 | Critical | CHANGELOG omits PRODUCT-001; current work has no version heading | Before tag |
| C3 | Critical | CLI banner prints "Version 0.1" | Before tag |
| H1 | High | Root README doesn't know PRODUCT-001 exists | Before tag |
| H2 | High | ROADMAP still platform-first; no shipped product | Before tag |
| H3 | High | Product documentation set is undiscoverable from the top | Before tag |
| H4 | High | Setup/onboarding path can't reach `aj ask` | Before tag |
| M1 | Medium | PRODUCT-001 specs still say Status: Draft / Version 0.1 | Can wait |
| M2 | Medium | Two overlapping "handbook Q&A" implementations | Can wait |
| M3 | Medium | CONTRIBUTING onboarding omits tests, specs, and the product | Can wait |
| L1 | Low | Root architecture diagrams omit the product/platform layer | Can wait |

---

# Critical

## C1 — The version scheme is ambiguous; repo `1.0.0` is already taken

- **Affected files:** [package.json](../../package.json),
  [CHANGELOG.md](../../CHANGELOG.md), the PRODUCT-001
  [release notes](../products/knowledge-assistant/release/v1.0.0.md).
- **Current state:** Repo `1.0.0` was released 2026-06-28 for the Notion business OS.
  `package.json` remains `1.0.0`. PRODUCT-001 (built after) has its own "v1.0.0"
  product docs. No repository version has been assigned to the Context Builder /
  agent / PRODUCT-001 body of work.
- **Why it is now inconsistent:** completing PRODUCT-001 produced a second "1.0" and
  a substantial unreleased body of work with no version number. A `v1.0.0` git tag
  would point at the wrong thing.
- **Recommended action:** decide the repository version that will carry the current
  unreleased work (Context Builder + agent/API + PRODUCT-001). Given the shift from
  a Notion business OS to a knowledge platform with its first product, a **minor or
  major bump (e.g., `1.1.0` or `2.0.0`)** is appropriate; set `package.json` to it.
  Keep PRODUCT-001's *product* version as `v1.0.0`, clearly labeled product-scoped,
  in the product docs. Document the two-axis versioning (repo semver vs. product
  version) in one place so it isn't re-confused.
- **Effort:** S to decide, S to apply.
- **Timing:** **Before tag** — it defines what the tag is.

## C2 — CHANGELOG does not record PRODUCT-001, and the unreleased work has no version

- **Affected file:** [CHANGELOG.md](../../CHANGELOG.md).
- **Current state:** the `[Unreleased]` section (lines 9–66) lists the Context
  Builder milestones and the API/agent, but contains **no mention of PRODUCT-001** —
  not the Knowledge Assistant, `aj ask`, nor the Config / Handbook / Retrieval /
  Prompt Renderer / AI Client capabilities. The most recent versioned entry is
  `[1.0.0] - 2026-06-28` (the Notion OS).
- **Why it is now inconsistent:** the repository's canonical release log has no
  record that its first platform-based product exists.
- **Recommended action:** add PRODUCT-001 entries under `[Unreleased]` (CLI `aj ask`,
  the five new platform capabilities, index-driven retrieval, citations, `--debug`);
  then, at tag time, promote `[Unreleased]` to the version decided in C1 with a date.
  The PRODUCT-001 [release notes](../products/knowledge-assistant/release/v1.0.0.md)
  are ready source material.
- **Effort:** M.
- **Timing:** **Before tag.**

## C3 — The CLI banner prints "Version 0.1"

- **Affected file:** [KnowledgeAssistant.ts](../../src/products/knowledge-assistant/KnowledgeAssistant.ts) line 357.
- **Current state:** the interactive welcome banner prints `Version 0.1`.
- **Why it is now inconsistent:** the product is at 1.0; the banner is a stale label
  and is the most visible version string a user sees.
- **Recommended action:** update the printed version to match the product's released
  version (ideally derived from a single source rather than a second hardcoded
  string). One-line code change; the only *code* item in this audit.
- **Effort:** S.
- **Timing:** **Before tag** — it is the product's face at launch.

---

# High

## H1 — The root README doesn't know PRODUCT-001 exists

- **Affected file:** [README.md](../../README.md).
- **Current state:** "Current Status" describes platform implementation as *underway*
  (Context Builder Milestone 4 "ready for its freeze review"); the "Roadmap" lists
  Context Builder as "In Progress." There is **no mention** of PRODUCT-001, the
  Knowledge Assistant, or `aj ask` anywhere in the file, and no product/platform
  consumer layer.
- **Why it is now inconsistent:** a shipped product is invisible in the repository's
  front door. A new developer cloning AJ-OS today would not learn that a usable
  product exists or how to run it.
- **Recommended action:** add a "Products" (or "Knowledge Assistant") section with the
  `aj ask` one-liner; update the status/roadmap sections to reflect that PRODUCT-001
  shipped; link to the product [documentation set](../products/knowledge-assistant/README.md).
- **Effort:** M.
- **Timing:** **Before tag** — first impression.

## H2 — The ROADMAP still frames the project as platform-first with no shipped product

- **Affected file:** [ROADMAP.md](../../ROADMAP.md).
- **Current state:** the roadmap states it "prioritizes building the platform itself
  before expanding into productivity features," places products only in Phase 5
  (future), and describes Context Builder M4 as pending freeze with work continuing
  to M5. PRODUCT-001 is absent.
- **Why it is now inconsistent:** PRODUCT-001 was built **product-first**, ahead of
  the platform-first sequence the roadmap still describes; the roadmap now
  contradicts what actually happened (see
  [engineering-decisions.md](../products/knowledge-assistant/engineering-decisions.md),
  EJ-01).
- **Recommended action:** reflect that the first product has shipped and that the
  approach became product-first; reconcile the phase narrative. The canonical history
  in [architecture-timeline.md](../products/knowledge-assistant/architecture-timeline.md)
  is the reference.
- **Effort:** M (a status note before tag; a fuller reconciliation can follow).
- **Timing:** **Before tag** for at least an accurate status note.

## H3 — The PRODUCT-001 documentation set is undiscoverable from the top

- **Affected files:** [README.md](../../README.md), the `docs/` index (no link
  exists anywhere).
- **Current state:** nothing at the repository root or in `docs/` links to
  `implementation/products/knowledge-assistant/`. A grep for `products/knowledge-assistant`
  across the root docs and `docs/` returns nothing.
- **Why it is now inconsistent:** a complete, eleven-document engineering record
  exists but cannot be found by anyone who doesn't already know the path.
- **Recommended action:** link the product doc set from the root README and/or a
  documentation index.
- **Effort:** S.
- **Timing:** **Before tag.**

## H4 — The setup / onboarding path cannot reach `aj ask`

- **Affected files:** [docs/guides/README.md](../../docs/guides/README.md),
  `docs/guides/installation.md`, `docs/guides/configuration.md`,
  [.env.example](../../.env.example), [CONTRIBUTING.md](../../CONTRIBUTING.md).
- **Current state:** the guides are Notion-centric — Installation covers "First
  synchronization," Configuration covers "your Notion workspace." `.env.example`
  frames `ANTHROPIC_API_KEY` as "Required to run the API server (npm run serve). The
  Notion sync CLI ignores these," and does not mention that the Knowledge Assistant
  needs it, nor `aj.config.json`. CONTRIBUTING's development commands list
  `install / typecheck / build / sync` but not `npm test` or `npm run dev`.
  *(installation.md and configuration.md were assessed from the guides index; read
  them in full when fixing.)*
- **Why it is now inconsistent:** a new developer following the documented setup ends
  up configuring Notion, not running the product. There is no documented path from
  clone → `aj ask`.
- **Recommended action:** add a Knowledge Assistant quickstart (create
  `aj.config.json`, set `ANTHROPIC_API_KEY`, `npm run build`, `aj ask`), clarify in
  `.env.example` that the key powers the Knowledge Assistant too, and add
  `npm test` / `npm run dev` where dev commands are listed. The product
  [usage.md](../products/knowledge-assistant/usage.md) already contains a ready
  quickstart to port or link.
- **Effort:** M (minimal quickstart + `.env` clarity is S–M; a full guide rewrite is
  larger and can wait).
- **Timing:** **Before tag** for the minimal quickstart and `.env.example` clarity.

---

# Medium

## M1 — PRODUCT-001 specifications still say Status: Draft / Version 0.1

- **Affected files:** the four
  [product specs](../../docs/specifications/products/) and the
  [implementation plan](../products/PRODUCT-001-implementation.md).
- **Current state:** all carry `Status: Draft`, `Version: 0.1`; the implementation
  plan describes seven milestones in the future tense.
- **Why it is now inconsistent:** the product shipped at 1.0, but the headers imply
  it is unbuilt. (Note the AJ-OS convention that "Draft = approved for implementation,
  not yet frozen"; a *shipped* product has passed that stage.)
- **Recommended action:** update the status/version headers to reflect an implemented
  v1.0 and/or add a pointer to the as-built documentation set. Do not rewrite the
  spec *content* — intent is still the specs' job.
- **Effort:** S.
- **Timing:** Can wait → next release (not release-blocking; a nice-to-have before
  tag).

## M2 — Two overlapping "handbook question-answering" implementations now coexist

- **Affected files:** [src/agent/](../../src/agent/) + [src/api/](../../src/api/)
  (the API handbook agent) vs
  [src/products/knowledge-assistant/](../../src/products/knowledge-assistant/) (the
  CLI Knowledge Assistant).
- **Current state:** the repository contains an API-based handbook agent
  (`POST /agent/ask`, a Claude tool-use loop over the handbook wiki) *and* the new
  platform-based CLI Knowledge Assistant (`aj ask`). Both answer questions from the
  handbook wiki, via different architectures.
- **Why it is now inconsistent:** completing PRODUCT-001 introduced a second,
  architecturally different assistant. A new developer would not know which is
  canonical or how they relate.
- **Recommended action:** document the relationship and intended roles (e.g., in the
  README or a short ADR) — not necessarily merge them. Decide the long-term direction
  separately.
- **Effort:** M to document; L if the two are ever consolidated.
- **Timing:** Can wait → next release (a one-sentence clarification before tag is
  cheap and worthwhile).

## M3 — CONTRIBUTING onboarding omits tests, specs, and the product

- **Affected file:** [CONTRIBUTING.md](../../CONTRIBUTING.md).
- **Current state:** recommended reading order points to `README`,
  `docs/guides/development.md`, `docs/architecture/`, `docs/modules/` (the legacy
  Notion modules) — it does not mention the specifications, standards, the
  `implementation/` tree, or the product docs. Development commands omit `npm test`
  despite a 243-test suite.
- **Why it is now inconsistent:** the onboarding path points a contributor at the
  legacy surface, not the platform/product they would actually work on, and hides the
  test suite that is now central.
- **Recommended action:** add `npm test` (and `npm run dev`) to the commands, and
  extend the reading order to include the specs/standards and the product docs.
- **Effort:** S.
- **Timing:** Can wait → next release (adding `npm test` is worth doing before tag).

---

# Low

## L1 — Root architecture diagrams omit the product/platform consumer layer

- **Affected files:** [README.md](../../README.md) (ASCII diagrams),
  `docs/architecture/ARCH-001-*`.
- **Current state:** the README's platform/knowledge-pipeline diagrams end at
  "Coding Agent" and do not depict the product/platform layering or PRODUCT-001 as a
  platform consumer.
- **Why it is now inconsistent:** the product introduced (and proved) a
  product-consumes-platform pattern that the top-level diagrams do not show.
- **Recommended action:** optionally add the product layer, or reference the
  canonical diagram in
  [architecture-timeline.md](../products/knowledge-assistant/architecture-timeline.md).
  Separately consider whether ARCH-001 should acknowledge the consumer layer.
- **Effort:** M.
- **Timing:** Can wait → next release.

---

# Consciously excluded (not PRODUCT-001-created)

To keep this audit honest and in-scope, the following were noticed but **excluded**
because they pre-date PRODUCT-001 or are unrelated to it:

- **"Business OS" vs. "developer OS" identity wording** between
  [CONTRIBUTING.md](../../CONTRIBUTING.md) ("code-first business operating system")
  and [README.md](../../README.md) ("knowledge-driven developer operating system").
  Pre-existing drift; PRODUCT-001 only sharpens it (see M3 for the part that is
  onboarding-relevant).
- **Legacy Notion modules / dashboard / schema engine.** Already labeled "Legacy
  Components (v1)" in the README; their existence is not a PRODUCT-001 inconsistency.
- **General ARCH-001 completeness** beyond the consumer-layer note in L1.

These may be worth addressing eventually, but they are not created by completing
PRODUCT-001 and are out of scope for this checklist.

---

# The new-developer test

The review philosophy asks: if a new developer cloned AJ-OS today…

| Question | Answer today | Fixed by |
| --- | --- | --- |
| Would they understand what AJ-OS currently is? | Partially — the front page still reads as a platform-in-progress. | H1, H2 |
| Would they know PRODUCT-001 exists? | **No** — it appears nowhere at the top level. | H1, H3, C2 |
| Would the documentation lead them correctly? | **No** — setup leads to Notion, not `aj ask`. | H4 |
| Are there conflicting versions? | **Yes** — repo `1.0.0` (June), product `1.0.0`, banner `0.1`. | C1, C3 |
| Are there stale roadmap items? | **Yes** — platform-first framing, no shipped product. | H2 |
| Are setup instructions still correct? | Only for the Notion path, not the product. | H4 |
| Do examples match the current CLI? | There are **no** `aj ask` examples at the root. | H1, H4 |

---

# Release assessment — is AJ-OS ready to tag Version 1.0?

**No — not yet.** Importantly, this is **not** because the product is unfinished.
The *code* is in good shape: PRODUCT-001 runs end to end, the full suite is green
(243 tests across 21 files, ~2.1s), and the product's own documentation is complete.

What is not ready is the **release metadata and the repository narrative**. The
blockers are all in that layer:

**Blocking (must resolve before any tag):**

1. **C1 — Decide what the tag means.** `v1.0.0` already denotes the June Notion
   release. The version that carries PRODUCT-001 must be chosen (and `package.json`
   set) before tagging, or the tag will misrepresent the repository.
2. **C2 — Record PRODUCT-001 in the CHANGELOG** and assign the release a version and
   date.
3. **C3 — Fix the "Version 0.1" CLI banner** so the product does not announce the
   wrong version on launch.
4. **H1 + H3 — Make PRODUCT-001 visible and discoverable** from the root README and a
   docs link.
5. **H2 — Correct the ROADMAP status** so it no longer contradicts the shipped
   product.
6. **H4 (minimum) — Provide a working `aj ask` quickstart** and clarify
   `.env.example`, so a fresh clone can actually run the product.

These are small in code terms — mostly documentation and one one-line banner fix —
and realistically total roughly **half a day to a day**. None require design work;
C1 is a decision, the rest is alignment.

**After the tag (backlog for the next release):** M1 (spec headers), M2 (clarify /
consolidate the two assistants), M3 (CONTRIBUTING), L1 (diagrams), and the fuller
guide rewrite behind H4.

**Bottom line:** the product is ready; the repository is not *yet* telling the truth
about it. Resolve the six blocking items above — the version decision first — and
AJ-OS can be tagged with confidence.
