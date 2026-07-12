/**
 * Page structure: frontmatter + a **generator-owned body** (ADR-002).
 *
 * The wiki is generator-owned: humans maintain the Handbook, AJ-OS maintains
 * the wiki. The entire page body is generator-owned — MERGE re-synthesizes it
 * under the enrichment guards (which preserve accumulated *generated*
 * knowledge, not manual edits). A hand-edited body is drift, surfaced by LINT
 * (hash), not preserved. The one exception is learned *compiler metadata* in
 * frontmatter (e.g. `aliases`), which survives regeneration (ADR-006).
 *
 * Also provides the small, mechanical extractors MERGE's guards rely on
 * (links, contradiction callouts) and a minimal frontmatter reader.
 */
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

export interface ParsedPage {
  /** Raw frontmatter text (between the `---` fences), without the fences. */
  readonly frontmatter: string;
  /** The generator-owned page body (everything after the frontmatter). */
  readonly body: string;
}

/** Split a page into frontmatter and body. */
export function parsePage(content: string): ParsedPage {
  const match = FRONTMATTER_RE.exec(content);
  if (match === null) {
    return { frontmatter: "", body: content.trim() };
  }
  return {
    frontmatter: match[1] ?? "",
    body: content.slice((match[0] ?? "").length).trim(),
  };
}

/** Reassemble a page from frontmatter + body. */
export function serializePage(frontmatter: string, body: string): string {
  return `---\n${frontmatter}\n---\n${body}\n`;
}

export interface Frontmatter {
  /** Scalar `key: value` fields (surrounding quotes stripped). */
  readonly fields: Readonly<Record<string, string>>;
  /** All list-valued fields (`sources:`, `aliases:`, `tags:`, …). */
  readonly lists: Readonly<Record<string, readonly string[]>>;
  /** The `sources:` list (convenience). */
  readonly sources: readonly string[];
  /** The `aliases:` list — learned identity knowledge (ADR-006). */
  readonly aliases: readonly string[];
}

/** Collect the `  - item` lines following index `i`; returns items + last index. */
function collectListItems(lines: string[], i: number): { items: string[]; end: number } {
  const items: string[] = [];
  let j = i + 1;
  for (; j < lines.length; j += 1) {
    const item = /^\s*-\s+(.*)$/.exec(lines[j] ?? "");
    if (item === null) {
      break;
    }
    items.push((item[1] ?? "").trim());
  }
  return { items, end: j - 1 };
}

/** Minimal reader for the controlled frontmatter format (§22.6). */
export function readFrontmatter(frontmatter: string): Frontmatter {
  const fields: Record<string, string> = {};
  const lists: Record<string, string[]> = {};
  const lines = frontmatter.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const listHeader = /^([a-z_]+):\s*$/.exec(line);
    if (listHeader !== null) {
      const { items, end } = collectListItems(lines, i);
      if (items.length > 0) {
        lists[listHeader[1] ?? ""] = items;
        i = end;
        continue;
      }
    }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (kv !== null) {
      let value = (kv[2] ?? "").trim();
      if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
      fields[kv[1] ?? ""] = value;
    }
  }
  return { fields, lists, sources: lists.sources ?? [], aliases: lists.aliases ?? [] };
}

/**
 * Learned compiler-metadata frontmatter keys — annotations (not knowledge)
 * that survive regeneration even though the body is generator-owned
 * (ADR-006). Currently just `aliases`; the human-feedback layer may add more.
 */
const LEARNED_METADATA_KEYS = new Set(["aliases"]);

/**
 * Patch a frontmatter block: replace the `sources:` list and given scalar
 * overrides, preserving every other line (aliases, tags, human-added
 * fields) — extends ADR-004 human-edit protection to frontmatter.
 */
export function patchFrontmatter(
  frontmatter: string,
  updates: {
    readonly sources?: readonly string[];
    readonly scalars?: Readonly<Record<string, string>>;
  },
): string {
  const out: string[] = [];
  const lines = frontmatter.split("\n");
  const usedScalars = new Set<string>();
  let sourcesEmitted = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (updates.sources !== undefined && /^sources:\s*$/.test(line)) {
      out.push("sources:", ...updates.sources.map((s) => `  - ${s}`));
      i = collectListItems(lines, i).end;
      sourcesEmitted = true;
      continue;
    }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    const key = kv?.[1];
    if (key !== undefined && updates.scalars !== undefined && key in updates.scalars) {
      out.push(`${key}: ${updates.scalars[key]}`);
      usedScalars.add(key);
      continue;
    }
    out.push(line);
  }

  if (updates.sources !== undefined && !sourcesEmitted) {
    out.push("sources:", ...updates.sources.map((s) => `  - ${s}`));
  }
  for (const [key, value] of Object.entries(updates.scalars ?? {})) {
    if (!usedScalars.has(key)) {
      out.push(`${key}: ${value}`);
    }
  }
  return out.join("\n");
}

/**
 * Carry learned compiler metadata (e.g. `aliases`) from an existing page's
 * frontmatter into a freshly re-derived page that lacks it, so teaching
 * survives regeneration while the body stays generator-owned (ADR-006).
 */
export function carryLearnedMetadata(existing: string, next: string): string {
  const existingFm = readFrontmatter(parsePage(existing).frontmatter);
  const nextFm = readFrontmatter(parsePage(next).frontmatter);
  const additions: string[] = [];
  for (const key of LEARNED_METADATA_KEYS) {
    const items = existingFm.lists[key];
    if (items !== undefined && items.length > 0 && nextFm.lists[key] === undefined) {
      additions.push(`${key}:`, ...items.map((v) => `  - ${v}`));
    }
  }
  if (additions.length === 0) {
    return next;
  }
  const match = FRONTMATTER_RE.exec(next);
  if (match === null) {
    return next;
  }
  const block = (match[1] ?? "").split("\n");
  return (
    `---\n${[...block, ...additions].join("\n")}\n---\n` +
    next.slice((match[0] ?? "").length)
  );
}

/** Every `[[wiki-link]]` occurrence (verbatim). */
export function extractLinks(text: string): string[] {
  return [...text.matchAll(/\[\[[^\]]+\]\]/g)].map((m) => m[0]);
}

/**
 * Each contradiction callout block — a run of consecutive `>`-quoted lines
 * containing a `[!warning]` marker.
 */
export function extractCallouts(text: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = (): void => {
    if (current.length > 0 && current.some((l) => l.includes("[!warning]"))) {
      blocks.push(current.join("\n"));
    }
    current = [];
  };
  for (const line of text.split("\n")) {
    if (line.startsWith(">")) {
      current.push(line);
    } else {
      flush();
    }
  }
  flush();
  return blocks;
}
