/**
 * SelectionResult contract — runtime schema (CB-014).
 *
 * Defines the runtime-validated, public **SelectionResult contract**: the
 * canonical, complete, deterministic outcome of knowledge selection. Selection
 * consumes a {@link CollectionResult} (CB-009) and partitions its knowledge into
 * what continues through the pipeline and what does not — preserving **both**
 * sides so a later stage (explainability, M5) can describe the decision without
 * re-running selection (PIPELINE-ARCHITECTURE §Selection; CB-014).
 *
 * A `SelectionResult` therefore carries three stable platform concepts:
 *
 *   metadata · selectedItems · excludedItems
 *
 * - `metadata` is the **provenance** of the selection — the `KnowledgeRequest`
 *   (CB-004) this selection answers, carried forward from the CollectionResult it
 *   consumed. It is reused wholesale (composition, not duplication), mirroring how
 *   CB-009 records the answered request as its metadata. It is deterministic and
 *   provider-agnostic.
 * - `selectedItems` compose the CB-004 `knowledgeItemSchema`. The array is an
 *   **ordered** collection: its order is the canonical deterministic contract that
 *   Assembly (M4) consumes exactly as given.
 * - `excludedItems` compose the same CB-004 `knowledgeItemSchema` — the knowledge
 *   selection did not carry forward, preserved unchanged.
 *
 * This task defines *what a completed selection is*, not *how it is produced*. No
 * Selection Engine execution, Selection Policy, evaluation, prioritization,
 * ordering logic, filtering, duplicate elimination or Context Builder integration
 * lives here. **KnowledgeItems are never modified, rewritten, merged or
 * summarized** — a SelectionResult holds references to the original immutable
 * items (Knowledge Identity, PIPELINE-ARCHITECTURE).
 *
 * The contract is deterministic and immutable: `parseSelectionResult()` validates
 * then deep-freezes. Both arrays may be empty (an empty result is valid).
 *
 * **Ordering is the contract.** `selectedItems` exposes the deterministic ordering
 * directly; the contract carries **no** explicit priority, score or ranking field.
 * Any priority used to derive the ordering is an implementation detail of the
 * Selection Policy (CB-015), never part of this contract.
 */

import { z } from "zod";

import { collectionResultMetadataSchema } from "../../collection/result/schema.js";
import type { DeepReadonly } from "../../package/types.js";
import { knowledgeItemSchema } from "../../providers/schema.js";

import type { SelectionResult } from "./types.js";

/**
 * Provenance metadata for a selection result.
 *
 * A `SelectionResult` records *which request the selection answered*. That
 * provenance is exactly the request a `CollectionResult` already carries, so the
 * metadata is **reused** from the adjacent upstream stage rather than redefined —
 * `selectionResultMetadataSchema = collectionResultMetadataSchema` (itself the
 * CB-004 {@link knowledgeRequestSchema}, `{ project, task, branch?, commit?,
 * issue? }`). Reusing the collection's metadata guarantees the selection
 * provenance can never drift from the request that flowed through collection, and
 * keeps the pipeline single-sourced (Selection knows only the public contract of
 * its adjacent stage, PIPELINE-ARCHITECTURE §Stage Independence).
 *
 * The metadata is deliberately provenance only. Execution-specific information —
 * timestamps, durations, counters, diagnostics or runtime detail — is **not**
 * part of this contract (it would break determinism and leak implementation
 * detail).
 */
export const selectionResultMetadataSchema = collectionResultMetadataSchema;

/**
 * The SelectionResult contract.
 *
 * The complete, deterministic outcome of knowledge selection: the request the
 * selection answered (`metadata`), the ordered knowledge that continues through
 * the pipeline (`selectedItems`), and the knowledge that does not
 * (`excludedItems`). The schema is `.strict()` so no priority-, score-,
 * ranking- or execution-specific field can enter the contract; `selectedItems`
 * and `excludedItems` compose the existing CB-004 `KnowledgeItem` contract
 * unchanged. Both arrays may be empty.
 *
 * `selectedItems` is ordered, and that order is the public platform guarantee
 * Assembly consumes as given. There is deliberately no `priority` field —
 * ordering *is* the contract.
 */
export const selectionResultSchema = z
  .object({
    /** Provenance: the request this selection answered (CB-004, reused). */
    metadata: selectionResultMetadataSchema,
    /**
     * Knowledge selected to continue through the pipeline (CB-004; may be empty).
     * Ordered — the order is the canonical deterministic contract Assembly
     * consumes exactly as provided. The contract exposes no priority field.
     */
    selectedItems: z.array(knowledgeItemSchema),
    /**
     * Knowledge selection did not carry forward (CB-004; may be empty). Preserved
     * unchanged to support future deterministic explainability without re-running
     * selection.
     */
    excludedItems: z.array(knowledgeItemSchema),
  })
  .strict();

/**
 * Recursively freeze a value, returning it typed as deeply immutable, so a
 * parsed contract is immutable at runtime as well as in the types.
 */
function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}

/**
 * Validate an unknown value against the `SelectionResult` contract and return a
 * deeply-immutable result. Throws a `ZodError` if validation fails (invalid
 * shape, unknown keys, a malformed metadata request, or a malformed selected/
 * excluded item).
 */
export function parseSelectionResult(input: unknown): SelectionResult {
  return deepFreeze(selectionResultSchema.parse(input));
}
