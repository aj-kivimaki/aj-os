# REX Milestone 5 — Retrospective *(and programme close)*

> **Milestone:** M5 — Comments, Errors & Test Craft (REX-501 → REX-503)
> **Outcome:** **FROZEN** by the reviewer (AJ) on 2026-07-18. **Final milestone — this freeze completes the Repository Excellence programme.**
> **Authored:** 2026-07-18, after the freeze — §4.7 stage 7.

---

## Summary

M5 made the repository more maintainable without expanding its architectural surface or altering a
single behavioural contract. Comments were treated as repository knowledge, not decoration; errors
became coherent without becoming a new public API; test infrastructure became more maintainable
without weakening verification. **Eleven findings closed; 744 tests green; behaviour preserved.**

Its defining constraint was the package's sharpest risk — *a comment cleanup deletes irreplaceable
knowledge* — and it held: **all six protected comments survived**, and the discipline that guaranteed
it (refresh the preserve-list *before* touching anything) paid for itself immediately by catching that
comment #1 had drifted under M3-B's rename.

**The reviewer's close on what the programme became:**

> *Repository Excellence began by asking a simple question — "Can we trust what this repository tells
> us?" Across six milestones that expanded into a disciplined practice: truth before change, evidence
> before judgement, verification before confidence, architecture before abstraction.*

---

## What worked well

- **The preserve-list refresh caught a real miss before any deletion.** Comment #1 was not at the
  inventory's `:123-128` — M3-B's rename and M4's refactor had moved it to
  `createFilesystemReviewStore.ts:157-163`. Refreshing coordinates *first* is the whole reason the
  cleanup deleted no load-bearing line.

- **The shared error base added a capability without removing one.** `AjError` makes `instanceof
  AjError` possible and forwards `cause`; every concrete `instanceof` still holds. It closed F-060's
  *live* gap — `SourceConnectorError` (handbook missing `foundation/`) now hits `wiki.ts`'s friendly
  path instead of a raw stack trace — while `session.ts` was **deliberately left enumerated** to
  protect the `AIError`-absent design the preserve-list guards. A base class that could have become a
  careless catch-all instead respected a documented absence.

- **"Keep, justified" recurred, and the evidence earned it.** F-064 assumed byte-identical
  duplication; measurement found the shareable helper *already* shared (`session-fixtures.ts`) and the
  rest suite-tuned. The `support.ts` convention — REX-D4's governing boundary — kept the contract
  fixtures inline. The programme's most-repeated result, one last time.

- **Addition met the same evidence bar as deletion.** F-066 added exactly *one* comment — a genuine,
  non-obvious API constraint in `loop.ts` (tool_use must precede tool_result) — and nothing to the
  self-explanatory routes. The same standard that deleted noise governed what to add.

---

## What surprised us

- **A `perl \x{}` escape corrupted a task file's UTF-8 mid-edit.** Editing REX-503's changelog with a
  perl unicode escape re-encoded the file's existing em-dashes into mojibake. Caught immediately,
  restored clean from the planning commit, re-applied via the edit tool, and verified with the **full
  `npm run ci`** — not a truncated tail. **The M4 format-gate lesson applied directly**, one milestone
  later: read the whole gate, not `tail -1`. No corruption reached a gate or `main`.

- **typecheck caught two things the runtime wouldn't.** Two wrong relative import paths in the error
  conversion, and (back in REX-402) a vitest `vi.fn` signature — both invisible to a green test run,
  both stopped by M2's typecheck-reaches-`tests/` gate. The ratchet built in M2 was still catching
  M5's mistakes.

---

## Engineering discoveries

- **A comment is a repository contract for the duration of a cleanup.** The preserve-list, refreshed
  and verified before and after, turned "comment cleanup" from a subjective edit into a controlled
  activity with a falsifiable safety check. *Absence of evidence is not evidence of obsolescence* — a
  comment stays until its constraint is provably gone.

- **A shared base is worth it when it makes a catch site honest — and only then.** `AjError` earned
  its place by closing a real user-facing gap, not by imposing uniformity. The refusal to narrow
  `session.ts` is the same discipline in the other direction.

