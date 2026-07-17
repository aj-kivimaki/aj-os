/**
 * Analyzer Registry public factory.
 *
 * The Analyzer Registry is an immutable catalogue of {@link Analyzer}s:
 *
 *   Analyzers → validation → immutable registry → lookup
 *
 * It is a pure **infrastructure** component that owns deterministic registration and
 * lookup only. It never executes, discovers, loads, configures, orders-by-policy,
 * retries, reports on, or builds a `ChangeSet` from its analyzers — collection
 * execution and partial-collection error handling are M2. It is created once through
 * a factory and never mutated, mirroring the SPEC-002 provider registry (CB-005) so
 * the registry architecture stays consistent across AJ-OS.
 */

import type { Analyzer } from "../contracts/change/index.js";

/**
 * Immutable catalogue of the {@link Analyzer}s available to the End-of-Session
 * workflow.
 *
 * The registry exposes the registered analyzers and retrieves an analyzer by its
 * identifier. It is analyzer-agnostic: it knows nothing about how an analyzer
 * observes changes, only its stable `id`. The registry is frozen at construction —
 * there is no way to add, remove, or reorder analyzers afterwards, and it exposes
 * no `run`/execute method.
 */
export interface AnalyzerRegistry {
  /**
   * The registered analyzers, in the caller's insertion order (deterministic: the
   * same input always yields the same order). The array is immutable.
   */
  readonly analyzers: readonly Analyzer[];
  /**
   * Retrieve an analyzer by its identifier, or `undefined` if no analyzer with that
   * `id` is registered.
   */
  get(id: string): Analyzer | undefined;
}

/**
 * Create an immutable Analyzer Registry from a collection of analyzers.
 *
 * Analyzers are validated during construction: every analyzer must carry a
 * non-empty string `id` (the identifier the registry keys on), and analyzer `id`s
 * must be unique. A missing/empty or duplicate `id` throws an `Error` — the
 * catalogue is rejected rather than silently built in a broken state.
 *
 * Ordering is deterministic: `analyzers` preserves the caller's insertion order.
 * The returned handle and its `analyzers` array are frozen; the analyzer objects
 * themselves are caller-owned and are not frozen. The registry never invokes an
 * analyzer's `analyze` method — execution is the collection stage's concern (M2).
 *
 * @example
 * const registry = createAnalyzerRegistry([gitAnalyzer]);
 * registry.get("git"); // gitAnalyzer | undefined
 * registry.analyzers;  // readonly [gitAnalyzer]
 */
export function createAnalyzerRegistry(analyzers: readonly Analyzer[]): AnalyzerRegistry {
  const byId = new Map<string, Analyzer>();

  for (const analyzer of analyzers) {
    const id = analyzer.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new Error(
        "createAnalyzerRegistry: every analyzer must have a non-empty string id.",
      );
    }
    if (byId.has(id)) {
      throw new Error(`createAnalyzerRegistry: duplicate analyzer id "${id}".`);
    }
    byId.set(id, analyzer);
  }

  const ordered: readonly Analyzer[] = Object.freeze([...analyzers]);

  return Object.freeze({
    analyzers: ordered,
    get(id: string): Analyzer | undefined {
      return byId.get(id);
    },
  });
}
