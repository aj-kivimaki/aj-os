# Decision: CB-003 Context Package Contract

> **Task:** CB-003 — Define Context Package Contract
> **Date:** 2026-07-07
> **Status:** Accepted

---

## Context

CB-003 defines the Context Builder's canonical output — the **Context Package**
— as a stable, immutable data contract that future milestones populate but never
redesign. The task requires the package to be immutable, self-contained,
explainable, deterministic and portable (independent of output format), using
Zod for runtime validation and inferred TypeScript types. It explicitly excludes
collection, ranking, token estimation, assembly and rendering, and forbids
provider-specific fields, implementation-specific metadata, filesystem paths,
ranking information, token calculations and transport concerns.

The canonical structure is AJS-002 Appendix B (Metadata + 12 required sections +
optional sections + validation). CB-003 restates the high-level shape as
`Metadata · Context Sections · References · Explainability · Summary`. Appendix B
is written as a `Context.md` document schema; CB-003 requires a *portable*
structure, so the markdown-oriented appendix had to be reified into a
serialization-independent contract. Several shape choices were open and are
recorded here.

## Decision

1. **Top level mirrors CB-003 exactly.** The package is
   `{ metadata, sections, references, explainability, summary }` — the five
   elements named by the task — and the Zod object is `.strict()`.

2. **Metadata = Appendix B metadata.** `contextVersion`, `generatedAt`
   (ISO-8601), `project`, `task`, `contextBuilderVersion` are required;
   `branch`/`commit` are optional (SPEC-002 §7 optional inputs).

3. **Sections are an ordered array with a canonical `kind` enum.** Each
   `ContextSection` is `{ kind, title, content, referenceIds }`. `kind` is one of
   the 12 canonical Appendix B section identifiers (`SECTION_KINDS`). Bodies are
   carried as an opaque `content` string so the contract is portable — rendering
   to markdown/JSON is a later (M4) concern. Composition (an array of small,
   uniform section records) is preferred over a rigid fixed-field object, which
   would force every section to be present even when empty.

4. **References are first-class, typed knowledge sources.** `SourceReference` is
   `{ id, type, title, locator? }`; `type` enumerates the AJS-002 knowledge
   *source categories* (`REFERENCE_TYPES` — specification, standard, architecture,
   project-documentation, handbook, wiki, source-code, adr, git-history). These
   are source *kinds*, not provider identities, so they are provider-agnostic.

5. **Explainability is score-free.** `{ summary, entries: { referenceId, reason }[] }`.
   It links selection *reasons* to references without ranking scores or token
   counts, which the task excludes from the contract (they belong to M5).

6. **Immutable at runtime and in types.** `parseContextPackage()` validates then
   **deep-freezes**; `ContextPackage` is `DeepReadonly<z.infer<…>>`. This is the
   deep analog of CB-002's `Object.freeze` + `Readonly<>`, appropriate because
   the package is nested.

7. **Structural invariants enforce the standard's principles.** A `superRefine`
   enforces unique reference ids, unique section kinds, and referential integrity
   (every `referenceId` in a section or explainability entry resolves to a
   declared reference). This makes *Self-Contained* and *Explainable* checkable
   invariants of the contract rather than conventions.

## Rationale

- Reifying Appendix B into a structured contract (rather than a markdown blob)
  satisfies *Portable* — "the package contract is independent of output format" —
  and lets M4 own rendering without touching the contract.
- An array of `{ kind, … }` sections keeps the public API minimal and additive:
  optional Appendix B sections can be introduced later by extending the enum,
  without reshaping the type.
- Typed references + reference links are what make traceability a property of the
  data, directly serving the *Explainable* principle.
- Deep-freeze + `DeepReadonly` gives a single, drift-free immutability guarantee
  observable at runtime (verified in the smoke test), consistent with CB-002.

## Consequences

- Consumers build packages through the typed contract and validate with
  `parseContextPackage()`; dangling references and duplicate ids/kinds fail
  loudly, which strengthens the "invalid package fails validation" criterion.
- Optional Appendix B sections (recent commits, related ADRs, API contracts, …)
  are a future **additive** extension of `SECTION_KINDS`, owned by the task that
  needs them — not pre-added speculatively here.
- Rendering, ranking and token estimation remain entirely outside the contract.

## File-path interpretation (flagged)

CB-003 says "avoid filesystem paths," yet Appendix B **requires** a "Files Likely
to Change" section and lists `source-code` as a knowledge source. Reconciliation:
**file references are domain content, not implementation paths.** Section bodies
stay opaque `content` strings, and `SourceReference.locator` is an *optional
logical* pointer (e.g. `"AJS-002 §6"`, a repo-relative file) — never an absolute
path or provider/transport internal. The contract therefore excludes
*implementation* filesystem/provider details while still satisfying Appendix B's
self-containment. This is an interpretation, not a redesign of the contract.

## Alternatives Considered

- **Fixed-field sections** (`objective`, `constraints`, … as named object keys) —
  matches Appendix B literally but is rigid (all fields always present, harder to
  extend with optional sections) and couples the type to the exact section list.
  Rejected in favour of the `kind`-tagged array.
- **Markdown string as the package** — trivially matches `Context.md` but
  violates *Portable* and pushes structure into free text, defeating validation
  and explainability. Rejected.
- **Embedding ranking scores / token counts in explainability** — convenient for
  M5 but explicitly excluded by CB-003 and would bake implementation concerns
  into the contract. Rejected; explainability stays score-free.
- **Shallow freeze only** (as literally in CB-002) — insufficient for a nested
  package; nested arrays/objects would remain mutable. Rejected in favour of
  deep-freeze.
