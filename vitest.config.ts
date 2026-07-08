/**
 * Vitest configuration — AJ-OS contract testing foundation (CB-006).
 *
 * The Context Builder is the first production service; its tests are the
 * reference implementation for future AJ-OS platform services. The foundation
 * is intentionally deterministic and minimal:
 *
 * - `node` environment — the platform is a Node service, no DOM.
 * - Tests live under `tests/**` and exercise built modules through their public
 *   entry points only; the compiler build (`tsc`) owns `src/` (see tsconfig
 *   `include`), so the two never collide.
 * - No globals: `describe` / `it` / `expect` are imported explicitly, keeping
 *   test files self-documenting.
 * - No coverage/reporters/timeouts tuning yet — contract tests are pure and
 *   run in milliseconds; complexity is added by the task that needs it.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Determinism: no watch, no randomized order, no timers.
    globals: false,
  },
});
