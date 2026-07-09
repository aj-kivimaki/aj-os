# Decision: CB-015 Selection Policy

> **Task:** CB-015 — Selection Policy
> **Date:** 2026-07-09
> **Status:** Accepted — the initial exact-duplicate deferral was resolved the same
> day by an approved planning clarification and is now implemented (see
> §Exact-Duplicate Deferral → Resolution)

---

## Context

CB-015 defines the **Selection Policy** — the deterministic decision-making model
of knowledge selection, implemented as **executable platform behaviour** (pure,
stateless, identity-preserving functions), not documentation. It follows CB-013
(Selection Engine boundary) and CB-014 (SelectionResult contract). The policy
decides which KnowledgeItems continue, which are excluded, and the canonical
deterministic ordering of the ones that continue.

This task defines **only** the policy. It does **not** execute the Selection
Engine, construct a `SelectionResult`, integrate with the Context Builder, assemble
Context Packages, add explainability, or add behaviour tests — those are CB-016 and
later. It modifies no frozen contract: `SelectionResult`, `CollectionResult`, the
Collection Engine and the Provider Registry are untouched.

The frozen Milestone M3 plan fully specified the policy's shape (deterministic
evaluation, filtering, an ordered comparator chain terminating in an immutable
identifier; no scores, no numeric priority, no business heuristic). It did **not**
define the platform meaning of "exact duplicate" — that gap is handled by deferral
(below), not by invention.

## Decision

1. **Layout: a new internal `selection/policy/` module of pure functions.**
   `evaluation.ts` (per-item eligibility predicate), `filtering.ts` (retention
   predicate), `comparators.ts` (the ordered comparator chain + composed
   comparator), and an `index.ts` barrel. The policy is **behaviour**, not a data
   contract, so it introduces no `schema.ts`/`types.ts` split (mirroring the CB-010
   `collectKnowledge` behaviour file rather than the CB-014 contract layout).

2. **Ordering is the public guarantee; comparators are internal.** The policy
   barrel is **not** re-exported from `selection/index.ts` or the top-level
   `context-builder/index.ts` — it is imported directly by the Selection Engine
   (CB-016) that *applies* it, exactly as `collectKnowledge` stays internal to the
   collection module. The public guarantee is the *order* of
   `SelectionResult.selectedItems` (CB-014), never a priority/score/ranking value.

3. **Evaluation = a deterministic per-item eligibility predicate.**
   `evaluateKnowledgeItem(item): boolean`. The M3 platform rule is narrow: an item
   is eligible iff it **carries knowledge** (`content` non-empty). This is stated as
   executable policy rather than assumed from the CB-004 `content` (min length 1),
   so the policy is self-contained. Selection is **profile-agnostic** at M3 and
   introduces no scoring and no business heuristic; every contract-valid item is
   therefore eligible. Future Context Profiles (M5) modulate eligibility through this
   same predicate seam.

4. **Filtering = a deterministic retention predicate that reuses evaluation.**
   `isRetainedKnowledgeItem(item): boolean` — retained iff eligible. Kept distinct
   from evaluation because the frozen plan enumerates evaluation and filtering as
   separate responsibilities: evaluation judges a single item; filtering is the
   named retention rule the Selection Engine applies to *partition* items. A
   non-retained item is carried into `excludedItems` unchanged (never dropped,
   rewritten or merged).

5. **Ordering = an ordered comparator chain terminating in an immutable identifier.**
   `selectionComparatorChain: readonly KnowledgeItemComparator[]` (frozen) composed
   by `compareKnowledgeItems(a, b)`: apply each comparator in order, take the first
   non-zero result. The chain **terminates with `compareById`** (over
   `KnowledgeItem.id`), which guarantees a stable **total** order. At M3 the chain
   holds **only** its terminal comparator — no prioritization comparator is defined
   by the frozen plan, and inventing one would be a forbidden business heuristic.
   The chain is structured so future comparators are **prepended** ahead of
   `compareById` (M5 profiles) without changing its structure or the SelectionResult
   contract.

