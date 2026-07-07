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

## Status

This module currently contains its boundary and public entry point (task
**CB-001**) and its public configuration contract and `createContextBuilder()`
factory (task **CB-002**). No Context Builder *behaviour* (providers,
collection, ranking, assembly, explainability) is implemented yet.

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
