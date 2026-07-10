# PRODUCT-001 — Knowledge Assistant

**Status:** Version 1.0.0 · As-Built Documentation Set
**Owner:** AJ
**Category:** Product Engineering — Index

---

# What PRODUCT-001 is

The **Knowledge Assistant** is the first complete product built on AJ-OS. It lets
you ask natural-language questions about a configured handbook and get answers
grounded in that handbook's generated wiki, each with citations to the exact
articles behind it. You use it through one command: `aj ask`.

```bash
aj ask "How does the Context Builder work?"
```

Underneath, a thin CLI launches the product, which composes six independent
platform capabilities into a single pipeline: **config → handbook → retrieval →
context → prompt → AI → cited answer.** The lasting outcome of this product is not
just `aj ask` — it is the reusable platform and architecture underneath it.

---

# Version status

- **Version:** 1.0.0 — first stable release.
- **Tests:** 243 passing across 21 files (~2.1s).
- **Interface:** CLI (`aj ask`), interactive and one-shot.
- **Known issues:** the interactive banner still prints "Version 0.1" (cosmetic);
  the Context Builder configuration the product passes is not yet honored. Both are
  documented in the [release notes](./release/v1.0.0.md).

---

# This folder

This folder is the **as-built engineering record** for PRODUCT-001 — the *how it
was actually built, why, and what was learned*. It is not the product's
specification (see [below](#relationship-to-the-specifications)) and not the
repository-wide documentation (see [below](#relationship-to-the-aj-os-repository)).

Everything here is navigation. Each document is self-contained; this README only
helps you find the right one.

---

# Documentation map

Organized by who you are and what you want.

### For users
- [usage.md](./usage.md) — the Version 1.0 user manual: install, configure, and run
  `aj ask`. Start here if you just want to use the product.

### For maintainers
- [architecture.md](./architecture.md) — the structural map: layers, dependency
  direction, the canonical diagram, and the invariants.
- [system-walkthrough.md](./system-walkthrough.md) — a guided tour following one
  question from command to cited answer.

### For contributors
- [testing.md](./testing.md) — the testing philosophy and how the suite is built.
- [decisions.md](./decisions.md) — the architecture decision record (KA-AD-01…10),
  with an honest verdict on each.

### For understanding the project
- [engineering-decisions.md](./engineering-decisions.md) — the chronological
  engineering journal: how the product actually evolved.
- [architecture-timeline.md](./architecture-timeline.md) — the canonical one-page
  history (idea → v1.0).
- [lessons-learned.md](./lessons-learned.md) — the honest retrospective.

### For future portfolio work
- [case-study-notes.md](./case-study-notes.md) — the raw engineering notebook and
  story index (informal, first-person).

### For release history
- [release/](./release/) — release notes, one file per version.
  Current: [v1.0.0](./release/v1.0.0.md).

---

# Recommended reading paths

Pick the path that matches your goal:

- **"I want to use the product."**
  [usage.md](./usage.md) → (if curious) [release/v1.0.0.md](./release/v1.0.0.md).

- **"I want to understand the architecture."**
  [architecture.md](./architecture.md) → [system-walkthrough.md](./system-walkthrough.md)
  → [decisions.md](./decisions.md).

- **"I want to contribute."**
  [architecture.md](./architecture.md) → [testing.md](./testing.md) →
  [decisions.md](./decisions.md).

- **"I want to understand how the project evolved."**
  [architecture-timeline.md](./architecture-timeline.md) →
  [engineering-decisions.md](./engineering-decisions.md) →
  [lessons-learned.md](./lessons-learned.md).

- **"I want the stories behind it."**
  [case-study-notes.md](./case-study-notes.md) (which links back into all of the
  above).

---

# Relationship to the specifications

The **specifications** describe the *intended* product — what it should do and how
it should behave. They live at
[docs/specifications/products/](../../../docs/specifications/products/):

- [Product spec](../../../docs/specifications/products/PRODUCT-001-knowledge-assistant.md)
  · [Principles](../../../docs/specifications/products/PRODUCT-001-principles.md)
  · [User Flows](../../../docs/specifications/products/PRODUCT-001-user-flows.md)
  · [Roadmap](../../../docs/specifications/products/PRODUCT-001-roadmap.md)

The specs are the authority on *intent*. **This folder documents the *implemented*
Version 1.0** — the authority on *what was actually built*. Where the two differ,
the implementation (and this record) reflects reality; the specs reflect the goal.

The implementation *plan* — the milestone breakdown the build followed — is at
[implementation/products/PRODUCT-001-implementation.md](../PRODUCT-001-implementation.md).

---

# Relationship to the AJ-OS repository

This folder documents **PRODUCT-001 only**. Repository-wide documentation lives at
the project root and in `docs/`:

- Root [README](../../../README.md), [CHANGELOG](../../../CHANGELOG.md), and
  [ROADMAP](../../../ROADMAP.md) — the whole AJ-OS project.
- [docs/architecture/](../../../docs/architecture/),
  [docs/standards/](../../../docs/standards/), and
  [docs/adr/](../../../docs/adr/) — platform-wide architecture, standards, and
  decisions.

If you are looking for how the *platform* or the *repository* works, start there.
If you are looking for how the *Knowledge Assistant* works, you are in the right
place.
