/**
 * Session Report builder behaviour tests (EOS-405).
 *
 * The report is the workflow's execution log (SPEC-003 §16) and the value `run` returns, so
 * these tests pin the properties that make it trustworthy: the outcome policy, the
 * denormalized fields the contract deliberately declines to check, determinism, and — most
 * importantly — that a **failed** run still produces a valid report, because the report is
 * how a failure becomes observable at all.
 *
 * The builder is a pure projection: no stubs are needed and none are used. Fixtures are built
 * through the public contracts.
 *
 * Everything is reached through the module's public surface only.
 */

import { describe, it, expect } from "vitest";

import {
  buildSessionReport,
  parseCandidateKnowledge,
  parseChangeSet,
  parseSessionReport,
  type CandidateKnowledge,
  type ChangeSet,
  type FatalStageError,
  type Session,
  type SessionRunFacts,
} from "../../src/end-of-session/index.js";

import { firstUnfrozenPath } from "./support.js";

const RUN_STARTED = "2026-07-16T10:30:00.000Z";
const RUN_ENDED = "2026-07-16T10:30:04.500Z";

const SESSION: Session = Object.freeze({
  id: "session-eos-405",
  // The *session's* window — deliberately different from the run's, to prove the report
  // times the run and not the session.
  startedAt: "2026-07-16T09:00:00.000Z",
  endedAt: "2026-07-16T09:00:00.000Z",
  trigger: "manual",
  gitState: Object.freeze({
    head: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    dirty: false,
    range: "main..HEAD",
  }),
  branch: "feat/spec-003-m5-composition",
}) as Session;

function candidate(index: number): CandidateKnowledge {
  return parseCandidateKnowledge({
    id: `session:${SESSION.id}:${index}`,
    kind: "handbook-entry",
    title: `Candidate ${index}`,
    body: `Body ${index}.`,
    rationale: `Rationale ${index}.`,
    provenance: {
      sessionId: SESSION.id,
      sourceChangeIds: [],
      sourcePaths: [`src/file-${index}.ts`],
      generatedAt: RUN_STARTED,
      generator: "end-of-session/candidate-generator",
    },
    governanceState: "candidate",
    tags: [],
    related: [],
  });
}

/** The recoverable-failure shape collection contributes to a `ChangeSet` (EOS-101). */
interface AnalyzerErrorFixture {
  readonly analyzer: string;
  readonly message: string;
  readonly recoverable: boolean;
}

function changeSet(
  fileCount: number,
  errors: readonly AnalyzerErrorFixture[] = [],
): ChangeSet {
  return parseChangeSet({
    sessionId: SESSION.id,
    changes: Array.from({ length: fileCount }, (_unused, index) => ({
      id: `git:src/file-${index}.ts`,
      kind: "source",
      path: `src/file-${index}.ts`,
      changeType: "modified",
      summary: `modified src/file-${index}.ts`,
      metadata: {},
    })),
    errors,
  });
}

/** A clean, complete run: two files analyzed, two candidates, no errors. */
function facts(overrides: Partial<SessionRunFacts> = {}): SessionRunFacts {
  return {
    session: SESSION,
    startedAt: RUN_STARTED,
    endedAt: RUN_ENDED,
    analyzersRun: ["git"],
    changeSet: changeSet(2),
    candidates: [candidate(1), candidate(2)],
    ...overrides,
  };
}

/**
 * Facts for a run that died before candidates existed.
 *
 * `candidates` is **omitted**, not set to `undefined`: the field is optional under
 * `exactOptionalPropertyTypes`, so "absent" and "explicitly undefined" are different types —
 * and absent is what a failed run actually looks like.
 */
function fatalFacts(
  fatalError: FatalStageError,
  overrides: Partial<SessionRunFacts> = {},
): SessionRunFacts {
  return {
    session: SESSION,
    startedAt: RUN_STARTED,
    endedAt: RUN_ENDED,
    analyzersRun: ["git"],
    changeSet: changeSet(2),
    fatalError,
    ...overrides,
  };
}

