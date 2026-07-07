# AJS-002 Appendix B --- Context Package Schema

**Status:** Draft v1.0

## Purpose

This appendix defines the canonical structure of a `Context.md` file.

Every Context Builder implementation MUST produce a package that follows
this schema.

Every coding agent SHOULD be able to consume it without requiring
additional formatting.

------------------------------------------------------------------------

# Design Goals

-   Consistent
-   Human-readable
-   AI-friendly
-   Minimal
-   Deterministic
-   Model-agnostic

------------------------------------------------------------------------

# Metadata

``` yaml
context_version: 1.0
generated_at:
project:
task:
branch:
commit:
context_builder_version:
```

------------------------------------------------------------------------

# Required Sections

## 1. Objective

Describe the requested work in one concise paragraph.

------------------------------------------------------------------------

## 2. Success Criteria

A checklist defining what "done" means.

Example:

-   Feature implemented
-   Tests passing
-   Documentation updated

------------------------------------------------------------------------

## 3. Constraints

Project-specific requirements.

Examples:

-   Use Fastify
-   Do not change public APIs
-   Maintain backwards compatibility
-   Do not edit unrelated files

------------------------------------------------------------------------

## 4. Relevant Architecture

Only architecture needed for the task.

Include:

-   Components
-   Services
-   Data flow
-   Dependencies

------------------------------------------------------------------------

## 5. Coding Standards

Summarize the applicable standards.

Examples:

-   Naming conventions
-   Folder structure
-   Error handling
-   Testing requirements

------------------------------------------------------------------------

## 6. Related Documentation

References to project documentation relevant to the task.

Include only documents directly related to the implementation.

------------------------------------------------------------------------

## 7. Handbook References

Reusable knowledge required for this task.

Examples:

-   OAuth checklist
-   API design playbook
-   Deployment checklist

------------------------------------------------------------------------

## 8. Wiki References

Relevant evergreen concepts.

Examples:

-   JWT
-   OAuth
-   MCP
-   Fastify routing

------------------------------------------------------------------------

## 9. Files Likely to Change

List probable files.

Purpose:

Help the coding agent focus immediately.

------------------------------------------------------------------------

## 10. Existing Implementation Patterns

Show similar implementations already present in the project.

Prefer references over copying large code blocks.

------------------------------------------------------------------------

## 11. Risks & Edge Cases

Document known risks.

Examples:

-   Security concerns
-   Breaking changes
-   Performance implications

------------------------------------------------------------------------

## 12. Open Questions

Questions requiring clarification before implementation.

Leave empty if none exist.

------------------------------------------------------------------------

# Optional Sections

Include only when useful:

-   Recent commits
-   Related ADRs
-   Database schema
-   API contracts
-   External documentation
-   Performance requirements

------------------------------------------------------------------------

# Exclusions

Never include:

-   Entire repositories
-   Irrelevant documentation
-   Duplicate information
-   Meeting notes unrelated to the task
-   Historical discussions with no implementation value

------------------------------------------------------------------------

# Validation Checklist

A Context Package is valid when:

-   [ ] Metadata is complete.
-   [ ] All required sections exist.
-   [ ] Information is relevant.
-   [ ] No duplicate content exists.
-   [ ] References are accurate.
-   [ ] The package is understandable without opening unrelated
    documents.

------------------------------------------------------------------------

# Minimal Template

``` markdown
# Context Package

## Objective

## Success Criteria

## Constraints

## Relevant Architecture

## Coding Standards

## Related Documentation

## Handbook References

## Wiki References

## Files Likely to Change

## Existing Implementation Patterns

## Risks & Edge Cases

## Open Questions
```

------------------------------------------------------------------------

# Relationship to AJS-002

This appendix defines the structure of the output.

AJS-002 defines how the content is assembled.

Appendix A defines how the content is ranked.

Together they form the complete Context Assembly specification.
