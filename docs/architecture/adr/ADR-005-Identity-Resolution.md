# ADR-005 — Identity Resolution and the Staged Compilation Pipeline

**Status:** Accepted

**Date:** 2026-07-12

**Extends:** ADR-004 · SPEC-005

**Decision Makers**

- AJ
- Claude (Architecture Partner)

---

# Context

Validation on real Foundation content (17 docs) showed that prompt-level
canonical naming **cannot** solve duplicate pages: the problem is
**cross-document identity**. Each document is compiled independently, so a
doc that extracts "game audio career" has no way to know another already
created "game audio". A refinement pass that added lateral links (a clear
win: 0 → 303 links) still left near-duplicate clusters *worse*
(`game-audio` / `game-audio-career` / `game-audio-portfolio` / …), because
per-document instructions cannot dedupe across documents.

The fix requires matching each new candidate against the **already-existing
wiki**, by meaning — an operation that belongs to a dedicated stage, not the
compiler. This ADR introduces that stage and makes the pipeline explicit.

---

# Decision

## 1. An explicit five-stage pipeline

```
KnowledgeCompiler → IdentityResolver → WikiRenderer → MergeEngine → WikiStore
   (extract)          (resolve)         (render)       (enrich)      (persist)
```

- **KnowledgeCompiler** — extracts structured knowledge from a source. It is
  **renderer-agnostic**: it emits an extraction model (summary, entities,
  concepts, relationships), **no Markdown**.
- **IdentityResolver** — maps each candidate entity/concept to a **canonical
  identity**: an existing page or a genuinely new one.
- **WikiRenderer** — renders Markdown pages using the **canonical** paths and
  wiki-links the resolver decided.
- **MergeEngine** — enriches an existing page with a new contribution
  (ADR-004), unchanged.
- **WikiStore** — persists.

## 2. The compiler is Markdown-free

Extraction is independent of any output format. This keeps the door open for
additional renderers (a graph export, a search index, other knowledge
artifacts) that consume the **same extraction** without touching the
extraction stage.

## 3. Rendering is downstream of identity

Identity determines canonical page paths and canonical `[[wiki-links]]`.
Rendering therefore happens **after** resolution and uses canonical
identities directly — the system never renders pages with candidate slugs
and repairs them afterward.

## 4. Staged identity resolution

For each candidate `(name, kind, description)` against the existing pages:

1. **Normalize** the candidate name.
2. **Lexical shortlist** — select the few most similar existing pages
   (token overlap), so the LLM never sees the whole wiki.
3. **LLM adjudication** — decide *same-as-X* (which shortlist page) vs *new*.
4. **Confidence + explanation** — return a confidence score and a short
   explanation (which candidates were considered, why the verdict) for
   debugging and threshold tuning.
5. **Three-way verdict, biased to split** — a high-confidence match is
   `existing`; a plausible-but-uncertain match is `unsure` (below the merge
   threshold); everything else — including an empty shortlist or an
   unparseable adjudication — is `new`. Orchestration today treats `unsure`
   like `new`, but the distinction is preserved in the contract for future
   review workflows ("did you mean X?"). A false split is cheap; a false
   merge corrupts accumulated knowledge (ADR-004 §9).

The LLM adjudication is the only non-deterministic step and is isolated
behind the resolver port; the shortlist and normalization are deterministic.

## 5. MergeEngine unchanged

When the resolver returns an existing target, the renderer produces the
incoming page at that canonical path and the MergeEngine enriches it under
ADR-004's guards.

---

# Invariants

1. **False split over false merge** — uncertain identity resolves to a new
   page; the resolver never merges below the confidence threshold.
2. **Extraction is renderer-agnostic** — the compiler emits no Markdown; any
   renderer can consume the extraction.
3. **Canonical by construction** — rendered paths/links use resolved
   identities; no post-hoc link repair.
4. **The resolver never invents** — it only maps to an existing page or
   declares new; it does not alter knowledge.
5. **Deterministic given resolutions** — rendering is deterministic; only
   resolution (LLM) and extraction (LLM) are not.

---

# Consequences

**Positive**

- Identity becomes a first-class, measurable stage (matches / new pages /
  confidence distribution / duplicate clusters).
- The compiler is reusable for non-wiki outputs.
- Cross-document dedup becomes possible (the `game-audio*` cluster collapses
  to one page; `fantasy-demo` merges into `fantasy-audio-demo`).

**Trade-offs / refactor**

- The compiler contract changes: `compile` returns an **extraction model**,
  not rendered pages. Rendering moves to a `WikiRenderer` stage.
- The generator composes an additional two collaborators (resolver,
  renderer). Its config grows accordingly.
- A per-run **existing-page catalog** (path, title, kind, description) is
  assembled for the resolver and updated as pages are created/merged.
- New validation metrics: matches vs new, confidence distribution, plus a
  slot for manual false-split / false-merge observations.

---

# Rollout (behavior-preserving first)

1. Introduce the stage contracts (this ADR + interfaces).
2. Refactor to the five stages with a **deterministic SlugIdentityResolver**
   (reproduces today's slug behavior) — tests stay green, no behavior change.
3. Add the **semantic IdentityResolver** behind the same interface + the
   extended metrics; re-run the Foundation validation and compare.

---

# Affected Documents

- **SPEC-005 §22** — pipeline stages updated; identity (§22.9) points here.
- **ARCH-002** — Knowledge Layer components updated to the five stages.
- **ADR-004 §9** — identity policy is realized by this resolver.

---

# Related Documents

- ADR-004 — Knowledge Merge Policy
- ARCH-002 — Knowledge Platform Architecture
- SPEC-005 — Wiki Generator Agent (§22 INGEST)
