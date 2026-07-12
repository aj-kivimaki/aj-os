# ADR-003 — Knowledge Reconciliation and Page Lifecycle

**Status:** Accepted

**Date:** 2026-07-11

**Extends:** ADR-002 · SPEC-005

**Decision Makers**

- AJ
- Claude (Architecture Partner)

---

# Context

ADR-002 established that the wiki is **persistent but recoverable** and
**not a mirror** of the source set: removing a source must not
automatically remove the knowledge derived from it. SPEC-005 named a
**RECONCILE** operation to handle removed/moved sources, but its behavior
was left undefined.

RECONCILE is not infrastructure — it defines the **lifecycle of generated
knowledge**. Before implementing it, the following had to be decided: what
"stale" means, which reconciliation actions run headless versus require
human review, how provenance drives the process, and how pages with
multiple contributing sources behave when one source changes or disappears.

---

# Decision

## 1. Page lifecycle

Generated pages have two stored statuses, **`active`** and **`stale`**;
**`removed`** is absence (no tombstone for now).

```
active ──(contributing source removed / synthesized-dependent source changed)──▶ stale
stale  ──(condition resolves: source returns, or page re-derived/re-synthesized)─▶ active
stale  ──(human/orchestration acts on a removal proposal)──────────────────────▶ removed
active ──(human/orchestration prunes directly)────────────────────────────────▶ removed
```

RECONCILE performs only the `active ⇄ stale` transitions and *emits*
removal proposals. It never performs a `→ removed` transition.

## 2. Definition of "stale"

A page is **stale** when its provenance is out of sync with the current
source set — it may no longer faithfully represent its sources. Stale iff:

- a contributing source was **removed** (partial or full orphan), or
- a contributing source was **modified** and the page could not be safely
  auto-re-derived (synthesized pages).

Staleness is recorded on the page (frontmatter `status`, `stale_reason`,
`stale_since`), making it durable and visible in Obsidian.

Hand-edits (hash-drift) and contradictions are **LINT's** concern, not
RECONCILE's. RECONCILE owns lifecycle driven by *source-set* changes; LINT
owns *wiki-internal* health; INGEST owns direct (re)derivation of 1:1
source pages.

## 3. Automatic (headless) actions

Only the safe, reversible, and unambiguous:

- Re-derive **1:1 source pages** on modification (deterministic → `active`).
- **Mark pages `stale`** when provenance goes out of sync.
- **Clear `stale` → `active`** when the condition resolves.
- Maintain the **reverse index** and page provenance.

## 4. Human-reviewed proposals (never headless)

- **Removal** is emitted as a `RemovalProposal` **only for fully-orphaned
  pages** (all contributing sources gone). Partial orphans stay
  `stale`-but-kept (they still have live provenance).
- **Merges** and other curation are out of RECONCILE's automatic scope
  (deferred).

## 5. Multi-source (synthesized) pages — conservative policy

For a synthesized page P ← {A, B, C}:

| Event | Outcome |
|---|---|
| A modified | P → `stale (source-modified)`. **Never** auto-rewritten. |
| A removed, B/C remain (partial orphan) | P → `stale (partial-orphan)`. Kept. |
| A, B, C all removed (full orphan) | P → `stale (orphaned)` + removal proposal. Kept. |

Synthesized pages are **never auto-rewritten headless**, because that risks
silently dropping accumulated cross-source knowledge — violating SPEC-005's
"never silently overwrite accumulated knowledge." Re-synthesis happens
later via a reviewed run or human action.

For 1:1 source pages: modified → auto re-derive (`active`); removed → `stale
(orphaned)` + removal proposal. A rename is remove + add until rename-stable
ids exist.

## 6. Provenance is sticky (historical)

When a source is removed, its id is **kept** in the affected page's
provenance as a historical record. Liveness is **computed** by intersecting
a page's contributing-source ids with the current source set — provenance
is never stripped. This preserves the audit trail of where knowledge came
from and is what makes orphan detection possible.

The **reverse index** (`source id → pages`) is generator state under
`.generator/` and is rebuildable by scanning page frontmatter.

## 7. Staleness is retrieval-neutral (for now)

`stale` is a flag; it does **not** gate retrieval by itself. Whether stale
pages are down-ranked or excluded is a retrieval concern (AJS-002) to be
decided later.

---

# Invariants

1. **No knowledge deleted headless** — RECONCILE only annotates/re-derives;
   destructive acts are proposals.
2. **No silent overwrite of synthesized knowledge** — multi-source pages
   are never auto-rewritten.
3. **Provenance preserved** (sticky/historical) — liveness is computed.
4. **Targeted & complete** — every affected page (via the reverse index) is
   evaluated; unaffected pages are untouched.
5. **Deterministic & idempotent** — repeated runs on the same source state
   do not oscillate.
6. **Reversible staleness** — `stale → active` when the condition resolves.
7. **Never a mirror** — accumulated knowledge persists until explicitly
   pruned.
8. **Index/provenance consistency & rebuildability**.
9. **Observability** — every action is reported in `GenerationReport` and
   logged with reasons.

---

# Consequences

**Positive**

- A clear, conservative lifecycle that protects accumulated knowledge and
  keeps humans in control of destructive actions.
- The existing contracts already support it: `GenerationReport.stalePages`
  and `.removalProposals`, and `RemovalProposal { path, reason,
  orphanedSources }` — no contract changes required.

**Trade-offs**

- Stale pages accumulate as a backlog that only a reviewed re-synthesis or
  human action clears; the wiki can temporarily hold stale-but-kept
  knowledge. This is accepted as the price of not silently overwriting or
  deleting.
- Renames surface an orphaned-page proposal plus a new page until
  rename-stable ids are introduced.

---

# Affected Documents

- **SPEC-005** — expanded with reconciliation semantics, page lifecycle,
  and the page frontmatter schema.
- **AJS-006** — governance note on the `stale` lifecycle.
- **ARCH-002** — references this ADR for the lifecycle invariants.

---

# Related Documents

- ADR-002 — Wiki Ownership, Location, and Persistence
- ARCH-002 — Knowledge Platform Architecture
- SPEC-005 — Wiki Generator Agent
- SPEC-006 — Source Connector · SPEC-007 — Wiki Store
- AJS-003 — Knowledge Standard · AJS-006 — Knowledge Governance Standard
