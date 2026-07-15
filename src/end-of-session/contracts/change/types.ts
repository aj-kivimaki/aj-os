/**
 * Session change contract types. Data types are inferred from the Zod schemas and
 * wrapped in `DeepReadonly` so the runtime and compile-time contracts can never
 * drift. `Analyzer` is a behavioural contract (it has a method), so it is a
 * TypeScript interface rather than a schema — the sole abstraction every analyzer
 * implements (mirroring the CB-004 `KnowledgeProvider`).
 */

import type { z } from "zod";

import type { DeepReadonly } from "../immutable.js";
import type { Session } from "../session/types.js";

import type {
  analyzerErrorSchema,
  analyzerMetadataSchema,
  changeKindSchema,
  changeSetSchema,
  changeTypeSchema,
  sessionChangeSchema,
} from "./schema.js";

/** A single normalized change an analyzer observed. */
export type SessionChange = DeepReadonly<z.infer<typeof sessionChangeSchema>>;

/** A single analyzer failure carried by a `ChangeSet` (partial collection). */
export type AnalyzerError = DeepReadonly<z.infer<typeof analyzerErrorSchema>>;

/** The aggregate collection outcome for a session — changes plus errors. */
export type ChangeSet = DeepReadonly<z.infer<typeof changeSetSchema>>;

/** The static identity an analyzer advertises. */
export type AnalyzerMetadata = DeepReadonly<
  z.infer<typeof analyzerMetadataSchema>
>;

/** The kind of change — a soft hint (see `changeKindSchema`). */
export type ChangeKind = z.infer<typeof changeKindSchema>;

/** How a path changed — a definite classification. */
export type ChangeType = z.infer<typeof changeTypeSchema>;

/**
 * A source of session changes — the extensibility seam for *what changed in a
 * session*. An analyzer identifies and describes itself (via {@link AnalyzerMetadata})
 * and, given an identified {@link Session}, contributes normalized
 * {@link SessionChange}s.
 *
 * `analyze` takes one immutable `Session` and is asynchronous so future file-, git-,
 * or API-backed analyzers satisfy the same contract without a signature change. The
 * returned array is `readonly`; the analyzer does not build a `ChangeSet`, aggregate
 * errors, apply policy, or persist — collection execution and partial-collection
 * error handling are owned by the registry-execution stage (M2), not the analyzer.
 */
export interface Analyzer extends AnalyzerMetadata {
  /** Contribute the changes this analyzer observed for the session. */
  analyze(session: Session): Promise<readonly SessionChange[]>;
}
