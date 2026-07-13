# After Wiki Build (Knowledge Platform wiring)

These items were uncovered while wiring the Knowledge Platform to the
`aj wiki build` entry point. They were **consciously deferred** to avoid
expanding that branch's scope; the milestone shipped as a coherent
implementation of the current architecture without them. They are recorded here
so they are not rediscovered by accident, and should be evaluated with real
usage evidence rather than assumptions.

---

## 1. Source-summary retrieval limitation

**Context.** The Wiki Generator renders one source-summary page per source at
`sources/<source-relative-path>.md` — nested, mirroring the source tree (e.g.
`sources/foundation/01-career/todo.md`). The consumer, `RetrievalService`,
defines its searchable corpus from `index.md` and resolves each linked article
by its **bare filename slug**, scanning only the wiki root and its **immediate**
subdirectories. As a result, nested source summaries are listed in `index.md`
but cannot be resolved, so they are never retrieved.

**Impact.** Today only **entities** and **concepts** (flat under `entities/` and
`concepts/`) are retrievable by the Knowledge Assistant. Those pages carry the
compiled, retrievable knowledge, so the loop is functional; source summaries
simply do not contribute to `aj ask` answers. This was accepted for the wiring
milestone.

**Options (evaluate later — do not pre-decide).**
- Producer side: the generator flattens source-summary paths to a single level
  (e.g. `sources/<slug>.md`).
- Consumer side: `RetrievalService` resolves index links by path and/or scans
  recursively.
- Leave as-is if entities/concepts prove sufficient in practice.

Any change must preserve the producer/consumer boundary — configuration
(`handbook.generatedWikiPath`) is the contract; the two sides stay unaware of
each other.

**Revisit.** During the Acceptance Review / dogfooding *after* SPEC-003
(End-of-Session) and SPEC-004 (Knowledge Review), using real retrieval-quality
evidence rather than assumption.

---

## 2. Artifact-name duplication (generated-artifact list vs. producers)

**Context.** The generator-owned top-level artifacts are enumerated once in
`GENERATED_WIKI_ARTIFACTS` (`src/knowledge/naming.ts`), which `--rebuild` uses to
reset a clean slate. The individual segment strings are *also* defined at their
producers: `pagePathFor` (`entities`/`concepts`), the renderer (`sources/`), the
generator (`METADATA_DIR = ".generator"`, `INDEX_PATH = "index.md"`), and the
store (`LOG_FILE = "log.md"`).

**Impact.** Adding a **new** top-level artifact to the reset set is a single edit
(the list) — the goal we set. But **renaming an existing** artifact requires two
edits (the list and its producer). This is duplicated knowledge with low
drift-risk, not a correctness problem.

**Option (evaluate later).** Centralize the segment constants in `naming.ts` and
have the producers import them, so each artifact name has a single definition.
Deferred now as low-value churn against a broadly-stable set of names.

**Revisit.** Opportunistically, the next time the generator, renderer, or store
internals are being changed for another reason.

---

Wiring milestone complete
↓
Begin SPEC-003 (End-of-Session), then SPEC-004 (Knowledge Review)
↓
Acceptance Review / dogfooding
↓
Open this file, evaluate each item with real evidence, promote only the proven ones
