/**
 * Selection Policy — deterministic evaluation (CB-015).
 *
 * Evaluation is the per-item judgement at the heart of the Selection Policy: a
 * pure, deterministic predicate that decides whether a single {@link KnowledgeItem}
 * is **eligible** to continue through the pipeline. It answers one question about
 * one item — "does this item carry knowledge worth selecting?" — and nothing else.
 *
 * The platform meaning of eligibility at Milestone M3 is deliberately narrow: an
 * item is eligible iff it **carries knowledge** (its `content` is non-empty). This
 * is expressed here as executable platform policy rather than assumed from the
 * CB-004 contract's `content` (min length 1): the policy states its own rule and
 * does not depend on an upstream schema for its correctness. Because a
 * contract-valid `KnowledgeItem` always carries knowledge, evaluation admits every
 * well-formed item at M3 — Selection is profile-agnostic here and introduces **no**
 * business-specific heuristic, no scoring and no runtime state (PIPELINE-ARCHITECTURE
 * §Selection, §Deterministic Behaviour). Future Context Profiles (M5) modulate
 * eligibility through this same predicate seam without changing the SelectionResult
 * contract.
 *
 * Evaluation is **stateless** and **preserves knowledge identity**: it reads a
 * KnowledgeItem and never modifies, rewrites, merges or summarizes it. It does not
 * execute the Selection Engine, construct a SelectionResult, communicate with
 * providers, or expose any priority/score/ranking value — those are out of scope
 * for CB-015 (they belong to CB-016 and later).
 */

import type { KnowledgeItem } from "../../providers/index.js";

/**
 * A deterministic, side-effect-free predicate over a single immutable
 * {@link KnowledgeItem}. Returns `true` when the item satisfies the predicate.
 *
 * A predicate never mutates its argument and never depends on runtime state, so
 * the same item always yields the same result.
 */
export type KnowledgeItemPredicate = (item: KnowledgeItem) => boolean;

/**
 * Deterministic eligibility evaluation for a single KnowledgeItem.
 *
 * An item is eligible to be selected iff it **carries knowledge** — i.e. its
 * `content` is non-empty. This is the platform's M3 eligibility rule, stated as
 * executable policy. It introduces no profile, no business heuristic and no
 * scoring: every contract-valid KnowledgeItem is eligible, and evaluation is a
 * pure function of the item alone.
 *
 * @param item - the immutable KnowledgeItem to evaluate (never modified)
 * @returns `true` when the item is eligible to continue through the pipeline
 */
export const evaluateKnowledgeItem: KnowledgeItemPredicate = (item) =>
  item.content.length > 0;
