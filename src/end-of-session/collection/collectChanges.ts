/**
 * Analyzer execution — deterministic partial collection (the Collection stage).
 *
 *   AnalyzerRegistry + Session → collectChanges → ChangeSet
 *
 * This is the analyzer-agnostic execution stage: it runs whatever analyzers the
 * registry holds and aggregates their output into an immutable {@link ChangeSet}.
 * It knows nothing about git or any concrete analyzer — it only invokes the
 * {@link Analyzer} port and assembles the result.
 *
 * Collection is **partial**: a single analyzer failing never aborts collection.
 * An analyzer that resolves contributes its {@link SessionChange}s; an analyzer
 * that rejects contributes exactly one {@link AnalyzerError}. Both travel together
 * in the returned `ChangeSet` (mirrors the SPEC-002 `CollectionResult`).
 *
 * Collection is **deterministic**: the registry's insertion order is
 * authoritative. Analyzers run concurrently, but completion order never influences
 * the result — settled outcomes are walked back in registry index order. Once
 * collection begins, failures are represented exclusively as `AnalyzerError` data,
 * never re-thrown.
 */

import type { Session } from "../contracts/session/index.js";
import {
  parseAnalyzerError,
  parseChangeSet,
} from "../contracts/change/index.js";
import type {
  Analyzer,
  AnalyzerError,
  ChangeSet,
  SessionChange,
} from "../contracts/change/index.js";
import type { AnalyzerRegistry } from "../registry/index.js";

/**
 * Derive a human-readable failure message from an opaque rejection reason.
 *
 * The execution stage never inspects an analyzer's internals; it takes only the
 * rejection's message text (never a stack trace or runtime object). A non-empty
 * `Error` message or string reason is used verbatim; anything else falls back to a
 * stable generic message so the error's `message` is always non-empty and
 * deterministic (the SPEC-002 `describeFailure` idiom).
 */
function describeFailure(reason: unknown): string {
  if (reason instanceof Error && reason.message.length > 0) {
    return reason.message;
  }
  if (typeof reason === "string" && reason.length > 0) {
    return reason;
  }
  return "The analyzer failed to contribute changes.";
}

/**
 * Represent a single analyzer rejection as a deterministic `AnalyzerError`.
 *
 * Every failure the execution stage catches is `recoverable: true`: because
 * collection never aborts, catching a rejection means collection continued past
 * it. The `analyzer` field derives from the analyzer's registry-unique `id`, so
 * failure records are stable across runs. Built via `parseAnalyzerError`, so the
 * error is validated and deep-frozen.
 */
function toAnalyzerError(analyzer: Analyzer, reason: unknown): AnalyzerError {
  return parseAnalyzerError({
    analyzer: analyzer.id,
    message: describeFailure(reason),
    recoverable: true,
  });
}

/**
 * Execute every registered analyzer for a session and assemble a deterministic,
 * immutable `ChangeSet` under the partial-collection model.
 *
 * Analyzers run concurrently via `Promise.all`, each wrapped in its own try/catch
 * so it can never reject the batch. `Promise.all` preserves registry order
 * regardless of completion timing; fulfilled analyzers contribute their changes in
 * their own returned order, rejected ones contribute one `AnalyzerError`. The
 * result is built through `parseChangeSet`, which validates and deep-freezes it.
 */
export async function collectChanges(
  registry: AnalyzerRegistry,
  session: Session,
): Promise<ChangeSet> {
  // Each analyzer's rejection is captured as an AnalyzerError rather than
  // re-thrown, so a single failure cannot abort the batch.
  const outcomes = await Promise.all(
    registry.analyzers.map(async (analyzer) => {
      try {
        const contributed = await analyzer.analyze(session);
        return { changes: contributed } as const;
      } catch (reason) {
        return { error: toAnalyzerError(analyzer, reason) } as const;
      }
    }),
  );

  const changes: SessionChange[] = [];
  const errors: AnalyzerError[] = [];

  for (const outcome of outcomes) {
    if ("error" in outcome) {
      errors.push(outcome.error);
    } else {
      for (const change of outcome.changes) {
        changes.push(change);
      }
    }
  }

  return parseChangeSet({ sessionId: session.id, changes, errors });
}
