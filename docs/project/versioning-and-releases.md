# AJ-OS — Versioning & Releases

**Type:** Project Governance
**Status:** Adopted — 2026-07-10
**Owner:** AJ
**Applies to:** the whole AJ-OS repository

---

# 1. Purpose

This document is the **canonical governance** for how AJ-OS is versioned, tagged,
and released. It exists so that one question never becomes ambiguous again:

> When we say "version 1.0" or "version 2.0," *what* is at that version — the
> platform, or a product?

It defines the versioning model, the meaning of every kind of tag, what becomes a
public release, how `package.json` and the CHANGELOG are versioned, and the
workflow for cutting a release. It is **policy, not implementation** — it describes
*what the rules are*, not how any particular tool works, and it is meant to be
stable enough that contributors follow it for years.

This is **project governance**, deliberately kept separate from the engineering
standards (`docs/standards/`, the AJS series) and the specifications
(`docs/specifications/`, the SPEC series). Those govern *how software is built*;
this governs *how the project is versioned and shipped*.

---

# 2. Versioning philosophy

AJ-OS versions **two independent things** on two independent axes:

- the **platform** — the reusable capabilities and architecture that live in this
  repository; and
- each **product** — a user-facing thing built *on top of* the platform.

They are versioned separately because they mature at different rates and mean
different things to different audiences. Conflating them onto one number is the
ambiguity this document exists to prevent.

## Long-term principles

These principles are the spirit of the policy. When a specific rule below is
unclear, resolve it in favour of these:

1. **The platform evolves independently of products.** A platform release does not
   require a product release, and vice versa.
2. **Products are released on top of the platform.** A product version describes
   the maturity of that product, not of the platform beneath it.
3. **Engineering checkpoints are not releases.** Tags that mark internal progress
   (architecture checkpoints, design snapshots) are waypoints, not something a
   user installs.
4. **Specification milestones document engineering progress.** SPEC-scoped tags
   record how implementation advanced; they are history, not distribution.
5. **GitHub Releases represent stable platform milestones.** A GitHub Release is a
   platform-level event; products are announced *within* it.
6. **Every release must be reproducible from Git history.** A release tag always
   points at a commit that builds and passes its checks. Nothing is released that
   cannot be rebuilt from the tag.
7. **The release history should tell the story of the platform.** Someone looking
   only at the Git tags, the GitHub Releases, and the CHANGELOG should be able to
   understand how AJ-OS evolved — without reading the code. Release history is part
   of the project's engineering record, not merely a deployment log.

---

# 3. Platform versions

