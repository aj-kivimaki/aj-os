# Context Builder

> **Specification:** SPEC-002 — Context Builder Agent
> **Standards:** AJS-001, AJS-002, AJS-003, AJS-004
> **Status:** Foundation (Milestone M1)

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

## Status

This module currently contains its boundary and public entry point (task
**CB-001**), its public configuration contract and `createContextBuilder()`
factory (task **CB-002**), the public Context Package contract (task
**CB-003**), the public Knowledge Provider contracts (task **CB-004**), the
immutable Provider Registry (task **CB-005**), and the Collection Engine service
boundary (task **CB-007**). No Context Builder *behaviour* (provider
implementations, provider execution, collection, ranking, assembly,
explainability) is implemented yet — the Collection Engine holds its registry but
does not execute it.

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
