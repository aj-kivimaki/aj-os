# Coverage — what the number means, and what it does not

> **Established by REX-208 (2026-07-17).** Read this before quoting a coverage figure.

`npm run test:coverage` measures test coverage and prints a report. **It is measured, not gated** —
there are no thresholds, deliberately. A threshold chosen before a baseline exists is a number, not
a standard.

## ⚠️ The headline is not repository coverage

**The reported percentage covers the files that appear in the report — not the codebase.**

At the time of writing, the report lists **43 of the 168 files** matched by `src/**/*.ts`. The
headline is therefore *"coverage of the files represented in the report"*, which is **a different
claim** from *"coverage of AJ-OS"*. Quoting it as the latter would be false.

## Why files go missing

`@vitest/coverage-v8` reports the files it **loaded**. That has a precise and non-obvious
consequence:

- A file with **no tests** still appears at **0%** — *provided something in its module graph was
  loaded.* `server.ts`, `src/agent/client.ts`, `src/api/errors.ts` and `src/config/agentEnv.ts` all
  show 0% correctly.
- A file in a module graph that **nothing imports at all** does not appear as 0%. **It disappears
  from the report entirely.**

**The report is not incapable of reporting bad news. Its limitation is that completely unreachable
module graphs vanish rather than reading zero.**

The clearest case *was* **`src/products/knowledge-assistant/KnowledgeAssistant.ts`** — for a long
time the repository's largest untested surface: zero tests, and **absent from the report
altogether**, because nothing imported it. That was exactly the file whose absence would most
inflate the headline. **REX-402 (F-053) has since given it injected dependencies and a test suite,
so something now imports it and it appears in the report as a genuine per-file row instead of
vanishing** — the vanishing-file problem made concrete, and then fixed. The mechanism it illustrated
still holds for any module graph that nothing imports at all.

## This is a tooling limit, not a configuration mistake

Established by investigation (REX-208), not assumption:

| Question | Answer |
|---|---|
| Does Vitest 4 still offer `coverage.all`? | **No** — removed; absent from the shipped type definitions; passing it changes nothing. |
| Does `coverage.include` restore it? | **No.** It *is* the v4 replacement and it **does** take effect (the headline moves when it changes), but the report still lists only loaded files. |
| Does the **istanbul** provider behave differently? | **No.** Installed and tested: identical behaviour, same figure, same omission. |

## How to read the report

- **Trust the per-file rows.** A file listed at 0% genuinely has no coverage.
- **Do not trust the headline as a repository figure.** It omits every unreachable module graph.
- **A file's absence is information**, not an oversight — it means nothing imports it. That is worth
  knowing on its own.

## What would fix it

Coverage becomes repository-wide when the unreachable graphs get tests. The largest one,
`KnowledgeAssistant.ts`, is already done: **REX M4 closed it (F-053)** — it once hard-wired its
dependencies and could not be constructed in a test without a real filesystem and a real API key; it
now takes injected dependencies and has a suite, so it enters the report instead of vanishing. The
remaining unreachable graphs are what still stands between the headline and a repository-wide figure.
**The measurement gap and the testing gap are the same gap.**
