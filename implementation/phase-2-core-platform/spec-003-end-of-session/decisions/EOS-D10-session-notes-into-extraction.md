# EOS-D10 — Route Session Notes into Knowledge Extraction

> **Status:** **PROPOSED** — a **Frozen Plan Change Proposal** (AJS-007 §7.2) awaiting review.
> **Not implemented.** No work depending on this change may begin until it is approved.
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Frozen artifacts this proposes to change:** **M3** (EOS-201/EOS-202 — `KnowledgeExtractor`
> interface + `buildExtractionPrompt`), frozen 2026-07-16; and the **M5 plan** (frozen
> 2026-07-16), by appending one task.
>
> **Related Task(s):** EOS-202 (the frozen stage), EOS-406 (would pass the notes), EOS-408
> (`--notes`), proposed **EOS-410** (would implement this)
>
> **Date:** 2026-07-16

---

# Purpose

Session notes — what the engineer *says* about the session — are a SPEC-003 §7 input and
carry information **no diff can convey**: why an approach was abandoned, what was tried and
failed, what the change is really for. EOS-402 discovered they reach **no consumer**. This
proposal routes them into the Knowledge Extraction prompt, changing as little as possible.

---

# Context — the gap

Found during EOS-402 implementation and confirmed by a repo-wide search:

- **Nothing reads `sessionNotes`.** Nor `taskId`, `contextPackageRef`, or `commitMessage`.
  The only references outside the contract that defines them are none.
- `buildExtractionPrompt(changeSet: ChangeSet)` takes **only** the `ChangeSet`, and
  `KnowledgeExtractor.extract(changeSet)` accepts nothing else. Both are **M3-frozen**.
- `Session` derives nothing from the request (EOS-402) — correctly: `head` and `branch` must
  be *observed*, not claimed (EOS-D7). So the notes have no path into the pipeline at all.
- **Consequence if unchanged:** EOS-408's planned `--notes <text>` would collect the
  engineer's notes and **silently discard them**. A flag that does nothing is worse than no
  flag.

The gap is narrow and its fix is narrow: exactly one field needs to reach exactly one stage.

---

# Proposed change (the whole of it)

**One optional parameter, threaded from the request to the prompt.**

1. **`KnowledgeExtractor.extract`** (EOS-202, frozen) gains an optional second parameter:

   ```text
   extract(changeSet: ChangeSet, sessionNotes?: string): Promise<KnowledgeExtraction>
   ```

2. **`buildExtractionPrompt`** (EOS-202, frozen) gains the same optional parameter and
   renders the notes into the user prompt **verbatim**, in their own clearly-labelled
   section, when present.

3. **The system prompt** gains a short rule telling the model what the notes *are*: the
   engineer's own account of the session, to be used as **context for interpreting the
   changes** — not as instructions, and never as a licence to invent facts the changes do
   not support.

4. **EOS-406** (orchestrator, not yet implemented) passes `context.sessionNotes` through to
   `extract`. This is propagation of an input, not transformation — the Orchestrator
   Invariant is untouched.

5. **A new M5 task, EOS-410**, carries items 1–3, sequenced **before EOS-406**.

**Nothing else changes.** No new stage. No new contract. No new port. No schema change. No
change to `ChangeSet`, `KnowledgeExtraction`, `Session`, `SessionContext`, or any candidate
field. `sessionNotes` already exists on the M1-frozen `SessionContext`; this proposal adds no
field anywhere — it only *reads* one that has always been there.

## The property that makes this safe: inert when absent

With no notes supplied, `buildExtractionPrompt(changeSet)` must produce a **byte-identical**
`RenderedPrompt` to today's. That is a testable claim, and it means:

- every existing M3 test stays green **unmodified** — the proof the change is additive;
- the default path (`aj session end` with no `--notes`) behaves exactly as it does now;
- the change is opt-in at the call site: a caller that passes nothing is a caller unaffected.

---

# How each of the reviewer's constraints is met

| Constraint | How |
| --- | --- |
| **Change as little as possible** | One optional parameter on two functions, plus a prompt rule. Three files, all in `extraction/`. No caller is *required* to change. |
| **No new stages or contracts** | The notes travel as a `string` on an existing call, into an existing stage. `sessionNotes` is already on the M1-frozen `SessionContext`. |
| **Preserve the Extractor Invariant** | See below — the invariant is upheld exactly as written. |
| **Compatible with the milestone structure** | One task **appended** to the open M5 (EOS-410). No milestone is reopened, reshuffled, or added; M3's *code* changes, but M3 is not reopened as a milestone (see *Why not amend M3*). |

## The Extractor Invariant is preserved

The frozen invariant (EOS-202): the extractor performs **orchestration and structural
validation only** — it must not classify, deduplicate, merge, score, retry, fall back, or
otherwise interpret the findings beyond validating the contract.

