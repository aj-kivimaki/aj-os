# Context Builder

> **Specification:** SPEC-002 — Context Builder Agent
> **Standards:** AJS-001, AJS-002, AJS-003, AJS-004
> **Status:** Knowledge Collection (Milestone M2, in progress)

The Context Builder assembles the smallest, highest-value **Context Package**
required for a coding agent to complete a single task. It is the primary bridge
between AJ-OS knowledge and implementation.

The implementation is deterministic and model-agnostic. Advanced retrieval
techniques (embeddings, semantic search, LLM reranking) are intentionally out
of scope for the initial implementation.

## Public entry point

The module exposes a single public entry point:

```ts
import { createContextBuilder } from "./context-builder/index.js";
```

Internal components are private and are re-exported from `index.ts` only as
they are implemented. Consumers should import from the module entry point, not
from internal files.

## Configuration & factory (CB-002)

The Context Builder is created through a factory. Configuration is validated at
runtime (Zod), frozen, and never mutated afterwards:

```ts
import { createContextBuilder } from "./context-builder/index.js";

const builder = createContextBuilder({
  profile: "implementation", // implementation | debugging | documentation | review | planning
  explainability: true, // produce an explainability report
  outputFormat: "markdown", // markdown | json
});

builder.config.profile; // "implementation" (readonly)
```

The configuration contract is intentionally **minimal, explicit and immutable**:

| Field            | Type                                                                       | Source        |
| ---------------- | -------------------------------------------------------------------------- | ------------- |
| `profile`        | `implementation \| debugging \| documentation \| review \| planning`       | SPEC-002 §6   |
| `explainability` | `boolean`                                                                  | SPEC-002 §8   |
| `outputFormat`   | `markdown \| json`                                                         | SPEC-002 §8   |

- Every field is **required** — there are no hidden defaults.
- The schema is **strict** — unknown keys are rejected.
- Invalid configuration throws a `ZodError`.

Provider configuration, filesystem paths, token budgets and environment
settings are intentionally **excluded** from this contract; they will be
introduced by the tasks that implement those capabilities.

Public exports: `createContextBuilder`, `contextBuilderConfigSchema`,
`parseContextBuilderConfig`, `CONTEXT_PROFILES`, `OUTPUT_FORMATS`, and the types
`ContextBuilder`, `ContextBuilderConfig`, `ContextProfile`, `OutputFormat`.

## Context Package contract (CB-003)

The **Context Package** is the canonical output of the Context Builder and the
primary input to a coding agent. CB-003 defines the *contract only* — its
structure, runtime validation and immutable types. No collection, ranking,
assembly or rendering logic exists yet; future milestones populate the package
without redesigning this contract.

The contract follows AJS-002 Appendix B, modelled as a portable structure
independent of output format:

```text
Context Package
├── metadata        identity & provenance (contextVersion, generatedAt, project,
│                   task, branch?, commit?, contextBuilderVersion)
├── sections        ordered ContextSection[] — { kind, title, content, referenceIds }
├── references      SourceReference[] — { id, type, title, locator? }
├── explainability  { summary, entries: { referenceId, reason }[] }
└── summary         at-a-glance synopsis
```

- `section.kind` is one of the 12 canonical Appendix B section identifiers
  (`SECTION_KINDS`); `reference.type` is one of the AJS-002 knowledge-source
  categories (`REFERENCE_TYPES`).
- Packages are validated with `parseContextPackage(input)`, which returns a
  **deeply-immutable** package (deep `Object.freeze`) or throws a `ZodError`.
- The schema is **strict** and enforces structural invariants: unique reference
  ids, unique section kinds, and referential integrity (every `referenceId`
  resolves to a declared reference — the *Explainable* / *Self-Contained*
  principles).
- The contract is deliberately free of ranking scores, token calculations,
  filesystem/provider internals and transport concerns. `locator` is an optional
  *logical* pointer (e.g. `"AJS-002 §6"`), not an absolute path.

```ts
import { parseContextPackage } from "./context-builder/index.js";

const pkg = parseContextPackage(input); // validated + deeply frozen
pkg.metadata.task; // readonly
```

Public exports: `contextPackageSchema`, `parseContextPackage`, `SECTION_KINDS`,
`REFERENCE_TYPES` (plus the component schemas), and the types `ContextPackage`,
`ContextPackageMetadata`, `ContextSection`, `SourceReference`,
`ContextExplainability`, `ExplainabilityEntry`, `ContextSectionKind`,
`ReferenceType`.

## Knowledge Provider contracts (CB-004)

The provider contracts define **how knowledge enters the platform** — the input
side of the Context Builder. CB-004 defines the *contracts only*: no provider
implementations, registry, collection, ranking or Context Package generation.

