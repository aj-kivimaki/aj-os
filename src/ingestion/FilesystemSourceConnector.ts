/**
 * Filesystem Source Connector — SPEC-006 (first connector).
 *
 * Reads Markdown documents from one or more source directories and
 * normalizes each into a {@link SourceRecord}. This is the connector for
 * the Handbook vault (`foundation/`, `library/`), but it is not
 * Handbook-specific: it is configured with a `kind`, a `baseDir`, and a
 * set of source directories.
 *
 * Contract guarantees (SPEC-006):
 * - One Markdown file = one record.
 * - `id` is `${kind}:${path-relative-to-baseDir}` — stable across content
 *   edits (an edit changes `hash`, never `id`) and globally namespaced.
 * - `hash` is a content hash, computed on line-ending-normalized content
 *   so it is stable across platforms; it is the change signal.
 * - Read-only: the connector never mutates the filesystem.
 * - Output is deterministic: records are returned sorted by `id`.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { SourceConnector, SourceRecord } from "./SourceConnector.js";

/** Raised on connector misconfiguration (SPEC-006 §11, fatal). */
export class SourceConnectorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceConnectorError";
  }
}

export interface FilesystemSourceConnectorOptions {
  /** Connector kind; namespaces record ids (e.g. `"handbook"`). No `:`. */
  readonly kind: string;
  /** Absolute (or cwd-relative) root against which record ids are computed. */
  readonly baseDir: string;
  /**
   * Directories to scan, each relative to `baseDir` (or absolute, but must
   * resolve inside `baseDir`). E.g. `["foundation", "library"]`.
   */
  readonly sources: readonly string[];
  /** File extensions to include. Defaults to `[".md"]`. */
  readonly extensions?: readonly string[];
}

const DEFAULT_EXTENSIONS = [".md"] as const;

/** Recursively collect absolute paths of matching files, skipping dotfiles. */
async function collectFiles(
  absDir: string,
  extensions: readonly string[],
): Promise<string[]> {
  const entries = await readdir(absDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const absChild = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absChild, extensions)));
    } else if (
      entry.isFile() &&
      extensions.some((ext) => entry.name.endsWith(ext))
    ) {
      files.push(absChild);
    }
  }

  return files;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Create a filesystem-backed {@link SourceConnector}.
 */
export function createFilesystemSourceConnector(
  options: FilesystemSourceConnectorOptions,
): SourceConnector {
  const { kind, sources } = options;
  if (kind.length === 0 || kind.includes(":")) {
    throw new SourceConnectorError(
      `Invalid connector kind: "${kind}" (must be non-empty and contain no ":").`,
    );
  }

  const baseAbs = path.resolve(options.baseDir);
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;

  /** Resolve a configured source and assert it lives inside baseDir. */
  function resolveSource(source: string): string {
    const abs = path.resolve(baseAbs, source);
    const rel = path.relative(baseAbs, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new SourceConnectorError(
        `Source "${source}" resolves outside baseDir (${baseAbs}).`,
      );
    }
    return abs;
  }

  function toRecord(absPath: string, content: string): SourceRecord {
    const normalized = content.replace(/\r\n/g, "\n");
    const relativePath = path
      .relative(baseAbs, absPath)
      .split(path.sep)
      .join("/");
    return {
      id: `${kind}:${relativePath}`,
      uri: pathToFileURL(absPath).href,
      content: normalized,
      hash: hashContent(normalized),
      metadata: {
        relativePath,
        bytes: Buffer.byteLength(normalized, "utf8"),
      },
    };
  }

  async function list(): Promise<SourceRecord[]> {
    const byId = new Map<string, SourceRecord>();

    for (const source of sources) {
      const absDir = resolveSource(source);

      let info;
      try {
        info = await stat(absDir);
      } catch {
        throw new SourceConnectorError(
          `Source directory does not exist: ${source} (${absDir}).`,
        );
      }
      if (!info.isDirectory()) {
        throw new SourceConnectorError(
          `Source is not a directory: ${source} (${absDir}).`,
        );
      }

      const files = await collectFiles(absDir, extensions);
      for (const absPath of files) {
        const content = await readFile(absPath, "utf8");
        const record = toRecord(absPath, content);
        const existing = byId.get(record.id);
        if (existing && existing.uri !== record.uri) {
          throw new SourceConnectorError(
            `Duplicate source id "${record.id}" from overlapping sources.`,
          );
        }
        byId.set(record.id, record);
      }
    }

    return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  return { kind, list };
}