- **The governing boundary decides a "keep," not the raw duplicate count.** F-064's `support.ts`
  convention settled it: contract fixtures stay inline. Consolidation that violates the module's own
  ratified convention is not an improvement.

---

## M5 reviewer rulings — recorded

- **F-064 — keep approved.** *"Evidence supported retaining the construct. A documented keep is a
  successful engineering outcome."*
- **F-063 — scoped cause chaining approved.** *"Extending it beyond the demonstrated cases would shift
  the work from craftsmanship into speculative consistency."*
- **F-066 — approved.** *"One standard for both deletion and addition. That consistency is important."*
- **Perl/mojibake incident — not evidence against freezing.** *"As with M4's formatting incident, the
  process succeeded; the repository history remains correct."*

---

## Programme-level observations — recorded by the reviewer (2026-07-18)

The final milestone's retrospective is also the programme's. The reviewer asked that these be recorded:

1. **Evidence consistently outperformed intuition.** Many findings closed through investigation rather
   than modification — understanding the repository was repeatedly more valuable than changing it.
   *(F-038, F-049, F-052, F-064 all closed "keep, justified" on measurement.)*

2. **Verification became reusable infrastructure.** M2's investment paid dividends in every later
   milestone — the CI gate caught M4's formatting slip and typecheck caught M5's; M3-A's surface
   manifests proved M3-B's renames and M5's error change were surface-neutral. Verification evolved
   from a deliverable into a permanent capability.

3. **Architectural boundaries prevented unnecessary abstraction.** Repeatedly preserving intentional
   divergence (EOS-005, the path guards, the two config systems, the test fixtures) produced a simpler,
   truer repository than aggressive consolidation would have.

4. **Retrospectives materially improved later milestones.** Each milestone's lessons became the next's
   practice: M1's ownership-by-outcome shaped M2's task allocation; M3-A's "restore-by-rewrite, not
   `git checkout`" held through M3-B/M4/M5; M4's "read the whole gate" caught M5's mojibake. The
   programme improved its own process, not just the repository.

5. **Repository Excellence concluded without expanding repository contracts.** The greatest success is
   what it *did not* do — no new APIs, abstractions, or behavioural changes smuggled in under
   "cleanup." Error codes deferred, deferred capabilities documented not implemented, the agent-layer
   ADR recommended not authored. Restraint preserved stability while quality rose.

---

## Process improvements — recommendations only

1. 🟡 **Never edit a UTF-8 document with a `perl \x{}`-escape one-liner.** It re-encodes existing
   multibyte characters. Use the edit tool for prose; reserve perl for ASCII-only structural edits.
   Recorded so a future programme does not relearn it.

2. 🟡 **The env-bound agent-layer characterization (F-054) remains the one open follow-on.** A test-env
   harness (`HANDBOOK_PATH` at import, isolated from the real vault) would let `loop.ts`/routes/`writer.ts`
   be characterized end-to-end. Explicitly deferred, reviewer-approved, and worth a future task — not a
   Repository Excellence gap but a known, owned item.

---

## What M5 cost, and its character

**Four commits plus a freeze-evidence commit, two ruled decisions, +6 tests, one corrupted-file
recovery, zero behavioural change.** M5's signature is **craftsmanship under restraint**: it made the
repository easier to read, its errors easier to catch, and its report easier to test — and it did all
of it without changing what the platform does or promises. A milestone that leaves the contracts
exactly where it found them, and the repository materially better to work in, is the right note to end
on.

---

## Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-18 | 1.0 | M5 Retrospective authored after the Milestone Freeze (§4.7 stage 7) — **and the programme close**. Records the preserve-list refresh catching comment #1's drift, the `AjError` base closing F-060's live gap while protecting `session.ts`'s enumerated design, F-064's evidence-based keep, F-066's single disciplined addition, and the perl-mojibake recovery (M4's lesson applied). Carries the reviewer's four M5 rulings and **five programme-level observations** — evidence over intuition, verification as reusable infrastructure, boundaries over abstraction, retrospectives improving the process, and a conclusion that expanded no contract. **This is the final milestone retrospective; the programme reaches its Definition of Done on the merge of PR #22.** |
