# Archive

This directory preserves **superseded implementations of AJ-OS** — the project
as it *was*, frozen as-built. It is kept intentionally separate from the active
documentation so that `docs/` always describes AJ-OS **today**.

## The rule

- **`docs/` describes AJ-OS as it exists now.** If a document explains the
  current operating system, it belongs in the active documentation.
- **`docs/archive/` preserves superseded implementations.** If a document
  explains a previous generation that no longer reflects how AJ-OS works, it
  belongs here.

This is the [VISION](../VISION.md) test restated for placement: *describes
AJ-OS today → active; explains a superseded implementation → archive.*

## What the archive is (and is not)

Archived documents are **primary artifacts, frozen.** They are the technical
record of a past implementation and are **not maintained or updated** — cross
references inside them point to other archived documents as they existed at the
time.

> This is distinct from the project's **narrative** history — how and why AJ-OS
> evolved — which will live in a dedicated `PROJECT-STORY`, written in the
> present tense about the past. An archive holds superseded source documents; a
> story explains the journey. They are kept separate on purpose.

## Contents

- [`v1/`](v1/README.md) — the original AJ-OS: a code-first Notion **business**
  operating system (Business Modules synchronized into a Notion workspace).
  Superseded by the current context/knowledge platform.

## What AJ-OS is today

See [`docs/VISION.md`](../VISION.md) for the current identity and
[`docs/architecture/`](../architecture/) for the current architecture.
