# SPEC-006 — Source Connector

**Specification ID:** SPEC-006 **Version:** 1.0 **Status:** Draft
**Owner:** AJ-OS **Related Standards:** AJS-003, AJS-004 **Related
Specifications:** SPEC-005, SPEC-007 **Related Architecture:** ARCH-002
**Related Decisions:** ADR-002 **Last Updated:** 2026-07-11

---

# 1. Overview

## Purpose

Define the contract by which AJ-OS reads knowledge sources. A Source
Connector enumerates and reads documents from a backend and normalizes
each into a `SourceRecord`, so that the Wiki Generator (SPEC-005) never
depends on any specific source technology.

## Scope

Begins at a configured source backend and ends with a stream of normalized
`SourceRecord`s. Covers enumeration, reading, and normalization.

## Goals

- Make source ingestion **backend-agnostic**.
- Provide stable, normalized records with provenance and content hashes.
- Allow new backends (Notion, Git, Jira) to be added without changing the
  generator.

## Non-Goals

- Compile knowledge or write wiki pages (SPEC-005 / SPEC-007).
- Modify source content.
- Decide what is canonical (AJS-003 / SPEC-004).

---

# 2. Functional Requirements

A Source Connector SHALL:

1. Enumerate the documents available in its configured backend.
2. Read a document's content on demand.
3. Normalize each document into a `SourceRecord` with a stable `id`, a
   `uri`, plain-text/Markdown `content`, a `hash`, and `metadata`.
4. Assign an `id` that is **stable across content changes** (so an edit is
   detected as *modified*, not as remove+add) and **globally namespaced by
   connector** (`<connector>:<connector-local-id>`) so connectors cannot
   collide.
5. Compute a `hash` from content as a **separate** change signal (identity
   and change-detection are distinct fields).
6. For the filesystem/Handbook connector: **one Markdown file = one
   `SourceRecord`**; `id = handbook:<relative-path>`; `hash =` content
   hash.
7. Resolve all backend-specific concerns (formats, block models, auth)
   internally, so records are uniform regardless of backend.

---

# 3. Non-Functional Requirements

- **Uniform output** — records are indistinguishable by backend at the
  consumer.
- **Deterministic ids/hashes** — the same document yields the same id and,
  if unchanged, the same hash.
- **Read-only** — connectors never mutate their backend.
- **Composable** — multiple connectors can feed one generation run.
- **Testable** — a filesystem connector can target a fixture directory.

---

# 4. User Stories

- As the Wiki Generator, I want normalized records so I can compile
  knowledge without knowing where it came from.
- As AJ, I want to add a Notion or Git source later without touching the
  generator.

---

# 5. Inputs

Required:

- Backend configuration (e.g. a set of source paths for the filesystem
  connector).

Optional:

- Include/exclude filters.
- Since-hash / changed-only selection.

Validation:

- Source locations must be readable.
- A connector's sources must not overlap the wiki **destination**
  (`destination ∉ sources`, enforced at generation config level — see
  SPEC-005 §7).

---

# 6. Outputs

- A stream/collection of `SourceRecord`s.

**`SourceRecord` (conceptual — fields, not a signature):**

| Field | Meaning |
|---|---|
| `id` | Stable, globally-namespaced identity (`<connector>:<local-id>`); unchanged across content edits. Handbook: `handbook:<relative-path>`. |
| `uri` | Where it came from (path / URL / backend reference). |
| `content` | Normalized plain-text / Markdown body. |
| `hash` | Content hash — the change signal; distinct from `id`. |
| `metadata` | Backend-neutral attributes (title, tags, timestamps, source kind). |

A rename changes the path and therefore reads as remove + add; RECONCILE
(SPEC-005) handles the re-evaluation. Rename-stable identity (e.g. a
frontmatter id) is a future enhancement.

The concrete interface signature is defined in the contracts step; this
SPEC fixes the responsibilities and record shape only.

---

# 7. Workflow

1. Initialize connector from configuration.
2. Enumerate documents.
3. For each document: read → normalize → compute hash → emit
   `SourceRecord`.
4. Optionally filter to changed records (by hash).

---

# 8. Agent / Component Responsibilities

- Enumerate, read, and normalize.
- Own all backend-specific logic.

Not responsible for: compilation, persistence, change *policy* (the
generator decides what to do with changed records), or version control.

---

# 9. Data Flow

```text
Backend (filesystem today; Notion/Git/Jira later)
      │  enumerate + read
      ▼
Normalization  (→ id, uri, content, hash, metadata)
      ▼
SourceRecord[]  →  Wiki Generator (SPEC-005)
```

---

# 10. Configuration

- Backend type and location(s).
- Filters (include/exclude, changed-only).
- Normalization options (where applicable).

Current configuration:

```jsonc
{
  "wiki": {
    "sources":     ["../../handbook/foundation", "../../handbook/library"],
    "destination": "../../handbook/wiki"
  }
}
```

---

# 11. Error Handling

Recoverable:

- Unreadable/parse-failing document → skip + report.

Fatal:

- Backend unavailable or misconfigured.

---

# 12. Logging & Observability

Record:

- Documents enumerated / normalized / skipped.
- Hash summary.
- Errors.

---

# 13. Testing Strategy

Unit:

- Enumeration, normalization, hashing.

Integration:

- Filesystem connector over a fixture vault yields stable records; an
  unchanged document produces an unchanged hash.

Acceptance:

- Records are backend-uniform.
- No backend mutation occurs.

---

# 14. Acceptance Criteria

- [ ] Filesystem/Markdown connector emits normalized `SourceRecord`s.
- [ ] Content hashes are stable and detect changes.
- [ ] The generator consumes records without backend-specific branching.
- [ ] Adding a new backend requires no change to SPEC-005.

---

# 15. Invariants

1. Records are uniform across backends; the generator never branches on
   source type.
2. Connectors are read-only.
3. All backend-specific concerns resolve inside the connector.
4. `id` is stable across content edits and globally namespaced; `hash` is
   a separate change signal.

---

# 16. Future Enhancements

- Notion, Git repository, and Jira connectors.
- Incremental / streaming enumeration for large backends.
- Rich metadata extraction (authors, relationships).

---

# 17. Notes

The Source Connector is the seam that keeps the Wiki Generator
source-agnostic (ADR-002). Only the filesystem/Markdown connector is
planned initially; other backends are added behind the same contract when
a real need exists.
