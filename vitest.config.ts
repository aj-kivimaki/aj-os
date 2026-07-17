import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],

    // MEASURED, NOT GATED — deliberately, and this is the whole discipline of
    // the task. There are no thresholds here. A threshold picked before
    // measuring is a number, not a standard: it is either trivially met and
    // worthless, or arbitrary and gamed. Gating is a later review's decision,
    // made on this baseline.
    //
    // The baseline itself is NOT written into any document. A hard-coded metric
    // drifts by construction — REX M1 spent two findings (F-010, F-011) learning
    // that. The report regenerates; the number lives in CI output.
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // ⚠️ UNRESOLVED — REX-208 does not meet its acceptance criterion.
      //
      // v8 reports only files it LOADED. A file with zero tests is never
      // imported, so it VANISHES from the report rather than showing 0% —
      // and the headline number is flattering by omission.
      //
      // KnowledgeAssistant.ts (410 lines, zero tests, F-053 — the largest known
      // hole) is ABSENT from this report entirely. `coverage.all = true` did not
      // change the output under @vitest/coverage-v8 v4; the option appears to
      // have changed or been removed in Vitest 4.
      //
      // The headline below is therefore NOT trustworthy as a repository figure:
      // it measures the files the suite happens to touch, not the code that
      // ships. Recorded rather than papered over — a coverage report that
      // cannot show bad news is not measuring. See REX-208.
      // Coverage measures the code that ships. Excluding untested PRODUCTION
      // code to flatter the number would defeat the task — the report must be
      // able to show bad news, and it does: KnowledgeAssistant.ts (F-053) and
      // the agent layer (F-054) are known holes M4 owns.
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/index.ts", // re-export barrels: no logic to cover
        "src/**/types.ts", // type-only modules erase at runtime
      ],
    },
  },
});
