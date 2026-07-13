/**
 * Wiki Renderer implementation.
 *
 * Renders an extraction into Markdown pages using the canonical identities the
 * IdentityResolver decided — paths and `[[wiki-links]]` are canonical by
 * construction. This is the only stage that knows Markdown and the page schema; it
 * is otherwise deterministic.
 */
import type { SourceRecord } from "../../ingestion/index.js";
import type {
  CompiledPage,
  ExtractedKnowledge,
  SourceExtraction,
} from "../compiler/index.js";
import { serializePage } from "../compiler/index.js";
import { pagePathFor } from "../naming.js";

import type { ResolvedIdentity, WikiRenderer } from "./WikiRenderer.js";

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

/** Wiki-link to a resolved identity: `[[entities/x|Title]]` (path without .md). */
function linkTo(identity: ResolvedIdentity): string {
  return `[[${identity.path.replace(/\.md$/, "")}|${identity.title}]]`;
}

/** Resolve a list of candidates to identities, deduped by canonical path. */
function resolveItems<T extends { name: string }>(
  items: readonly T[],
  identities: ReadonlyMap<string, ResolvedIdentity>,
): { identity: ResolvedIdentity; item: T }[] {
  const seen = new Set<string>();
  const out: { identity: ResolvedIdentity; item: T }[] = [];
  for (const item of items) {
    const identity = identities.get(item.name);
    if (identity === undefined || seen.has(identity.path)) {
      continue;
    }
    seen.add(identity.path);
    out.push({ identity, item });
  }
  return out;
}

/** Resolve `related` names to lateral links, skipping self and unknowns. */
function renderRelated(
  related: readonly string[] | undefined,
  identities: ReadonlyMap<string, ResolvedIdentity>,
  selfPath: string,
): string[] {
  const links: string[] = [];
  const seen = new Set<string>();
  for (const name of related ?? []) {
    const identity = identities.get(name);
    if (
      identity === undefined ||
      identity.path === selfPath ||
      seen.has(identity.path)
    ) {
      continue;
    }
    seen.add(identity.path);
    links.push(`- ${linkTo(identity)}`);
  }
  return links.length === 0 ? [] : ["", "## Related", ...links];
}

/**
 * Build slug-based identities for an extraction — the deterministic default
 * (path = slug, title = candidate name). Used by tests and the
 * SlugIdentityResolver path.
 */
export function buildSlugIdentities(
  extraction: SourceExtraction,
): Map<string, ResolvedIdentity> {
  const identities = new Map<string, ResolvedIdentity>();
  for (const entity of extraction.entities) {
    if (!identities.has(entity.name)) {
      identities.set(entity.name, {
        path: pagePathFor("entity", entity.name),
        title: entity.name,
        kind: "entity",
        isNew: true,
      });
    }
  }
  for (const concept of extraction.concepts) {
    if (!identities.has(concept.name)) {
      identities.set(concept.name, {
        path: pagePathFor("concept", concept.name),
        title: concept.name,
        kind: "concept",
        isNew: true,
      });
    }
  }
  return identities;
}

export function renderPages(
  source: SourceRecord,
  extraction: SourceExtraction,
  identities: ReadonlyMap<string, ResolvedIdentity>,
  generatedAt: string,
): CompiledPage[] {
  const relativePath = relativePathFromId(source.id);
  const relativeNoExt = relativePath.replace(/\.md$/, "");
  const summaryPath = `sources/${relativePath}`;
  const summaryLink = `sources/${relativeNoExt}`;
  const date = generatedAt.slice(0, 10);
  const provenance = [source.id];
  const summaryTitle = extraction.summary.title;

  const entities = resolveItems(extraction.entities, identities);
  const concepts = resolveItems(extraction.concepts, identities);

  const pages: CompiledPage[] = [];

  for (const { identity, item } of entities) {
    pages.push({
      path: identity.path,
      kind: "entity",
      title: identity.title,
      sources: provenance,
      content: serializePage(
        frontmatterText([
          "type: entity",
          `title: ${yamlString(identity.title)}`,
          `entity_type: ${item.type}`,
          ...sourcesBlock(provenance),
          `created: ${date}`,
          `updated: ${date}`,
          `generated_at: ${generatedAt}`,
        ]),
        [
          item.description,
          ...renderRelated(item.related, identities, identity.path),
          "",
          `Source: [[${summaryLink}|${summaryTitle}]]`,
        ].join("\n"),
      ),
    });
  }

  for (const { identity, item } of concepts) {
    pages.push({
      path: identity.path,
      kind: "concept",
      title: identity.title,
      sources: provenance,
      content: serializePage(
        frontmatterText([
          "type: concept",
          `title: ${yamlString(identity.title)}`,
          ...sourcesBlock(provenance),
          `created: ${date}`,
          `updated: ${date}`,
          `generated_at: ${generatedAt}`,
        ]),
        [
          item.description,
          ...renderRelated(item.related, identities, identity.path),
          "",
          `Source: [[${summaryLink}|${summaryTitle}]]`,
        ].join("\n"),
      ),
    });
  }

  // Source summary — links out to every entity/concept and to the origin doc.
  const body: string[] = [
    ...extraction.summary.keyPoints.map((point) => `- ${point}`),
  ];
  if (entities.length > 0) {
    body.push("", "## Entities", ...entities.map(({ identity }) => `- ${linkTo(identity)}`));
  }
  if (concepts.length > 0) {
    body.push("", "## Concepts", ...concepts.map(({ identity }) => `- ${linkTo(identity)}`));
  }
  body.push("", "## Source", `[[${relativeNoExt}|${summaryTitle}]]`);

  pages.push({
    path: summaryPath,
    kind: "source",
    title: summaryTitle,
    sources: provenance,
    content: serializePage(
      frontmatterText([
        "type: source",
        `title: ${yamlString(summaryTitle)}`,
        ...sourcesBlock(provenance),
        `hash: ${source.hash}`,
        `created: ${date}`,
        `updated: ${date}`,
        `generated_at: ${generatedAt}`,
      ]),
      body.join("\n"),
    ),
  });

  return pages;
}

/** Create the Wiki Renderer stage. */
export function createWikiRenderer(): WikiRenderer {
  return {
    render: (extracted: ExtractedKnowledge, identities, generatedAt) =>
      renderPages(extracted.source, extracted.extraction, identities, generatedAt),
  };
}
