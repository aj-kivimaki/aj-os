/**
 * Workflow orchestrator behaviour tests (EOS-406).
 *
 * The orchestrator owns **sequencing only**, so these tests are about order, propagation,
 * and outcome routing — not about what any stage decides. Every stage is stubbed: no
 * filesystem, no git, no model. The real wiring is EOS-409's job; here the orchestrator is
 * examined in isolation, which is exactly what injecting every collaborator buys.
 *
 * Call order is recorded through a shared trace, because "the stages ran in the frozen
 * order" is the one guarantee this component exists to provide.
 *
 * Everything is reached through the module's public surface only.
 */

import { describe, it, expect } from "vitest";

import {
  createAnalyzerRegistry,
  createSessionWorkflow,
  parseCandidateKnowledge,
  parseChangeSet,
  parseExtractionResponse,
  parseSession,
  type Analyzer,
  type CandidateGenerator,
  type CandidateKnowledge,
  type ChangeSet,
  type EndOfSessionWorkflow,
  type KnowledgeExtraction,
  type KnowledgeExtractor,
  type NotificationPort,
  type ReviewPackage,
  type ReviewPackageProjector,
  type ReviewStore,
  type Session,
  type SessionContext,
  type SessionFactory,
  type SessionReport,
  type SessionWorkflowDeps,
} from "../../src/end-of-session/index.js";

const FIXED_INSTANT = new Date("2026-07-16T10:30:00.000Z");

const NOTES = "Abandoned the caching approach; invalidation needed the vault root.";

const CONTEXT: SessionContext = Object.freeze({
  project: "aj-os",
  repository: "systems/aj-os",
  branch: "feat/spec-003-m5-composition",
  sessionNotes: NOTES,
}) as SessionContext;

const SESSION: Session = parseSession({
  id: "session-eos-406",
  startedAt: "2026-07-16T10:30:00.000Z",
  endedAt: "2026-07-16T10:30:00.000Z",
  trigger: "manual",
  gitState: {
    head: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    dirty: false,
    range: "HEAD",
  },
  branch: "feat/spec-003-m5-composition",
});

const CHANGE_SET: ChangeSet = parseChangeSet({
  sessionId: SESSION.id,
  changes: [
    {
      id: "git:src/a.ts",
      kind: "source",
      path: "src/a.ts",
      changeType: "modified",
      summary: "modified src/a.ts",
      metadata: {},
    },
  ],
  errors: [],
});

const EXTRACTION: KnowledgeExtraction = parseExtractionResponse(
  JSON.stringify({
    sessionId: SESSION.id,
    summary: { title: "A session", keyPoints: ["Did a thing."] },
    findings: [
      {
        kind: "handbook-entry",
        title: "A finding",
        body: "Body.",
        rationale: "Reusable.",
        relatedChangeIds: ["git:src/a.ts"],
        relatedPaths: ["src/a.ts"],
        tags: [],
      },
    ],
  }),
);

const CANDIDATE: CandidateKnowledge = parseCandidateKnowledge({
  id: `session:${SESSION.id}:1`,
  kind: "handbook-entry",
  title: "A finding",
  body: "Body.",
  rationale: "Reusable.",
  provenance: {
    sessionId: SESSION.id,
    sourceChangeIds: ["git:src/a.ts"],
    sourcePaths: ["src/a.ts"],
    generatedAt: FIXED_INSTANT.toISOString(),
    generator: "end-of-session/candidate-generator",
  },
  governanceState: "candidate",
  tags: [],
  related: [],
});

/** What each stub records, so the frozen order can be asserted. */
type Trace = string[];

interface Stubs {
  readonly trace: Trace;
  readonly deps: SessionWorkflowDeps;
  readonly saved: {
    candidates: readonly CandidateKnowledge[] | undefined;
    reviewPackage: ReviewPackage | undefined;
    report: SessionReport | undefined;
    logEntry: string | undefined;
    notified: SessionReport | undefined;
  };
}

interface StubOptions {
  readonly changeSet?: ChangeSet;
  readonly analyzers?: readonly Analyzer[];
  readonly failIn?: string;
  readonly storeFails?: "saveCandidates" | "saveReport";
  readonly notifierFails?: boolean;
}

/** An analyzer that contributes nothing — used when only its registration matters. */
function inertAnalyzer(id: string): Analyzer {
  return {
    id,
    name: `${id} analyzer`,
    description: "inert",
    async analyze() {
      return [];
    },
  };
}

/** An analyzer that contributes the fixture's changes. */
function contributingAnalyzer(): Analyzer {
  return {
    id: "git",
    name: "Git change analyzer",
    description: "stub",
    async analyze() {
      return CHANGE_SET.changes;
    },
  };
}

