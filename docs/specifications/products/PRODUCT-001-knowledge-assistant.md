# PRODUCT-001 — Knowledge Assistant

**Status:** Draft  
**Version:** 0.1  
**Owner:** AJ  
**Category:** Product Specification

---

# Purpose

The Knowledge Assistant is the first user-facing product built on AJ-OS.

It enables users to ask questions about the knowledge contained in a configured handbook using natural language. Rather than manually navigating documentation or wiki pages, the assistant searches the AI-optimized wiki generated from the handbook and provides contextual answers with citations to the relevant wiki articles.

The Knowledge Assistant is the first complete implementation of the AJ-OS vision and establishes the foundation for future AI-powered products.

---

# Problem

As a handbook grows, it becomes a large collection of interconnected knowledge spread across multiple domains.

Although the information is well organized, manually locating and connecting the right knowledge becomes increasingly difficult.

Traditional search returns documents.

The Knowledge Assistant returns understanding.

---

# Goal

Enable users to ask questions about a configured handbook using natural language and receive accurate, contextual answers with citations to the relevant wiki articles.

---

# Target User

## Primary User

AJ

## Future Users

The architecture is designed to support any handbook following the AJ-OS handbook structure, but Version 0.1 is intended for a single personal handbook.

---

# User Journey

```text
Question

↓

Knowledge Assistant

↓

Search configured handbook wiki

↓

Retrieve relevant knowledge

↓

Generate AI answer

↓

Return answer with citations
```

Example

> How does Context Builder work?

↓

AJ-OS searches the configured handbook wiki.

↓

Relevant knowledge is retrieved.

↓

The AI generates an answer.

↓

The answer contains citations to the relevant wiki articles.

---

# Knowledge Flow

The Knowledge Assistant never reads handbook source material directly.

It retrieves knowledge from the generated wiki, which is produced from the configured handbook.

```text
Configured Handbook
(external project)

        │
        ▼

Knowledge Sources

• Foundation
• Library
• Projects
• Skills
• Resources
• Lessons Learned
• ...

        │
        ▼

Wiki Generator

        │
        ▼

Generated Wiki

        │
        ▼

Knowledge Assistant

        │
        ▼

AI Answer
```

The handbook remains the canonical source of truth.

The generated wiki is an AI-optimized representation of that knowledge.

The Knowledge Assistant is a read-only consumer of the generated wiki.

---

# Inputs

The Knowledge Assistant requires:

- A natural language question
- Generated wiki from the configured handbook
- Relevant wiki articles

---

# Outputs

The Knowledge Assistant returns:

- AI-generated answer
- Citations to relevant wiki articles
- (Optional) confidence indicators

---

# Definition of Success

The product is considered complete when:

- A natural language question can be asked.
- AJ-OS returns a useful answer.
- Every answer contains citations.
- Citations reference the relevant wiki articles.
- The product can be used daily without understanding its implementation.

---

# Non-Goals

Version 0.1 does **not**:

- browse the internet
- answer questions outside the configured handbook
- modify handbook content
- generate or update wiki articles
- edit the handbook
- automate workflows
- support multiple users
- provide a graphical interface
- replace ChatGPT or Claude

Its sole responsibility is answering questions using the generated handbook wiki.

---

# Future Evolution

The Knowledge Assistant provides the foundation for future AJ-OS products, including:

- Knowledge Capture
- Project Assistant
- Project Kickoff
- Workflow Automation
- Learning Assistant

---

# Platform Dependencies

The Knowledge Assistant depends on the following AJ-OS platform capabilities:

- CORE-PLATFORM-002 — Context Builder
- Wiki Generator (future)
- Retrieval Engine (future)
- Prompt Renderer (future)
- AI Client (future)

---

# External Dependencies

The Knowledge Assistant requires:

- A configured handbook
- A generated handbook wiki

The handbook is an external project and is not part of AJ-OS.

---

# Product Philosophy

The Knowledge Assistant is intentionally simple.

It exists to solve one problem exceptionally well:

> Help users understand and retrieve knowledge from a handbook quickly.

AJ-OS remains independent of the knowledge it consumes.

Knowledge always flows in one direction:

```text
Configured Handbook
        │
        ▼
Knowledge Sources
        │
        ▼
Generated Wiki
        │
        ▼
Knowledge Assistant
        │
        ▼
AI Answer
```

Humans curate and maintain the handbook.

AJ-OS generates an AI-optimized wiki from the handbook.

The Knowledge Assistant retrieves knowledge from that generated wiki to answer questions.

Every future AJ-OS product should follow the same philosophy:

**Solve one problem well, then build upon it.**
