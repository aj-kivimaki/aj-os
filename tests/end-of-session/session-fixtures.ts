/**
 * Shared fixtures for the EOS-409 vertical-slice suites.
 *
 * The integration and acceptance suites drive the *same* real world — a disposable git repo
 * and a disposable vault — and differ only in what they assert. The builders live here
 * rather than being duplicated: these are test **infrastructure**, not the inline contract
 * fixtures each per-contract suite owns (EOS-007's convention).
 *
 * Everything is disposable and temporary. No test touches the developer's vault or
 * repository, and the `TextGenerator` is always stubbed — the suite runs offline, with no
 * API key, in CI.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import type { TextGenerator } from "../../src/end-of-session/index.js";
import type { AjConfig } from "../../src/platform/config/index.js";

/** The instant every fixture run is pinned to, so artifacts are comparable across runs. */
export const FIXED_INSTANT = new Date("2026-07-17T10:30:00.000Z");

/** The canonical vault areas SPEC-003 may never modify (§17). */
export const CANONICAL_AREAS = ["foundation", "library", "wiki"] as const;

const created: string[] = [];

/** Remove every temp directory a test created. Call from `afterEach`. */
export async function cleanupFixtures(): Promise<void> {
  while (created.length > 0) {
    const dir = created.pop();
    if (dir !== undefined) {
      await rm(dir, { recursive: true, force: true });
    }
  }
}

async function tempDir(prefix: string): Promise<string> {
  // realpath so expectations match the store's canonical root (macOS /var → /private/var).
  const dir = await realpath(await mkdtemp(join(tmpdir(), prefix)));
  created.push(dir);
  return dir;
}

/** Run a git command in `cwd`. Setup only — the code under test is read-only. */
export function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, stdio: "pipe" }).toString();
}

/**
 * A vault with canonical content in `foundation/`, `library/`, and `wiki/`.
 *
 * The areas are **seeded with real files**, not left empty: "canonical knowledge unchanged"
 * is only a meaningful claim if there is canonical knowledge there to change.
 */
export async function fixtureVault(): Promise<string> {
  const root = await tempDir("aj-vault-");

  await mkdir(join(root, "foundation"), { recursive: true });
  await writeFile(
    join(root, "foundation", "principles.md"),
    "# Principles\n\nAutomation proposes; humans approve.\n",
  );
  await mkdir(join(root, "library", "patterns"), { recursive: true });
  await writeFile(
    join(root, "library", "patterns", "ports.md"),
    "# Ports\n\nIsolate non-determinism behind an injected port.\n",
  );
  await mkdir(join(root, "wiki", "entities"), { recursive: true });
  await writeFile(
    join(root, "wiki", "entities", "aj-os.md"),
    "---\ntitle: AJ-OS\n---\n\nGenerated page.\n",
  );

  return root;
}

/**
 * A disposable repo whose session touched source, test, doc, and config files — so the
 * analyzer's change-kind classification and `filesAnalyzed` are exercised for real.
 *
 * The session ends with **one file never `git add`ed** and one **`.gitignore`d** — the shape
 * of a real session, and the case EOS-D11 (approved) restored: an untracked file is
 * uncommitted work, so it belongs to the default range, while an ignored file never does.
 */