function stubs(options: StubOptions = {}): Stubs {
  const trace: Trace = [];
  const saved: Stubs["saved"] = {
    candidates: undefined,
    reviewPackage: undefined,
    report: undefined,
    logEntry: undefined,
    notified: undefined,
  };

  const boom = (stage: string) => {
    if (options.failIn === stage) {
      throw new Error(`${stage} exploded`);
    }
  };

  const sessionFactory: SessionFactory = {
    async create(): Promise<Session> {
      trace.push("session");
      boom("session");
      return SESSION;
    },
  };

  const extractor: KnowledgeExtractor = {
    async extract(_changeSet, sessionNotes): Promise<KnowledgeExtraction> {
      trace.push(`extraction(notes=${sessionNotes ?? "none"})`);
      boom("extraction");
      return EXTRACTION;
    },
  };

  const candidateGenerator: CandidateGenerator = {
    generate(): CandidateKnowledge[] {
      trace.push("generation");
      boom("generation");
      return [CANDIDATE];
    },
  };

  const projector: ReviewPackageProjector = {
    project(candidates, session, generatedAt): ReviewPackage {
      trace.push(`projection(generatedAt=${generatedAt})`);
      boom("projection");
      return {
        sessionId: session.id,
        generatedAt,
        summary: `${candidates.length} candidate(s).`,
        candidateIds: candidates.map((candidate) => candidate.id),
        markdown: "# Review\n",
      } as ReviewPackage;
    },
  };

  const store: ReviewStore = {
    async locate() {
      return { root: "/tmp/review" };
    },
    async saveCandidates(_sessionId, candidates) {
      trace.push("saveCandidates");
      if (options.storeFails === "saveCandidates") {
        throw new Error("disk full");
      }
      saved.candidates = candidates;
    },
    async saveReviewPackage(_sessionId, reviewPackage) {
      trace.push("saveReviewPackage");
      saved.reviewPackage = reviewPackage;
    },
    async saveReport(_sessionId, report) {
      trace.push("saveReport");
      if (options.storeFails === "saveReport") {
        throw new Error("store unwritable");
      }
      saved.report = report;
    },
    async appendLog(_sessionId, entry) {
      trace.push("appendLog");
      saved.logEntry = entry;
    },
  };

  const notifier: NotificationPort = {
    async notify(report) {
      trace.push("notify");
      if (options.notifierFails === true) {
        throw new Error("slack unreachable");
      }
      saved.notified = report;
    },
  };

  // `collectChanges` is a module function, not an injected stage, so it is driven through
  // the registry: the stub analyzer returns the fixture's changes.
  const analyzers = options.analyzers ?? [
    {
      id: "git",
      name: "Git change analyzer",
      description: "stub",
      async analyze() {
        trace.push("collection");
        return (options.changeSet ?? CHANGE_SET).changes;
      },
    } satisfies Analyzer,
  ];

  return {
    trace,
    saved,
    deps: {
      sessionFactory,
      registry: createAnalyzerRegistry(analyzers),
      extractor,
      candidateGenerator,
      store,
      projector,
      notifier,
      trigger: "manual",
      now: () => FIXED_INSTANT,
    },
  };
}

function workflow(options: StubOptions = {}): {
  readonly wf: EndOfSessionWorkflow;
  readonly s: Stubs;
} {
  const s = stubs(options);
  return { wf: createSessionWorkflow(s.deps), s };
}

describe("EOS-406 — the frozen sequence", () => {
  it("runs the stages in the documented order", async () => {
    const { wf, s } = workflow();
    await wf.run(CONTEXT);

    expect(s.trace).toEqual([
      "session",
      "collection",
      `extraction(notes=${NOTES})`,
      "generation",
      "saveCandidates",
      `projection(generatedAt=${FIXED_INSTANT.toISOString()})`,
      "saveReviewPackage",
      "saveReport",
      "appendLog",
      "notify",
    ]);
  });

  it("persists the canonical candidates before rendering a view of them (EOS-D4)", async () => {
    const { wf, s } = workflow();
    await wf.run(CONTEXT);

    // The candidates are what SPEC-004 consumes; the package is a derived view. If the
    // projector fails, the canonical artifact is already durable.
    expect(s.trace.indexOf("saveCandidates")).toBeLessThan(
      s.trace.findIndex((step) => step.startsWith("projection")),
    );
  });

  it("returns the report it persisted and notified with", async () => {
    const { wf, s } = workflow();
    const report = await wf.run(CONTEXT);

    expect(s.saved.report).toEqual(report);
    expect(s.saved.notified).toEqual(report);
    expect(s.saved.logEntry).toBe(report.logEntry);
  });
});

describe("EOS-406 — propagation without transformation", () => {
  it("hands each stage's output to the next unmodified", async () => {
    const { wf, s } = workflow();
    await wf.run(CONTEXT);

    // What a stage returns is what the next stage receives, and what the store gets is what
    // generation produced — no reshaping in flight.
    expect(s.saved.candidates).toEqual([CANDIDATE]);
    expect(s.saved.reviewPackage?.candidateIds).toEqual([CANDIDATE.id]);
  });

  it("passes the session notes through to extraction (EOS-D10)", async () => {
    const { wf, s } = workflow();
    await wf.run(CONTEXT);

    expect(s.trace).toContain(`extraction(notes=${NOTES})`);
  });

  it("omits notes that the request did not carry", async () => {
    const bare = { project: "aj-os", repository: "r", branch: "b" } as SessionContext;
    const { wf, s } = workflow();
    await wf.run(bare);

    expect(s.trace).toContain("extraction(notes=none)");
  });

  it("reports the analyzers the registry holds", async () => {
    const { wf } = workflow({
      analyzers: [inertAnalyzer("git"), inertAnalyzer("docs")],
    });
    const report = await wf.run(CONTEXT);

    expect(report.analyzersRun).toEqual(["git", "docs"]);
  });
});