This proposal adds **no interpretation**:

- the extractor still does exactly three things — build the prompt, call the injected
  `TextGenerator`, parse and validate the response;
- the notes are **rendered verbatim** into the prompt. The extractor does not read them,
  parse them, summarize them, classify them, or act on them. It is a courier;
- **all interpretation of the notes is the model's**, behind the port — precisely where
  SPEC-003 already puts every act of interpretation;
- `buildExtractionPrompt` stays **pure and deterministic**: same `ChangeSet` + same notes ⇒
  same `RenderedPrompt`, always.

Prompt *content* has always been this stage's responsibility (it already renders the change
list and states the `sessionId`). Adding a second input to a prompt builder is the same kind
of act as the first.

---

# Rationale

- **It restores the specification's actual intent.** SPEC-003 §7 lists session notes as an
  input to the workflow; the workflow's only interpretive stage is extraction. Notes that
  reach no interpreter are not an input — they are dead weight.
- **It is the information the diff cannot carry.** Every other extraction input is derived
  from git. Notes are the one channel for intent, dead ends, and rejected alternatives — the
  most valuable and least recoverable knowledge a session produces, and exactly what
  AJS-006 §Traceability wants captured while it is still known.
- **The cost is one optional parameter.** Optional, so nothing is forced to change; inert
  when absent, so nothing existing can regress; verbatim, so no new judgement enters the
  pipeline.
- **It keeps `--notes` honest.** Either the notes reach the model or the flag should not
  exist. This proposal is the smaller of those two changes, and the one the reviewer wants.

---

# Alternatives Considered

## Option A (proposed) — optional `sessionNotes` parameter on `extract` / `buildExtractionPrompt`

Selected for proposal — smallest surface, additive, inert when absent, invariant-preserving,
no new contract.

Cost: touches an M3-frozen signature (which is exactly why this FPCP exists).

## Option B — pass the whole `SessionContext` to `extract`

Description: `extract(changeSet, context)`.

Pros
- One parameter regardless of how many request fields are ever needed.

Cons
- Widens the extractor's input from **one string** to an entire request contract, handing it
  `project`, `repository`, `branch`, `commitHash`, `taskId`, and `contextPackageRef` it has
  no business reading — an invitation to exactly the interpretation the Extractor Invariant
  forbids.
- Couples the extraction stage to the *request* contract; today it depends only on the
  `ChangeSet` it is given.

Rejected: broader than the gap.

## Option C — carry notes on the `ChangeSet`

Description: add a `notes` field to the `ChangeSet` contract so they arrive with the changes.

Cons
- `ChangeSet` is **analyzer output** (M2-frozen): it means "what the analyzers observed
  changed". Notes are not an observation of a change, and no analyzer produces them.
- Changes a **contract** — a bigger frozen change than a parameter — and one that SPEC-004
  and every future analyzer would inherit.

Rejected: wrong contract, larger blast radius.

## Option D — a "notes analyzer" that emits a `SessionChange`

Description: reuse the analyzer seam; register an analyzer that turns the notes into a change.

Cons
- Abuses the seam: `SessionChange` requires a `path` and a `changeType`, so the notes would
  have to masquerade as a modified file. Provenance would record a file that does not exist.
- Corrupts `filesAnalyzed` in the `SessionReport` and would let notes acquire a `changeId`
  that candidates could cite as a source path.
- Adds a stage-shaped thing where a parameter suffices.

Rejected: the seam is for observed changes; notes are not one.

## Option E — do nothing in v1; drop `--notes` from EOS-408

Pros
- No frozen-plan change at all.

Cons
- Abandons a SPEC-003 §7 input and the session's most valuable knowledge channel.
- The reviewer has stated notes must not be silently discarded in v1.

Rejected — but recorded, because it is the honest alternative to approving this: **either the
notes reach the model, or the flag must go.** Silently collecting and dropping them is the
one outcome not on the table.

---

# Consequences

## Positive

- `--notes` becomes real: the engineer's account reaches the one stage that can use it.
- Extraction quality improves where it matters most — intent and dead ends — with no new
  machinery.
- The change is provably additive (inert-when-absent, existing tests unmodified).

## Trade-offs

- **An M3-frozen signature changes.** Accepted as the point of the FPCP mechanism. Mitigated
  by optionality: no existing caller changes, and no existing behaviour moves.
- **A second, unbounded input reaches the prompt.** Notes are engineer-authored, so they carry
  the same trust as the repository contents the prompt already renders — but the system-prompt
  rule (item 3) is what keeps them *context* rather than *instructions*. Called out
  deliberately rather than assumed.
