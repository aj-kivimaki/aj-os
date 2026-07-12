/**
 * Deterministic rendering: turn a validated {@link SourceExtraction} into
 * fully-rendered wiki pages (SPEC-005 §21.5 frontmatter, kebab-case slugs,
 * Obsidian `[[wiki-links]]`). Pure and side-effect-free, so the page schema
 * and graph links are validated without the LLM.
 *
 * Graph shape (this slice): the source summary links out to every entity and
 * concept it introduced; each entity/concept links back to the summary; the
 * summary links to the origin document in full-path form for provenance.
 */
import type { SourceRecord } from "../../ingestion/index.js";

import type { CompiledPage } from "./KnowledgeCompiler.js";
import type { SourceExtraction } from "./extraction.js";
import { serializePage } from "./regions.js";

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

function relativePathFromId(id: string): string {
  const idx = id.indexOf(":");
  return idx === -1 ? id : id.slice(idx + 1);
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function frontmatterText(lines: readonly string[]): string {
  return lines.join("\n");
}

function sourcesBlock(sources: readonly string[]): string[] {
  return ["sources:", ...sources.map((id) => `  - ${id}`)];
}

interface LookupEntry {
  readonly kind: "entity" | "concept";
  readonly slug: string;
  readonly name: string;
}

/**
 * Resolve `related` names to lateral `[[wiki-links]]`, skipping self and any
 * name that isn't one of this source's extracted items (so links never break).
 * Returns the "## Related" section lines, or [] when there are none.
 */
function renderRelated(
  related: readonly string[] | undefined,
  lookup: ReadonlyMap<string, LookupEntry>,
  selfSlug: string,
): string[] {
  const links: string[] = [];
  const seen = new Set<string>();
  for (const name of related ?? []) {
    const entry = lookup.get(slugify(name));
    if (entry === undefined || entry.slug === selfSlug || seen.has(entry.slug)) {
      continue;
    }
    seen.add(entry.slug);
    const dir = entry.kind === "entity" ? "entities" : "concepts";
    links.push(`- [[${dir}/${entry.slug}|${entry.name}]]`);
  }
  return links.length === 0 ? [] : ["", "## Related", ...links];
}

/** Dedupe by slug, keeping the first occurrence. */
function bySlug<T extends { name: string }>(
  items: readonly T[],
): { slug: string; item: T }[] {
  const seen = new Set<string>();
  const out: { slug: string; item: T }[] = [];
  for (const item of items) {
    const slug = slugify(item.name);
    if (seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    out.push({ slug, item });
  }
  return out;
}

export function renderPages(
  source: SourceRecord,
  extraction: SourceExtraction,
  generatedAt: string,
): CompiledPage[] {
  const relativePath = relativePathFromId(source.id);
  const relativeNoExt = relativePath.replace(/\.md$/, "");
  const summaryPath = `sources/${relativePath}`;
  const summaryLink = `sources/${relativeNoExt}`;
  const date = generatedAt.slice(0, 10);
  const provenance = [source.id];

  const entities = bySlug(extraction.entities);
  const concepts = bySlug(extraction.concepts);

  // Name → page lookup for resolving lateral `related` links.
  const lookup = new Map<string, LookupEntry>();
  for (const { slug, item } of entities) {
    if (!lookup.has(slug)) {
      lookup.set(slug, { kind: "entity", slug, name: item.name });
    }
  }
  for (const { slug, item } of concepts) {
    if (!lookup.has(slug)) {
      lookup.set(slug, { kind: "concept", slug, name: item.name });
    }
  }

  const pages: CompiledPage[] = [];

  // Entity pages.
  for (const { slug, item } of entities) {
    const title = item.name;
    pages.push({
      path: `entities/${slug}.md`,
      kind: "entity",
      title,
      sources: provenance,
      content: serializePage(
        frontmatterText([
          "type: entity",
          `title: ${yamlString(title)}`,
          `entity_type: ${item.type}`,
          ...sourcesBlock(provenance),
          `created: ${date}`,
          `updated: ${date}`,
          `generated_at: ${generatedAt}`,
        ]),
        [
          item.description,
          ...renderRelated(item.related, lookup, slug),
          "",
          `Source: [[${summaryLink}|${extraction.summary.title}]]`,
        ].join("\n"),
      ),
    });
  }

  // Concept pages.
  for (const { slug, item } of concepts) {
    const title = item.name;
    pages.push({
      path: `concepts/${slug}.md`,
      kind: "concept",
      title,
      sources: provenance,
      content: serializePage(
        frontmatterText([
          "type: concept",
          `title: ${yamlString(title)}`,
          ...sourcesBlock(provenance),
          `created: ${date}`,
          `updated: ${date}`,
          `generated_at: ${generatedAt}`,
        ]),
        [
          item.description,
          ...renderRelated(item.related, lookup, slug),
          "",
          `Source: [[${summaryLink}|${extraction.summary.title}]]`,
        ].join("\n"),
      ),
    });
  }

  // Source summary page — links out to every entity and concept, and to the
  // origin document (full-path form) for provenance.
  const summaryFrontmatter = frontmatterText([
    "type: source",
    `title: ${yamlString(extraction.summary.title)}`,
    ...sourcesBlock(provenance),
    `hash: ${source.hash}`,
    `created: ${date}`,
    `updated: ${date}`,
    `generated_at: ${generatedAt}`,
  ]);
  const body: string[] = [
    ...extraction.summary.keyPoints.map((point) => `- ${point}`),
  ];
  if (entities.length > 0) {
    body.push(
      "",
      "## Entities",
      ...entities.map(
        ({ slug, item }) => `- [[entities/${slug}|${item.name}]]`,
      ),
    );
  }
  if (concepts.length > 0) {
    body.push(
      "",
      "## Concepts",
      ...concepts.map(
        ({ slug, item }) => `- [[concepts/${slug}|${item.name}]]`,
      ),
    );
  }
  body.push("", "## Source", `[[${relativeNoExt}|${extraction.summary.title}]]`);

  pages.push({
    path: summaryPath,
    kind: "source",
    title: extraction.summary.title,
    sources: provenance,
    content: serializePage(summaryFrontmatter, body.join("\n")),
  });

  return pages;
}
