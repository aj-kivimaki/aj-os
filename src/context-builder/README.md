# Context Builder

> **Specification:** SPEC-002 — Context Builder Agent
> **Standards:** AJS-001, AJS-002, AJS-003, AJS-004
> **Status:** Milestone M3 — Knowledge Selection **complete** (M1, M2 also
> complete). The Context Builder pipeline runs Collection → Selection through the
> single public entry point `build(request)` (CB-017), protected by permanent
> Selection behaviour and `build` pipeline regression tests (CB-018).

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

## Configuration & factory (CB-002, extended by CB-011, evolved by CB-017)

The Context Builder is created through a factory. Configuration is validated at
runtime (Zod), frozen, and never mutated afterwards. CB-011 evolved this factory
(an approved architectural evolution): it now also takes a required Provider
Registry, from which it composes the Collection Engine it owns. CB-017 extends the
pipeline with the Selection stage and reconciles the public entry point to
`build(request)` (see
[Context Builder pipeline — `build(request)`](#context-builder-pipeline--buildrequest-cb-017)):

```ts
import {
  createContextBuilder,
  createProviderRegistry,
} from "./context-builder/index.js";

const registry = createProviderRegistry([handbookProvider, wikiProvider]);

const builder = createContextBuilder(
  {
    profile: "implementation", // implementation | debugging | documentation | review | planning
    explainability: true, // produce an explainability report
    outputFormat: "markdown", // markdown | json
  },
  registry, // required — the catalogue the owned Collection Engine executes
);

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

## Context Builder integration (CB-011)

CB-011 wires the first **end-to-end collection pipeline**. The Context Builder is
the platform's single public orchestration service: it **composes** a Collection
Engine from an injected Provider Registry at construction, **owns** that engine,
and (at Milestone 2) exposed a `collect(request)` entry point that delegated to it
and returned the `CollectionResult` **unchanged**.

> **Superseded by CB-017.** The public `collect(request)` entry point described in
> this section was superseded by `build(request)` when the Selection stage was added
> (see [Context Builder pipeline — `build(request)`](#context-builder-pipeline--buildrequest-cb-017)).
> The Milestone 2 collection behaviour is unchanged — it is preserved as the internal
> `CollectionEngine.collect(request)` stage operation that `build` now invokes. The
> snippet below is retained as the historical CB-011 record.

```text
KnowledgeRequest → ContextBuilder.collect → CollectionEngine → ProviderRegistry
                → providers → KnowledgeItems + CollectionErrors → CollectionResult
```

```ts
import {
  createContextBuilder,
  createProviderRegistry,
} from "./context-builder/index.js";

const builder = createContextBuilder(
  { profile: "implementation", explainability: true, outputFormat: "markdown" },
  createProviderRegistry([handbookProvider, wikiProvider]),
);

const result = await builder.collect({ project: "aj-os", task: "CB-011" });
result.items;  // KnowledgeItems (registry order)
result.errors; // one CollectionError per provider that rejected
```

- **Thin orchestration** — the Context Builder does **not** inspect, modify,
  filter, rank, deduplicate or enrich the result. All collection business logic
  stays inside the Collection Engine (CB-007/CB-010); `collect` is a direct
  delegation.
- **Owns the engine, not the registry** — the registry is injected only to compose
  the engine. The builder holds the engine; the entry point takes a request only.
- **Deterministic & immutable** — collection is partial (a single provider failure
  never aborts collection) and registry order is authoritative; the returned
  result is the engine's deeply-frozen `CollectionResult`. The same request and
  registry always produce the same result.

**Approved contract evolution.** CB-011 changed the frozen CB-002 factory from
`createContextBuilder(config)` to `createContextBuilder(config, registry)` and
added `collect(request)` to the `ContextBuilder` interface. This was reviewed
under the Implementation Guardrail: a single immutable handle can only own the
engine and expose an unconditional, request-only `collect` if the registry is
injected at construction, so an additive-only design could not satisfy the
architecture without a partial or duplicate public API. No other public contract
changed.

## Collection behaviour tests (CB-012)

Milestone M2's collection behaviour is protected by permanent, deterministic
Vitest tests (built on the CB-006 foundation — no new framework). They validate
only **public behaviour** through the module entry point, run in milliseconds,
and use no filesystem, network, randomness or timing-based assertions:

```text
tests/context-builder/
├── collection.test.ts                    Collection Engine service boundary (CB-007)
├── collection-errors.test.ts             CollectionError contract (CB-008)
├── collection-result.test.ts             CollectionResult contract (CB-009)
├── collection-execution.test.ts          Provider execution & determinism (CB-010)
└── context-builder-collection.test.ts    Context Builder integration (CB-011)
```

The determinism guarantee is asserted directly: registry order is authoritative,
so provider **completion** order never influences item **or** error ordering
(delayed-resolving and delayed-rejecting fixtures prove both), partial collection
is deterministic, results and errors are deeply immutable, and repeated
collection with identical inputs yields equivalent results. The Context Builder
integration tests assert that `ContextBuilder.collect` delegates to the owned
engine and returns the `CollectionResult` **unchanged** — equal to a standalone
engine over the same registry, with no filtering, ranking, deduplication or
enrichment. CB-012 introduced **no** platform behaviour; it only exercises the
frozen CB-002…CB-011 contracts.

## Selection Engine (CB-013)

The **Selection Engine** is the platform service that performs deterministic
knowledge selection — determining which collected knowledge continues through the
pipeline. CB-013 opens Milestone M3 by establishing only its *service boundary* —
the seam that later Milestone M3 tasks extend:

```text
createSelectionEngine → immutable service handle
```

It follows the same factory-based service pattern as `createContextBuilder()`,
`createProviderRegistry()` and `createCollectionEngine()`:

```ts
import { createSelectionEngine } from "./context-builder/index.js";

const engine = createSelectionEngine();
// In CB-016 the engine gains: await engine.select(collectionResult);
```

- **Pure boundary** — unlike the Collection Engine, which is constructed with the
  Provider Registry it **holds**, the Selection Engine holds **nothing** at
  construction and exposes **no members** yet. Its only input, the
  `CollectionResult` (CB-009), arrives as the future `select(collectionResult)`
  argument; its Selection Policy arrives in CB-015. `createSelectionEngine()`
  therefore takes **no arguments**.
- **Minimal** — the handle carries **no** `select()` method: the SelectionResult
  contract (CB-014), the deterministic Selection Policy (CB-015) and the
  `select(collectionResult)` stage operation (CB-016) are introduced through this
  same interface by later Milestone M3 tasks. Adding a member now would be a
  placeholder for behaviour owned by a later task.
- **Deterministic** — every call yields the same public service.
- **Stateless & immutable** — no mutable runtime state; the returned handle is
  frozen (`Object.freeze`).
- **Pipeline-independent** — the engine does not own the Collection Engine, the
  Provider Registry or any Knowledge Provider; it communicates only through
  immutable platform contracts.

Like the registry and the Collection Engine, no `schema.ts` is introduced: the
engine adds no new *data* contract, so its interface is co-located with its
factory in `selection/createSelectionEngine.ts`.

Public exports: `createSelectionEngine` and the type `SelectionEngine`.

## SelectionResult contract (CB-014)

The **SelectionResult** is the canonical, complete, deterministic outcome of
knowledge selection — the immutable boundary between the Selection Engine and
Context Assembly (M4). Selection consumes a `CollectionResult` (CB-009) and
partitions its knowledge, preserving *both* what continues through the pipeline
and what does not:

```text
metadata · selectedItems (KnowledgeItem[], ordered) · excludedItems (KnowledgeItem[])
```

CB-014 defines the *contract only* — no Selection Engine execution, Selection
Policy, evaluation, prioritization, ordering logic, filtering or duplicate
elimination. It **composes** the existing contracts rather than redefining them,
and **preserves knowledge identity**: KnowledgeItems are never modified,
rewritten, merged or summarized.

- **`metadata`** — the selection's **provenance**: the `KnowledgeRequest` (CB-004)
  the selection answered, carried forward from the CollectionResult it consumed.
  The metadata schema is **reused** from CB-009
  (`selectionResultMetadataSchema = collectionResultMetadataSchema`), so the
  provenance can never drift from the request that flowed through collection. It
  is provenance only — no timestamps, durations, counters, diagnostics or runtime
  detail (those would break determinism and leak implementation detail).
- **`selectedItems`** — the knowledge selected to continue through the pipeline,
  composing the CB-004 `KnowledgeItem` contract. **Ordered** — the order is the
  canonical deterministic contract Assembly consumes exactly as provided. May be
  empty.
- **`excludedItems`** — the knowledge selection did not carry forward, composing
  the same `KnowledgeItem` contract, preserved unchanged to support future
  deterministic explainability without re-running selection. May be empty.

**Ordering is the contract.** `selectedItems` exposes the deterministic ordering
directly; the contract carries **no** explicit priority, score or ranking field.
Any priority used to derive the ordering is an implementation detail of the
Selection Policy (CB-015).

```ts
import { parseSelectionResult } from "./context-builder/index.js";

const result = parseSelectionResult({
  metadata: { project: "aj-os", task: "CB-014" },
  selectedItems: [
    {
      id: "k1",
      source: { id: "AJS-002", type: "standard", title: "Context Assembly Standard" },
      content: "…",
    },
  ],
  excludedItems: [
    {
      id: "k2",
      source: { id: "AJS-001", type: "standard", title: "Engineering Standard" },
      content: "…",
    },
  ],
}); // validated + deeply frozen
```

- `parseSelectionResult(input)` validates then **deep-freezes** (immutable at
  every level — the result, its arrays, and every embedded item), or throws a
  `ZodError`. The schema is **strict** — priority-, score-, ranking- or
  execution-specific fields are rejected.
- `selectionResultSchema` is exported so CB-015/CB-016 can **construct** a
  `SelectionResult` during selection without CB-014 implementing any selection
  behaviour.

Public exports: `selectionResultSchema`, `selectionResultMetadataSchema`,
`parseSelectionResult`, and the types `SelectionResult`, `SelectionResultMetadata`.

## Selection Policy (CB-015)

The **Selection Policy** is the deterministic decision-making model of knowledge
selection, implemented as **executable platform behaviour** — pure, stateless,
identity-preserving functions. CB-015 defines the *policy only*; it does **not**
execute the Selection Engine, construct a `SelectionResult`, integrate with the
Context Builder, or add behaviour tests (those are CB-016+). The Selection Engine
(CB-016) will *apply* this policy to a `CollectionResult`:

```text
evaluation  → filtering (retain / exclude) → ordering (ordered comparator chain)
```

- **Evaluation** — a per-item eligibility predicate `evaluateKnowledgeItem(item)`.
  The M3 platform rule is deliberately narrow: an item is eligible iff it **carries
  knowledge** (non-empty `content`), stated as executable policy rather than assumed
  from the CB-004 contract. Selection is **profile-agnostic** at M3 and introduces
  no scoring and no business heuristic, so every well-formed item is eligible;
  future Context Profiles (M5) modulate eligibility through this same seam.
- **Filtering** — the retention predicate `isRetainedKnowledgeItem(item)`: an item
  is retained iff it is eligible under evaluation. The Selection Engine applies it
  to partition collected knowledge; a non-retained item is carried into
  `excludedItems` **unchanged** (never dropped, rewritten or merged).
- **Ordering** — an **ordered comparator chain** (`selectionComparatorChain`)
  composed into a single total-order comparator (`compareKnowledgeItems`).
  Comparators are applied in order and the first non-zero result wins; the chain
  **terminates with an immutable platform identifier** (`compareById`, over
  `KnowledgeItem.id`, compared by UTF-16 code unit — **not** locale-aware
  `localeCompare`, which would break determinism) to guarantee a **stable total
  ordering**. The policy introduces **no scoring, no numeric priority and no
  business-specific ranking heuristic**. At M3 the chain holds only its terminal
  comparator; future profile-driven comparators (M5) are **prepended** ahead of it
  without changing this structure or the SelectionResult contract.

**Ordering is the public guarantee; the comparator implementation stays internal.**
The policy functions are internal platform behaviour: they live in
`selection/policy/` and are **not** re-exported from `selection/index.ts` or the
top-level `context-builder/index.ts` (mirroring how the CB-010 `collectKnowledge`
behaviour stays internal). The public guarantee is the *order* of
`SelectionResult.selectedItems` (CB-014), never a priority/score/ranking value.

- **Exact-duplicate elimination** — `partitionExactDuplicates(orderedItems)` splits
  a canonically-ordered sequence into `retained` and `duplicates`, applying the
  approved platform definition (`isExactDuplicate`): two items are exact duplicates
  iff their `content` is identical **and** their entire `source` (`id`, `type`,
  `title`, `locator`) is structurally identical. `KnowledgeItem.id` is **excluded**
  (it is the ordering tie-breaker, never the duplicate identity); comparison is
  literal structural equality with **no** normalization; the **first occurrence in
  canonical order is retained** and every subsequent duplicate is destined for
  `excludedItems`. Elimination removes a redundant copy — it never merges,
  summarizes or rewrites a survivor.

Internal (module-private) exports: `evaluateKnowledgeItem`,
`isRetainedKnowledgeItem`, `compareById`, `selectionComparatorChain`,
`compareKnowledgeItems`, `isExactDuplicate`, `partitionExactDuplicates`, and the
types `KnowledgeItemPredicate`, `KnowledgeItemComparator`,
`KnowledgeItemEquivalence`, `ExactDuplicatePartition`.

## Selection execution (CB-016)

CB-016 adds the first *runtime behaviour* to the Selection Engine. The engine
established in CB-013 gains a `select(collectionResult)` stage operation that
**applies** the deterministic Selection Policy (CB-015) to an immutable
`CollectionResult` (CB-009) and assembles an immutable `SelectionResult` (CB-014):

```text
CollectionResult → engine.select → SelectionResult (ordered selectedItems + excludedItems)
```

```ts
import { createSelectionEngine } from "./context-builder/index.js";

const engine = createSelectionEngine();

const selection = await engine.select(collectionResult);
selection.selectedItems; // KnowledgeItems in canonical deterministic order
selection.excludedItems; // filtered-out items and eliminated exact duplicates
selection.metadata;      // the request this selection answered (provenance)
```

- **Applies policy, decides nothing.** Execution *sequences* the CB-015 policy in
  four steps — **filter** (`isRetainedKnowledgeItem`) → **order** the retained items
  into canonical order (`compareKnowledgeItems`) → **eliminate exact duplicates** in
  that order (`partitionExactDuplicates`, first occurrence retained) → **construct**
  the result (`parseSelectionResult`). It embeds no evaluation, filtering, ordering
  or duplicate rule of its own, introduces no new comparator, and exposes no
  priority/score/ranking value. The Selection Policy and this behaviour stay internal
  to the module; only `select` is public.
- **`selectedItems` is the canonical ordered sequence** the policy produces — the
  public guarantee Assembly (M4) consumes exactly as given. **`excludedItems`**
  carries everything selection did not forward (items removed by filtering and exact
  duplicates removed), each **unchanged**; it has no contractual ordering guarantee,
  so the engine orders it with the same policy comparator purely to keep the output
  fully deterministic.
- **Deterministic** — identical CollectionResults always produce identical
  SelectionResults. The comparator chain terminates in an immutable identifier, so
  ordering never depends on collection order, timing or randomness.
- **Stateless, identity-preserving, immutable** — `select` is a pure function of its
  input; the engine holds no runtime state, never mutates the frozen input (retained
  items are sorted over a copy), communicates with no provider or external service,
  and returns the deeply-frozen `SelectionResult` built by `parseSelectionResult`.
- **`async` to mirror `collect`** — like the Collection Engine's stage operation,
  `select` returns a promise so both stage operations compose uniformly in the future
  `build(request)` pipeline (CB-017). Selection performs no I/O; the promise resolves
  synchronously.

This extends the CB-013 service boundary with the method it anticipated; it adds no
new contract, composing CB-009, CB-014 and CB-015 unchanged. Context Builder
integration (CB-017), assembly, profiles and explainability remain out of scope.

Public exports: unchanged — `select` is a method on the existing `SelectionEngine`
handle returned by `createSelectionEngine`.

## Context Builder pipeline — `build(request)` (CB-017)

CB-017 extends the Context Builder pipeline with the Selection stage and reconciles
the public entry point. The Context Builder is a **thin orchestrator**: it composes
and owns **both** a Collection Engine (CB-007/CB-010) and a Selection Engine
(CB-013/CB-016) at construction, and exposes a single public entry point,
`build(request)`, that runs the highest-level implemented pipeline and returns the
resulting `SelectionResult` **unchanged**:

```text
KnowledgeRequest → ContextBuilder.build → CollectionEngine.collect → CollectionResult
                → SelectionEngine.select → SelectionResult (ordered selectedItems + excludedItems)
```

```ts
import {
  createContextBuilder,
  createProviderRegistry,
} from "./context-builder/index.js";

const builder = createContextBuilder(
  { profile: "implementation", explainability: true, outputFormat: "markdown" },
  createProviderRegistry([handbookProvider, wikiProvider]),
);

const selection = await builder.build({ project: "aj-os", task: "CB-017" });
selection.selectedItems; // KnowledgeItems in canonical deterministic order
selection.excludedItems; // filtered-out items and eliminated exact duplicates
selection.metadata;      // the request this pipeline answered (provenance)
```

- **Orchestration only.** `build` invokes `CollectionEngine.collect(request)` then
  `SelectionEngine.select(collectionResult)` and returns the Selection Engine's
  result verbatim. The Context Builder implements no selection policy and no
  collection behaviour, and does **not** inspect, modify, filter, reorder,
  deduplicate or enrich the `SelectionResult`. All decisions live in the stages.
- **Composes once, owns the engines.** Both engines are composed a single time at
  construction; the registry is injected only to build the owned Collection Engine.
  The intermediate `CollectionResult` and the stage operations (`collect`, `select`)
  remain internal to the pipeline — only `build` is public on the Context Builder.
- **Deterministic & immutable.** Determinism and deep immutability are inherited from
  the engines (CB-010/CB-016); the same request and registry always produce the same
  deeply-frozen `SelectionResult`. The Context Builder holds no runtime state.

**Approved public API evolution.** `build(request)` is the Context Builder's single
public entry point; it **supersedes** the Milestone 2 era `ContextBuilder.collect`
public method. This was the approved reconciliation recorded in MILESTONES.md and
CB-017. No frozen Milestone 1 or Milestone 2 platform contract changed: the Milestone
2 collection behaviour is preserved as the `CollectionEngine.collect(request)` stage
operation, and CollectionResult, the Collection Engine, the Provider Registry and the
configuration contract are unchanged. Because `collect` is no longer public, its
obsolete builder-level regression suite was retired; collection stays permanently
covered by the Collection Engine suite (CB-010), and the permanent `build(request)`
pipeline regression suite is owned by CB-018.

Public exports: unchanged — `build` is a method on the existing `ContextBuilder`
handle returned by `createContextBuilder`; the `SelectionResult` it returns is the
already-public CB-014 contract.

## Selection behaviour tests (CB-018)

Milestone M3's Selection stage is protected by permanent, deterministic Vitest
tests (built on the CB-006 foundation — no new framework). CB-018 is the permanent
owner of the `ContextBuilder.build(request)` pipeline regression suite. Because
CB-013 (engine boundary), CB-015 (policy) and CB-016 (execution) deferred their
behaviour tests to CB-018, this task **authors** the Selection Engine and pipeline
behaviour suites (the CB-014 `SelectionResult` *contract* suite already shipped in
`selection-result.test.ts` and is not re-authored):

```text
tests/context-builder/
├── selection-result.test.ts            SelectionResult contract (CB-014, pre-existing)
├── selection.test.ts                    Selection Engine service boundary (CB-013)
├── selection-execution.test.ts          select() behaviour + Selection Policy (CB-015/CB-016)
└── context-builder-pipeline.test.ts     build(request) pipeline & end-to-end (CB-017)
```

Every guarantee is asserted **only through the public API** — `createSelectionEngine().select(collectionResult)`
and `createContextBuilder(config, registry).build(request)`. No policy comparator,
predicate, duplicate helper or private function is imported, so the internal
Selection Policy stays free to evolve. The suite validates canonical deterministic
ordering (stable total order via the terminal `KnowledgeItem.id` tie-breaker), M3
filtering (every well-formed item is eligible), exact-duplicate elimination with
routing to `excludedItems`, metadata preservation, knowledge-identity preservation,
input immutability (the frozen `CollectionResult` is ordered over a copy), deep
immutability of the result, determinism across repeated runs, and conformance to the
public SelectionResult contract. The pipeline suite proves `build(request)` equals a
manual two-engine composition (`select(collect(request))`) over the same registry —
the Context Builder is a thin orchestrator that adds no behaviour and exposes only
`build`. Engine-level collection behaviour remains owned by the CB-010 suite
(`collection-execution.test.ts`) and is **not** re-tested here. CB-018 introduced
**no** platform behaviour and **no** contract change; it only exercises the frozen
CB-013…CB-017 surfaces. **Milestone M3 is complete.**

## Status

This module currently contains its boundary and public entry point (task
**CB-001**), its public configuration contract and `createContextBuilder()`
factory (task **CB-002**), the public Context Package contract (task
**CB-003**), the public Knowledge Provider contracts (task **CB-004**), the
immutable Provider Registry (task **CB-005**), the Collection Engine service
boundary (task **CB-007**), the CollectionError contract (task **CB-008**), the
CollectionResult contract (task **CB-009**), deterministic partial provider
execution — `CollectionEngine.collect` (task **CB-010**), and the integrated
collection pipeline — `ContextBuilder.collect` (task **CB-011**), all protected
by permanent collection behaviour tests (task **CB-012**), the Selection Engine
service boundary — `createSelectionEngine()` (task **CB-013**), and the
SelectionResult contract (task **CB-014**), and the deterministic Selection Policy
— evaluation, filtering, an ordered comparator chain terminating in an immutable
identifier, and exact-duplicate elimination (task **CB-015**), and selection
execution — `SelectionEngine.select`, which applies the Selection Policy to a
CollectionResult and constructs an immutable SelectionResult (task **CB-016**). The
Context Builder now composes and owns a Collection Engine and collects knowledge
end-to-end, and Milestone M2 is complete; Milestone M3 is under way with the
Selection Engine boundary, the SelectionResult contract, the complete Selection
Policy, selection execution, and the integrated pipeline — `ContextBuilder.build`
(task **CB-017**) — in place. The Context Builder now composes and owns both a
Collection Engine and a Selection Engine and runs Collection → Selection end-to-end
through the single public entry point `build(request)`, which supersedes the
Milestone 2 era `collect(request)`. This selection pipeline is now protected by the
permanent Selection Engine, execution and `build(request)` behaviour tests (task
**CB-018**), which completes **Milestone M3**. The remaining Context Builder
*behaviour* (assembly, explainability) is not implemented yet and arrives through the
same `build` entry point in later milestones (M4+).

Functionality arrives incrementally through the SPEC-002 milestones:

| Milestone | Focus                                     |
| --------- | ----------------------------------------- |
| M1        | Foundation, schemas, provider interface   |
| M2        | Knowledge Collection                      |
| M3        | Knowledge Selection                       |
| M4        | Context Assembly (AJS-002 Appendix B)     |
| M5        | Explainability & Profiles                 |
| M6        | Optimization                              |

Subfolders (e.g. `config/`, `providers/`, `collection/`, `selection/`,
`ranking/`, `package/`, `profiles/`, `explainability/`, `types/`, `utils/`) are created by
the tasks that introduce their code, rather than pre-created as empty
placeholders.

## References

- `docs/specifications/SPEC-002-Context-Builder-Agent.md`
- `docs/standards/AJS-004-AJ-OS-Agent-Specification-Standard.md`
- `implementation/phase-2-core-platform/spec-002-context-builder/`
