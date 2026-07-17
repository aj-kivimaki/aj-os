import type { DeepReadonly } from "./types.js";

/**
 * Recursively freeze an object graph, returning it typed `DeepReadonly<T>`.
 *
 * The Context Builder's single deep-freeze helper (REX-401, F-051): five identical private
 * copies across the module's schema files were consolidated here, beside `DeepReadonly` — its
 * static companion. Scoped to `context-builder` deliberately; `end-of-session`'s parallel copy in
 * `contracts/immutable.ts` is a separate, ratified decision (EOS-005) and is not shared with this.
 */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}
