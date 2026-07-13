/**
 * Canonical naming — the one place slugs and page paths are derived, shared
 * by the IdentityResolver (to match candidates against existing pages) and
 * the WikiRenderer (to place pages and links). Deterministic.
 */

/** Kebab-case slug for a page filename / wiki-link. */
export function slugify(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "unnamed" : slug;
}

/** Canonical wiki path for an entity/concept of the given name. */
export function pagePathFor(kind: "entity" | "concept", name: string): string {
  const dir = kind === "entity" ? "entities" : "concepts";
  return `${dir}/${slugify(name)}.md`;
}

/**
 * The generator-owned top-level entries of a generated wiki — the single
 * source of truth for what the Knowledge Platform produces at the top level:
 * the rendered pages (`entities/`, `concepts/`, `sources/`), the generation
 * log (`log.md`), and the generator's private bookkeeping (`.generator/`).
 *
 * `aj wiki build` owns the lifecycle of everything it generates, so a
 * `--rebuild` removes exactly these before regenerating and preserves anything
 * else in the destination. If the generator ever gains another top-level
 * artifact, add it here — this list is the one place that defines ownership.
 */
export const GENERATED_WIKI_ARTIFACTS = [
  "entities",
  "concepts",
  "sources",
  "index.md",
  "log.md",
  ".generator",
] as const;
