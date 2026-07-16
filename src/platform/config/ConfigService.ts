import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

import type { AjConfig } from "./types.js";

/** The configuration file name, expected at the project root. */
const CONFIG_FILE_NAME = "aj.config.json";

/**
 * Where the generated wiki lives when the file does not say. Relative to
 * `handbook.path`; kept inside the vault so AJ-OS remains its sole producer.
 */
const DEFAULT_GENERATED_WIKI_PATH = "wiki-generated";

/**
 * Where candidate knowledge awaits review when the file does not say. Relative to
 * `handbook.path`; a non-canonical area the End-of-Session Workflow writes to and the
 * Knowledge Review Workflow reads from (EOS-D2).
 */
const DEFAULT_REVIEW_PATH = "knowledge-review";

/**
 * A configuration problem with a message safe to show the user.
 *
 * The product catches this to print a friendly explanation, while letting
 * unexpected errors surface loudly.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * Reads and validates `aj.config.json`.
 *
 * This is a platform capability: it knows nothing about the Knowledge
 * Assistant or any other product that consumes it. Its only job is to turn a
 * configuration file into a validated, typed {@link AjConfig} — or a clear
 * {@link ConfigError} explaining what is wrong.
 */
export class ConfigService {
  /**
   * @param projectRoot Directory that contains `aj.config.json`. Defaults to
   * the current working directory, which is the project root under
   * `npm run dev`. An explicit root keeps the service testable without
   * changing the process working directory.
   */
  constructor(private readonly projectRoot: string = process.cwd()) {}

  /** Load, parse, and validate the configuration. */
  async load(): Promise<AjConfig> {
    const configPath = resolve(this.projectRoot, CONFIG_FILE_NAME);

    const raw = await this.readConfigFile(configPath);
    const parsed = this.parseJson(raw);
    const handbook = this.validateShape(parsed);

    await this.validateHandbookPath(handbook.path);

    return { handbook };
  }

  private async readConfigFile(configPath: string): Promise<string> {
    try {
      return await readFile(configPath, "utf8");
    } catch (error) {
      if (isErrnoException(error) && error.code === "ENOENT") {
        throw new ConfigError(
          `Configuration file not found.\n\nExpected ${CONFIG_FILE_NAME} at:\n\n  ${configPath}`,
        );
      }
      throw error;
    }
  }

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      throw new ConfigError(`Invalid JSON in ${CONFIG_FILE_NAME}.`);
    }
  }

  /**
   * Confirm the object has a non-empty `handbook.path` string and resolve the
   * optional `handbook.generatedWikiPath` (defaulting when absent). Returns the
   * validated, fully-defaulted `handbook` block.
   */
  private validateShape(parsed: unknown): AjConfig["handbook"] {
    if (!isObject(parsed) || !isObject(parsed.handbook)) {
      throw new ConfigError(
        `${CONFIG_FILE_NAME} must contain a "handbook" object with a "path".`,
      );
    }

    const path = parsed.handbook.path;
    if (typeof path !== "string" || path.trim() === "") {
      throw new ConfigError(
        `${CONFIG_FILE_NAME} must set "handbook.path" to a non-empty string.`,
      );
    }

    return {
      path,
      generatedWikiPath: this.resolveGeneratedWikiPath(parsed),
      reviewPath: this.resolveReviewPath(parsed),
    };
  }

  /**
   * Read the optional `handbook.generatedWikiPath`. Absent falls back to the
   * default; present-but-not-a-non-empty-string is a configuration error (a
   * silent default would hide a typo).
   */
  private resolveGeneratedWikiPath(parsed: Record<string, unknown>): string {
    const value = (parsed.handbook as Record<string, unknown>).generatedWikiPath;
    if (value === undefined) {
      return DEFAULT_GENERATED_WIKI_PATH;
    }
    if (typeof value !== "string" || value.trim() === "") {
      throw new ConfigError(
        `${CONFIG_FILE_NAME} "handbook.generatedWikiPath" must be a non-empty string when set.`,
      );
    }
    return value;
  }

  /**
   * Read the optional `handbook.reviewPath` (EOS-D2). Absent falls back to the
   * default; present-but-not-a-non-empty-string is a configuration error (a
   * silent default would hide a typo). Mirrors {@link resolveGeneratedWikiPath};
   * resolving it to an absolute directory is the composition root's concern, not
   * this loader's.
   */
  private resolveReviewPath(parsed: Record<string, unknown>): string {
    const value = (parsed.handbook as Record<string, unknown>).reviewPath;
    if (value === undefined) {
      return DEFAULT_REVIEW_PATH;
    }
    if (typeof value !== "string" || value.trim() === "") {
      throw new ConfigError(
        `${CONFIG_FILE_NAME} "handbook.reviewPath" must be a non-empty string when set.`,
      );
    }
    return value;
  }

  /** Confirm the configured handbook path exists and is a directory. */
  private async validateHandbookPath(handbookPath: string): Promise<void> {
    const resolved = resolve(this.projectRoot, handbookPath);

    let stats;
    try {
      stats = await stat(resolved);
    } catch (error) {
      if (isErrnoException(error) && error.code === "ENOENT") {
        throw new ConfigError(
          `Configured handbook path does not exist:\n\n  ${handbookPath}`,
        );
      }
      throw error;
    }

    if (!stats.isDirectory()) {
      throw new ConfigError(
        `Configured handbook path is not a directory:\n\n  ${handbookPath}`,
      );
    }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