export async function fixtureRepo(): Promise<string> {
  const dir = await tempDir("aj-repo-");

  git(dir, "init", "-q");
  git(dir, "config", "user.email", "test@example.com");
  git(dir, "config", "user.name", "EOS-409 Test");
  git(dir, "config", "commit.gpgsign", "false");
  git(dir, "checkout", "-q", "-b", "main");

  // Commit 1 — the baseline the session starts from.
  await writeFile(join(dir, "src.ts"), "export const one = 1;\n");
  await writeFile(join(dir, "gone.ts"), "export const gone = 1;\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "baseline");

  // Commit 2 — the session's committed work (so `--since` has a range to measure).
  await mkdir(join(dir, "src"), { recursive: true });
  await writeFile(join(dir, "src", "committed.ts"), "export const committed = 1;\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "session work, committed");

  // The session's uncommitted-but-staged work: one of each change kind.
  await writeFile(join(dir, "src.ts"), "export const one = 2;\n"); // modified · source
  await rm(join(dir, "gone.ts")); // deleted
  await mkdir(join(dir, "docs"), { recursive: true });
  await writeFile(join(dir, "docs", "guide.md"), "# Guide\n"); // added · documentation
  await mkdir(join(dir, "tests"), { recursive: true });
  await writeFile(join(dir, "tests", "src.test.ts"), "// a test\n"); // added · test
  await writeFile(join(dir, "tsconfig.json"), "{}\n"); // added · config
  await writeFile(join(dir, ".gitignore"), "*.log\n");
  git(dir, "add", "-A");

  // And the work the engineer has not staged at all — the EOS-D11 case. `build.log` is
  // ignored and must never reach the session; `src/untracked.ts` is real new work and must.
  await writeFile(join(dir, "src", "untracked.ts"), "export const fresh = 1;\n");
  await writeFile(join(dir, "build.log"), "noise\n");

  return dir;
}

/** The untracked file the fixture session leaves behind — real new work, never `git add`ed. */
export const UNTRACKED_PATH = "src/untracked.ts";

/** The ignored file the fixture session leaves behind — noise that must never be captured. */
export const IGNORED_PATH = "build.log";

export function fixtureConfig(handbookPath: string): AjConfig {
  return {
    handbook: {
      path: handbookPath,
      generatedWikiPath: "wiki-generated",
      reviewPath: "knowledge-review",
    },
  };
}

/**
 * A stub `TextGenerator` returning a fixed, valid extraction — the pipeline's one
 * non-deterministic seam, pinned.
 *
 * The response is wrapped in a **fenced code block**, because a real model routinely does
 * that and `parseExtractionResponse` strips fences: the slice should be proven against the
 * shape the model actually emits, not a tidied one.
 *
 * Yields two findings of different kinds — a `handbook-entry` and a `wiki-publication` — so
 * the §19 criteria about both can be asserted from one run.
 */
export function stubGenerator(seenPrompts?: string[]): TextGenerator {
  return {
    async complete(prompt) {
      // Optionally record what the model was actually shown. That is the only honest way to
      // prove a change reached extraction: asserting on a *finding* would only prove the
      // stub chose to cite it.
      seenPrompts?.push(prompt.user);
      const sessionId = /Session id: (\S+)/.exec(prompt.user)?.[1] ?? "unknown";
      const extraction = {
        sessionId,
        summary: {
          title: "Wire the End-of-Session capture pipeline",
          keyPoints: [
            "Collected the session's git changes.",
            "Extracted two reusable findings.",
          ],
        },
        findings: [
          {
            kind: "handbook-entry",
            title: "Isolate model non-determinism behind an injected port",
            body: "Stub the port in tests and assert on structure, never prose.",
            rationale: "Keeps every surrounding stage deterministic and testable.",
            relatedChangeIds: ["git:src.ts"],
            relatedPaths: ["src.ts"],
            tags: ["testing", "architecture"],
            confidence: 0.9,
          },
          {
            kind: "wiki-publication",
            title: "The End-of-Session capture pipeline",
            body: "Trigger → session → collect → extract → generate → review.",
            rationale: "Worth publishing once the slice is proven.",
            relatedChangeIds: ["git:docs/guide.md"],
            relatedPaths: ["docs/guide.md"],
            tags: ["wiki"],
          },
        ],
      };
      return {
        text: `\`\`\`json\n${JSON.stringify(extraction, null, 2)}\n\`\`\``,
        model: "stub-model",
      };
    },
  };
}

/** One entry of a directory snapshot: a repo-relative path and a hash of its bytes. */
export type Snapshot = ReadonlyMap<string, string>;

/**
 * Recursively hash every file under `root`, keyed by its path relative to `root`.
 *
 * Content hashes rather than mtimes: the claim is that canonical knowledge is *unchanged*,
 * and a byte-identical file that was rewritten identically is, for this purpose, unchanged.
 */
export async function snapshot(root: string): Promise<Snapshot> {
  const files = new Map<string, string>();

  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const bytes = await readFile(full);
        files.set(relative(root, full), createHash("sha256").update(bytes).digest("hex"));
      }
    }
  }

  await walk(root);
  return files;
}

/** Snapshot every canonical area of a vault — what SPEC-003 §17 must never touch. */
export async function snapshotCanonical(vault: string): Promise<Snapshot> {
  const all = new Map<string, string>();
  for (const area of CANONICAL_AREAS) {
    for (const [path, hash] of await snapshot(join(vault, area))) {
      all.set(join(area, path), hash);
    }
  }
  return all;
}
