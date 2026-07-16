/**
 * End-of-Session integration tests (EOS-409) — the v1 vertical slice, wired for real.
 *
 * Every stage is genuine: the real `createGitPort` against a disposable fixture repo, the
 * real `FilesystemReviewStore` against a disposable fixture vault, the real session factory,
 * candidate generator, projector, report builder, store, and orchestrator — assembled by the
 * real composition root. Only the `TextGenerator` is stubbed, because it is the pipeline's
 * one non-deterministic seam; the suite runs offline, with no API key.
 *
 * Each stage's own suite proves what that stage decides. These tests prove the *pipeline*:
 * that the pieces are wired to each other correctly, and that the properties each stage
 * guarantees in isolation survive composition. Everything is reached through the module's
 * public surface only.
 */

import { mkdir, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  collectChanges,
  createAnalyzerRegistry,
  createCandidateGenerator,
  createEndOfSessionWorkflow,
  createFilesystemReviewStore,
  createGitChangeAnalyzer,
  createGitPort,
  createKnowledgeExtractor,
  createNoopNotificationPort,
  createReviewPackageProjector,
  createSessionFactory,
  createSessionWorkflow,
  parseCandidateKnowledge,
  parseSession,
  parseSessionReport,
  type Analyzer,
  type SessionReport,
} from "../../src/end-of-session/index.js";

import {
  cleanupFixtures,
  FIXED_INSTANT,
  fixtureConfig,
  fixtureRepo,
  fixtureVault,
  git,
  snapshot,
  stubGenerator,
} from "./session-fixtures.js";

afterEach(cleanupFixtures);

interface SliceOptions {
  readonly since?: string;
  /** Reuse an existing fixture instead of building a fresh one. */
  readonly handbook?: string;
  readonly repositoryPath?: string;
}

/** Compose the real workflow over a fixture repo and vault, with only the model stubbed. */
async function slice(options: SliceOptions = {}) {
  const handbook = options.handbook ?? (await fixtureVault());
  const repositoryPath = options.repositoryPath ?? (await fixtureRepo());

  const pipeline = await createEndOfSessionWorkflow(fixtureConfig(handbook), {
    generator: stubGenerator(),
    now: () => FIXED_INSTANT,
    repositoryPath,
    ...(options.since !== undefined ? { since: options.since } : {}),
  });

  return { ...pipeline, handbook, repositoryPath };
}

/** Run the slice end to end and return everything a test might want to assert on. */
async function run(options: SliceOptions = {}): Promise<{
  report: SessionReport;
  sessionDir: string;
  handbook: string;
  repositoryPath: string;
}> {
  const { workflow, store, trigger, handbook, repositoryPath } = await slice(options);
  const report = await workflow.run(await trigger.createContext());
  const sessionDir = join((await store.locate()).root, "pending", report.sessionId);

  return { report, sessionDir, handbook, repositoryPath };
}

describe("EOS-409 — a real run writes the whole session layout", () => {
  it("produces candidates, a report, a review package, and a log", async () => {
    const { report, sessionDir } = await run();

    expect(report.result).toBe("completed");
    expect((await readdir(sessionDir)).sort()).toEqual([
      "candidates",
      "log.md",
      "report.json",
      "review-package.md",
    ]);
  });

  it("persists exactly the report it returned", async () => {
    const { report, sessionDir } = await run();

    const persisted = parseSessionReport(
      JSON.parse(await readFile(join(sessionDir, "report.json"), "utf8")),
    );
    expect(persisted).toEqual(report);
  });

  it("agrees with itself about which candidates exist", async () => {
    const { report, sessionDir } = await run();

    // The generator named them, the store filed them, and the report counted them — all
    // three have to describe the same set for SPEC-004 to trust any of it.
    const files = (await readdir(join(sessionDir, "candidates"))).sort();
    expect(files).toEqual(
      [...report.candidatesProduced.ids].sort().map((id) => `${id}.json`),
    );
    expect(report.candidatesProduced.count).toBe(files.length);
  });

  it("writes candidates that round-trip through the published contract", async () => {
    const { sessionDir } = await run();

    // The store is consumable by SPEC-004: every artifact parses with the contract SPEC-004
    // will import.
    for (const file of await readdir(join(sessionDir, "candidates"))) {
      const raw = JSON.parse(await readFile(join(sessionDir, "candidates", file), "utf8"));
      expect(() => parseCandidateKnowledge(raw)).not.toThrow();
    }
  });

  it("records the run's log entry in log.md", async () => {
    const { report, sessionDir } = await run();

    expect(await readFile(join(sessionDir, "log.md"), "utf8")).toContain(report.logEntry);
  });
});

