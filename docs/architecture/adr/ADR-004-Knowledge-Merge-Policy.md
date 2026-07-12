# ADR-004 — Knowledge Merge Policy

**Status:** Accepted

**Date:** 2026-07-12

**Extends:** ADR-002 · ADR-003 · SPEC-005

**Decision Makers**

- AJ
- Claude (Architecture Partner)

---

> **Amended by ADR-006 (2026-07-12).** The "human-owned region" of §5 and the
> human-edit protection in §6 are **superseded**: realigning to ADR-002, the
> wiki body is fully generator-owned and MERGE re-synthesizes it. The guards
> below still hold (they protect accumulated *generated* knowledge); only the
> manual-wiki-edit protection is removed. Learned frontmatter metadata
> (`aliases`) is the sole preserved exception.

# Context

INGEST compiles a source into a small graph of pages (SPEC-005 §22). Once
more than one source touches the same entity or concept, the wiki must
**accumulate** knowledge on the shared page rather than overwrite or
duplicate it. MERGE is that accumulation behavior — and, like RECONCILE, it
is a knowledge policy, not just plumbing.

The guiding requirement: **every successful merge leaves the page richer
than before.** MERGE grows the knowledge graph over time while preserving
accumulated knowledge, provenance, contradictions, and human edits.

---

# Decision

## 1. The Wiki is the sole knowledge artifact

MERGE reads the **existing page** and the **new extraction** and produces an
enriched page. There is **no separate claim store or structured
intermediate knowledge database** — introducing one would move the canonical
knowledge representation away from the Wiki, which is a different
architecture. The generator's `.generator/` state remains pure
**bookkeeping** (content hashes, the reverse index); it never holds
knowledge. The rendered wiki pages *are* the accumulated knowledge.

## 2. What merging means (scope)

MERGE governs `entities/` and `concepts/` pages — the multi-source pages.
`sources/` summary pages stay strictly 1:1 (re-derived on modify, orphaned
on remove — ADR-003). `overview.md` (global synthesis) and `index.md`
(catalog) evolve by their own rules and are out of MERGE's scope.

## 3. Guarded LLM re-synthesis (default mode)

When a new source contributes to an existing page, MERGE merges the existing
page and the new extraction into a **single, richer page** via the LLM
(behind the Knowledge Compiler port). Enrichment is **validated against
guards, not mathematically proven** (there is no claim set to prove it
from).

## 4. Enrichment guards (validation)

A re-synthesis is accepted only if all hold; otherwise it is **not
persisted** (§6):

- **Provenance superset** — `sources[]` after ⊇ before.
- **Link retention** — every `[[wiki-link]]` present before is present
  after (no dropped graph edges), unless converted into a contradiction.
- **Contradiction retention** — every existing `> [!warning] Contradiction`
  callout is retained.
- **No silent loss** — supported knowledge present before is still
  represented after (or explicitly superseded via a contradiction).
- **No collapse** — the merged page is not implausibly smaller than before
  (a tripwire against the model discarding content).

## 5. Human-owned vs generator-owned regions (structural protection)

Long-term, each page demarcates a **generator-owned region** (which MERGE
may rewrite) from a **human-owned region** (which MERGE never touches).
MERGE only ever rewrites the generated region; human additions are
protected **structurally**, not heuristically, so the graph keeps evolving
without endangering edits.

Interim (until pages carry region markers): a page that has **drifted from
its last generated hash** is treated as human-owned and is protected (§6).

## 6. Fallback when re-synthesis is unsafe

When full re-synthesis is not safe — the page is human-owned/drifted, or a
re-synthesis fails the §4 guards — MERGE must **never persist a lossy page**
and must **never touch human content**. Instead it enriches losslessly by
**appending the new knowledge into the generated region**, and records the
event. If even a safe append is not possible, MERGE **defers** with a
needs-merge proposal for review. Accumulation continues; nothing is lost.

## 7. Provenance

`sources[]` is a **monotonic superset** (MERGE only widens it) and
**sticky** (RECONCILE keeps removed ids). The reverse index generalizes
from `source → its page` to **`source → [all pages it contributed to]`**.
MERGE (adds provenance) and RECONCILE (flags/removes it) compose cleanly.

## 8. Contradictions

A new claim that conflicts with existing content produces a persistent
`> [!warning] Contradiction` callout naming both claims, both sources, and
the date. Contradictions are **surfaced and retained, never auto-resolved**
(Foundation-over-Library is surfaced, not silently applied). A contradiction
is itself accumulated knowledge.

## 9. Identity is the mechanism, not the driver

Which page receives a merge is decided by identity resolution behind the
Knowledge Compiler port. **v1 = deterministic slug matching**; **semantic
matching is a future extension** behind the same port. When identity is
uncertain, MERGE **prefers a new page (a benign duplicate LINT can flag)
over merging into the wrong page** — a false split is cheap; a false merge
corrupts accumulated knowledge.

---

# Invariants

1. **Enrichment** — a successful merge never leaves the page poorer;
   knowledge after ⊇ before. Enforced by construction: a result failing the
   §4 guards is never persisted (§6).
2. **Wiki is the sole artifact** — no separate claim/knowledge store;
   `.generator/` holds only bookkeeping.
3. **Provenance monotonic + sticky** — `sources[]` only grows via MERGE.
4. **Human edits preserved** — MERGE never rewrites the human-owned region
   (structurally long-term; via drift protection interim).
5. **Contradictions surfaced, retained, never auto-resolved.**
6. **Non-destructive** — MERGE only enriches or creates; never deletes.
7. **Idempotent** — re-merging an already-incorporated source is a no-op.
8. **Atomic** — all-or-nothing per page.
9. **Identity safety** — a false split is preferred over a false merge.
10. **Auditable & rebuildable** — every merge is logged; provenance makes
    the accumulation reconstructable.

---

# Consequences

**Positive**

- The Wiki stays the single, browsable, canonical knowledge artifact.
- Human edits gain deterministic, structural protection.
- Existing contracts absorb it: `GenerationReport` already carries the
  fields needed to report merges/proposals; no contract change required.

**Trade-offs / new needs**

- Enrichment is **validated, not proven** — the §4 guards and the §6
  fallback are load-bearing; weak guards would let the model silently drop
  knowledge.
- The generator must persist a **per-page generated-content hash** (in
  `.generator/`, bookkeeping — not knowledge) to detect drift and protect
  human regions.
- The reverse index becomes `source → [pages]`; page provenance
  (`page → sources`) lives in frontmatter.
- Pages need a **generated/human region demarcation** long-term; until then
  drift detection is the interim guard.

---

# Affected Documents

- **SPEC-005 §22.7** — expanded from a requirement into the operational
  MERGE policy (modes, guards, regions, identity).
- **AJS-006** — governance note on merge/enrichment.
- **ARCH-002** — references this ADR for the merge invariants.

---

# Related Documents

- ADR-002 — Wiki Ownership, Location, and Persistence
- ADR-003 — Knowledge Reconciliation and Page Lifecycle
- ARCH-002 — Knowledge Platform Architecture
- SPEC-005 — Wiki Generator Agent (§22 INGEST)
- AJS-003 — Knowledge Standard · AJS-006 — Knowledge Governance Standard
