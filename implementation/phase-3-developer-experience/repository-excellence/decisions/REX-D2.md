# REX-D2 — The File-Naming Rule

> **Status:** ✅ **ACCEPTED** — ruled by the reviewer (AJ) at the **M3-B Planning Review**, 2026-07-17. Planning Freeze declared.
>
> **Type:** Package decision ruled at M3-B Planning. Governs file renames (M3-B, REX-304).
> Renames are behaviour-neutral; below the FPCP threshold.
>
> **Implementation Package:** REX — Repository Excellence Review · **Milestone:** M3-B
>
> **Related Task(s):** **REX-304** · **Findings:** F-045, F-046, F-047, F-048

---

# Purpose

Establish the **one file-naming rule** M3-B applies. The Evidence Review changed what that rule must
be: the repository does **not** have three competing casings needing convergence — it has an
**implicit role-based rule that is mostly followed**, plus a large, legitimate conventional category.
The rule below **codifies what already works** and names the narrow set of genuine violations.

---

# The evidence (measured against `HEAD`, `5033f8e`)

**File-name styles across `src/` (116 non-index `.ts` files):**

| Style | Count | Character |
|---|---|---|
| lowercase `types.ts` / `schema.ts` | **32** | universal TS convention — a rule must **bless**, not fix |
| lowercase single-word (`server.ts`, `session.ts`, `naming.ts`) | 27 | single-concept modules |
| camelCase | 28 | factory/function files (`createContextBuilder.ts`) |
| PascalCase | 26 | eponymous type/class files (`ConfigService.ts` → `class ConfigService`) |
| kebab-case | **3** | the only genuine outliers |

**The implicit rule, and where it holds:** PascalCase ⇒ the file's primary export is a **type or
class of the same name**; camelCase ⇒ the primary export is a **factory or function**. **22 of 26
PascalCase files** carry an eponymous type/class. The rule is real; it is followed; it has drifted in
a few places.

**The genuine violations — narrow, not repo-wide:**

1. **4 PascalCase files with no eponymous export** — they export a `create*` factory plus a `*Options`
   type and a `*Error` class, and nothing of the file's own name:
   `src/end-of-session/store/FilesystemReviewStore.ts`, `src/knowledge/wiki-store/FilesystemWikiStore.ts`,
   `src/ingestion/FilesystemSourceConnector.ts`, `src/knowledge/compiler/AnthropicKnowledgeCompiler.ts`.
   *(The inventory named the first two; measurement found all four.)*
2. **3 kebab-case files** — `src/agent/system-prompt.ts`, `src/config/agent-env.ts`,
   `src/config/app-env.ts`.

**F-047 is almost certainly not a violation.** `wikiKnowledgeProvider.ts` exports
`createWikiKnowledgeProvider` — a factory. Under the role rule, camelCase is **correct**; it only
reads as inconsistent if one expects a single casing for every file. **Recommend reclassifying F-047
as "consistent under the rule," not a rename.**

---

# Decision — the rule (proposed)

A `src/` file is named for **the role of its primary export**:

| Role of the file's primary export | Filename style | Example |
|---|---|---|
| A **type or class** — the file *is* that type | **PascalCase**, matching the export | `ConfigService.ts` → `class ConfigService` |
| A **factory or function** — the file *makes or does* something | **camelCase**, matching the export | `createContextBuilder.ts`, `wikiKnowledgeProvider.ts` |
| A **conventional module role** — a barrel or a role-file | **lowercase** | `index.ts`, `types.ts`, `schema.ts`, `errors.ts` |

**kebab-case is not used.** No other style is introduced.

**The one rule, stated once:** *a file is named after its primary export, in that export's own
casing; conventional role-files (`index`, `types`, `schema`, `errors`) stay lowercase.*

---

# The open question REX-D2 must rule: the 4 PascalCase-factory files

These export a factory (`createFilesystemReviewStore`) but are named for a **concept** (*the
Filesystem Review Store*). Two defensible readings:

