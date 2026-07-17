/**
 * Composition root behaviour tests (EOS-407).
 *
 * The root's job is assembly: turn an `AjConfig` into a ready-to-run workflow. These tests
 * therefore check *what it builds and what it refuses to build* — destination resolution,
 * the fail-fast guard, the v1 analyzer set, the exposed handles — not what any stage does
 * once it runs.
 *
 * Real filesystem (temp vaults) and real git (disposable fixture repos), because those are
 * the adapters the root constructs and the preconditions it owns. The **generator is always
 * stubbed**: composing a workflow must never require a network call or an API key.
 *
 * Everything is reached through the module's public surface only.
 */

import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createEndOfSessionWorkflow,
  ReviewStoreError,
  type TextGenerator,
} from "../../src/end-of-session/index.js";
import type { AjConfig } from "../../src/platform/config/index.js";

const FIXED_INSTANT = new Date("2026-07-16T10:30:00.000Z");

/** Temp directories created during the run, removed after each test. */
const created: string[] = [];

afterEach(async () => {
  while (created.length > 0) {
    const dir = created.pop();
    if (dir !== undefined) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

async function tempDir(prefix: string): Promise<string> {
  // realpath so expectations match the store's canonical root (macOS /var → /private/var).
  const dir = await realpath(await mkdtemp(join(tmpdir(), prefix)));
  created.push(dir);
  return dir;
}

/** A vault with the canonical areas present, so a real `reviewPath` can be resolved. */
async function vault(): Promise<string> {
  const root = await tempDir("aj-vault-");
  for (const area of ["foundation", "library", "wiki"]) {
    await mkdir(join(root, area), { recursive: true });
  }
  return root;
}

function configFor(handbookPath: string, reviewPath = "knowledge-review"): AjConfig {
  return {
    handbook: { path: handbookPath, generatedWikiPath: "wiki-generated", reviewPath },
  };
}

/** A disposable repo with one commit on a known branch. */
async function fixtureRepo(): Promise<string> {
  const dir = await tempDir("aj-repo-");
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: dir, stdio: "pipe" });

  git("init", "-q");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "EOS-407 Test");
  git("config", "commit.gpgsign", "false");
  git("checkout", "-q", "-b", "main");
  await writeFile(join(dir, "keep.ts"), "export const keep = 1;\n");
  git("add", "-A");
  git("commit", "-q", "-m", "baseline");

  return dir;
}

/** A generator that fails loudly if composition ever calls the model. */
function stubGenerator(): TextGenerator {
  return {
    async complete(): Promise<never> {
      throw new Error("composition must not call the model");
    },
  };
}

async function compose(
  overrides: {
    handbook?: string;
    reviewPath?: string;
    repositoryPath?: string;
    since?: string;
    sessionNotes?: string;
  } = {},
) {
  const handbook = overrides.handbook ?? (await vault());
  const repositoryPath = overrides.repositoryPath ?? (await fixtureRepo());

  return createEndOfSessionWorkflow(configFor(handbook, overrides.reviewPath), {
    generator: stubGenerator(),
    now: () => FIXED_INSTANT,
    repositoryPath,
    ...(overrides.since !== undefined ? { since: overrides.since } : {}),
    ...(overrides.sessionNotes !== undefined
      ? { sessionNotes: overrides.sessionNotes }
      : {}),
  });
}

describe("EOS-407 — what the root assembles", () => {
  it("returns the workflow, the store, and the trigger (EOS-D9)", async () => {
    const pipeline = await compose();

    expect(typeof pipeline.workflow.run).toBe("function");
    expect(typeof pipeline.store.locate).toBe("function");
    expect(typeof pipeline.trigger.createContext).toBe("function");
    expect(Object.isFrozen(pipeline)).toBe(true);
  });

  it("composes without calling the model", async () => {
    // Assembly must be free: no network, no API key. The stub throws if touched.
    await expect(compose()).resolves.toBeDefined();
  });

  it("exposes the manual trigger, which produces the session's context", async () => {
    const repositoryPath = await fixtureRepo();
    const { trigger } = await compose({ repositoryPath, sessionNotes: "Tried X." });

    expect(trigger.trigger).toBe("manual");

    const context = await trigger.createContext();
    // The root resolved these — the CLI never touches git (EOS-D9).
    expect(context.branch).toBe("main");
    expect(context.repository).toBe(repositoryPath);
    expect(context.project).toBe(basename(repositoryPath));
    expect(context.sessionNotes).toBe("Tried X.");
  });

  it("omits notes the caller did not supply", async () => {
    const { trigger } = await compose();

    expect((await trigger.createContext()).sessionNotes).toBeUndefined();
  });
});

