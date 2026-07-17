/**
 * ManualTriggerSource — the v1 trigger: a session ended explicitly (e.g.
 * `aj session end`). It builds a `SessionContext` from explicit inputs (CLI args)
 * and represents `trigger: "manual"`.
 *
 * It is the minimal real implementation of the {@link TriggerSource} seam: it holds
 * the raw input and, on `createContext()`, validates it into an immutable
 * `SessionContext` (via the EOS-002 `parseSessionContext`). Validation happens at
 * production — that is the moment the context comes into existence. It reads no
 * config or environment beyond the input it is given; wiring (reading `AjConfig` /
 * CLI args) belongs to the composition root (M5).
 */

import { parseSessionContext, type SessionContext } from "../contracts/session/index.js";

import type { TriggerSource } from "./TriggerSource.js";

/**
 * Create the manual trigger source from the explicit session inputs.
 *
 * `input` is the untrusted raw `SessionContext` data (e.g. assembled from CLI
 * args); `createContext()` validates and freezes it via `parseSessionContext`,
 * throwing a `ZodError` if the inputs are invalid. The returned handle is frozen.
 *
 * @example
 * const source = createManualTriggerSource({
 *   project: "aj-os",
 *   repository: "systems/aj-os",
 *   branch: "feat/spec-003-m1-foundation",
 * });
 * source.trigger;              // "manual"
 * await source.createContext(); // validated, immutable SessionContext
 */
export function createManualTriggerSource(input: unknown): TriggerSource {
  return Object.freeze({
    trigger: "manual" as const,
    // `async` so an invalid-input `ZodError` surfaces as a rejected promise rather
    // than a synchronous throw — the method's `Promise` return contract must hold
    // for callers that only `.catch()`.
    async createContext(): Promise<SessionContext> {
      return parseSessionContext(input);
    },
  });
}
