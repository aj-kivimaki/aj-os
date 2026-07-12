# ADR-006 — Identity Learning (Aliases and Review)

**Status:** Accepted

**Date:** 2026-07-12

**Extends:** ADR-004 · ADR-005

**Decision Makers**

- AJ
- Claude (Architecture Partner)

---

# Context

The semantic IdentityResolver (ADR-005) is conservative by design: it merges
only high-confidence matches, surfaces the rest as `unsure`, and never risks
a false merge. Validation on Foundation confirmed this works (near-duplicate
clusters halved, zero false merges), leaving `unsure` concept synonyms
deliberately split.

Rather than lower the thresholds (which would risk false merges), we **teach**
the resolver: human-reviewed decisions become **persistent identity
knowledge** that the resolver consults *before* lexical matching and LLM
adjudication. The system then improves on this Handbook over time while the
conservative policy stays intact.

---

# Decision

## 1. Learned identity lives in the wiki (page frontmatter aliases)

A canonical page records its alternative names in Obsidian-native
`aliases:` frontmatter:

```yaml
---
type: entity
title: "Fantasy Audio Demo"
aliases:
  - Fantasy Demo
  - Unity Wwise Fantasy Audio Demo
---
```

This keeps identity knowledge **in the wiki** (consistent with ADR-004: the
wiki is the sole knowledge artifact — no separate store), human-editable in
Obsidian, rebuildable, and it improves Obsidian's own link resolution.

## 2. Resolver Stage 0 — known identity

Resolution gains a deterministic first stage, before the lexical shortlist
and LLM (ADR-005 §4):

```
0. KNOWN IDENTITY — candidate name matches a same-kind page's title or a
   learned alias (normalized)?  → existing (confidence 1, no LLM)
1. lexical shortlist
2. LLM adjudication → existing / unsure / new
```

Implemented as a **composable alias-aware decorator** around any
`IdentityResolver` (slug or semantic), so the underlying policy is unchanged.
A human-approved alias becomes a deterministic, LLM-free match forever — with
no false-merge risk, because it was human-approved.

## 3. Learned compiler metadata is preserved (the wiki body is not)

**This ADR realigns to ADR-002: the wiki is generator-owned.** The entire
page **body is generator-owned** — MERGE re-synthesizes it under the
enrichment guards (which preserve accumulated *generated* knowledge), and a
hand-edited body is drift surfaced by LINT (hash), **not** preserved. This
**supersedes ADR-004 §5–6's "human-owned region"** concept, which solved a
problem the intended workflow does not have (humans maintain the Handbook,
not the wiki).

The one exception is **learned compiler metadata in frontmatter** (`aliases`,
and future feedback-layer signals). These are compiler *annotations*, not
knowledge content, so merge and re-derive carry them forward across
regeneration even though the body is regenerated.

## 4. The `unsure` worklist is captured

Each run persists its `unsure` verdicts — candidate, best-candidate target,
confidence, and explanation — to `.generator/review-queue.json` (generator
bookkeeping), so the review command has a worklist.

## 5. Review command with retroactive merge

A review command replays the worklist for approve/reject. **Approving** a
match:

1. writes the candidate name as an **alias** on the canonical page;
2. **retroactively merges** the duplicate page's accumulated knowledge into
   the canonical (via the MergeEngine, ADR-004 guards), **preserving
   provenance** (the reverse-index entries move onto the canonical);
3. **surfaces the duplicate as a removal candidate** — it does *not*
   auto-delete. The now-redundant page becomes a removal proposal requiring
   an explicit, separate human approval (as with RECONCILE, ADR-003).

So cleanup is immediate for knowledge (alias + merge) but deletion stays a
second, explicit human decision.

---

# Invariants

1. **Conservative policy unchanged** — thresholds and prompts are untouched;
   aliases only ADD human-approved deterministic positives.
2. **No false merges introduced** — Stage 0 matches only exact title/alias;
   retroactive merges are human-approved.
3. **Identity knowledge lives in the wiki** — aliases are page frontmatter,
   not a separate store; the `.generator/` review queue is bookkeeping only.
4. **Teaching persists** — aliases survive merge/re-derive.
5. **Deletion stays explicit** — the review command merges and aliases
   immediately, but only *surfaces* the duplicate as a removal candidate; a
   separate human approval performs the deletion.

---

# 6. Toward a general human-feedback layer

Identity resolution is the **first capability** of a general pattern:
human-reviewed decisions become persistent, wiki-resident knowledge that
guides future automation without changing the core compiler or its prompts.
The same shape — surface uncertainty → human confirms → persist as page
metadata the pipeline consults — can later support **preferred terminology**,
**summary refinements/corrections**, and other user-guided improvements.
The review queue and the "consult learned knowledge first" stage are
designed to generalize beyond identity; this ADR implements the identity
instance.

---

# Consequences

- `ExistingPage` gains `aliases`; `readFrontmatter` parses list fields;
  `buildCatalog` populates aliases.
- The MergeEngine preserves `aliases`; the generator preserves them on
  re-derive.
- A `.generator/review-queue.json` is written per run.
- The review command reuses the MergeEngine and updates the reverse index
  when it prunes a duplicate.

---

# Rollout

- **Phase 1** — aliases in frontmatter, the alias-aware resolver decorator,
  alias preservation, and worklist capture. (Foundation; forward improvement
  works immediately if aliases are added in Obsidian.)
- **Phase 2** — the review command + retroactive merge/prune.

---

# Related Documents

- ADR-004 — Knowledge Merge Policy
- ADR-005 — Identity Resolution
- SPEC-005 — Wiki Generator Agent (§22)
