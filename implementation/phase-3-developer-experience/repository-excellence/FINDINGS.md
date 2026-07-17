# REX — Review Findings Inventory

> **Implementation Package:** REX — Repository Excellence Review
>
> **Role:** **Lifecycle Prerequisite** (AJS-007 §8.2). Substitutes for §4.2 Specification Decomposition per [REX-D0](decisions/REX-D0.md). Produced **before** the lifecycle begins; **not** a lifecycle stage.
>
> **Status:** **FROZEN** as part of the package Planning Freeze declared by the reviewer (AJ) on 2026-07-17.

---

# Purpose

This is the **roadmap of record**. It establishes the milestone structure that the lifecycle
delivers, exactly as a Specification Roadmap would.

**The inventory is closed.** New findings discovered during implementation are **recorded here as
`Deferred — post-REX`, never actioned**. That rule is the primary defence against the package's
defining risk: a quality review that grows without limit because every finding suggests an
adjacent improvement. AJS-007 §6.1 **Scope Discipline** governs; cite it by name.

---

# How to read this

## The evidence rule

**No finding enters a milestone without reproducible evidence.** Every row carries a command or a
`file:line` that a reviewer can run or open. Claims are **proven, not asserted** — the standard
SPEC-003 set (*"Verified by grep"*, *"Verified adapter-only by diff: one file changed"*, *"the
canonical-unchanged proof was itself verified to be able to fail"*).

All evidence below was verified against the working tree at `9bd051d` on **2026-07-17**.

## Classification — `class`

| Value | Meaning |
|---|---|
| **M** — Measurable | A machine decides. The reviewer does not need to. |
| **J** — Judgement | No tool can settle it. Reviewer attention is the only instrument. |

The classification is an **experiment** (see [README § Measurable vs. Judgement](README.md#measurable-vs-judgement)), not a standard. Where a finding resists classification, that is **evidence about the boundary** and belongs in the retrospective.

## Severity

| Value | Meaning |
|---|---|
| **Blocking** | A document states a falsehood, or a mandatory AJS-007 mechanism failed. |
| **Major** | Real cost to correctness, safety, or maintainability. |
| **Minor** | Consistency and polish. |

## `frozen?`

**Yes** ⇒ the fix touches frozen work ⇒ an **FPCP is mandatory** and must be **ruled before**
dependent work begins (AJS-007 §7.2).

---

# M1 — Documentation Truth & SPEC-003 Lifecycle Closure

## Falsifiable false claims

Each is a **falsifiable assertion about the code**, which is why these are Measurable rather than
Judgement — the reframing that makes "docs are accurate" testable.

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-001 | M | Blocking | No | `README.md:90-91` — *"**Next:** … End-of-Session (SPEC-003) and Knowledge Review (SPEC-004)"*. SPEC-003 shipped. | `grep -n "Next:" README.md`; `git log --oneline 9bd051d` |
| F-002 | M | Blocking | No | `docs/guides/installation.md:51-56` — the wiki generator is *"implemented but **not yet wired to a runnable command**"*, and *"no generated wiki" is a "**known limitation**"*. **README:58 documents `aj wiki build`. The two docs contradict each other.** | `grep -n "not yet wired\|known limitation" docs/guides/installation.md`; `src/cli/commands/wiki.ts` |
| F-003 | M | Blocking | No | `docs/README.md:74` — *"SPEC-003 \| End-of-Session (**owns commits**)"*. **Contradicts a frozen decision**: ADR-002 / AJS-005 §7 exclude git writes from v1, verified absent at the M5 freeze. | `grep -n "owns commits" docs/README.md`; ADR-002 |
| F-004 | M | Blocking | No | `ROADMAP.md:26` — *"**owns git commits** (the engine never commits)"*. Same contradiction. | `grep -n "owns git commits" ROADMAP.md` |
| F-005 | M | Blocking | No | `src/end-of-session/README.md:5,7,54` — *"Status: Milestone M1 … **No behavior yet** — collection, extraction, generation, persistence, projection, and the `aj session end` CLI arrive in M2–M5."* All five milestones are frozen; `aj session end` ships. | `grep -n "No behavior" src/end-of-session/README.md` |
| F-006 | M | Blocking | No | `implementation/phase-2-core-platform/README.md` — *"**no CLI command or service currently invokes `WikiGenerator.run()`**"*. False. | `src/cli/commands/wiki.ts` |
| F-007 | M | Blocking | No | `implementation/phase-2-core-platform/README.md` — *"SPEC-003 … **Planning frozen; Milestone 1 ready to implement**"*. SPEC-003 is complete and merged. | `MILESTONES.md` v1.33 |
| F-008 | M | Blocking | No | `ROADMAP.md` — the single **"Resume Here"** pointer aims at completed SPEC-003 work. The one place a reader looks to find the next task is wrong. | `ROADMAP.md` §Resume Here |
| F-009 | M | Blocking | No | `CHANGELOG.md:9` `[Unreleased] → Planned:` still lists SPEC-003. **SPEC-003 appears nowhere as `Added`** despite 26 tasks, 5 milestones, 11 decisions and a shipped command across PRs #6–#11. | `grep -n "^## \[" CHANGELOG.md` |
| F-024 | M | Minor | No | `implementation/review/SPEC-FREEZE-REVIEW.md:142` — *"there is **no separate ROADMAP document**"*. A top-level `ROADMAP.md` exists. Likely means "per implementation package", but reads as a flat contradiction. | `ls ROADMAP.md` |

## Hard-coded metrics that drift by construction

**A distinct finding class.** The defect is **the count, not its value** — updating it re-arms the
same trap. The fix is to remove it or generate it. *A document that cannot drift needs no
synchronization*, which is cheaper than any documentation-sync mechanism.

**Scope boundary, verified:** counts under a **released version heading are legitimate history**
and are **out of scope**. `CHANGELOG.md:106,113,120` (*"the suite grew from 63 → 119 tests
(CB-012)"*) sit under `## [2.0.0] - 2026-07-11` and record what was true at that release. Only
**live claims** are findings.

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-010 | M | Major | No | `CHANGELOG.md:55` — *"the test suite grew to **340 tests**"* sits under **`[Unreleased]`** (line 9), not a released heading. It is a live claim and it has drifted. | `awk 'NR<=55 && /^## /{h=$0;n=NR} END{print n": "h}' CHANGELOG.md` → `9: ## [Unreleased]` |
| F-011 | M | Major | No | `tests/context-builder/README.md:19` — *"**Current** size: **205 tests across 15 files**"*. The word *Current* makes it a live claim. **Actual: 207 across 15.** | `npx vitest run tests/context-builder` → `Tests 207 passed` |

## Missing documentation for things that exist

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-013 | M | Major | No | `docs/guides/configuration.md` omits **`handbook.generatedWikiPath`** — shipped, and README:68 calls it *"one configuration contract"*. | `src/platform/config/ConfigService.ts:107,118` |
| F-014 | M | Major | No | `docs/guides/configuration.md` omits **`handbook.reviewPath`** — shipped by EOS-303. | `src/platform/config/ConfigService.ts:108,138` |
| F-015 | M | Major | No | **`aj session end` is documented nowhere outside `implementation/`** — not in README, installation, configuration, or development. | `grep -rn "session end" README.md docs/guides/` |
| F-016 | M | Major | No | `aj wiki build` absent from the guides. | `grep -rn "wiki build" docs/guides/` |
| F-017 | M | Minor | No | `docs/guides/installation.md:60` — *"a handbook that contains a **`wiki/`** directory"*. The contract is `handbook.generatedWikiPath`, default **`wiki-generated`**. | `aj.config.example.json` |

## AJS-007 compliance failures

**These are not stale docs. They are mandatory mechanisms that did not run.**

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-018 | M | **Blocking** | No | **No retrospective exists for any of the five SPEC-003 milestones**, yet all five were frozen. Violates AJS-007 §4.7 stage 7, §8.1 (a Lifecycle Deliverable), `SPEC-FREEZE-REVIEW.md` Step 8, and its Freeze Decision box *"Retrospective completed (accumulated, not overwritten)"*. **SPEC-002 has four.** §9.2 designated SPEC-003 as AJS-007's own validating evidence and §3 makes the retrospective the **only** upward path — so that evidence has never travelled. | `ls implementation/phase-2-core-platform/spec-003-end-of-session/` → no `retrospectives/`; compare `spec-002-context-builder/retrospectives/` (4 files) |
| F-019 | M | **Blocking** | No | `implementation/backlog/SPEC-003-specification-hygiene.md` — **all 7 boxes unchecked**, though the document states they must land *"no later than the SPEC-003 implementation Freeze Review"*. That freeze happened on 2026-07-17. **The deadline was self-declared and missed.** | `grep -c "^- \[ \]" implementation/backlog/SPEC-003-specification-hygiene.md` |
| F-020 | M | Major | No | `spec-003-end-of-session/README.md:203` documents `retrospectives/ (added at each Milestone Freeze)` — **a directory that does not exist**. The doc describes the very mechanism that failed. | `ls spec-003-end-of-session/` |
| F-012 | M | Major | No | `src/context-builder/README.md` — *"M4 … implementation complete, **pending Freeze Review**"*. SPEC-002 M4 is frozen (✅) and v2.0.0 shipped Assembly. Same class as F-005: **AJS-007 §7.4 Documentation Synchronization is Mandatory and failed silently at two separate freezes.** | `spec-002-context-builder/MILESTONES.md` |
| F-021 | M | Minor | No | `spec-003-end-of-session/README.md:333` — `- [ ] Merged into main. _(M5 pull request open — the last step.)_` PR #11 merged as `9bd051d`. | `git log --oneline -1 9bd051d` |

## Architectural representation

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-022 | **J** | Major | **Depends** | **The agent layer has no architectural home.** `src/agent/`, `src/handbook/`, `src/api/` are live (n8n calls `/agent/ask` and `/inbox/note`) but appear in **no** architecture document and **not** in README's subsystem table. ARCH-001 is frozen; amending it requires an ADR (§3). **Blocked on [REX-D1](decisions/) — must be ruled before the task proceeds.** | `grep -ohE '"url".*' infrastructure/n8n/workflows/*.json`; `grep -rn "src/agent" docs/architecture/` |

---

# M2 — Automated Quality Gates

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-025 | M | **Blocking** | No | **`.github/` does not exist and never has.** 11 PRs merged with **zero** automated gates, while `CONTRIBUTING.md:72` and `docs/guides/development.md:51` both mandate typecheck+build+test before every PR. **A policy stated twice and enforced zero times.** | `ls -d .github` → absent; `git log --all --oneline -- .github \| wc -l` → **0** |
| F-026 | M | **Blocking** | No | **`npm run typecheck` type-checks zero test files.** `tsconfig.json:46` `include: ["src"]` is the sole file-selection directive; `tsc --noEmit` with no `-p` uses it verbatim. ~11k lines of test code are never checked. | `npx tsc --noEmit --listFiles \| grep -c '/tests/'` → **0** |
| F-027 | M | **Blocking** | No | **46 errors are hidden by F-026** — real strictness violations under the repo's own `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes` (`tsconfig.json:22-23`). Includes `TS2352` readonly→mutable casts tsc flags as *"may be a mistake"* — **in a repo whose immutability is contract-level.** Precedent: this gotcha hid **3 real defects** during SPEC-003. | `npx tsc --noEmit --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes … tests/**/*.test.ts \| grep -c 'error TS'` → **46** |
| F-028 | M | **Blocking** | No | **No linter exists**, yet `implementation/CLAUDE.md` § Code Quality requires code to *"pass linting"* and `CONTRIBUTING.md:75-77` asserts code conventions. **The instruction is unenforceable.** | `ls .eslintrc* eslint.config.* biome.json*` → none; `grep -c '"lint"' package.json` → 0 |
| F-029 | M | Major | No | No formatter (`.prettierrc*`, `biome.json`, `.editorconfig` all absent). Code is consistently formatted **by hand**, which works until it doesn't. | `ls .prettierrc* .editorconfig` → none |
| F-030 | M | Major | No | **Coverage is not measured.** `@vitest/coverage-v8` is not installed; `vitest.config.ts:14` says *"No coverage/reporters/timeouts tuning yet"*. `coverage/` is gitignored in anticipation of a thing that never happens. | `ls node_modules/@vitest/` |
| F-031 | M | Major | No | **Six strictness flags sit commented out** at `tsconfig.json:26-32`: `noImplicitReturns`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`. Free wins left on the table. | `sed -n '26,32p' tsconfig.json` |
| F-032 | M | Major | No | `package.json` has only 8 top-level keys. Missing: `description`, **`license`** (a real MIT `LICENSE` exists at root), `repository`, `author`, `keywords`, `homepage`, `bugs`, `engines`, `packageManager`. `private: true` excuses `exports`/`files` — **not `license` or `engines`.** | `cat package.json` |
| F-033 | M | Minor | No | No Node version pin (`.nvmrc` / `.node-version` / `engines`). | `ls .nvmrc .node-version` → none |
| F-034 | M | Minor | No | `tsconfig.json:38` `jsx: "react-jsx"` — **dead config**. No JSX exists in this Node-only repo. | `grep -rl "\.tsx" src/` → none |
| F-035 | M | Minor | No | No `SECURITY.md` — notable: the project handles `ANTHROPIC_API_KEY` and `API_AUTH_TOKEN`, and `configuration.md` has a §Security. No disclosure channel. No `CODE_OF_CONDUCT.md` either, though README:22-24 says *"developed in the open"*. | `ls SECURITY.md CODE_OF_CONDUCT.md` → none |
| F-036 | M | Minor | No | No PR template, `dependabot.yml`, or `CODEOWNERS`. `CONTRIBUTING.md:83` states PR rules that nothing surfaces at PR time; 9 dependencies drift unmonitored. | `ls .github/` → absent |

---

# M3-A — Public Surface *(contractual)*

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-037 | M | Major | No | **4 barrels use blanket `export *`**, leaking everything by default, while every other module uses explicit named re-exports. | `grep -rln "export \*" src/` → `platform/{config,handbook,retrieval}/index.ts`, `products/knowledge-assistant/index.ts` |
| F-038 | J | Major | No | `src/end-of-session/index.ts` re-exports **~70 symbols** — every schema, parse function, const tuple, factory, plus internal-ish types (`SessionRunFacts`, `FatalStageError` at `:183`). Effectively the whole module. | `src/end-of-session/index.ts` |
| F-039 | M | Major | No | `src/context-builder/index.ts:5-6` **claims** internal components stay private. **They don't**: `createCollectionEngine` (`:80`), `createSelectionEngine` (`:106`), `createAssemblyEngine` (`:124`) are all public, though `createContextBuilder` is documented as *"the single public orchestration service"*. **The claim is either true or deleted.** | `sed -n '1,10p;78,126p' src/context-builder/index.ts` |
| F-040 | M | Minor | No | `src/products/knowledge-assistant/types.ts` is a **0-byte file**. Dead. | `wc -c src/products/knowledge-assistant/types.ts` → **0** |
| F-041 | **J** | Major | **YES** | **`ContextBuilderConfig` requires three fields nothing reads.** `profile`, `explainability`, `outputFormat` are validated, frozen, `.strict()`, "no hidden defaults" — and inert. `assembleContext.ts:130-134` hardcodes empty placeholders; `KnowledgeAssistant.ts:266-269` dutifully passes all three and gets empty explainability regardless. **`outputFormat: "json"` produces output identical to `"markdown"` — the contract makes a promise the code does not keep.** FPCP required. Note the scope guard: *implementing* them is platform evolution and defers. | `grep -rn "\.profile\b\|\.explainability\b\|\.outputFormat\b" --include="*.ts" src/context-builder/ \| grep -v schema\|types` → **empty** |
| F-042 | **J** | Major | **YES** | **Two identity resolvers are exported, fully tested, and wired to nothing.** The only composition root uses `createSlugIdentityResolver`. `createSemanticIdentityResolver` costs a **model call per resolution** — this is an unused AI code path, not inert scaffolding. **May be staged for ADR-006 Identity Learning; only the reviewer knows.** FPCP required. | `grep -rn "createSemanticIdentityResolver\|createAliasAwareResolver" --include="*.ts" src/ \| grep -v "identity/"` → **empty**; `createKnowledgePipeline.ts:101` → `createSlugIdentityResolver()` |
| F-043 | J | Minor | **YES** | `createWikiGenerator.ts:479` returns `lint: { findings: [] }` against a `noLint` stub at `:173` — **a declared but unimplemented capability on the public `GenerationReport`.** FPCP required. Implementing it is a feature and defers. | `sed -n '173p;479p' src/knowledge/wiki-generator/createWikiGenerator.ts` |
| F-044 | J | Minor | No | `tests/end-of-session/foundation.test.ts:78-112` reads sibling test files and fails if any imports a non-barrel path; `:29-56` pins the exact export manifest. **This is the repo's best idea and exactly one module uses it** — while AJS-007 §6.1 names Public-Surface Validation a **validated principle**. | `grep -rln "foundation.test" tests/` → 1 |

---

# M3-B — Naming & Readability

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-045 | **J** | Major | No | **Three file-naming schemes coexist, all three inside a single directory.** PascalCase (26 files), camelCase (28), kebab-case (3). e.g. `analyzers/git/{GitPort.ts, createGitPort.ts, createGitChangeAnalyzer.ts, index.ts}`. | `find src -name "*.ts"` |
| F-046 | J | Major | No | The implicit rule (PascalCase = type/class, camelCase = function) **breaks**: `FilesystemReviewStore.ts` and `FilesystemWikiStore.ts` are PascalCase but export only **functions** (`createFilesystemReviewStore` + an error class). Compare `projection/createReviewPackageProjector.ts` — camelCase for the identical factory shape, **same module, opposite naming**. | `grep -n "^export" src/end-of-session/store/FilesystemReviewStore.ts` |
| F-047 | J | Minor | No | `products/knowledge-assistant/wikiKnowledgeProvider.ts` is camelCase beside PascalCase `KnowledgeAssistant.ts` in the same folder. | `ls src/products/knowledge-assistant/` |
| F-048 | J | Minor | No | `src/knowledge/naming.ts` and `src/handbook/paths.ts` are bare lowercase nouns — a **fourth** style. | `ls src/knowledge/ src/handbook/` |
| F-023 | J | Major | No | **`CONTRIBUTING.md:31-38`'s "one rule" describes ~⅓ of the tree.** *"Platform capabilities live in `src/platform/` (and `src/context-builder/`)… Products live in `src/products/`… CLI → Product → Platform."* No slot for `src/knowledge/`, `src/end-of-session/`, `src/ingestion/`, `src/handbook/`, `src/agent/`, `src/api/`, `src/config/`. The rule **is** respected where it applies (verified: nothing under `platform/`/`context-builder/` imports `products/`) — it just doesn't apply to most of `src/`. | `ls src/`; `grep -rn "products" src/platform src/context-builder` → empty |

---

# M4 — Structural Consistency & Genuine Duplication

**Governed by the shared-ownership criteria ([REX-D3](decisions/)).** Duplication is **evidence,
not a verdict**. All four criteria must hold before consolidating; **"keep parallel" is a valid
outcome, recorded as a result rather than a deferral.**

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-049 | **J** | Major | No | **Path-guarding logic triplicated** — ~200 lines of **security-relevant** code (symlink-escape prevention) in three copies with three error types: `FilesystemReviewStore.ts:59,74,104,143` · `FilesystemWikiStore.ts:47,56,80,113` · `handbook/paths.ts:60-114`. **Contested against the criteria** — each guards a *different root* with different canonicality rules. REX-D3 rules. | the three files |
| F-050 | M | **Major** | No | **The copies have already diverged, and one has a bug hazard the other doesn't.** `FilesystemWikiStore.ts:96-98` catches inside the loop and must re-throw its own error type to avoid swallowing it; `FilesystemReviewStore` factored out `realpathIfExists` and has no such hazard. **This is a defect on its own merits — M4 closes it regardless of the REX-D3 ruling, and it must not be held hostage to that decision.** | `sed -n '80,100p' src/knowledge/wiki-store/FilesystemWikiStore.ts` |
| F-051 | M | Major | No | **`deepFreeze` defined 6×**, five of them **private and identical inside `src/context-builder/` alone**. `DeepReadonly<T>` defined 2×. **Scope: within `context-builder` only** — `end-of-session/contracts/immutable.ts` is **excluded by EOS-005**, which it cites at `:6-8`. | `grep -rln "function deepFreeze" src/` → **6** |
| F-052 | J | Minor | No | Model-JSON-parse duplicated: `knowledge/compiler/extraction.ts:59-64` and `end-of-session/contracts/knowledge-extraction/schema.ts:144-149` — same routine, same two messages, different error class. **Likely governed by EOS-005** (parallel by design). REX-D3 rules. | both files |
| F-053 | M | **Major** | No | **`KnowledgeAssistant.ts` — 410 lines, zero tests**, because it hard-wires every dependency as a field initializer (`:77,85,93,184,192,263-267`). No `deps` param; `ask.ts:18` calls `new KnowledgeAssistant()`. **You cannot construct it without a real filesystem and a real API key.** The two modules *with* composition roots have exhaustive suites — **direct causal link.** `createKnowledgePipeline` / `createEndOfSessionWorkflow` are the pattern to copy. | `ls tests/products/`; `sed -n '77,95p' src/products/knowledge-assistant/KnowledgeAssistant.ts` |
| F-054 | M | Major | No | The agent layer is **untested**: `src/agent/tools.ts` (190 lines), `loop.ts` (98), `src/api/*`, `src/handbook/writer.ts` (127), `src/server.ts`. Live code, zero coverage. | `ls tests/` → no `agent/`, `api/`, `handbook/` |
| F-055 | J | Minor | No | **Two config systems**: `src/config/{app-env,agent-env}.ts` (Zod over dotenv, `HANDBOOK_PATH`) vs `platform/config/ConfigService.ts` (hand-rolled validation over `aj.config.json`, `handbook.path`). Two handbook-path sources of truth, two validation styles. **They serve two transports** — document and bound them; **merging is a redesign and defers** (scope guard). | both paths |

---

# M5 — Comments, Errors & Test Craft

| ID | class | sev | frozen? | Finding | Evidence |
|---|---|---|---|---|---|
| F-056 | M | Major | No | `src/end-of-session/index.ts:16-19` still says *"services and the `run` entry point land in **later M1+ tasks**. The barrel exports nothing that does not yet exist."* They landed. | `sed -n '16,19p' src/end-of-session/index.ts` |
| F-057 | M | Major | No | `src/config/app-env.ts:6-13` and `agent-env.ts:6-9` defend against a `NOTION_*` constraint **deleted in `16e66da`** (*"so the Notion sync CLI can boot without them"*). The comments defend a constraint that no longer exists. | `git show 16e66da --stat \| grep -i notion` |
| F-058 | J | Minor | No | Pure section-label noise: `src/context-builder/index.ts:20` `// Public factory and handle.` above `export { createContextBuilder }`; `:24` `// Public configuration contract.` above `export { contextBuilderConfigSchema }`. | `sed -n '20,25p' src/context-builder/index.ts` |
| F-059 | J | Major | No | `src/end-of-session/index.ts` is **215 lines, ~150 of them prose duplicating JSDoc already present at each definition** (e.g. `:161-168` re-describes the Orchestrator Invariant that `createSessionWorkflow.ts` already documents). **Two copies that will drift — and F-056 proves they already have.** | `wc -l src/end-of-session/index.ts` |
| F-060 | M | Major | No | **12 custom error classes, no shared base.** Each is an identical 4-line `extends Error` + `this.name`. No `cause`, no codes. `catch (e) { if (e instanceof AjError) }` is impossible, so every call site enumerates: `session.ts:157` (`ConfigError \|\| ReviewStoreError`), `wiki.ts:45` (`ConfigError \|\| AIError`). **A new user-facing error silently breaks the friendly-message path in both.** | `grep -rn "extends Error" src/` → 12 |
| F-061 | M | Minor | No | **Three spellings of one message.** `FilesystemReviewStore.ts:79` *"must not contain NUL bytes."* · `FilesystemWikiStore.ts:118` *"Path must not contain null bytes."* · `handbook/paths.ts:67` *"Path must not contain NUL bytes"* (no period). | the three files |
| F-062 | M | Minor | No | Inconsistent terminal punctuation: platform errors end with `.`; `handbook/paths.ts:67,70,75,80` and `api/errors.ts:12,43` do not. | same |
| F-063 | J | Minor | No | No `cause` chaining anywhere — underlying errors are discarded when wrapped. | `grep -rn "cause:" src/` |
| F-064 | **J** | Minor | No | Test helper duplication: `stubGenerator` ×4, `makeProvider` ×3, `candidate` ×3, `item` ×3, `stubGitPort` ×2. **But per-suite inlining is a documented, deliberate convention** (`tests/end-of-session/support.ts:5-8`). Defensible for **contract fixtures**; less so for infrastructure like `makeProvider`. REX-D4 rules. | `grep -rn "const stubGenerator\|const makeProvider" tests/` |
| F-065 | M | Minor | No | `src/cli/commands/wiki.ts:58` `printReport` `console.log`s directly and is untestable. `session.ts:83` `formatSessionReport` returns `string[]` **specifically so it can be tested without stdout capture**, and documents why at `:81-82`. **Same layer, two conventions; `session.ts` is the exemplar.** | both files |
| F-066 | J | Minor | No | **The agent layer has ~zero comments** — `api/routes/inbox.ts` (20 lines, 0%), `routes/agent.ts` (17, 0%), `agent/client.ts` (16, 0%), `agent/tools.ts` (190, 0%) — while `src/end-of-session/` runs 60-83% and cites decision records. **The repo has two documentation cultures.** | the files |

## Comments that must be preserved — an explicit anti-finding

**A comment cleanup is the single easiest way to delete irreplaceable knowledge.** These are
**load-bearing** and are protected by name. REX-D6 defines the rule; this list is the safety net.

| Location | Why it is irreplaceable |
|---|---|
| `FilesystemReviewStore.ts:123-128` | Why only the destination's **basename** is checked against canonical dirs, why scanning the whole absolute path would be wrong (a vault under `~/wiki/` is not canonical space), and what covers the residual gap. **Unrecoverable from the code.** |
| `src/cli/commands/session.ts:44-54` | Why the workflow must **not** pre-flight the API key, and why detection reads the report instead of catching — *"the error never escapes `run` — it is data by the time the command sees it."* |
| `src/cli/commands/session.ts:150-156` | Why `AIError` is **deliberately absent** from the catch block. **Documents an absence — the hardest thing to document and the easiest for a cleanup pass to delete.** |
| `createEndOfSessionWorkflow.ts:43-53` | Why `NO_BRANCH = "detached"` does *not* reimplement the Session factory's Branch Policy — for a field nothing reads. |
| `selectKnowledge.ts:67-68` | *"Copy before sorting: the CollectionResult's `items` array is frozen and `Array.prototype.sort` orders in place."* Terse, load-bearing. |
| `tsconfig.json:38-41` | Why `include` is scoped to `src`. **Sound for `build`; it is the reasoning F-026 must engage with, not delete.** |

---

# Deferred — recorded, not actioned

Each is real. Each is out of scope. **Recording them is what stops them leaking in.**

| Item | Why deferred |
|---|---|
| **`PROJECT-STORY`** | Promised by `README.md:130` *"once the cleanup is complete"*. REX **is** the cleanup — its genuine successor. |
| **ADR-007** (producer-owned contracts) | Deliberately deferred at SPEC-003 M1; trigger arguably now met. **Architecture layer — above REX** (§3). REX-D1 may *recommend* it. |
| **Test tier separation** | The suite runs fast enough that tiering buys nothing today. Revisit if runtime grows ~an order of magnitude. |
| **Coverage thresholds** | Needs a baseline first. **A threshold picked before measuring is a number, not a standard.** M2 measures; a later review gates. |
| **`createWikiGenerator.ts` refactor** | 485 lines, 15 nested closures, `run` ~79 lines over a 12-field mutable bag. Real — but **structural redesign**. Scope guard. |
| **Config system unification** | Two systems serve two transports. **Merging is a redesign**; may resolve itself in the MCP migration. |
| **`createGitPort` `maxBuffer`** | Already a **reviewer-accepted** M2 deferral; degrades correctly into an `AnalyzerError`. **Not REX's to re-open.** |
| **Non-ASCII path quoting** | Pre-existing in M2's frozen parser; recorded as Future Hardening in SPEC-003 MILESTONES. |
| **MCP transport** | Product work. |
| **`/inbox/file`** | Registered, no n8n consumer. May be deliberate. Recorded; not acted on. |
| **`implementation/prompts/` gaps** | No `EOS-*` history though `implementation/README.md` advertises it; two filename typos (`plannig`, `promt`). Cosmetic. |
| **`CB-019` decision record** | Missing from an otherwise complete CB-001..CB-022 sequence. **SPEC-002's to close.** |
| **`worklog/` directory** | `implementation/README.md` documents it; it doesn't exist. `CLAUDE.md` already hedges that it *"may therefore be empty"*. |
| **`dist/` staleness** | Gitignored and untracked, but `bin` points into it, so `npm link` can serve old code. Verify manually post-M2. |

---

# Summary

| Milestone | Findings | Blocking | Measurable | Judgement | Frozen (FPCP) |
|---|---|---|---|---|---|
| M1 | 20 | 12 | 19 | 1 | 0 (F-022 depends on REX-D1) |
| M2 | 12 | 4 | 12 | 0 | 0 |
| M3-A | 8 | 0 | 4 | 4 | **3** |
| M3-B | 5 | 0 | 1 | 4 | 0 |
| M4 | 7 | 0 | 4 | 3 | 0 |
| M5 | 11 | 0 | 7 | 4 | 0 |
| **Total** | **63** | **16** | **47** | **16** | **3** |

**~75% Measurable.** That ratio is itself the argument for M2 landing early: three quarters of this
inventory can be held true by a machine forever, and until CI exists none of it is.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 1.0 | Inventory created and **FROZEN** with the package Planning Freeze (reviewer: AJ). All evidence verified against `9bd051d`. Two corrections made during verification rather than transcribed from exploration: (1) the `CHANGELOG.md` counts under `## [2.0.0]` are **legitimate history** and out of scope — only `[Unreleased]` and *"Current size"* claims are live drift (F-010, F-011); (2) the reported `src/handbook/` ↔ `src/platform/handbook/` "duplication" was **rejected** — they share a name, not a responsibility, and no finding was raised. |

---

> **Engineering Rule**
>
> No finding enters a milestone without reproducible evidence.
>
> The inventory is closed. New findings are recorded, not actioned.