describe("EOS-406 — outcome routing", () => {
  it("a clean run completes", async () => {
    const { wf } = workflow();

    expect((await wf.run(CONTEXT)).result).toBe("completed");
  });

  it("a recoverable analyzer error yields partial, and the run still finishes", async () => {
    // Collection never rejects: a failing analyzer contributes an AnalyzerError, and the
    // rest of the pipeline carries on.
    const failing: Analyzer = {
      id: "docs",
      name: "Docs analyzer",
      description: "stub",
      async analyze() {
        throw new Error("docs analyzer exploded");
      },
    };
    const { wf } = workflow({ analyzers: [contributingAnalyzer(), failing] });

    const report = await wf.run(CONTEXT);

    expect(report.result).toBe("partial");
    expect(report.errors.map((error) => error.source)).toContain("docs");
    expect(report.candidatesProduced.count).toBe(1);
  });

  it("a fatal extraction failure yields a persisted failed report, not a rejection", async () => {
    const { wf, s } = workflow({ failIn: "extraction" });

    const report = await wf.run(CONTEXT);

    // The run that most needs a record is the one that failed.
    expect(report.result).toBe("failed");
    expect(report.errors).toEqual([
      { source: "extraction", message: "extraction exploded", recoverable: false },
    ]);
    expect(s.saved.report).toEqual(report);
    expect(s.saved.notified).toEqual(report);
  });

  it("attributes a projection failure to the projection stage", async () => {
    const { wf, s } = workflow({ failIn: "projection" });
    const report = await wf.run(CONTEXT);

    expect(report.result).toBe("failed");
    expect(report.errors[0]?.source).toBe("projection");
    // The canonical candidates were already safe before the projector ran.
    expect(s.saved.candidates).toEqual([CANDIDATE]);
    expect(report.candidatesProduced.count).toBe(1);
  });

  it("still records what it had when a stage failed midway", async () => {
    const { wf } = workflow({ failIn: "generation" });
    const report = await wf.run(CONTEXT);

    expect(report.filesAnalyzed).toBe(1);
    expect(report.candidatesProduced).toEqual({ count: 0, ids: [] });
  });
});

describe("EOS-406 — rejects only when there is nowhere to record the outcome", () => {
  it("rejects when the session cannot be identified", async () => {
    // No session means no id, no report, and no `pending/<id>/` to write to — the failure
    // can only be surfaced.
    const { wf } = workflow({ failIn: "session" });

    await expect(wf.run(CONTEXT)).rejects.toThrow(/session exploded/);
  });

  it("rejects when the store cannot take the report", async () => {
    const { wf } = workflow({ storeFails: "saveReport" });

    await expect(wf.run(CONTEXT)).rejects.toThrow(/store unwritable/);
  });

  it("reports a candidate-persistence failure rather than losing the run", async () => {
    const { wf } = workflow({ storeFails: "saveCandidates" });
    const report = await wf.run(CONTEXT);

    expect(report.result).toBe("failed");
    expect(report.errors[0]?.source).toBe("persistence");
  });

  it("surfaces a notifier failure instead of swallowing it — but only after the report is durable", async () => {
    const { wf, s } = workflow({ notifierFails: true });

    // Swallowing this would be a retry/fallback policy, which the Orchestrator Invariant
    // puts in a stage, never here. The report is already persisted, so nothing is lost by
    // letting the failure surface.
    await expect(wf.run(CONTEXT)).rejects.toThrow(/slack unreachable/);
    expect(s.saved.report?.result).toBe("completed");
    expect(s.saved.logEntry).toBe(s.saved.report?.logEntry);
  });
});

describe("EOS-406 — the orchestrator is inert and additive", () => {
  it("returns a frozen handle", () => {
    expect(Object.isFrozen(workflow().wf)).toBe(true);
  });

  it("holds no state between runs", async () => {
    const { wf } = workflow();

    expect(await wf.run(CONTEXT)).toEqual(await wf.run(CONTEXT));
  });

  it("is deterministic with every stage stubbed and the clock pinned", async () => {
    expect(await workflow().wf.run(CONTEXT)).toEqual(await workflow().wf.run(CONTEXT));
  });

  it("absorbs a second analyzer with no change to the orchestrator", async () => {
    // The seams' payoff: registering an analyzer is a composition edit, never an
    // orchestration one.
    const { wf } = workflow({
      analyzers: [inertAnalyzer("git"), inertAnalyzer("docs"), inertAnalyzer("ide")],
    });
    const report = await wf.run(CONTEXT);

    expect(report.analyzersRun).toHaveLength(3);
    expect(report.result).toBe("completed");
  });
});