| Option | Rename | Argument |
|---|---|---|
| **A — camelCase to match the factory** (rule-consistent) | `FilesystemReviewStore.ts` → `createFilesystemReviewStore.ts` | The primary export is a factory; there is no `class FilesystemReviewStore`. The rule says camelCase. Consistent with `createContextBuilder.ts`, `createWikiGenerator.ts`. |
| **B — keep PascalCase as a concept name** | none | *"FilesystemReviewStore"* names a cohesive service concept; the `create*` factory and its `*Error`/`*Options` are that concept's surface. Treat the file as the concept, not the function. |

**Author recommendation: Option A.** The repository already names factory files in camelCase
(`createContextBuilder.ts`, `createWikiGenerator.ts`, `createKnowledgePipeline.ts`) — the four
`Filesystem*`/`Anthropic*` files are the *inconsistency*, not a second valid convention. Option A
makes the rule uniform; Option B carves out an exception that will need re-explaining every time.
**But this is a judgement about concept-vs-factory identity, and it is the reviewer's.**

The 3 kebab files rename to their role style (all export config/const, so lowercase or camelCase per
their primary export — settled at REX-304 against the ruled rule).

## ✅ Reviewer ruling (AJ, M3-B Planning Review, 2026-07-17)

**Option A approved — rename the four PascalCase-factory files to camelCase.** The reviewer:

> *"This produces a simpler repository rule with fewer exceptions. It also aligns naturally with
> existing repository conventions such as `createContextBuilder`. I do not recommend introducing a
> special 'concept-name factory' exception. Repository Excellence should minimise exceptions unless
> the architecture genuinely requires them."*

**F-047 confirmed as NOT a violation** — no rename: *"The current name already communicates the
module's role. Changing it would reduce consistency with the rule just established."*

The rule itself is adopted: **PascalCase → eponymous types/classes/interfaces; camelCase →
factories/creators/builders/executable modules; lowercase/kebab → conventional role-files where a
repository convention already exists.** *"Repository names should communicate semantic role rather
than visual consistency."*

---

# Scope guard

Renaming files changes **no behaviour** — it changes import specifiers, which the compiler and the
REX-303 manifests verify mechanically. Codifying a rule the repository already mostly follows is
engineering hygiene, **in scope**. *Inventing* a new scheme, or renaming the 59 conventional
lowercase files, would be churn for its own sake — **out of scope**, and the rule above explicitly
blesses the convention instead.

---

# Validation

- The rule is applied by **rename-only commits**: `git show --stat` shows renames; content diffs are
  empty (M3-B's frozen validation).
- **No exported identifier changes** — a rename that would require one is a surface change and belongs
  to M3-A, which is frozen. The REX-303 manifests are the mechanical proof: they stay green across a
  pure rename and go red if an export moves.
- Every file conforms to the rule **or** is a recorded, reasoned exception.

---

# Change Log

| Date | Version | Description |
| ---------- | ------- | ---------------------- |
| 2026-07-17 | 0.1 | **PROPOSED** at M3-B Planning. Evidence Review reframed the rule from *"converge three casings"* to *"codify the existing role-based convention"* — the lowercase category is **59 files (32 conventional), not the 2 F-048 named**, and the real violations are **4 PascalCase-factory files (not 2) + 3 kebab files**. Recommends reclassifying **F-047 as a non-violation**. Open question — the 4 `Filesystem*`/`Anthropic*` files (camelCase vs concept-name) — reserved to the reviewer, author recommends camelCase. |
| 2026-07-17 | 1.0 | ✅ **ACCEPTED** at the M3-B Planning Review (reviewer: AJ). Role-based rule adopted; **the 4 PascalCase-factory files rename to camelCase (Option A, no concept-name exception)**; **F-047 confirmed a non-violation**. *"Repository names should communicate semantic role rather than visual consistency… minimise exceptions unless the architecture genuinely requires them."* |

---

> **Engineering Rule**
>
> Name a file after its primary export, in that export's own casing. The best naming rule is usually
> the one the codebase already half-follows — written down, then made whole.