describe("EOS-409 — the stages' guarantees survive composition", () => {
  it("keeps the Candidate Generation Invariant: one finding, one candidate, in order", async () => {
    const { report } = await run();

    // The stub yields exactly two findings. No merge, split, invention, or removal.
    expect(report.candidatesProduced.count).toBe(2);
    expect(report.candidatesProduced.ids).toEqual([
      `session:${report.sessionId}:1`,
      `session:${report.sessionId}:2`,
    ]);
  });

  it("carries real provenance back to the fixture repository", async () => {
    const { report, sessionDir, repositoryPath } = await run();

    const first = parseCandidateKnowledge(
      JSON.parse(
        await readFile(
          join(sessionDir, "candidates", `${report.candidatesProduced.ids[0]}.json`),
          "utf8",
        ),
      ),
    );

    // `commitHash` is the fixture's actual HEAD — proof the EOS-401 git read is wired all
    // the way through to a persisted candidate, rather than a value someone passed in.
    expect(first.provenance.commitHash).toBe(git(repositoryPath, "rev-parse", "HEAD").trim());
    expect(first.provenance.sessionId).toBe(report.sessionId);
    expect(first.governanceState).toBe("candidate");
  });

  it("analyzes the session's real changes", async () => {
    const { report } = await run();

    // The fixture's session: one modification, one deletion, four staged additions, and
    // one file never `git add`ed (EOS-D11). `build.log` is ignored and must not appear.
    expect(report.filesAnalyzed).toBe(7);
    expect(report.analyzersRun).toEqual(["git"]);
  });

  it("measures a commit range when --since is given", async () => {
    const { report } = await run({ since: "HEAD~1" });

    // `HEAD~1..HEAD` covers only the committed work — one file — not the staged tree.
    expect(report.filesAnalyzed).toBe(1);
    expect(report.result).toBe("completed");
  });
});

describe("EOS-409 — determinism", () => {
  /**
   * Two runs over **one** repository and vault.
   *
   * Deliberately not two fresh fixtures: a new fixture repo commits at a new instant, so its
   * HEAD hash differs, and the runs would then have different *inputs* — which proves
   * nothing about determinism. (An earlier version of this suite did exactly that and passed
   * only when both repos happened to be created within the same second.) Determinism means
   * the same inputs give the same outputs, so the inputs must actually be the same.
   */
  async function twoRunsOverOneRepo() {
    const handbook = await fixtureVault();
    const repositoryPath = await fixtureRepo();

    const first = await run({ handbook, repositoryPath });
    const second = await run({ handbook, repositoryPath });

    return { first, second };
  }

  it("produces identical artifacts across runs, except the session's identity", async () => {
    const { first, second } = await twoRunsOverOneRepo();

    // Identity is minted per run by design (EOS-D3), and it cascades into candidate ids,
    // paths, and provenance — so the reports cannot be deep-equal. Everything else must be.
    expect(first.report.sessionId).not.toBe(second.report.sessionId);

    const normalize = (report: SessionReport): string =>
      JSON.stringify(report).replaceAll(report.sessionId, "<session>");
    expect(normalize(first.report)).toBe(normalize(second.report));
  });

  it("renders a byte-identical review package across runs, modulo identity", async () => {
    const { first, second } = await twoRunsOverOneRepo();

    const read = async (dir: string, id: string): Promise<string> =>
      (await readFile(join(dir, "review-package.md"), "utf8")).replaceAll(id, "<session>");

    expect(await read(first.sessionDir, first.report.sessionId)).toBe(
      await read(second.sessionDir, second.report.sessionId),
    );
  });
});

