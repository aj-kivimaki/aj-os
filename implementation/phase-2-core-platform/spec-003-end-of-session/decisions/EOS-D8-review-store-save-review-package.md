# EOS-D8 — The Review Store Owns the Review Package (`saveReviewPackage`)

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-404 (implements the operation), EOS-403 (produces the package),
> EOS-406 (calls it), EOS-302 / EOS-D6 (the M4-frozen surface being extended)
>
> **Date:** 2026-07-16

---

# Purpose

EOS-D6 froze the Review Store's surface at four operations — `saveCandidates`,
`saveReport`, `appendLog`, `locate` — none of which can write the `ReviewPackage`. Yet the
package is a required SPEC-003 output (§13, §19) and EOS-302 already anticipated it living
in the session directory. This decision fixes **who writes `review-package.md`**: the store,
or the projector that renders it.

---

# Context

- **EOS-302 anticipated the file but not the mechanism.** Its Design Notes state:
  "`review-package.md` is written to the same session directory by the M5 projector — the
  store simply guards/hosts that directory." The *file's location* is within the frozen
  plan; only the *mechanism* was left ambiguous.
- **The anticipated mechanism contradicts EOS-D6's central holding.** EOS-D6 decided the
  store "owns the per-session layout and serialization … Callers name a session and hand
  over contracts; they do not compose paths or serialize." A projector writing the file
  itself would compose a path outside the store, duplicate layout knowledge, and **bypass
  the store's lexical and symlink escape guards** — reintroducing exactly the split EOS-D6
  rejected.
- **It also contradicts EOS-403's invariant.** The projector is a **pure projection**
  (ratified at the M5 Planning Review): same inputs ⇒ deep-equal output, no I/O. Giving it a
  filesystem dependency would destroy the property that makes it trivially testable and
  deterministic.
