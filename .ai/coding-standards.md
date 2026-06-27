# Coding Standards

## TypeScript

- Strict mode
- Explicit types when useful
- Avoid `any`
- Prefer immutable values
- Prefer readonly where appropriate

---

## Files

Small files.

Single responsibility.

---

## Functions

Prefer pure functions.

Keep functions short.

Avoid deeply nested logic.

---

## Naming

Use descriptive names.

Avoid abbreviations.

Examples:

ProjectDefinition

DatabaseBuilder

createDatabase()

validateEnvironment()

---

## Imports

Group imports logically.

Avoid circular dependencies.

---

## Error Handling

Fail fast.

Provide clear error messages.

Never silently ignore errors.

---

## Comments

Explain why.

Do not explain obvious code.

---

## Architecture

Business logic belongs in builders.

Notion API calls belong inside the Notion layer.

Configuration belongs inside config.

Utilities should remain generic.