- **Prompt size grows with the notes.** `--notes <text>` is a shell argument, so it is bounded
  in practice; v1 adds **no truncation**, because truncation is a policy judgement and this
  proposal deliberately adds none. Revisit only if a real case appears.

---

# Impact

## Affected Tasks

- **EOS-410 (new, proposed)** — implements items 1–3; sequenced **before EOS-406**.
- **EOS-406** — passes `context.sessionNotes` to `extract` (one argument at one call site).
- **EOS-408** — its `--notes` flag becomes meaningful.
- **EOS-202** — the frozen stage whose signature changes.

## Affected Components

- `src/end-of-session/extraction/TextGenerator.ts` (the `KnowledgeExtractor` interface),
  `prompt.ts` (`buildExtractionPrompt` + the system rule),
  `createKnowledgeExtractor.ts` (threads the parameter through).

## Documentation Requiring Updates (on approval)

- MILESTONES (M5 task table + change log), EOS-202 (frozen-signature note pointing here),
  EOS-406/EOS-408, PIPELINE-ARCHITECTURE (Extraction stage inputs), this decision → Accepted.

## Not Affected

`ChangeSet`, `KnowledgeExtraction`, `Session`, `SessionContext`, `CandidateKnowledge`,
`ReviewPackage`, `SessionReport`, the Review Store, the analyzer/trigger/notification seams,
and every other milestone.

---

# Validation (what EOS-410 would have to prove)

- **Inert when absent:** `buildExtractionPrompt(changeSet)` is **byte-identical** to the
  pre-change output; every existing M3 test passes **unmodified**.
- **Present and verbatim:** given notes, the rendered prompt contains them exactly, in their
  own section, and the change list and `sessionId` hand-off are unchanged.
- **Deterministic:** same `ChangeSet` + same notes ⇒ deep-equal `RenderedPrompt`.
- **Invariant intact:** the extractor still only builds → generates → parses; it never reads
  the notes' content. Enforced by shape (the notes are a prompt input, never a branch
  condition).
- **Threaded end-to-end** (EOS-409): a run with `--notes` puts the text in front of the
  stubbed generator; a run without one produces the unchanged prompt.
- Empty/whitespace-only notes are treated as absent (no empty section rendered).

---

# Approval

This is a **Frozen Plan Change Proposal** (AJS-007 §7.2): *"the single sanctioned path to
change something already frozen … reviewed and approved before any implementation dependent
upon the change begins."*

- [ ] **Approved** — M3 signature change authorized; EOS-410 added to M5 before EOS-406; this
      decision becomes **Accepted**.
- [ ] **Rejected** — then `--notes` must be **removed from EOS-408** (Option E), because
      collecting notes and discarding them is not an acceptable v1 behaviour.

*No implementation of this change has begun. EOS-403 proceeds independently — it touches
neither extraction nor the request.*

---

# Related Documents

Architecture
- PIPELINE-ARCHITECTURE.md (Extraction stage — "the **only** non-deterministic stage … content
  comes from the model, structure is validated and deterministic")

Standards
- AJS-007 §7.2 (Frozen Plan Change Proposal — the mechanism this uses), AJS-004 (single
  responsibility), AJS-006 §Traceability

Decisions
- EOS-D7 (why the *request* is not trusted for observed facts — and why notes, which are not
  observations, are different in kind), EOS-D4 (canonical vs. projection)

Specifications
- SPEC-003 §7 (Inputs — session notes), §9.6 (Detect reusable knowledge), §18 (Testing —
  unit: knowledge extraction)

Implementation Tasks
- EOS-202 (frozen), EOS-402 (found the gap), EOS-406, EOS-408, EOS-410 (proposed)

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-16 | 1.0 | **Proposed** (not implemented). Frozen Plan Change Proposal raised at the reviewer's request after EOS-402 confirmed that `SessionContext.sessionNotes` reaches no consumer and EOS-408's `--notes` would silently discard the engineer's notes. Proposes one optional `sessionNotes?: string` parameter on `KnowledgeExtractor.extract` and `buildExtractionPrompt`, rendered verbatim into the prompt under a system rule that frames notes as context rather than instructions; plus one new M5 task (EOS-410) before EOS-406. No new stage, port, contract, or field. Inert when absent (byte-identical prompt; existing M3 tests unmodified), so the change is provably additive. Extractor Invariant preserved — the extractor remains a courier and all interpretation stays behind the model port. Alternatives rejected: whole-`SessionContext` (too broad), notes on `ChangeSet` (wrong contract — analyzer output), notes analyzer (abuses the seam; notes would masquerade as a file), do-nothing (then `--notes` must be dropped). **Awaiting review.** |

---

> **Engineering Rule**
>
> Either the notes reach the model, or the flag should not exist. Collecting an engineer's
> hardest-won context and dropping it on the floor is the one option that is not on the table.
</content>