- The store already **hosts and guards** the session directory (EOS-302's own words) and
  owns the three other files in it. The package is the fourth.

---

# Decision

1. **Add a fifth operation to the `ReviewStore`:**
   `saveReviewPackage(sessionId: string, reviewPackage: ReviewPackage): Promise<void>`,
   implemented in `createFilesystemReviewStore`.
2. **The store owns every file in the session directory** — completing the layout it already
   owns:

   ```
   <destination>/pending/<session-id>/
       candidates/<candidate-id>.json     canonical CandidateKnowledge (EOS-302)
       report.json                        the SessionReport            (EOS-302)
       review-package.md                  the human-readable projection ◄── this decision
       log.md                             append-only execution log     (EOS-302)
   ```

3. **The package is persisted as markdown, not JSON.** The store is domain-aware — it knows
   the *artifacts* (EOS-D6). `ReviewPackage` **is** a markdown projection by contract
   (EOS-D4); writing `reviewPackage.markdown` to a `.md` file honours the artifact's type.
   Serializing the projection as JSON would produce a file no human could read, defeating its
   only purpose.
4. **Overwrite, not append.** The package is single-valued per session and regenerable from
   the canonical candidates (EOS-D4), so re-saving replaces it — like `report.json`, unlike
   the append-only `log.md`.
5. **The store does not validate the package on write.** It does not interpret (the
   Persistence Invariant); the projector already validated it via `parseReviewPackage`
   (EOS-403). Re-validating would move contract enforcement into persistence and duplicate an
   owner — consistent with `saveCandidates`, which trusts its input.
6. **Every EOS-302 guarantee is unchanged and reaffirmed.** The new write goes through the
   same `assertSegment` / `resolveInRoot` / `assertNoSymlinkEscape` guards; the non-canonical
   destination guard at construction is untouched; the store still **never invokes git**
   (ADR-002 §4, AJS-005 §7) and still interprets nothing.

---

# Rationale

- **Consistency with EOS-D6.** One owner of the layout, one guarded write path. Owning
  three-quarters of a directory is not a boundary; it is an accident waiting to be
  reproduced by the next writer.
- **A complete contract for SPEC-004.** SPEC-004 reads the session directory. With this
  operation, the *whole* directory is a named contract rather than three named files plus one
  convention nobody owns.
- **It protects the projector's purity.** EOS-403's value is that it is a pure function of
  canonical inputs. This decision is what allows that to stay true.
- **Guards must not be optional.** A write that skips the store skips the path guards. For a
  workflow whose central safety claim is "canonical knowledge is never modified", an
  unguarded write path is the wrong place to save an operation.
- **Smallest correct change.** The store already resolves, guards, and creates this exact
  directory. Adding a fourth file to it is additive and mechanical; the alternative
  redistributes responsibility.

---

# Alternatives Considered

## Option A — The projector (or the orchestrator) writes the file directly

Description: the mechanism EOS-302's prose hinted at — the projector composes
`pending/<id>/review-package.md` and writes it.

Pros
- No change to the M4-frozen store surface.

Cons
- Layout knowledge leaks out of the store, contradicting EOS-D6.
- The write **bypasses the store's lexical and symlink guards**.
- The projector gains a filesystem dependency and stops being pure, contradicting EOS-403.
- A second writer into a directory with a designated owner.

Rejected: it contradicts two ratified decisions at once to avoid one additive method.

## Option B (selected) — `saveReviewPackage` on the store

Selected — consistent with EOS-D6, keeps the projector pure, keeps every write guarded, and
gives SPEC-004 a complete named contract for the session directory.

## Option C — A generic `write(path, content)` escape hatch on the store

Description: add a `WikiStore`-style path-keyed write the projector could call.

Cons
- Re-opens precisely the semantics-free-vs-domain-aware question EOS-D6 settled, and does so
  by half-measure: the store would be domain-aware for three artifacts and path-keyed for the
  fourth.
- Hands callers back the ability to compose arbitrary paths — the thing the domain API
  exists to prevent.

Rejected: inconsistent surface; weakens the boundary EOS-D6 established.

---

# Consequences

## Positive

- The session directory has exactly one owner; SPEC-004 depends on one complete contract.
- The projector stays pure and deterministic (EOS-403).
- Every write into the review area is path-guarded, without exception.
- No public-surface growth: `saveReviewPackage` is a method on an already-exported
  interface, so the EOS-007 drift-guard manifest and the operation count are unchanged.

## Trade-offs

- **The store's surface grows from four operations to five**, and the EOS-D6 surface — framed
  as the long-term SPEC-003 → SPEC-004 boundary — proves to have been incomplete at freeze.
  Accepted, and worth naming honestly: EOS-D6 was decided while the package's mechanism was
  still ambiguous, so this is the boundary being *completed*, not corrected. The four
  original operations are untouched.
- The store now writes one markdown artifact alongside three JSON ones. Accepted: it
  serializes each artifact in the form that artifact is defined to take (EOS-D4).

---

# Impact

## Affected Tasks

- **EOS-404** — implements the operation and its behaviour tests.
- **EOS-403** — produces the `ReviewPackage`; stays pure because of this decision.
- **EOS-406** — the call site (`store.saveReviewPackage(session.id, pkg)`).
- **EOS-302 / EOS-D6** — the frozen surface being extended.

## Affected Components

- `src/end-of-session/store/ReviewStore.ts`, `FilesystemReviewStore.ts`.

## Documentation Requiring Updates

- MILESTONES (M5), EOS-404, **EOS-D6** (change-log cross-reference to this decision),
  PIPELINE-ARCHITECTURE (Persistence stage surface), CONTRACTS.md (the persisted boundary,
  when SPEC-004 begins).

---

# Validation

- EOS-404 writes `pending/<session-id>/review-package.md` with `markdown` verbatim
  (byte-for-byte round trip); re-saving overwrites; the `sessionId` single-segment guard and
  the lexical/symlink guards apply; the exact-surface test pins **five** operations.
- The four frozen operations and their tests are untouched and green.
- No git is invoked; the store still performs no interpretation (no parse, no render, no
  cross-check against the candidates).
- EOS-409 proves the file exists, is non-empty, and names every candidate after a real
  composed run.
- Revisited when SPEC-004 begins: confirm it reads the complete session directory through
  the domain layout without a store-shape change.

---

# Future Review

- Revisit **only if** a second consumer of the review area appears with a different layout or
  artifact set — the same trigger EOS-D6 records. At that point extracting a generic
  path-keyed core beneath the domain API may be justified: a promotion, not a fix.

---

# Related Documents

Architecture
- PIPELINE-ARCHITECTURE.md (Persistence stage; Projection stage), ADR-002 §4,
  docs/architecture/CONTRACTS.md (boundary invariants 3, 5 & 6)

Standards
- AJS-004 (single responsibility), AJS-005 §7, AJS-006 §2 (generated artifacts are derived),
  AJS-007 §7.2 (Frozen Plan Change Proposal)

Decisions
- **EOS-D6** (the decision this completes — domain-aware store, store-owned layout),
  EOS-D4 (canonical vs. projection), EOS-D2 (the review location)

Specifications
- SPEC-003 §13 (Produces — markdown review package), §17 (Write access: review package
  location only), §19 (Review package created)

Implementation Tasks
- EOS-404, EOS-403, EOS-406, EOS-302

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-16 | 1.0 | Decision created and **Accepted** at the M5 Planning Review (reviewer: AJ). Closes the second frozen-plan gap found at M5 planning: EOS-302 anticipated `review-package.md` in the session directory, but EOS-D6 froze the store at four operations and the anticipated mechanism ("the projector writes it") contradicted both EOS-D6's store-owns-the-layout holding and EOS-403's purity, while bypassing the store's path guards. Adds `saveReviewPackage` as a fifth domain operation (markdown, overwrite, no validation, all existing guards) so the store owns every file in the session directory. Extends — does not revise — EOS-D6. Ratified under AJS-007 §7.2 as an additive change to the M4-frozen surface. |

---

> **Engineering Rule**
>
> The store owns every file in the session directory — or it owns none of them. A write that
> skips the store skips the guards.
</content>
