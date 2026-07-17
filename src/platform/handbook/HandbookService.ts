import { AjError } from "../AjError.js";
import type { Stats } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import type { HandbookInfo } from "./types.js";

/**
 * A handbook problem with a message safe to show the user.
 *
 * The product catches this to print a friendly explanation, while letting
 * unexpected errors surface loudly.
 */
export class HandbookError extends AjError {}

/**
 * Understands the structure of a configured handbook.
 *
 * This is a platform capability with a single job: given a handbook root,
 * confirm the expected structure and locate the generated wiki. It knows
 * nothing about how the wiki is searched, how context is built, or how
 * questions are answered — and nothing about where the handbook path came
 * from (it does not know ConfigService exists).
 */
export class HandbookService {
  /**
   * @param handbookPath The handbook root directory. This is provided by the
   * caller (the product passes the validated path from configuration); the
   * service does not read configuration itself.
   * @param wikiDirName The generated-wiki directory to locate inside the
   * handbook, relative to {@link handbookPath}. The caller supplies it from
   * configuration (`handbook.generatedWikiPath`) — the directory name is the
   * loop's contract, not an assumption the service bakes in.
   */
  constructor(
    private readonly handbookPath: string,
    private readonly wikiDirName: string,
  ) {}

  /**
   * Validate the handbook structure and return its useful paths.
   *
   * Confirms the handbook directory exists (defensive — the caller usually
   * guarantees this) and that the configured generated-wiki directory is
   * present.
   */
  async locateWiki(): Promise<HandbookInfo> {
    const handbookPath = resolve(this.handbookPath);
    await this.requireDirectory(
      handbookPath,
      `The configured handbook directory does not exist:\n\n  ${handbookPath}`,
    );

    const wikiPath = resolve(handbookPath, this.wikiDirName);
    await this.requireDirectory(
      wikiPath,
      "The configured handbook does not contain a generated wiki.",
    );

    return { handbookPath, wikiPath };
  }

  /** Assert that `path` exists and is a directory, or throw `message`. */
  private async requireDirectory(path: string, message: string): Promise<void> {
    let stats: Stats;
    try {
      stats = await stat(path);
    } catch (error) {
      if (isErrnoException(error) && error.code === "ENOENT") {
        throw new HandbookError(message);
      }
      throw error;
    }

    if (!stats.isDirectory()) {
      throw new HandbookError(message);
    }
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
