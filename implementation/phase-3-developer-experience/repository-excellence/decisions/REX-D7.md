# REX-D7 — Toolchain: Biome

> **Status:** ✅ **Accepted** — ruled by the reviewer (AJ) at the M2 Planning Re-read, 2026-07-17.
>
> **Specification:** _None (REX)._
>
> **Implementation Package:** REX — Repository Excellence Review
>
> **Related Task(s):** REX-204 (formatting) · REX-205 (lint & config truth)

---

# Purpose

M2 introduces the repository's **first** linter and **first** formatter. Neither exists today, which
makes this a greenfield choice rather than a migration — and the choice governs two M2 tasks and
every subsequent milestone's diff.

---

# Context

**Nothing to preserve.** Verified: no `.eslintrc*`, no `eslint.config.*`, no `.prettierrc*`, no
`biome.json`, no `.editorconfig`. There is no `lint` or `format` script in `package.json`.

Meanwhile **two documents already require what does not exist**: `implementation/CLAUDE.md` § Code
Quality requires code to *"pass linting"* (F-028), and `CONTRIBUTING.md:75-77` asserts code
conventions. The instruction is unenforceable today.

The repository's only current "linter" is the TypeScript compiler, and it is genuinely strict —
`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` +
`isolatedModules` + `noUncheckedSideEffectImports`. **Six further flags sit commented out**
(`tsconfig.json:26-32`), which M2 enables under F-031.

The code is already formatted consistently **by hand** — 2-space, double quotes, semicolons, ~90
columns. That works until it doesn't, and it has never been enforced.

---

# Decision

**Use Biome** for both formatting and linting.

---

# Rationale

The reviewer's reasoning, recorded as ruled:

- no existing ESLint configuration needs to be preserved;
- formatting and linting are introduced **together**, so there is no reason to stage two tools;
- **one executable, one configuration**;
- lower long-term maintenance;
- *"aligns well with Repository Excellence's emphasis on reducing unnecessary repository
  complexity."*

> *"Unless M2 uncovers a capability Biome genuinely lacks, I see no reason to introduce a two-tool
> stack."*

**That caveat is the decision's own falsifier**, and it is deliberate: if M2 finds a needed rule
Biome cannot express, this decision is revisited rather than worked around.

**The deeper argument.** REX exists to reduce unnecessary complexity. Introducing two tools, two
configuration files, and their integration seam — on a ~12k-line Node repository with no
plugin requirements — would be REX adding the class of thing REX exists to remove.

---

# Alternatives Considered

## Option A — ESLint + Prettier

**Pros**
- The ecosystem default; the largest plugin catalogue; every contributor has met it.
- `typescript-eslint` offers type-aware rules Biome does not fully match.

**Cons**
- **Two tools, two configs, one integration seam** — and the seam is a known source of conflict
  (formatter vs. lint-formatting rules) that needs a third package to suppress.
- Slower.
- **Solves a migration problem this repository does not have** — there is nothing to migrate.

## Option B — Biome *(selected)*

**Pros**
- One binary, one config, fast.
- Formatter and linter cannot disagree with each other — the class of problem `eslint-config-prettier`
  exists to paper over simply does not arise.
- Nothing to migrate.

**Cons**
- Smaller plugin ecosystem; **no type-aware linting** comparable to `typescript-eslint`.
- **Accepted, with reason:** the TypeScript compiler already carries the type-aware load here, and
  **M2 makes it stricter** (F-031's six flags) *and* extends it to `tests/` for the first time
  (F-026). The type-aware gap is covered by the tool that should cover it.

## Selected — B

---

# Consequences

## Positive

- One configuration file; a `lint` and `format` script that mean what they say.
- `implementation/CLAUDE.md`'s *"pass linting"* becomes **enforceable** rather than aspirational.
- Fast enough to run on every commit without anyone resenting it.

## Trade-offs

- **No type-aware lint rules.** If a rule turns out to need type information, this decision is
  revisited per the reviewer's caveat — not worked around with a second tool bolted on quietly.
- A less familiar tool for a future contributor. Mitigated: one config file, and the commands are
  `npm run lint` / `npm run format`.

---

# Impact

## Affected Tasks

- **REX-204** — formatter + `.editorconfig`. The **first-run diff touches nearly every file** and
  lands as an isolated commit, provable by re-running the formatter on the pre-M2 tree.
- **REX-205** — linter + the six dormant `tsconfig` flags.

## Affected Components

- None. **No runtime behaviour changes.**

## Documentation Requiring Updates

- `package.json` (`lint`, `format`, `format:check` scripts) · `docs/guides/development.md` (M2's) ·
  `CONTRIBUTING.md` (M2's).

---

# Validation

- `npm run lint` passes; `npm run format:check` is **idempotent** (running the formatter twice
  changes nothing).
- **The gate is demonstrated failing** on a deliberate violation, then passing. *A gate never seen
  red is not known to work.*
- **The formatter's diff is proven mechanical**: re-running Biome on the pre-M2 tree reproduces the
  post-M2 tree **exactly**. A formatter is deterministic, which is what makes this provable rather
  than asserted.

---

# Future Review

**Revisit if M2 uncovers a capability Biome genuinely lacks** — the reviewer's stated condition.
Record it as a finding; do **not** add a second tool silently.

Also revisit if type-aware linting becomes necessary. Today the compiler covers it, and **M2
strengthens exactly that coverage** — which is the reason this trade-off is acceptable now and might
not be later.

---

# Related Documents

Standards
- **AJS-007 §6.1 Scope Discipline** — the reason a two-tool stack is not adopted "just in case".

Implementation
- [FINDINGS.md](../FINDINGS.md) — F-028 (no linter), F-029 (no formatter), F-031 (six dormant flags),
  F-034 (dead `jsx` config).
- [MILESTONES.md](../MILESTONES.md) — M2.

---

# Change Log

| Date       | Version | Description      |
| ---------- | ------- | ---------------- |
| 2026-07-17 | 1.0     | Decision created and **Accepted** — ruled by the reviewer (AJ) at the M2 Planning Re-read. Biome selected for both formatting and linting. The reviewer's caveat is recorded as the decision's falsifier: *"Unless M2 uncovers a capability Biome genuinely lacks, I see no reason to introduce a two-tool stack."* |

---

> **Engineering Rule**
>
> A review that exists to reduce unnecessary complexity should not introduce a two-tool stack to
> solve a migration problem it does not have.