6. **Identifier ordering is by UTF-16 code unit, not `localeCompare`.** `compareById`
   uses `<` / `>` on `id`. Locale-aware collation is environment-dependent and would
   break determinism (PIPELINE-ARCHITECTURE §Deterministic Behaviour).

7. **No scores, no numeric priority, no ranking values, no runtime state.** The
   policy exposes only predicates and comparators. It never modifies KnowledgeItems
   (identity preserved), never communicates with providers, and never executes the
   engine or constructs a SelectionResult.

## Exact-Duplicate Deferral

**Exact-duplicate elimination is intentionally not implemented in CB-015.** The
frozen plan lists it as a Selection Policy responsibility but supplies **no
operative definition** of "exact duplicate" — only a *negative constraint*
(CB-015 Notes: the definition "must not rely on `KnowledgeItem.id`, since the
identifier serves as the deterministic tie-breaker rather than the duplicate
identity") and an instruction to "define 'exact duplicate' explicitly **before**
implementing" it. A `KnowledgeItem` is `{ id, source, content }` and `source` is
`{ id, type, title, locator? }`; with `KnowledgeItem.id` excluded, the plan does not
say whether duplicate identity is `content` alone, `content` + full `source`,
`content` + `source.id`, whether comparison is byte-exact or normalized, etc. This
is a genuine, load-bearing ambiguity.

Per the implementation guardrail ("If implementing duplicate elimination requires
defining the platform meaning of 'exact duplicate': STOP … Do not invent the
definition"), the definition was **not invented**. It was raised as a **Contract
Change Proposal** and duplicate elimination was initially deferred.

### Resolution (approved 2026-07-09)

The proposal was approved. The smallest planning correction was applied — an
**Exact Duplicate Definition** section was added to the CB-015 task document, with
one-line references added to CB-016 and CB-018. The approved definition:

> Two KnowledgeItems are exact duplicates iff their `content` values are identical
> **and** their entire `source` objects (`id`, `type`, `title`, `locator`) are
> structurally identical. `KnowledgeItem.id` is **excluded** (it is the ordering
> tie-breaker, never the duplicate identity). No normalization is applied — "exact"
> means literal structural equality. The first occurrence in canonical Selection
> Policy order is retained; every subsequent duplicate is moved to `excludedItems`.

Duplicate elimination is now **implemented** in `selection/policy/duplicates.ts`:
`isExactDuplicate(a, b)` (field-by-field structural equality, `id` excluded) and
`partitionExactDuplicates(orderedItems)` → `{ retained, duplicates }` (retain first
occurrence in the given canonical order). Comparison is field-by-field, **not** a
serialized/hashed key, so no delimiter or encoding choice can merge distinct items.
The function preserves knowledge identity (items are returned unchanged) and
constructs no SelectionResult — CB-016 applies it and routes `duplicates` into
`excludedItems`. No public contract changed.

## Rationale

- **Executable policy, cleanly separable from execution.** Pure predicates and
  comparators let the *decision model* be reviewed and (later) tested independently
  of the Selection Engine that applies it — the separation the task exists to create.
- **Expose the guarantee, not the mechanism.** Keeping comparators internal and
  publishing only the ordered `selectedItems` (CB-014) continues the CB-014
  principle: consumers depend on *order*, never on a leaked ranking number.
- **Determinism by construction.** Code-unit identifier ordering + a total-order
  terminal comparator + stateless pure functions make identical inputs yield
  identical decisions, with no timing, randomness or external state.
- **Extensible without contract change.** A prependable comparator chain and a
  single eligibility predicate give M5 Context Profiles a modulation seam that
  touches neither the SelectionResult contract nor the `build(request)` entry point.
- **Discipline over invention.** Deferring the undefined "exact duplicate" rather
  than guessing keeps a platform-wide semantic decision an explicit, reviewed one.

## Consequences

- CB-016 **applies** this policy: it filters a `CollectionResult`'s items with
  `isRetainedKnowledgeItem`, orders the retained items with `compareKnowledgeItems`,
  and constructs an immutable `SelectionResult` — consuming the policy and the
  CB-014 contract without altering either. It also implements exact-duplicate
  elimination **once the definition is approved**.
- Exact-duplicate elimination is implemented (`partitionExactDuplicates`); CB-016
  applies it after ordering and routes the removed duplicates into `excludedItems`.
- M5 profiles extend evaluation/ordering through the existing seams.

## Alternatives Considered

### Policy granularity

- **Separate `evaluation` / `filtering` / `comparators` files (selected).** Matches
  the responsibilities the frozen plan enumerates and the module's granular file
  style; each function has one job.
- **A single `selectionPolicy.ts`.** Rejected — collapses three named
  responsibilities into one file and obscures the evaluation-vs-filtering distinction
  the plan draws.

### Comparator chain at M3

- **Chain = only the terminal identifier comparator (selected).** The sole ordering
  the frozen plan mandates; guarantees a stable total order and invents no heuristic.
- **Add `source`/`type`/`content` comparators ahead of `id`.** Rejected — these are
  ordering *heuristics* the plan neither defines nor permits ("no business-specific
  ranking heuristics"); adding them would invent policy.

### Identifier comparison

- **UTF-16 code-unit comparison via `<`/`>` (selected).** Deterministic and
  environment-independent.
- **`String.prototype.localeCompare`.** Rejected — locale-aware collation is
  environment-dependent and breaks determinism.

### Exact duplicate

- **Invent a definition and implement elimination immediately.** Rejected — the
  frozen plan gave only a negative constraint; picking a definition is a
  platform-wide semantic decision the guardrail forbids inventing.
- **Defer via a Contract Change Proposal (selected).** Implemented everything the
  plan fully defined and escalated only the genuinely undefined piece. The proposal
  was approved the same day; the definition was added to the plan and elimination
  implemented — via field-by-field structural equality rather than a serialized key,
  so no encoding choice can merge distinct items.

## Validation

- `npm run typecheck` — passes.
- `npm test` — 135 passing across 11 files (unchanged: CB-015 adds **no** behaviour
  tests, per scope; existing tests remain green).
- `npm run build` — passes; emits `dist/context-builder/selection/policy/`
  (`evaluation`, `filtering`, `comparators`, `duplicates`, `index`).

## Future Review

- Revisit at CB-016: confirm the engine **applies** this policy without embedding
  additional decision rules, and implement exact-duplicate elimination against the
  approved definition.
- Revisit at M5: confirm Context Profiles modulate evaluation/ordering through the
  existing seams without contract change.

## Related Documents

Architecture

- ARCH-001, PIPELINE-ARCHITECTURE.md (§Selection, §Deterministic Ordering,
  §Knowledge Identity, §Deterministic Behaviour)

Standards

- AJS-001, AJS-002, AJS-004

Specifications

- SPEC-002

Implementation Tasks

- CB-004 (`KnowledgeItem`, read by the policy), CB-013 (Selection Engine boundary),
  CB-014 (`SelectionResult` — ordering guarantee this policy produces), CB-015 (this
  task), CB-016 (applies this policy, constructs `SelectionResult`, implements
  duplicate elimination)

## Process Recommendation (reusable engineering principle)

**Reusable principle:** *A negative constraint is not a definition.* The frozen plan
said what "exact duplicate" must **not** be (must not rely on `KnowledgeItem.id`) but
never said what it **is**. A bound on a decision is not the decision. When a task
asks you to implement against an identity/equality rule that is only constrained, not
defined, treat the definition as missing and escalate it — implementing the parts
that *are* defined — rather than letting a plausible-looking constraint masquerade as
a specification. Recorded as a recommendation only; no AJS document is modified.

## Change Log

| Date       | Version | Description                                                                                                                                            |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-09 | 1.1     | Exact-duplicate deferral resolved: definition approved and added to CB-015 planning; elimination implemented (`duplicates.ts`). No public contract changed. |
| 2026-07-09 | 1.0     | Decision created                                                                                                                                       |
