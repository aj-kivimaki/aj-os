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

function frontmatter(lines: readonly string[]): string {
  return ["---", ...lines, "---"].join("\n");
}

function sourcesBlock(sources: readonly string[]): string[] {
  return ["sources:", ...sources.map((id) => `  - ${id}`)];
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

  const pages: CompiledPage[] = [];

  // Entity pages.
  for (const { slug, item } of entities) {
    const title = item.name;
    pages.push({
      path: `entities/${slug}.md`,
      kind: "entity",
      title,
      sources: provenance,
      content: [
        frontmatter([
          "type: entity",
          `title: ${yamlString(title)}`,
          `entity_type: ${item.type}`,
          ...sourcesBlock(provenance),
          `created: ${date}`,
          `updated: ${date}`,
          `generated_at: ${generatedAt}`,
        ]),
        "",
        item.description,
        "",
        `Source: [[${summaryLink}|${extraction.summary.title}]]`,
        "",
      ].join("\n"),
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
      content: [
        frontmatter([
          "type: concept",
          `title: ${yamlString(title)}`,
          ...sourcesBlock(provenance),
          `created: ${date}`,
          `updated: ${date}`,
          `generated_at: ${generatedAt}`,
        ]),
        "",
        item.description,
        "",
        `Source: [[${summaryLink}|${extraction.summary.title}]]`,
        "",
      ].join("\n"),
    });
  }

  // Source summary page — links out to every entity and concept, and to the
  // origin document (full-path form) for provenance.
  const body: string[] = [
    frontmatter([
      "type: source",
      `title: ${yamlString(extraction.summary.title)}`,
      ...sourcesBlock(provenance),
      `hash: ${source.hash}`,
      `created: ${date}`,
      `updated: ${date}`,
      `generated_at: ${generatedAt}`,
    ]),
    "",
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
  body.push(
    "",
    "## Source",
    `[[${relativeNoExt}|${extraction.summary.title}]]`,
    "",
  );

  pages.push({
    path: summaryPath,
    kind: "source",
    title: extraction.summary.title,
    sources: provenance,
    content: body.join("\n"),
  });

  return pages;
}