Knowledge flows through immutable platform contracts:

```text
KnowledgeRequest → KnowledgeProvider → KnowledgeItem[] → Context Builder → Context Package
```

- **`KnowledgeRequest`** — the immutable, provider-agnostic input handed to every
  provider: `{ project, task, branch?, commit?, issue? }` (SPEC-002 §7). It
  carries only stable locators. The Context Profile and workflow type are
  **excluded** — they are Context Builder *configuration* and drive
  ranking/assembly, which providers must not know about.
- **`KnowledgeItem`** — the canonical unit of knowledge a provider returns:
  `{ id, source, content }`. `source` **reuses the CB-003
  `SourceReference` contract** (`{ id, type, title, locator? }`), so the same
  citable-source shape flows unchanged from a provider into the package's
  references. `content` is opaque body text — providers contribute knowledge,
  not formatted context. There is deliberately **no freeform metadata bag**
  (it would become a provider-specific dumping ground).
- **`KnowledgeProvider`** — the interface every source implements. It extends
  `ProviderMetadata` (`id`, `name`, `description`) and exposes a single method
  `provide(request: KnowledgeRequest): Promise<readonly KnowledgeItem[]>`. One
  immutable request object (never expanding primitive parameters); async so
  future file/API providers fit without a signature change. Providers do **not**
  build packages, rank, format, estimate tokens, or read configuration.

```ts
import {
  parseKnowledgeRequest,
  parseKnowledgeItem,
  type KnowledgeProvider,
} from "./context-builder/index.js";

const request = parseKnowledgeRequest({ project: "aj-os", task: "CB-004" }); // frozen
const item = parseKnowledgeItem({
  id: "k1",
  source: { id: "AJS-002", type: "standard", title: "Context Assembly Standard" },
  content: "…",
}); // validated + deeply frozen
```

- `parseKnowledgeRequest` / `parseKnowledgeItem` validate then freeze (deep), or
  throw a `ZodError`. Every schema is **strict** (unknown keys rejected);
  `content` must be non-empty.
- `providerMetadataSchema` is exported so a future provider registry (CB-005)
  can validate providers without CB-004 implementing any registry behaviour.

Public exports: `knowledgeRequestSchema`, `knowledgeItemSchema`,
`providerMetadataSchema`, `parseKnowledgeRequest`, `parseKnowledgeItem`, and the
types `KnowledgeRequest`, `KnowledgeItem`, `ProviderMetadata`,
`KnowledgeProvider`.

## Provider Registry (CB-005)

The **Provider Registry** is the immutable catalogue of the `KnowledgeProvider`s
available to the Context Builder. Its responsibility is deliberately narrow:

```text
KnowledgeProviders → validation → immutable registry → lookup
```

It does **not** execute, discover, load, configure or rank providers, and it does
not build Context Packages. It follows the same factory-based service pattern as
`createContextBuilder()`:

```ts
import { createProviderRegistry } from "./context-builder/index.js";

const registry = createProviderRegistry([handbookProvider, wikiProvider]);

registry.get("handbook"); // handbookProvider | undefined
registry.providers; // readonly [handbookProvider, wikiProvider]
```

- **Deterministic** — `providers` preserves the caller's insertion order; the
  same input always produces the same registry.
- **Immutable** — the returned handle and its `providers` array are frozen; there
  is no way to add, remove or reorder providers after construction.
- **Validated at construction** — every provider must carry a non-empty string
  `id` (the identifier the registry keys on), and provider `id`s must be unique.
  A missing/empty or duplicate `id` throws an `Error`; the broken catalogue is
  rejected rather than silently built.
- **Provider-agnostic** — the registry knows only a provider's `id`, never its
  implementation details.

The contract is minimal — `providers` (expose) and `get(id)` (retrieve). No
`schema.ts` is introduced: the registry adds no new *data* contract (it composes
the CB-004 `KnowledgeProvider`), so its interface is co-located with its factory,
mirroring `createContextBuilder.ts`.

Public exports: `createProviderRegistry` and the type `ProviderRegistry`.

## Collection Engine (CB-007)

The **Collection Engine** is the platform service that coordinates deterministic
knowledge collection. CB-007 establishes only its *service boundary* — the seam
that later Milestone M2 tasks extend:

```text
ProviderRegistry → createCollectionEngine → immutable service handle
```

The engine is **constructed with** the Provider Registry (CB-005), which it
**holds but does not execute**. It follows the same factory-based service pattern
as `createContextBuilder()` and `createProviderRegistry()`:

```ts
import {
  createProviderRegistry,
  createCollectionEngine,
} from "./context-builder/index.js";

const registry = createProviderRegistry([handbookProvider, wikiProvider]);
const engine = createCollectionEngine(registry);

engine.registry; // the injected registry (held, not executed)
```

