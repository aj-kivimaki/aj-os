# SPEC-007 — Wiki Store

**Specification ID:** SPEC-007 **Version:** 1.0 **Status:** Draft
**Owner:** AJ-OS **Related Standards:** AJS-002, AJS-003, AJS-005
**Related Specifications:** SPEC-002, SPEC-005 **Related Architecture:**
ARCH-002 **Related Decisions:** ADR-002 **Last Updated:** 2026-07-13

---

# 1. Overview

## Purpose

Define the contract for reading and writing wiki pages. The Wiki Store
abstracts **where** the wiki is stored, so producers (SPEC-005) and
consumers (Retrieval, SPEC-002) never touch raw filesystem paths.

## Scope

Covers persistence of the wiki artifact: locating it, reading pages and
the index, writing/deleting pages, and appending to the generation log.

## Goals

- Provide one stable interface for all wiki reads and writes.
- Decouple every caller from the wiki's physical location.
- Keep persistence **free of version-control concerns**.

## Non-Goals

- Compile knowledge (SPEC-005).
- Retrieve/rank for queries (AJS-002 / Retrieval).
- Perform git operations or decide commit policy (AJS-005 /
  orchestration).

---

# 2. Functional Requirements

The Wiki Store SHALL:

1. Locate the wiki at the configured destination and validate its
   structure.
2. Read an entry by wiki-relative path, and list entries by prefix
   (consumer + producer side).
3. Write and delete entries by path (producer side).
4. Append entries to the generation log.
5. Confine all writes to the configured destination (path-guarded).

The store is a **generic path-keyed Markdown blob store**: pages, the
index, the reverse (provenance) index, and the log are all just
path-keyed *entries*. The store does **not** parse frontmatter or
understand page structure — that knowledge lives in the Wiki Generator.

Operations:

- `locate`, `read(path)`, `list(prefix?)`
- `write(path, content)`, `delete(path)`, `removeTree(path)`, `appendLog(entry)`

There is **no `commit()`** — version control is out of scope. `delete`
(single entry) and `removeTree` (a file or a whole subtree, recursively)
exist for orchestration/maintenance — e.g. `aj wiki build --rebuild`
resetting generator-owned outputs; the headless generator never calls
either (SPEC-005). Both are path-guarded to the destination and idempotent.

---

# 3. Non-Functional Requirements

- **Persistence-only** — no knowledge of git or workflow.
- **Location-transparent** — callers depend on the interface, not paths.
- **Path-safe** — writes cannot escape the destination
  (`realpath`-resolved, no traversal).
- **Consistent** — reads reflect prior writes within a run.
- **Testable** — can target a fixture destination.

---

# 4. User Stories

- As the Wiki Generator, I want to persist pages without knowing where the
  wiki lives or how it is versioned.
- As Retrieval, I want to read pages and the index through one stable
  interface.
- As AJ, I want to relocate the wiki later by changing configuration only.

---

# 5. Inputs

Required:

- Destination configuration (currently `handbook/wiki/`).

Optional:

- Structure/validation options.

Validation:

- Destination must exist and be writable for producer use; readable for
  consumer use.
- Destination must not overlap any configured **source** (enforced at
  generation config, SPEC-005 §7).

---

# 6. Outputs

- Persisted wiki pages and log entries at the destination.
- Page/index content for consumers.

The store produces **no commits** and no version-control side effects.

---

# 7. Workflow

**Read path (consumers):** locate → read index → read page(s).

**Write path (generator):** locate → write/delete page(s) → append log.

Committing (if any) happens later, in orchestration, over the files the
store persisted.

---

# 8. Component Responsibilities

- Locate, validate, read, write, delete, append-log.
- Enforce the destination boundary.

Not responsible for: compilation, retrieval ranking, or version control.

---

# 9. Data Flow

```text
Wiki Generator ──write/appendLog────▶ Wiki Store ──▶ handbook/wiki/
Retrieval      ──read/list──────────▶ Wiki Store ──▶ handbook/wiki/
Orchestration  ──(reads files, commits/deletes separately)──▶ git
```

---

# 10. Configuration

- Destination location (single source of truth for where the wiki lives).
- Structure expectations (e.g. `index.md`, subdirectories `sources/`,
  `entities/`, `concepts/`).

---

# 11. Error Handling

Recoverable:

- Missing page on read → not-found result.
- Missing optional structure → report + continue where safe.

Fatal:

- Destination unavailable or not writable (producer).
- Attempted write outside the destination → rejected.

---

# 12. Logging & Observability

Record:

- Pages read / written / deleted.
- Log appends.
- Path-guard rejections and errors.

---

# 13. Testing Strategy

Unit:

- Locate/validate; read/write/delete; append-log.
- Path-guard rejects traversal outside the destination.

Integration:

- Round-trip write-then-read against a fixture destination.
- Relocating the destination via config changes nothing for callers.

Acceptance:

- All wiki I/O flows through the store.
- No git side effects occur.

---

# 14. Acceptance Criteria

- [ ] Reader and writer operations behave against a configured
      destination.
- [ ] Writes are confined to the destination (path-guarded).
- [ ] No `commit()` / git behavior exists in the store.
- [ ] Retrieval and the Generator use the store, not raw paths.

---

# 15. Invariants

1. Persistence only — the store never performs version control.
2. All wiki reads/writes go through the store; no caller uses raw paths.
3. Writes never escape the configured destination.

---

# 16. Future Enhancements

- Alternative destination backends (e.g. object storage) behind the same
  interface.
- Transactional / batched writes.
- Read caching for retrieval.

---

# 17. Notes

Splitting persistence (this SPEC) from version control (AJS-005) is a
deliberate single-responsibility boundary from ADR-002: the store writes
files; orchestration decides whether and when to commit them.
