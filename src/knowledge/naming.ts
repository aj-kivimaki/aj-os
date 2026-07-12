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
