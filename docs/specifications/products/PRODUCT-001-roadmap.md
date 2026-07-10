# PRODUCT-001 — Knowledge Assistant Roadmap

**Status:** Draft  
**Version:** 0.1  
**Owner:** AJ  
**Category:** Product Roadmap

---

# Purpose

This roadmap defines how the Knowledge Assistant evolves from an idea into a complete product.

The roadmap focuses on **user value**, not implementation details.

Technical work belongs in the platform specifications.

---

# Product Vision

The Knowledge Assistant becomes the primary interface for interacting with a configured handbook.

Instead of manually browsing documentation or searching through wiki articles, users simply ask questions and receive trustworthy, contextual answers grounded in their own knowledge.

## Primary Interface

Version 0.1 is delivered as a Command Line Interface (CLI).

The CLI provides the fastest path to delivering the first usable AJ-OS product while remaining simple, scriptable, and easy to extend.

The Knowledge Assistant is accessed using the `aj ask` command.

Version 0.1 supports two interaction modes:

### Interactive Mode

```bash
aj ask
```

The assistant prompts the user for a question and supports follow-up interactions within the same session.

### One-shot Mode

```bash
aj ask "How does Context Builder work?"
```

The assistant answers a single question and exits.

Future versions may introduce additional interfaces such as a web application, editor integrations, or APIs. Regardless of the interface, the user experience should remain consistent with the principles defined in PRODUCT-001.

---

# Release Strategy

The product will be developed incrementally.

Each release must provide real user value and remain usable on its own.

No release should exist solely to prepare for future work.

---

# Version 0.1 — First Usable Product

## Goal

A user can ask questions about a configured handbook and receive trustworthy answers with citations.

## Features

### Ask Questions

The user can ask questions using natural language.

---

### Retrieve Knowledge

The assistant retrieves the most relevant information from the generated handbook wiki.

---

### Generate Answers

The assistant explains the requested knowledge in a clear and understandable way.

---

### Show Citations

Every factual answer contains citations to the relevant wiki articles.

---

### Handle Missing Knowledge

When sufficient knowledge does not exist, the assistant explains the limitation honestly instead of inventing an answer.

---

### Support Follow-up Questions

The assistant can continue the conversation when additional clarification is requested.

---

## Success Criteria

Version 0.1 is complete when:

- Users can ask questions naturally.
- Answers are useful.
- Answers always include citations.
- No unsupported information is presented.
- The assistant becomes the preferred way of exploring the handbook.

---

# Version 0.2 — Better Knowledge Retrieval

## Goals

Improve answer quality and user experience.

Potential capabilities include:

- Better retrieval accuracy
- Improved relevance ranking
- Faster responses
- Better conversation handling
- Richer citations

---

# Version 0.3 — Knowledge Growth

## Goals

Allow the handbook to continuously improve.

Potential capabilities include:

- Knowledge Capture
- Knowledge Review
- Wiki regeneration
- Knowledge validation
- Improved handbook maintenance workflows

---

# Future Products

The Knowledge Assistant is the foundation for future AJ-OS products.

Planned products include:

- PRODUCT-002 — Knowledge Capture
- PRODUCT-003 — Project Assistant
- PRODUCT-004 — Project Kickoff
- PRODUCT-005 — Learning Assistant
- PRODUCT-006 — Workflow Automation

Each new product should build upon the platform capabilities developed for previous products.

---

# Product Strategy

AJ-OS is developed **product-first**.

Every platform capability should exist because it enables one or more products.

Products define user value.

The platform enables that value.

Implementation follows product requirements—not the other way around.

---

# Definition of Success

The Knowledge Assistant succeeds when it becomes the primary interface for interacting with a configured handbook.

Users should naturally prefer asking the assistant over manually browsing documentation because it is faster, easier, trustworthy, and always traceable to the original knowledge.