- **Composed** — the registry is injected at construction; the engine does not
  own, discover, load, configure or rank providers.
- **Minimal** — the handle exposes only the held `registry`. It carries **no**
  `collect()` method yet: provider execution, `CollectionResult` and
  `CollectionError` are introduced by CB-008…CB-010 through this same interface.
- **Deterministic** — the same registry always yields the same public service.
- **Stateless & immutable** — no mutable runtime state; the returned handle is
  frozen. A missing registry throws an `Error` (fail-fast construction).
- **Platform-oriented** — the engine *coordinates* collection; it is not itself a
  provider.

Like the registry, no `schema.ts` is introduced: the engine adds no new *data*
contract (it composes the CB-005 `ProviderRegistry`), so its interface is
co-located with its factory in `collection/createCollectionEngine.ts`.

Public exports: `createCollectionEngine` and the type `CollectionEngine`.

## Collection Error contract (CB-008)

The **CollectionError** is the deterministic, provider-agnostic representation of
a single knowledge-collection failure. The Context Builder uses a
**partial-collection** model: a single provider failing never aborts collection —
a provider contributes *either* KnowledgeItems *or* a `CollectionError`, and both
travel together in the future `CollectionResult` (CB-009).

`CollectionError` is a **data contract, not a thrown exception**. It carries only
stable platform concepts — never provider-specific exceptions, stack traces,
timestamps or runtime objects. Error *representation* lives here; error *handling*
(retry, recovery, logging) does not.

```text
provider fails → CollectionError { id, providerId, category, message } → CollectionResult (CB-009)
```

