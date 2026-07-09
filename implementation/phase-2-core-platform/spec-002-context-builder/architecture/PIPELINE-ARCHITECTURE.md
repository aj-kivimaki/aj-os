# Pipeline Architecture

Status: Living Architecture

This document describes the target architecture of SPEC-002.

It is updated as milestones are planned and implemented.

It does not replace architectural decision records (ADRs), which explain why individual decisions were made.

## Overview

The Context Builder is implemented as a deterministic processing pipeline.

Each stage has a single responsibility and communicates with the next stage exclusively through immutable platform contracts.

No stage depends on the internal implementation of another stage.

Future milestones extend the pipeline by introducing new stages rather than modifying existing ones.

---

# Pipeline

Knowledge Providers
│
▼
Collection Engine
│
▼
CollectionResult
│
▼
Selection Engine
│
▼
SelectionResult
│
▼
Assembly Engine
│
▼
Context Package
│
▼
Explainability
│
▼
Explainability Report

Optimization operates across completed pipeline stages without changing their deterministic behaviour.

---

# Stage Responsibilities

## Collection

Responsible for determining what knowledge is available.

Produces:

- CollectionResult

Does not:

- rank
- filter
- prioritize
- assemble

---

## Selection

Responsible for determining which collected knowledge continues through the pipeline.

Produces:

- SelectionResult

Selection:

- evaluates
- filters
- prioritizes
- orders
- may eliminate exact duplicates

Selection never:

- executes providers
- modifies KnowledgeItems
- merges knowledge
- summarizes knowledge
- assembles Context Packages

### Deterministic Ordering

Selection produces a canonical deterministic sequence of selectedItems.

The Selection Policy defines an ordered comparator chain. Every comparator is deterministic, and the chain terminates with an immutable platform identifier (for example `KnowledgeItem.id`) to guarantee a stable total ordering.

The ordering of selectedItems is the public platform guarantee. SelectionResult exposes no explicit priority field; any priority used within the policy is an implementation detail expressed through the comparator chain. Assembly consumes selectedItems exactly in the order provided.

Selection introduces no scoring algorithms, no numeric priority values, and no business-specific ranking heuristics. The architecture specifies deterministic guarantees, not ranking heuristics.

---

## Assembly

Responsible for constructing a Context Package from the ordered SelectionResult.

Assembly performs no additional evaluation.

Assembly does not reorder knowledge.

Assembly does not filter knowledge.

---

## Explainability

Responsible for explaining deterministic decisions already made by previous stages.

Explainability never changes pipeline behaviour.

---

## Optimization

Responsible for improving implementation performance without changing deterministic behaviour or public contracts.

---

# Pipeline Ownership

The Context Builder owns every pipeline stage.

ContextBuilder
    ├── CollectionEngine
    ├── SelectionEngine
    └── (future AssemblyEngine)

Each engine owns exactly one stage.

Pipeline stages do not own each other.

## Public Entry Point

The Context Builder exposes a single public pipeline entry point:

    build(request)

`build()` always executes the highest-level pipeline currently implemented. The public entry point does not change when new stages are added — callers always invoke `build(request)` and receive the output of the highest-level implemented stage.

At Milestone 3 the implemented pipeline is:

KnowledgeRequest
        ↓
Collection
        ↓
Selection
        ↓
SelectionResult

At Milestone 4 `build()` extends to:

KnowledgeRequest
        ↓
Collection
        ↓
Selection
        ↓
Assembly
        ↓
ContextPackage

## Stage Operations

Each engine exposes only its own stage-specific operation:

CollectionEngine
    collect(request)

SelectionEngine
    select(collectionResult)

AssemblyEngine (future)
    assemble(selectionResult)

Intermediate pipeline stages and their results remain internal to the Context Builder pipeline. Only `build(request)` is public on the Context Builder.

---

# Pipeline Contracts

Each stage communicates exclusively through immutable contracts.

KnowledgeRequest
│
▼
CollectionResult
│
▼
SelectionResult
│
▼
ContextPackage

Contracts are immutable.

Contracts preserve provenance.

Contracts are never modified after creation.

CollectionResult and SelectionResult are internal pipeline contracts exchanged between stages. The public `build(request)` entry point returns the output of the highest-level implemented stage — SelectionResult at Milestone 3, ContextPackage at Milestone 4.

---

# Architectural Principles

## Single Responsibility

Each pipeline stage performs exactly one responsibility.

---

## Immutable Boundaries

Pipeline stages communicate only through immutable platform contracts.

---

## Deterministic Behaviour

Identical inputs always produce identical outputs.

Pipeline stages never depend on:

- execution timing
- randomness
- external state
- filesystem ordering
- provider implementation details

---

## Knowledge Identity

KnowledgeItems are never rewritten.

Selection preserves original KnowledgeItems.

Assembly consumes original KnowledgeItems.

---

## Stage Independence

Stages know only the public contract of adjacent stages.

No stage depends on another stage's implementation.

---

## Extensibility

Future stages extend the pipeline without modifying previous stages.

---

# Milestone Mapping

Milestone 2

Collection Engine

↓

CollectionResult

Milestone 3

Selection Engine

↓

SelectionResult

Milestone 4

Assembly Engine

↓

Context Package

Milestone 5

Explainability

↓

Explainability Report

Milestone 6

Optimization

↓

Performance improvements

---

# Integration Check

Before freezing any milestone introducing a new pipeline stage, verify:

- the new stage has exactly one responsibility
- the stage communicates only through immutable contracts
- previous stages require no modification
- public contract evolution is not required

If a public contract must evolve, implementation pauses until the change has been reviewed and approved.