const recoverable: AnalyzerErrorFixture = {
  analyzer: "docs",
  message: "The analyzer failed to contribute changes.",
  recoverable: true,
};

describe("EOS-405 — the outcome policy", () => {
  it("a clean run is completed", () => {
    expect(buildSessionReport(facts()).result).toBe("completed");
  });

  it("a recoverable analyzer error makes the run partial", () => {
    const report = buildSessionReport(facts({ changeSet: changeSet(2, [recoverable]) }));

    // Partial collection: one analyzer failed, the rest continued, candidates were still
    // produced. The run succeeded — incompletely.
    expect(report.result).toBe("partial");
    expect(report.candidatesProduced.count).toBe(2);
  });

  it("a fatal stage error makes the run failed", () => {
    const report = buildSessionReport(
      fatalFacts({ source: "extraction", message: "The model returned no JSON." }),
    );

    expect(report.result).toBe("failed");
  });

  it("zero candidates with no errors is completed, not failed", () => {
    // A session that taught us nothing is a successful capture of nothing. This is the
    // assumption most likely to harden the wrong way, so it is pinned explicitly.
    const report = buildSessionReport(facts({ candidates: [] }));

    expect(report.result).toBe("completed");
    expect(report.candidatesProduced).toEqual({ count: 0, ids: [] });
  });

  it("zero candidates with a recoverable error is partial — the discriminator is errors", () => {
    const report = buildSessionReport(
      facts({ candidates: [], changeSet: changeSet(0, [recoverable]) }),
    );

    expect(report.result).toBe("partial");
  });

  it("a fatal error wins over recoverable ones — the run did not finish", () => {
    const report = buildSessionReport(
      fatalFacts(
        { source: "extraction", message: "Transport failure." },
        { changeSet: changeSet(2, [recoverable]) },
      ),
    );

    expect(report.result).toBe("failed");
    expect(report.errors).toHaveLength(2);
  });
});

describe("EOS-405 — a failed run still produces a valid report", () => {
  it("reports a run that died before collection", () => {
    // The report is how a failure becomes observable; a builder that threw here would
    // erase the only record of it.
    const report = buildSessionReport({
      session: SESSION,
      startedAt: RUN_STARTED,
      endedAt: RUN_ENDED,
      analyzersRun: ["git"],
      fatalError: { source: "session", message: "repository unavailable" },
    });

    expect(report.result).toBe("failed");
    expect(report.filesAnalyzed).toBe(0);
    expect(report.candidatesProduced).toEqual({ count: 0, ids: [] });
    expect(report.errors).toEqual([
      {
        source: "session",
        message: "repository unavailable",
        recoverable: false,
      },
    ]);
    expect(() => parseSessionReport(report)).not.toThrow();
  });
});

describe("EOS-405 — errors", () => {
  it("maps an AnalyzerError onto the report's shape, carrying recoverable", () => {
    const report = buildSessionReport(facts({ changeSet: changeSet(1, [recoverable]) }));

    // `source` generalizes `analyzer` (EOS-004); `recoverable` is carried, not re-decided —
    // the collection stage already judged it.
    expect(report.errors).toEqual([
      {
        source: "docs",
        message: "The analyzer failed to contribute changes.",
        recoverable: true,
      },
    ]);
  });

  it("orders recoverable errors before the fatal one", () => {
    const report = buildSessionReport(
      fatalFacts(
        { source: "extraction", message: "boom" },
        { changeSet: changeSet(1, [recoverable]) },
      ),
    );

    expect(report.errors.map((error) => error.source)).toEqual(["docs", "extraction"]);
    expect(report.errors.map((error) => error.recoverable)).toEqual([true, false]);
  });
});