The **platform version** is the version of the AJ-OS repository as a whole — its
reusable capabilities, contracts, and architecture. It follows
[Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

- **MAJOR** — an architectural shift or a breaking change to platform contracts
  (e.g., the move from the original Notion architecture to the reusable
  product/platform architecture is a MAJOR change: `1.x` → `2.0.0`).
- **MINOR** — new platform capability, backward-compatible (e.g., completing a
  further Context Builder milestone that adds behaviour without breaking contracts:
  `2.0.0` → `2.1.0`).
- **PATCH** — backward-compatible fixes to platform behaviour.

`MAJOR.0.0` means "the first release of a new major line," **not** "the platform is
complete." The platform continues to mature across the `MAJOR.x` series.

The platform version is the **single number carried in `package.json`** (see §9)
and the number that appears in **GitHub Releases** (see §8).

---

# 4. Product versions

Each product built on AJ-OS carries **its own** SemVer version, describing the
maturity of *that product*. A product version is independent of the platform
version and of every other product's version.

- A product at `v0.x` is pre-stable; `v1.0.0` marks its first production release.
- A product's version advances on its own cadence, driven by that product's
  changes — never automatically because the platform moved.

Product versions are recorded in the product's own documentation — its release
notes under `implementation/products/<product>/release/vX.Y.Z.md` — and marked in
Git with a **product tag** (see §7). They are **not** carried in `package.json`.

> **Why independent?** The platform is infrastructure; a product is an application
> of it. A user of the Knowledge Assistant cares about *its* maturity, not which
> platform minor it happens to run on. Coupling the two numbers would force
> meaningless version bumps and re-introduce the very ambiguity this policy removes.

---

# 5. Engineering milestone tags

**Engineering milestone tags** mark internal engineering waypoints that are **not
releases**. They record that a significant point in the platform's construction
was reached, so history is navigable and reproducible.

They use a version-like name with a **descriptive suffix** that signals "checkpoint,
not release":

- `v2.0-foundation` — the architectural checkpoint that *begins* the v2 platform
  line. It is a Git tag only; nothing is distributed from it.
- `v0.9.5-design` — an architecture-and-product-design snapshot on the road to
  `v1.0.0`.
- `repo-docs-m2` — a repository-documentation checkpoint.

The rule: **a bare `vX.Y.Z` is a release; a `vX.Y*` with a word-suffix
(`-foundation`, `-design`, …) is a checkpoint.** The suffix is what distinguishes a
waypoint from a release. (Pre-release *releases* — `-alpha`, `-beta`, `-rc.N` — are
the exception and are covered in §7/§8.)

---

# 6. Specification milestone tags

**Specification milestone tags** are engineering tags **scoped to a specification**
(a SPEC document). They document how a specification's implementation progressed.
They are history and are never releases.

Format: `spec-<nnn>-<marker>`. Real examples from this repository:

- `spec-002-m1`, `spec-002-m2`, `spec-002-m3`, `spec-002-m4` — SPEC-002 milestone
  completions.
- `spec-002-m3-plan`, `spec-002-m4-planning-freeze` — planning / planning-freeze
  checkpoints within a milestone.
- `spec-002-m2-freeze` — a milestone freeze.
- `spec-002-cb017`, `spec-002-cb-019-022` — individual tasks or task ranges.

These tags let anyone reconstruct the exact state at any point in a specification's
implementation. They belong to the *engineering* record and are independent of both
platform and product release versions.

---

# 7. Git tags

All tags live in one namespace, so the naming convention must keep the kinds from
colliding. AJ-OS uses four tag families:

| Family | Format | Example | Is it a release? |
| --- | --- | --- | --- |
| **Platform release** | `vMAJOR.MINOR.PATCH` | `v1.0.0`, `v2.0.0` | **Yes** — stable |
| **Platform pre-release** | `vMAJOR.MINOR.PATCH-<alpha\|beta\|rc.N>` | `v0.5.0-alpha`, `v2.0.0-rc.1` | Pre-release only |
| **Engineering / spec checkpoint** | `vX.Y-<label>` or `spec-<nnn>-<marker>` | `v2.0-foundation`, `spec-002-m4` | **No** |
| **Product release** | `<product-slug>-vMAJOR.MINOR.PATCH` | `knowledge-assistant-v1.0.0` | Product-level |

Rules:

- **Platform tags own the bare `vX.Y.Z` space.** Nothing else may take that form.
- **Product tags are always prefixed** with the product slug —
  `<product-slug>-vMAJOR.MINOR.PATCH` — so a product `v1.0.0` can never be confused
  with a platform `v1.0.0`. This flat, slug-prefixed form is the **permanent
  convention** (e.g., `knowledge-assistant-v1.0.0`, `workflow-assistant-v1.0.0`,
  `learning-assistant-v0.1.0`): simple, readable, searchable, and free of special
  characters.
- **Checkpoints carry a non-SemVer suffix or a `spec-` prefix**, so they are never
  mistaken for a release.
- Tags are **immutable** once pushed. History is corrected by adding tags, never by
  moving or deleting released ones.

---

# 8. GitHub Releases

A **GitHub Release** is a **platform** event. It is created from a stable platform
release tag (`vX.Y.Z`) and represents a stable platform milestone that users can
adopt.

- **Only stable platform tags become full GitHub Releases.** Pre-release tags
  (`-alpha`/`-beta`/`-rc.N`) may become GitHub *pre-releases*. Engineering, spec,
  and product tags do **not** become GitHub Releases.
- **Products are announced *within* the platform Release.** The Release notes for,
  say, `v2.0.0` name the products it ships and their versions (e.g., "flagship:
  Knowledge Assistant v1.0.0"), and link to each product's own release notes.
- A GitHub Release must be reproducible: its tag points at a commit that builds and
  passes its checks (Principle 6).

> A product does not get its own GitHub Release **while it lives inside AJ-OS**; it
> is delivered as part of the platform Release that ships it, which lists the product
> versions included — for example:
>
> > **AJ-OS Platform v2.0.0** — Included products: **Knowledge Assistant v1.0.0**
>
> This keeps "a Release" meaning exactly one thing. If a product is ever extracted
> into its own repository, it may have its own GitHub Releases *there*; but while
> products live inside AJ-OS, there is one public release.

---

# 9. `package.json` policy

`package.json` holds **exactly one version: the platform version.**

- It is bumped **only** on a platform release, to match the platform release tag.
- It is **never** set to a product version. Products are versioned in their own
  docs and tags (§4, §7).
- Because the repository is a single package today, there is no per-product
  `package.json`, and **no product manifest is introduced now** — the combination of
  product documentation and product tags is sufficient. This is revisited only if
  products ever become independently distributable; at that point a product would
  get its own manifest, never a change to the platform's `package.json`.

> **Guard against regression:** if you find yourself wanting to set
> `package.json`'s version to a product's number, stop — that is the original
> ambiguity returning. The product's version belongs in its release notes and its
> product tag.

---

# 10. CHANGELOG policy

The root `CHANGELOG.md` is the **platform changelog**, following
[Keep a Changelog](https://keepachangelog.com).

- Entries are grouped under **platform versions** (`## [2.0.0] - YYYY-MM-DD`), with
  an `## [Unreleased]` section at the top for work not yet released.
- **Products are recorded within the platform version that ships them.** The
  `[2.0.0]` entry notes the products delivered and their versions; the *detailed*
  product release notes live in the product's own
  `implementation/products/<product>/release/vX.Y.Z.md`.
- **Released entries are immutable.** Once a version is released, its changelog
  section is history and is not rewritten.
- Every released changelog version corresponds to a platform release tag and a
  GitHub Release.

---

# 11. Release workflow

The standard gate for cutting a **platform release**. (Product-only changes that do
not warrant a platform release follow the same spirit at the product level: update
the product's release notes and create its product tag.)

1. **Decide the version bump** (MAJOR / MINOR / PATCH) per §3, and whether a
   pre-release (`-rc.N`) cycle is warranted.
2. **Update the CHANGELOG** — promote `[Unreleased]` to the new version with a date;
   record the products shipped and their versions (§10).
3. **Confirm product versions and release notes** are current for anything the
   release ships (§4).
4. **Bump `package.json`** to the new platform version (§9).
5. **Verify reproducibility** — build, type-check, run the full test suite, and
   check documentation links. Nothing ships red (Principle 6).
6. **Tag the platform release** — `vX.Y.Z` (§7).
7. **Create the GitHub Release** from that tag, announcing the products it ships
   (§8).
8. **Create any product release tags** — e.g., `knowledge-assistant-v1.0.0` (§7).

Engineering and specification checkpoints (§5, §6) are created as work progresses
and are independent of this workflow.

---

# 12. Examples (grounded in this repository)

### The platform line (real tags)

```text
v0.5.0-alpha     pre-release   Initial AJ-OS experiments
v0.7.0-alpha     pre-release   Repository improvements
v0.9.5-design    checkpoint    Architecture and product design
v1.0.0           RELEASE       Final release of the original AJ-OS architecture
v2.0-foundation  checkpoint    Beginning of the AJ-OS v2 architecture (NOT a release)
v2.0.0           RELEASE       First release of the new reusable platform  ← next
```

`v2.0.0` is the first release of the `2.x` line — a beginning, not a claim of
completeness. The platform matures onward across `v2.1.0`, `v2.2.0`, …

### Products (versioned independently)

```text
Knowledge Assistant        v1.0.0    first product, shipped within platform v2.0.0
Future Workflow Assistant  v1.0.0    (illustrative) its own maturity, its own cadence
Future Learning Assistant  v0.1.0    (illustrative) pre-stable, on the same platform
```

### How they coexist without ambiguity

At the moment the platform reaches `v2.0.0`, the tags present look like:

```text
v2.0.0                       ← platform release  (→ GitHub Release, package.json = 2.0.0)
knowledge-assistant-v1.0.0   ← product release   (announced within the v2.0.0 Release)
v2.0-foundation              ← engineering checkpoint (not a release)
spec-002-m4                  ← specification milestone (not a release)
```

There is no collision: the platform owns bare `vX.Y.Z`, products are slug-prefixed,
and checkpoints carry a distinguishing suffix or `spec-` prefix. A reader can tell,
from the tag name alone, exactly what kind of thing it marks — and `package.json`
plus the GitHub Release together state the one platform version unambiguously.

### Historical tags are interpreted, not rewritten

The tags that already exist are **history**. This policy governs *future* releases;
it does **not** retroactively normalize earlier tags. `v0.5.0-alpha` and
`v0.7.0-alpha` remain historical pre-releases; `v0.9.5-design` and `v2.0-foundation`
remain historical engineering checkpoints. They are *read* according to the
conventions above, but they are never renamed, moved, or deleted to fit them.
History is added to, not rewritten (Principle 7: the release history is itself part
of the record).

---

# Future evolution

This governance document is intentionally expected to **evolve slowly**. It defines
long-term policy, not current implementation, so changes to it should be **uncommon**
and should happen only when **AJ-OS itself changes how it is developed or released**
— for example, if products were ever extracted into their own repositories, or if
the platform adopted a fundamentally different distribution model.

Day-to-day work does not change this document. Routine releases, new products, and
new specifications all happen *within* the policy described here. If you find
yourself wanting to edit this document to make a single release work, that is a
signal to reconsider the release, not the policy.

---

# Adoption

Once adopted, this document is the canonical reference for versioning and releases
across AJ-OS. The root `README.md` and `CONTRIBUTING.md` should point to it, and the
remaining AJ-OS Platform v2.0.0 repository updates (CHANGELOG, `package.json`,
README, ROADMAP, product tags) should conform to it.