describe("EOS-407 — the destination precondition", () => {
  it("resolves <handbook>/<reviewPath> and creates it", async () => {
    const handbook = await vault();
    const { store } = await compose({ handbook });

    expect(await store.locate()).toEqual({
      root: join(handbook, "knowledge-review"),
    });
    // The root created it; the store requires its destination to exist.
    expect(await readdir(handbook)).toContain("knowledge-review");
  });

  it("honours a configured reviewPath", async () => {
    const handbook = await vault();
    const { store } = await compose({ handbook, reviewPath: "review-area" });

    expect((await store.locate()).root).toBe(join(handbook, "review-area"));
  });

  it("creates only the destination — the layout beneath it is the store's", async () => {
    const handbook = await vault();
    await compose({ handbook });

    // No `pending/` yet: the root resolves a destination, it does not lay out sessions
    // (EOS-D6/EOS-D8).
    expect(await readdir(join(handbook, "knowledge-review"))).toEqual([]);
  });

  it("leaves canonical vault areas untouched", async () => {
    const handbook = await vault();
    await compose({ handbook });

    for (const area of ["foundation", "library", "wiki"]) {
      expect(await readdir(join(handbook, area))).toEqual([]);
    }
  });
});

describe("EOS-407 — failing fast", () => {
  it("refuses a reviewPath pointing at canonical knowledge", async () => {
    const handbook = await vault();

    // The EOS-302 guard, proven at its real call site: a mis-set `reviewPath` is refused
    // at composition, before any git or model work is done.
    await expect(compose({ handbook, reviewPath: "wiki" })).rejects.toBeInstanceOf(
      ReviewStoreError,
    );
    await expect(compose({ handbook, reviewPath: "foundation" })).rejects.toThrow(
      /canonical/,
    );
  });

  it("surfaces an unusable repository", async () => {
    const notARepo = await tempDir("aj-bare-");

    await expect(compose({ repositoryPath: notARepo })).rejects.toThrow();
  });
});

describe("EOS-407 — the v1 wiring", () => {
  it("registers exactly one analyzer, the git one", async () => {
    // v1 collects git changes and nothing else. A second analyzer is an edit *here* and
    // nowhere else — the seam's whole point.
    const { trigger, workflow } = await compose();
    const context = await trigger.createContext();

    // The workflow is wired; proving *which* analyzers ran is the report's job, and the
    // stub generator stops the run at extraction — so the report says exactly that.
    const report = await workflow.run(context);
    expect(report.analyzersRun).toEqual(["git"]);
  });

  it("wires the injected generator into the extraction seam", async () => {
    const { trigger, workflow } = await compose();
    const report = await workflow.run(await trigger.createContext());

    // The stub refuses to generate, so the run fails at extraction — which proves the
    // injected generator reached the extractor rather than the real AIClient.
    expect(report.result).toBe("failed");
    expect(report.errors[0]?.source).toBe("extraction");
    expect(report.errors[0]?.message).toBe("composition must not call the model");
  });

  it("wires the session factory to the fixture repo and the pinned clock", async () => {
    const { trigger, workflow } = await compose({ since: "main" });
    const report = await workflow.run(await trigger.createContext());

    // The report's window comes from the injected clock, and the session was identified
    // against the real fixture repo.
    expect(report.startedAt).toBe(FIXED_INSTANT.toISOString());
    expect(report.sessionId.length).toBeGreaterThan(0);
    expect(report.trigger).toBe("manual");
  });

  it("persists the run's report under the resolved destination", async () => {
    const handbook = await vault();
    const { trigger, workflow, store } = await compose({ handbook });
    const report = await workflow.run(await trigger.createContext());

    const root = (await store.locate()).root;
    expect(await readdir(join(root, "pending"))).toEqual([report.sessionId]);
  });
});