- **`id`** — a stable identifier for the failure.
- **`providerId`** — the provider that failed to contribute (the platform knows
  only a provider's `id`, never its implementation).
- **`category`** — a deterministic, provider-agnostic failure category from the
  closed `FAILURE_CATEGORIES` set: `invalid-request` (the request was not valid
  for the provider), `provider-unavailable` (the source could not be reached or
  read), `provider-error` (an unexpected provider failure). Grounded in
  SPEC-002 §15 and AJS-004 "Failure Handling". A provider that simply finds
  nothing is **not** an error — it contributes an empty set of items.
- **`message`** — a human-readable description (never a stack trace).

```ts
import { parseCollectionError } from "./context-builder/index.js";

const error = parseCollectionError({
  id: "err-1",
  providerId: "handbook",
  category: "provider-unavailable",
  message: "The handbook source could not be read.",
}); // validated + deeply frozen
```

- `parseCollectionError(input)` validates then **deep-freezes** (immutable after
  creation), or throws a `ZodError`. The schema is **strict** (unknown keys, e.g.
  a leaked `stack`, are rejected) and `category` is a closed `z.enum`, so
  providers cannot leak implementation-specific error codes into the contract.
- `collectionErrorSchema` is exported so the CB-009 `CollectionResult` can embed
  the contract without CB-008 implementing any collection behaviour.

Public exports: `collectionErrorSchema`, `parseCollectionError`,
`FAILURE_CATEGORIES`, and the types `CollectionError`, `FailureCategory`.

## CollectionResult contract (CB-009)

The **CollectionResult** is the canonical, complete, deterministic outcome of
knowledge collection. Because the Context Builder uses **partial collection**, a
result aggregates *both* what was collected and what failed — a single provider
failure never aborts collection:

```text
metadata · items (KnowledgeItem[]) · errors (CollectionError[])
```

CB-009 defines the *contract only* — no provider execution, engine behaviour,
ranking, selection, duplicate detection or Context Package generation. It
**composes** the existing contracts rather than redefining them.

- **`metadata`** — the collection's **provenance**: the `KnowledgeRequest`
  (CB-004) the collection answered (`{ project, task, branch?, commit?, issue? }`).
  The request schema is **reused wholesale**, mirroring the CB-003 package
  metadata (`project`/`task`/`branch`/`commit`). It is provenance only — no
  timestamps, durations, retry counts, token estimates or diagnostics (those
  would break determinism and leak implementation detail).
- **`items`** — the collected knowledge, composing the CB-004 `KnowledgeItem`
  contract. May be empty.
- **`errors`** — per-provider failures, composing the CB-008 `CollectionError`
  contract. May be empty. An empty collection means no provider failed; a result
  with both items and errors is a valid **partial** outcome; an empty result (no
  items, no errors) is also valid.

```ts
import { parseCollectionResult } from "./context-builder/index.js";

const result = parseCollectionResult({
  metadata: { project: "aj-os", task: "CB-009" },
  items: [
    {
      id: "k1",
      source: { id: "AJS-002", type: "standard", title: "Context Assembly Standard" },
      content: "…",
    },
  ],
  errors: [
    {
      id: "err-1",
      providerId: "handbook",
      category: "provider-unavailable",
      message: "The handbook source could not be read.",
    },
  ],
}); // validated + deeply frozen
```

- `parseCollectionResult(input)` validates then **deep-freezes** (immutable at
  every level — the result, its arrays, and every embedded item/error), or throws
  a `ZodError`. The schema is **strict** — execution-, ranking- or
  selection-specific fields (e.g. a leaked `durationMs`) are rejected.
- `collectionResultSchema` is exported so CB-010 can **construct** a
  `CollectionResult` during provider execution without CB-009 implementing any
  collection behaviour.

Public exports: `collectionResultSchema`, `collectionResultMetadataSchema`,
`parseCollectionResult`, and the types `CollectionResult`,
`CollectionResultMetadata`.

## Provider execution (CB-010)

CB-010 adds the first *runtime behaviour* to the Collection Engine. The engine
established in CB-007 gains a `collect(request)` method that executes the held
registry's providers and assembles an immutable `CollectionResult`:

```text
ProviderRegistry + KnowledgeRequest → engine.collect → CollectionResult (items + errors)
```

```ts
import {
  createProviderRegistry,
  createCollectionEngine,
} from "./context-builder/index.js";

const engine = createCollectionEngine(
  createProviderRegistry([handbookProvider, wikiProvider]),
);

const result = await engine.collect({ project: "aj-os", task: "CB-010" });
result.items;  // KnowledgeItems from providers that resolved (registry order)
result.errors; // one CollectionError per provider that rejected
```

- **Partial** — a single provider failure never aborts collection. A provider
  that resolves contributes its `KnowledgeItem`s; a provider that rejects
  contributes exactly one `CollectionError`. Both travel together in the result.
- **Deterministic** — providers run concurrently, but the **registry order is
  authoritative**: `Promise.all` preserves input order, and outcomes are
  aggregated in registry order, so provider *completion* order never influences
  the result. The same registry and request always produce the same result shape.
- **Failure representation only** — a rejection is mapped to a `CollectionError`
  (CB-008): `id = "collection-error:<providerId>"`, `providerId`, a
  provider-agnostic `category` of `provider-error` (the engine sees only an opaque
  rejection and does not guess finer categories), and the rejection's message. The
  engine never retries, recovers, logs, applies an error policy, or re-throws a
  provider failure once collection has begun.
- **Stateless & immutable** — `collect` is a pure function of the held registry
  and the request; the engine keeps no runtime state. The result is built with
  `parseCollectionResult` (CB-009), so it is validated and deeply frozen.

This extends the CB-007 service boundary with the method it anticipated; it adds
no new contract, composing CB-004, CB-005, CB-008 and CB-009 unchanged. Ranking,
filtering, duplicate handling, Context Builder integration and Context Package
generation remain out of scope (later tasks/milestones).

Public exports: unchanged — `collect` is a method on the existing
`CollectionEngine` handle returned by `createCollectionEngine`.

## Status

This module currently contains its boundary and public entry point (task
**CB-001**), its public configuration contract and `createContextBuilder()`
factory (task **CB-002**), the public Context Package contract (task
**CB-003**), the public Knowledge Provider contracts (task **CB-004**), the
immutable Provider Registry (task **CB-005**), the Collection Engine service
boundary (task **CB-007**), the CollectionError contract (task **CB-008**), the
CollectionResult contract (task **CB-009**), and deterministic partial provider
execution — `CollectionEngine.collect` (task **CB-010**). The engine now executes
its registry's providers and assembles a `CollectionResult`; the remaining
Context Builder *behaviour* (Context Builder integration, ranking, selection,
assembly, explainability) is not implemented yet.

Functionality arrives incrementally through the SPEC-002 milestones:

| Milestone | Focus                                     |
| --------- | ----------------------------------------- |
| M1        | Foundation, schemas, provider interface   |
| M2        | Knowledge providers                       |
| M3        | Context collection                        |
| M4        | Context assembly (AJS-002 Appendix B)      |
| M5        | Explainability & profiles                 |
| M6        | Optimization                              |

Subfolders (e.g. `config/`, `providers/`, `collector/`, `ranking/`,
`package/`, `profiles/`, `explainability/`, `types/`, `utils/`) are created by
the tasks that introduce their code, rather than pre-created as empty
placeholders.

## References

- `docs/specifications/SPEC-002-Context-Builder-Agent.md`
- `docs/standards/AJS-004-AJ-OS-Agent-Specification-Standard.md`
- `implementation/phase-2-core-platform/spec-002-context-builder/`