describe("EOS-405 — the denormalized fields the contract will not check", () => {
  it("keeps candidatesProduced.count equal to ids.length", () => {
    const report = buildSessionReport(facts());

    expect(report.candidatesProduced.count).toBe(report.candidatesProduced.ids.length);
    expect(report.candidatesProduced.ids).toEqual([
      "session:session-eos-405:1",
      "session:session-eos-405:2",
    ]);
  });

  it("computes durationMs from the run window", () => {
    expect(buildSessionReport(facts()).durationMs).toBe(4_500);
  });

  it("clamps a backwards clock to zero rather than losing the report", () => {
    // A wall clock can step backwards mid-run (an NTP correction). A negative duration
    // would fail the contract's min(0) and destroy the run's only record over a
    // meaningless number.
    const report = buildSessionReport(
      facts({ startedAt: RUN_ENDED, endedAt: RUN_STARTED }),
    );

    expect(report.durationMs).toBe(0);
    expect(() => parseSessionReport(report)).not.toThrow();
  });

  it("counts the files collection analyzed", () => {
    expect(buildSessionReport(facts({ changeSet: changeSet(5) })).filesAnalyzed).toBe(5);
  });
});

describe("EOS-405 — the report times the run, not the session", () => {
  it("records the run window, not the session's", () => {
    const report = buildSessionReport(facts());

    // Same field names on two contracts, different meanings on purpose: `Session` times the
    // coding session; the report times the workflow execution (SPEC-003 §16's "Duration").
    expect(report.startedAt).toBe(RUN_STARTED);
    expect(report.endedAt).toBe(RUN_ENDED);
    expect(report.startedAt).not.toBe(SESSION.startedAt);
  });

  it("takes sessionId and trigger from the session", () => {
    const report = buildSessionReport(facts());

    expect(report.sessionId).toBe(SESSION.id);
    expect(report.trigger).toBe("manual");
  });

  it("records which analyzers ran, in the order given", () => {
    // A SPEC-003 §16 field: the log must say what was actually run, not what was
    // registered in principle.
    const report = buildSessionReport(facts({ analyzersRun: ["git", "docs"] }));

    expect(report.analyzersRun).toEqual(["git", "docs"]);
  });

  it("records an empty analyzer list without inventing one", () => {
    expect(buildSessionReport(facts({ analyzersRun: [] })).analyzersRun).toEqual([]);
  });
});

describe("EOS-405 — purity and contract conformance", () => {
  it("is deep-equal across repeated builds, logEntry included", () => {
    expect(buildSessionReport(facts())).toEqual(buildSessionReport(facts()));
  });

  it("returns a validated, deeply immutable report", () => {
    const report = buildSessionReport(facts());

    expect(() => parseSessionReport(report)).not.toThrow();
    expect(firstUnfrozenPath(report)).toBeNull();
  });

  it("leaves its inputs untouched", () => {
    const input = facts();
    const before = JSON.stringify(input);

    buildSessionReport(input);

    expect(JSON.stringify(input)).toBe(before);
  });
});

describe("EOS-405 — logEntry", () => {
  it("is a deterministic one-line summary of the run", () => {
    const { logEntry } = buildSessionReport(facts());

    expect(logEntry).not.toContain("\n");
    expect(logEntry).toContain(`session=${SESSION.id}`);
    expect(logEntry).toContain("result=completed");
    expect(logEntry).toContain("files=2");
    expect(logEntry).toContain("candidates=2");
    expect(logEntry).toContain("errors=0");
  });

  it("reports the outcome of a failed run", () => {
    const { logEntry } = buildSessionReport(
      fatalFacts({ source: "extraction", message: "boom" }),
    );

    expect(logEntry).toContain("result=failed");
    expect(logEntry).toContain("errors=1");
  });

  it("agrees with the structured fields it summarizes", () => {
    // The log line is derived from the assembled report, not recomputed from the facts, so
    // the record and its summary cannot describe the same run differently.
    const report = buildSessionReport(facts({ changeSet: changeSet(3, [recoverable]) }));

    expect(report.logEntry).toContain(`duration=${report.durationMs}ms`);
    expect(report.logEntry).toContain(`files=${report.filesAnalyzed}`);
    expect(report.logEntry).toContain(`candidates=${report.candidatesProduced.count}`);
    expect(report.logEntry).toContain(`errors=${report.errors.length}`);
    expect(report.logEntry).toContain(`result=${report.result}`);
  });
});
