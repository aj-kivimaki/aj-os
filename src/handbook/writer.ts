import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  getInboxRoot,
  PathEscapeError,
  resolveInInbox,
  toVaultRelative,
} from "./paths.js";
import type { InboxFileInput, InboxNoteInput, InboxWriteResult } from "./types.js";

/**
 * Validate a caller-supplied inbox filename. Rejects (rather than silently
 * strips) path separators, `..`, and NUL so a traversal attempt is a clean
 * error instead of a surprising rename.
 */
function sanitizeFilename(name: string): string {
  const trimmed = name.replace(/^\.+/, "").trim();
  if (!trimmed) {
    return trimmed;
  }
  if (
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0") ||
    trimmed === ".." ||
    trimmed !== path.basename(trimmed)
  ) {
    throw new PathEscapeError(`Filename must not contain path segments: ${name}`);
  }
  return trimmed;
}

/** Convert a title into a kebab-case filename stem. */
function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "note";
}

/** Local YYYY-MM-DD, matching the vault's date convention. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Write `content` to the inbox under `filename`, never overwriting.
 * On collision, retries with a timestamp suffix.
 */
async function writeWithoutOverwrite(
  filename: string,
  content: string | Buffer,
): Promise<InboxWriteResult> {
  await mkdir(getInboxRoot(), { recursive: true });

  const ext = path.extname(filename);
  const stem = filename.slice(0, filename.length - ext.length);
  const candidates = [filename, `${stem}-${Date.now()}${ext}`];

  for (const candidate of candidates) {
    const absPath = resolveInInbox(candidate);
    try {
      await writeFile(absPath, content, { flag: "wx" });
      const { size } = await stat(absPath);
      return { path: toVaultRelative(absPath), bytesWritten: size };
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "EEXIST") {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Could not write inbox file without overwriting: ${filename}`);
}

/** Create a Markdown note in the inbox with lightweight frontmatter. */
export async function writeInboxNote(input: InboxNoteInput): Promise<InboxWriteResult> {
  const stem = input.filename
    ? sanitizeFilename(input.filename).replace(/\.md$/i, "")
    : slugify(input.title);
  const filename = `${stem || slugify(input.title)}.md`;

  const tags = input.tags ?? [];
  const frontmatter = [
    "---",
    "type: inbox-note",
    `title: ${input.title}`,
    `created: ${today()}`,
    `tags: [${tags.join(", ")}]`,
    "---",
    "",
  ].join("\n");

  const content = `${frontmatter}# ${input.title}\n\n${input.body}\n`;
  return writeWithoutOverwrite(filename, content);
}

/** Save an arbitrary file (text or base64) to the inbox. */
export async function saveInboxFile(input: InboxFileInput): Promise<InboxWriteResult> {
  const filename = sanitizeFilename(input.filename);
  if (!filename) {
    throw new Error("A non-empty filename is required");
  }

  const encoding = input.encoding ?? "utf8";
  const data =
    encoding === "base64"
      ? Buffer.from(input.content, "base64")
      : Buffer.from(input.content, "utf8");

  return writeWithoutOverwrite(filename, data);
}
