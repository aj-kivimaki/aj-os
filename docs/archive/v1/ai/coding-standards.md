# Coding Standards

## TypeScript

- Strict mode
- Avoid any
- Prefer readonly values where appropriate
- Explicit types when they improve readability

---

## Files

Small files.

Single responsibility.

---

## Functions

Prefer pure functions.

Keep functions short.

Avoid deep nesting.

---

## Naming

Use descriptive names.

Examples:

- DatabaseDefinition
- PropertyDefinition
- DatabaseBuilder
- createDatabase()
- validateEnvironment()

Avoid abbreviations.

---

## Imports

Group imports logically.

Avoid circular dependencies.

---

## Error Handling

Fail fast.

Provide meaningful error messages.

Never silently ignore failures.

---

## Comments

Explain why.

Avoid comments that merely describe what the code already says.

---

## Architecture

Business logic belongs in builders.

Notion API code belongs in the Notion layer.

Configuration belongs in config.

Utilities should remain generic.

---

## General Philosophy

Readable code is preferred over clever code.

Consistency is preferred over personal preference.