describe("EOS-409 — partial collection, end to end", () => {
  it("keeps capturing when one analyzer fails", async () => {
    // The composition root registers exactly one analyzer (v1), so a co-analyzer is wired
    // by hand here — every other stage is still the real one.
    const handbook = await fixtureVault();
    const repositoryPath = await fixtureRepo();
    const gitPort = createGitPort(repositoryPath);

    const failing: Analyzer = {
      id: "docs",
      name: "Documentation analyzer",
      description: "a co-analyzer that fails",
      async analyze() {
        throw new Error("the docs analyzer is unavailable");
      },
    };

    // The composition root would have created this; wiring by hand means owning its
    // precondition too.
    const destination = join(handbook, "knowledge-review");
    await mkdir(destination, { recursive: true });
    const store = createFilesystemReviewStore({ destination });

    const workflow = createSessionWorkflow({
      sessionFactory: createSessionFactory({ gitPort, now: () => FIXED_INSTANT }),
      registry: createAnalyzerRegistry([createGitChangeAnalyzer(gitPort), failing]),
      extractor: createKnowledgeExtractor({ generator: stubGenerator() }),
      candidateGenerator: createCandidateGenerator({ now: () => FIXED_INSTANT }),
      store,
      projector: createReviewPackageProjector(),
      notifier: createNoopNotificationPort(),
      trigger: "manual",
      now: () => FIXED_INSTANT,
    });

    const report = await workflow.run({
      project: "aj-os",
      repository: repositoryPath,
      branch: "main",
    });

    // One analyzer failing never aborts the workflow: the run finishes, the failure is
    // recorded as recoverable, and the session's knowledge is still captured.
    expect(report.result).toBe("partial");
    expect(report.errors).toEqual([
      {
        source: "docs",
        message: "the docs analyzer is unavailable",
        recoverable: true,
      },
    ]);
    expect(report.candidatesProduced.count).toBe(2);
    expect(report.filesAnalyzed).toBe(7);
  });

  it("runs collection directly against the fixture with the same result", async () => {
    const repositoryPath = await fixtureRepo();
    const gitPort = createGitPort(repositoryPath);
    const registry = createAnalyzerRegistry([createGitChangeAnalyzer(gitPort)]);

    // Built through the contract, not cast past it: a suite proving the pipeline works on
    // real data should not hand a stage a shape the contract would reject.
    const changeSet = await collectChanges(
      registry,
      parseSession({
        id: "session-direct",
        startedAt: FIXED_INSTANT.toISOString(),
        endedAt: FIXED_INSTANT.toISOString(),
        trigger: "manual",
        gitState: {
          head: git(repositoryPath, "rev-parse", "HEAD").trim(),
          dirty: true,
          range: "HEAD",
        },
        branch: "main",
      }),
    );

    // Path-sorted and classified by kind — the stage's guarantees, against real git.
    expect(changeSet.changes.map((change) => change.path)).toEqual([
      ".gitignore",
      "docs/guide.md",
      "gone.ts",
      "src.ts",
      "src/untracked.ts", // never staged — reaches the stream via EOS-D11
      "tests/src.test.ts",
      "tsconfig.json",
    ]);
    // Ignored files never enter the session's knowledge.
    expect(changeSet.changes.map((change) => change.path)).not.toContain("build.log");
    expect(changeSet.errors).toEqual([]);
  });
});

describe("EOS-409 — the workflow's permanent promises", () => {
  it("never writes to git", async () => {
    const repositoryPath = await fixtureRepo();
    const handbook = await fixtureVault();

    const head = git(repositoryPath, "rev-parse", "HEAD");
    const status = git(repositoryPath, "status", "--porcelain");

    const { workflow, trigger } = await createEndOfSessionWorkflow(
      fixtureConfig(handbook),
      { generator: stubGenerator(), now: () => FIXED_INSTANT, repositoryPath },
    );
    await workflow.run(await trigger.createContext());

    // v1 commits nothing (ADR-002 §4, AJS-005 §7). Proven, not asserted: HEAD, the index,
    // and the working tree are exactly as the session left them.
    expect(git(repositoryPath, "rev-parse", "HEAD")).toBe(head);
    expect(git(repositoryPath, "status", "--porcelain")).toBe(status);
  });

  it("generates no wiki", async () => {
    const { handbook } = await run();

    // The generated-wiki path is the Wiki Generator's; End-of-Session never triggers it.
    await expect(readdir(join(handbook, "wiki-generated"))).rejects.toThrow();
  });

  it("writes only inside the review area", async () => {
    const handbook = await fixtureVault();
    const before = await snapshot(handbook);

    const repositoryPath = await fixtureRepo();
    const { workflow, trigger } = await createEndOfSessionWorkflow(
      fixtureConfig(handbook),
      { generator: stubGenerator(), now: () => FIXED_INSTANT, repositoryPath },
    );
    await workflow.run(await trigger.createContext());

    const after = await snapshot(handbook);
    const added = [...after.keys()].filter((path) => !before.has(path));

    expect(added.length).toBeGreaterThan(0);
    for (const path of added) {
      expect(path.startsWith("knowledge-review/")).toBe(true);
    }
  });
});
