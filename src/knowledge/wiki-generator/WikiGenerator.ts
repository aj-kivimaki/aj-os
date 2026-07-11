/**
 * Wiki Generator contract — SPEC-005.
 *
 * Maintains the LLM Wiki from normalized {@link SourceRecord}s. The
 * generator is composed with its connectors and store (it pulls sources
 * itself); orchestration simply calls {@link WikiGenerator.run}.
 *
 * Invariants (ARCH-002 §5, SPEC-005):
 * - Source-agnostic: operates only on normalized records, never branching
 *   on source type.
 * - Never performs version control (no git); never deletes pages headless
 *   (removal is *proposed* via {@link GenerationReport.removalProposals}).
 * - The wiki is not a mirror of the sources: removing a source triggers
 *   RECONCILE, not deletion.
 * - Every page records all contributing source ids; a reverse index
 *   (source id → pages) is maintained so changed/removed sources
 *   re-evaluate only affected pages.
 */

import type { SourceConnector } from "../../ingestion/index.js";
import type { WikiStore } from "../wiki-store/index.js";

/**
 * Composition of a Wiki Generator: the sources it pulls and the store it
 * persists through.
 */
export interface WikiGeneratorConfig {
  /** One or more source backends. Their records are merged by id. */
  readonly connectors: readonly SourceConnector[];
  /** The persistence destination for the wiki. */
  readonly store: WikiStore;
}

/** Incremental maintenance (default) or a lossy recovery/bootstrap rebuild. */
export type GenerationMode = "incremental" | "rebuild";

export interface RunOptions {
  /** Defaults to `"incremental"`. `"rebuild"` is a recovery path (ADR-002). */
  readonly mode?: GenerationMode;
}

/** Lifecycle state of a wiki page (SPEC-005 §12). */
export type PageStatus = "active" | "stale";

/**
 * A proposal to remove a page whose contributing sources are gone. The
 * generator never acts on this itself; orchestration/humans decide.
 */
export interface RemovalProposal {
  /** Wiki-relative path of the page proposed for removal. */
  readonly path: string;
  /** Human-readable justification. */
  readonly reason: string;
  /** Source ids that were removed and left the page orphaned. */
  readonly orphanedSources: readonly string[];
}

export type LintKind =
  | "contradiction"
  | "orphan"
  | "stale"
  | "hash-drift";

export interface LintFinding {
  readonly kind: LintKind;
  /** Wiki-relative path the finding concerns. */
  readonly path: string;
  readonly detail: string;
}

export interface LintReport {
  readonly findings: readonly LintFinding[];
}

/**
 * The outcome of a generation run. Orchestration reads this to decide on
 * page deletions (from {@link removalProposals}) and whether to commit.
 */
export interface GenerationReport {
  readonly mode: GenerationMode;
  /** Source ids compiled (added/modified) during INGEST. */
  readonly ingested: readonly string[];
  /** Source ids re-evaluated (removed/moved) during RECONCILE. */
  readonly reconciled: readonly string[];
  /** Wiki-relative paths written this run. */
  readonly updatedPages: readonly string[];
  /** Wiki-relative paths marked `stale` this run. */
  readonly stalePages: readonly string[];
  /** Pages the generator proposes removing (never auto-deleted). */
  readonly removalProposals: readonly RemovalProposal[];
  /** LINT results for this run. */
  readonly lint: LintReport;
  /** The provenance-stamped log entry appended for this run. */
  readonly logEntry: string;
}

/**
 * The Wiki Generator.
 *
 * Constructed from a {@link WikiGeneratorConfig}; the concrete factory is
 * defined by the implementation behind this contract.
 */
export interface WikiGenerator {
  /**
   * Run the full incremental cycle: detect changes (added/modified/
   * removed) → INGEST → RECONCILE → cross-reference & provenance →
   * persist → LINT. Returns a report; performs no git and no headless
   * deletion.
   */
  run(options?: RunOptions): Promise<GenerationReport>;

  /**
   * Run LINT alone (contradictions, orphans, stale, hash-drift). Suitable
   * for independent scheduling; performs no writes beyond what LINT
   * records.
   */
  lint(): Promise<LintReport>;
}
