# EOS-D9 — The Composition Root Exposes the `TriggerSource`; Session Construction Stays Out of the CLI

> **Status:** Accepted
>
> **Specification:** SPEC-003
>
> **Implementation Package:** SPEC-003 — End-of-Session Workflow
>
> **Related Task(s):** EOS-407 (implements the return shape), EOS-408 (the CLI consumer),
> EOS-406 (`run(context)`), EOS-006 (the `TriggerSource` seam)
>
> **Date:** 2026-07-16

---

# Purpose

The workflow's frozen entry point is `run(context: SessionContext)`, so **something upstream
must produce a `SessionContext`** — and its `project`, `repository`, and `branch` fields are
all required and non-empty. Meanwhile PIPELINE-ARCHITECTURE lists the `TriggerSource` under
*Pipeline Ownership*, inside the workflow. This decision resolves that tension: it fixes
**who invokes the trigger** and **what the composition root returns**.

---

# Context

- The frozen plan pulls two ways. *Public Entry Point*: "`run(context: SessionContext) :
  Promise<SessionReport>`". *Pipeline Ownership*: `EndOfSessionWorkflow ├── TriggerSource
  (manual)`. Both cannot be literally true: if the workflow owned and invoked the trigger,
  `run` would need no argument.
- `SessionContext` requires `project`, `repository`, and `branch` (all `.min(1)`).
  **`branch` is only knowable by reading git** — so whoever builds the context needs git
  access.
- The `TriggerSource` seam was designed for this: "it reads no config or environment beyond
  the input it is given; **wiring (reading `AjConfig` / CLI args) belongs to the composition
  root (M5)**" (`createManualTriggerSource` docstring).
- The platform's thin-CLI pattern is established and explicit: `wikiBuildCommand` "loads
  configuration, asks the composition root for a ready-to-run pipeline, runs it, and prints
  the report. All wiring lives in `createKnowledgePipeline`… **This command performs no
  git**."
- The frozen plan states the composition root "returns `{ workflow, store }`".

---

# Decision

1. **The composition root builds the `TriggerSource` and exposes it**, returning
   **`{ workflow, store, trigger }`** — an additive extension of the frozen
   `{ workflow, store }`.
2. **The CLI does not construct a session and does not touch git.** It calls:

   ```ts
   const { workflow, trigger } = await createEndOfSessionWorkflow(config, { since, notes });
   const context = await trigger.createContext();
   const report  = await workflow.run(context);
   ```

3. **The composition root resolves the context's inputs**, because it is the only component
   that holds every source at once:
   - `branch` — from the `GitPort` (EOS-D7), the same seam every other git read uses;
   - `repository` — the resolved `repositoryPath` (default `process.cwd()`, injectable);
   - `project` — its basename;
   - `sessionNotes` — the CLI's `--notes`, passed through untouched.
4. **`run(context)` is unchanged** — the frozen public entry point keeps its signature. The
   workflow **owns the trigger's `kind`** (stamped onto the `Session` via EOS-402) but
   **never invokes a trigger**: producing a context is upstream of the run.
5. **No `AjConfig` key is added for `project` or `repository`.** Nothing needs one; adding
   one would be speculative (the implementation playbook's "avoid speculative features").
   Revisit if a real requirement appears.

---

# Rationale

- **It keeps git behind one seam.** The alternative puts a git read in the CLI — duplicating
  what EOS-D7's port already provides and breaking the thin-CLI pattern that `wikiBuildCommand`
  establishes. Git access should have exactly one home in SPEC-003.
- **It honours "the workflow owns the trigger" without contradicting `run(context)`.** The
  workflow's *composition* owns the trigger; the *engine* does not invoke it. That is the
  reading under which both frozen statements are true.
- **It matches the seam's documented design.** `createManualTriggerSource` explicitly defers
  wiring to the composition root. This decision is that deferral being honoured, not a new
  design.
- **It keeps future triggers additive.** A git-hook, scheduled, or n8n trigger becomes a
  different `TriggerSource` built in the composition root. The CLI, `run`, and every
  downstream stage are untouched — exactly the extensibility the seam exists for.
- **The cost is the smallest available.** Extending a *return shape* is additive and
  compile-checked; changing the *entry point* (Option C) or the *CLI's responsibilities*
  (Option B) is not.

---

# Alternatives Considered

## Option A (selected) — The root returns `{ workflow, store, trigger }`

Selected — the CLI stays thin and git-free, `run(context)` stays frozen, git stays behind one
seam, and future triggers stay additive. Cost: an additive change to a frozen return shape.

## Option B — The CLI builds the trigger itself

Description: the CLI assembles the `SessionContext` and calls `createManualTriggerSource`
directly; the root keeps `{ workflow, store }`.

Pros
- No change to the frozen return shape.

Cons
- The CLI must resolve `branch` — i.e. **call git from the CLI**, breaking the thin-CLI
  pattern and duplicating the EOS-D7 port.
- Composition logic (repository path, project derivation) migrates into an entry point,
  contradicting `createManualTriggerSource`'s own docstring.
- Every future entry point (git hook, n8n, IDE) would re-implement the same resolution.

Rejected: it preserves a return-shape literal by relocating responsibility to the wrong
layer.

## Option C — `run()` invokes the trigger internally (no argument)

Pros
- Matches *Pipeline Ownership* most literally.

Cons
- Changes the **frozen public entry point** `run(context)` — a materially heavier change than
  a return shape.
- Makes the workflow untestable with an arbitrary context; every test would need a trigger.
- Couples the engine to *when* a session ends, which is precisely what the trigger seam
  exists to decouple.

Rejected.

---

# Consequences

## Positive

- One home for git access; the CLI performs none.
- `run(context)` — the frozen entry point and the module's documented public surface — is
  unchanged.
- Future triggers plug in at the composition root without touching the CLI, `run`, or any
  stage.
- The trigger's `kind` reaches the `Session` (EOS-D3) without the engine invoking a trigger.

## Trade-offs

- **The frozen `{ workflow, store }` return grows a third member.** Additive and
  compile-checked; the frozen plan's intent (the root hands back everything an entry point
  needs) is preserved. Named here so the divergence from PIPELINE-ARCHITECTURE's literal text
  is deliberate and documented, and PIPELINE-ARCHITECTURE is updated to match.
- **`project` = the repository directory's basename** is a convention, not a configured fact.
  Accepted for v1: it is honest, needs no new config, and matches the manual trigger's own
  example usage. If it proves wrong, the fix is a real requirement away.

---

# Impact

## Affected Tasks

- **EOS-407** — builds the trigger, resolves the context inputs, returns
  `{ workflow, store, trigger }`.
- **EOS-408** — obtains the context from the trigger; performs no git.
- **EOS-406** — `run(context)` unchanged; stamps `trigger.trigger` onto the session via
  EOS-402.
- **EOS-401 / EOS-D7** — supplies the `branch()` read this decision depends on.

## Affected Components

- `src/end-of-session/composition/createEndOfSessionWorkflow.ts`, `src/cli/commands/session.ts`.

## Documentation Requiring Updates

- **PIPELINE-ARCHITECTURE** (*Pipeline Ownership* + *Public Entry Point*: the root returns
  `{ workflow, store, trigger }`; the workflow owns the trigger's kind but does not invoke
  it), MILESTONES (M5), EOS-407, EOS-408.

---

# Validation

- EOS-407: composition builds the trigger; `trigger.createContext()` yields a validated
  `SessionContext` whose `branch` matches the fixture repo's real branch and whose `notes`
  round-trip from `--notes`.
- EOS-408: the command file contains **no git and no filesystem access** (a review check);
  options pass through untouched.
- EOS-409: a real composed run over a fixture repo produces a context whose `branch`/`project`
  reflect the fixture, end to end.
- Revisited when a second `TriggerSource` is implemented: confirm it plugs into the
  composition root with no CLI, `run`, or stage change — the property EOS-D3 and EOS-006
  promise.

---

# Future Review

- Revisit when a **non-CLI trigger** (git hook, scheduled, n8n) is implemented: confirm the
  root can build the right trigger without a shape change, and that `project`/`repository`
  resolution still holds outside an interactive shell (where `process.cwd()` may not be the
  repository).

---

# Related Documents

Architecture
- PIPELINE-ARCHITECTURE.md (*Trigger* stage, *Pipeline Ownership*, *Public Entry Point*),
  docs/architecture/CONTRACTS.md (`SessionContext` row)

Standards
- AJS-004 (single responsibility), AJS-005 (workflow orchestration), AJS-007 §7.2

Decisions
- EOS-D3 (trigger is session metadata; identity independent of trigger source), EOS-D7 (the
  single git seam this depends on)

Specifications
- SPEC-003 §6 (Triggers), §7 (Inputs), §9.1 (Detect trigger), §14 (Configuration)

Implementation Tasks
- EOS-407, EOS-408, EOS-406, EOS-402, EOS-006

---

# Change Log

| Date | Version | Description |
| ---- | ------- | ----------- |
| 2026-07-16 | 1.0 | Decision created and **Accepted** at the M5 Planning Review (reviewer: AJ). Resolves the frozen plan's tension between `run(context)` (which needs an upstream `SessionContext`) and *Pipeline Ownership* (which places `TriggerSource` inside the workflow): the composition root builds the trigger and returns `{ workflow, store, trigger }` (additive to the frozen `{ workflow, store }`), resolving `branch` via the EOS-D7 git seam and `repository`/`project` from the injected `repositoryPath`. The CLI performs **no git** and constructs no session; `run(context)` is unchanged; the workflow owns the trigger's kind but never invokes it. Keeps future triggers additive at the composition root. Ratified under AJS-007 §7.2. |

---

> **Engineering Rule**
>
> The composition root resolves the world; the CLI takes input and prints output. If the entry
> point needs git, the wiring is in the wrong place.
</content>
