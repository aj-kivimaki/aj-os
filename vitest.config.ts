import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],

    // MEASURED, NOT GATED — deliberately. There are no thresholds here. A
    // threshold picked before measuring is a number, not a standard: either
    // trivially met and worthless, or arbitrary and gamed. Gating is a later
    // review's decision, made on this baseline.
    //
    // The baseline is NOT written into any document. A hard-coded metric drifts
    // by construction — REX M1 spent two findings (F-010, F-011) learning that.
    // The report regenerates; the number lives in CI output.
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/index.ts", // re-export barrels: no logic to cover
        "src/**/types.ts", // type-only modules erase at runtime
      ],
    },
  },
});
