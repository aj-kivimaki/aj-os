/**
 * Page structure: frontmatter + a delimited **generator-owned region** +
 * an optional **human-owned region** after it (ADR-004 §5).
 *
 * MERGE only ever rewrites the generated region; anything after the end
 * marker is human-owned and preserved verbatim. This gives deterministic,
 * structural protection for human edits — no heuristics.
 *
 * Also provides the small, mechanical extractors MERGE's guards rely on
 * (links, contradiction callouts) and a minimal frontmatter field reader.
 */
export const GENERATED_BEGIN = "<!-- aj-os:generated -->";
export const GENERATED_END = "<!-- /aj-os:generated -->";

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

export interface ParsedPage {
  /** Raw frontmatter text (between the `---` fences), without the fences. */
  readonly frontmatter: string;
  /** Generator-owned region, or `null` if the page has no markers. */
  readonly generated: string | null;
  /** Human-owned region after the end marker (verbatim). */
  readonly human: string;
}

/** Split a page into frontmatter, generated region, and human region. */
export function parsePage(content: string): ParsedPage {
  const match = FRONTMATTER_RE.exec(content);
  const frontmatter = match ? (match[1] ?? "") : "";
  const rest = match ? content.slice((match[0] ?? "").length) : content;

  const begin = rest.indexOf(GENERATED_BEGIN);
  const end = rest.indexOf(GENERATED_END);
  if (begin === -1 || end === -1 || end < begin) {
    // No usable generated region — treat the whole body as human-owned.
    return { frontmatter, generated: null, human: rest.trim() };
  }
  const generated = rest.slice(begin + GENERATED_BEGIN.length, end).trim();
  const human = rest.slice(end + GENERATED_END.length).trim();
  return { frontmatter, generated, human };
}

/** Reassemble a page from its parts, wrapping the generated region. */
export function serializePage(
  frontmatter: string,
  generated: string,
  human = "",
): string {
  const base =
    `---\n${frontmatter}\n---\n` +
    `${GENERATED_BEGIN}\n${generated}\n${GENERATED_END}\n`;
  return human === "" ? base : `${base}\n${human}\n`;
}

export interface Frontmatter {
  /** Scalar `key: value` fields (surrounding quotes stripped). */
  readonly fields: Readonly<Record<string, string>>;
  /** The `sources:` list. */
  readonly sources: readonly string[];
}

/** Minimal reader for the controlled frontmatter format (§22.6). */
export function readFrontmatter(frontmatter: string): Frontmatter {
  const fields: Record<string, string> = {};
  const sources: string[] = [];
  const lines = frontmatter.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (/^sources:\s*$/.test(line)) {
      for (let j = i + 1; j < lines.length; j += 1) {
        const item = /^\s*-\s+(.*)$/.exec(lines[j] ?? "");
        if (item === null) {
          break;
        }
        sources.push((item[1] ?? "").trim());
        i = j;
      }
      continue;
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
  return { fields, sources };
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
