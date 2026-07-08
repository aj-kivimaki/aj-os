Perform a repository documentation consistency review.

Do not implement code.

Do not modify anything yet.

This is a documentation audit only.

Read the entire repository documentation hierarchy.

Review all documentation that tracks project status, planning, implementation progress, milestones, retrospectives, roadmaps, worklogs, changelogs, and implementation status.

Include, where applicable:

Repository level

- README.md
- ROADMAP.md
- CHANGELOG.md
- PROJECTS.md (if present)
- WORKLOG.md (if present)
- any repository-level milestone or planning documents

Implementation framework

- implementation/README.md
- implementation/MILESTONES.md
- implementation/review/*
- implementation/templates/*
- implementation/worklog/*
- implementation/changelog/*
- implementation/logs/*
- any implementation planning documents

SPEC-002

- README.md
- MILESTONES.md
- RETROSPECTIVE.md
- RETROSPECTIVE-M2.md
- task documents
- decision records
- changelog
- roadmap references
- implementation status
- milestone status

Review every document for consistency.

Specifically verify:

1.

Implementation status is synchronized everywhere.

2.

Milestone status is synchronized everywhere.

3.

Roadmaps match completed work.

4.

README files accurately describe the current implementation.

5.

Implementation progress matches the completed tasks.

6.

Completed tasks are marked complete everywhere.

7.

Future tasks remain correctly planned.

8.

Retrospectives are current.

9.

Changelogs include milestone-level changes.

10.

Decision records referenced by documentation actually exist.

11.

No document references obsolete task ordering.

12.

No document references old architecture.

13.

No document references renamed folders or modules.

14.

No document contradicts the current public API.

15.

Links between documentation remain valid.

16.

Implementation templates are still consistent with the engineering process established during Milestones 1 and 2.

For every issue found:

Classify it as:

Required

or

Optional

For each issue provide:

- affected file
- description
- reason
- recommended correction

If multiple documents should be synchronized together, identify all of them.

Do not modify any files.

Do not propose architectural changes.

Do not propose implementation changes.

This is a documentation consistency review only.

Conclude with exactly one recommendation:

PASS

PASS WITH MINOR CORRECTIONS

DO NOT UPDATE

Wait for approval before making any documentation changes.