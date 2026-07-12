/**
 * Wiki Renderer contract — ADR-005.
 *
 * The stage that turns renderer-agnostic {@link ExtractedKnowledge} into
 * Markdown pages, using the **canonical identities** the IdentityResolver
 * decided. Because paths and links come from resolved identities, links are
 * canonical by construction — pages are never rendered with candidate slugs
 * and repaired later.
 *
 * This is one renderer of potentially several (a graph export or search
 * index could consume the same extraction); it is the only stage that knows
 * Markdown and the wiki page schema (SPEC-005 §22.6).
 */
import type {
  CompiledPage,
  ExtractedKnowledge,
} from "../compiler/index.js";
import type { PageKind } from "../identity/index.js";

/** The canonical identity a candidate resolved to (existing or new). */
export interface ResolvedIdentity {
  /** Canonical wiki path, e.g. `entities/game-audio.md`. */
  readonly path: string;
  /** Canonical display title (the existing page's, or the candidate's). */
  readonly title: string;
  readonly kind: PageKind;
  /** True when this candidate is a new page, false when it merges into one. */
  readonly isNew: boolean;
}

export interface WikiRenderer {
  /**
   * Render the extraction into pages. `identities` maps each extracted
   * candidate name to its resolved canonical identity, so paths and
   * `[[wiki-links]]` use canonical targets throughout. `generatedAt` is the
   * ISO timestamp stamped into frontmatter (deterministic).
   */
  render(
    extracted: ExtractedKnowledge,
    identities: ReadonlyMap<string, ResolvedIdentity>,
    generatedAt: string,
  ): CompiledPage[];
}
