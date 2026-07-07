# AJS-004 --- AJ-OS Agent Specification Standard

**Status:** Draft v1.0

## Purpose

Define the standard structure, lifecycle, responsibilities, inputs,
outputs, and behavior of every AJ-OS Agent.

An AJ-OS Agent is any component that performs work within AJ-OS,
regardless of implementation. An agent may use an LLM, deterministic
code, workflows, APIs, or a combination of these.

The goal is:

> Every AJ-OS Agent behaves predictably, integrates consistently, and
> can be replaced without changing the rest of the system.

------------------------------------------------------------------------

# Core Principles

## 1. Single Responsibility

Each AJ-OS Agent has one clearly defined purpose.

Avoid "super agents" that perform unrelated responsibilities.

------------------------------------------------------------------------

## 2. Model Agnostic

Agents may use:

-   LLMs
-   Scripts
-   APIs
-   n8n workflows
-   MCP servers
-   Local applications

The standard defines behavior, not implementation.

------------------------------------------------------------------------

## 3. Stateless by Default

Agents should avoid storing permanent state.

Persistent information belongs in:

-   Project Documentation
-   Handbook
-   Standards
-   Databases
-   Configuration

------------------------------------------------------------------------

## 4. Idempotent

Running the same agent multiple times should not corrupt data or produce
inconsistent results.

------------------------------------------------------------------------

## 5. Observable

Every execution should be logged.

------------------------------------------------------------------------

## 6. Human-in-the-Loop

Unless explicitly configured otherwise:

-   Agents propose.
-   Humans approve.

------------------------------------------------------------------------

# Agent Lifecycle

``` text
Trigger
    ↓
Collect Inputs
    ↓
Validate
    ↓
Execute
    ↓
Generate Outputs
    ↓
Log
    ↓
Notify
```

------------------------------------------------------------------------

# Required Metadata

Every AJ-OS Agent must define:

``` yaml
agent:
  id:
  name:
  version:
  owner:
  description:
  category:
```

------------------------------------------------------------------------

# Required Inputs

Each agent explicitly defines its inputs.

Examples:

-   Project
-   Task
-   Repository
-   Commit
-   Context Package
-   Handbook entries

------------------------------------------------------------------------

# Required Outputs

Each agent explicitly defines its outputs.

Examples:

-   Markdown
-   JSON
-   Reports
-   Documentation
-   Notifications
-   Generated files

------------------------------------------------------------------------

# Required Capabilities

Every agent documents the capabilities it requires.

Examples:

-   Read project files
-   Search handbook
-   Search wiki
-   Read Git history
-   Write documentation
-   Call LLM
-   Access APIs

Capabilities should follow the principle of least privilege.

------------------------------------------------------------------------

# Required Permissions

Each agent declares required permissions.

Examples:

-   Read filesystem
-   Write filesystem
-   Git access
-   Internet access
-   Database access
-   Secret management

------------------------------------------------------------------------

# Failure Handling

Every agent specifies:

-   Validation failures
-   Retry policy
-   Fallback behavior
-   User notification
-   Recovery strategy

Errors should be structured and explainable.

------------------------------------------------------------------------

# Logging Requirements

Every execution should record:

-   Start time
-   End time
-   Duration
-   Inputs
-   Outputs
-   Errors
-   Result status

Logs should support debugging and auditing.

------------------------------------------------------------------------

# Success Criteria

Every agent defines measurable completion criteria.

Examples:

-   Context Package generated
-   Documentation updated
-   Handbook proposal created

------------------------------------------------------------------------

# Standard Agent Specification

``` yaml
agent:
  id:
  name:
  version:
  category:
  description:

trigger:

inputs:

outputs:

capabilities:

permissions:

success:

failure:

logging:
```

------------------------------------------------------------------------

# Agent Categories

## Planning

-   Project Kickoff
-   Roadmap Builder
-   Architecture Planner

## Context

-   Context Builder
-   Context Optimizer

## Knowledge

-   Knowledge Extractor
-   Handbook Sync
-   Wiki Generator

## Documentation

-   README Generator
-   Case Study Generator
-   API Documentation

## Development

-   Code Review
-   Dependency Analyzer
-   Test Generator

## Operations

-   Backup
-   Scheduler
-   Notification
-   Synchronization

------------------------------------------------------------------------

# Relationship to Other Standards

-   **AJS-001** defines the developer workflow.
-   **AJS-002** defines context assembly.
-   **AJS-003** defines knowledge ownership.
-   **AJS-004** defines AJ-OS Agent behavior.
-   **AJS-005** will define automation orchestration.
-   **AJS-006** will define knowledge lifecycle governance.

------------------------------------------------------------------------

# Design Principles

-   One purpose per agent.
-   Prefer composition over complexity.
-   Keep implementations replaceable.
-   Standardize interfaces.
-   Make execution observable.
-   Default to human approval.
-   Optimize for maintainability over cleverness.

------------------------------------------------------------------------

# Future Extensions

Future versions of this standard may define:

-   Agent discovery
-   Version compatibility
-   Health monitoring
-   Performance metrics
-   Agent-to-agent communication
-   Security profiles
-   Capability negotiation

The goal is for every AJ-OS Agent to be plug-and-play within the AJ-OS
ecosystem.
