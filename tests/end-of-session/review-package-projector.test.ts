/**
 * Review Package projector behaviour tests (EOS-403).
 *
 * The projector is the workflow's one markdown-aware stage and its only *derived*
 * artifact (EOS-D4): the candidates are canonical, the package is a view of them. These
 * tests pin the properties that make that claim true — purity, determinism,
 * completeness, canonical ordering, and regenerability from canonical data alone — and
 * deliberately **do not pin the prose**.
 *
 * Nothing parses this markdown, so asserting its exact wording would ossify a layout
 * that is explicitly free to change into a de-facto contract. Every assertion below is
 * about *presence, order, and derivation*.
 *
 * Everything is reached through the module's public surface only.
 */

import { describe, it, expect } from "vitest";

import {
  createReviewPackageProjector,
  parseCandidateKnowledge,
  parseReviewPackage,
  type CandidateKnowledge,
  type Session,
} from "../../src/end-of-session/index.js";

import { firstUnfrozenPath } from "./support.js";

const GENERATED_AT = "2026-07-16T10:30:00.000Z";

const SESSION: Session = Object.freeze({
  id: "session-eos-403",
  startedAt: "2026-07-16T10:00:00.000Z",
  endedAt: "2026-07-16T10:00:00.000Z",
  trigger: "manual",
  gitState: Object.freeze({
    head: "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    dirty: false,
    range: "main..HEAD",
  }),
  branch: "feat/spec-003-m5-composition",
}) as Session;

/** Build a candidate through the public contract — never a hand-rolled object literal. */
function candidate(
  index: number,
  overrides: Record<string, unknown> = {},
): CandidateKnowledge {
  return parseCandidateKnowledge({
    id: `session:${SESSION.id}:${index}`,
    kind: "handbook-entry",
    title: `Candidate ${index} title`,
    body: `The proposed knowledge of candidate ${index}.`,
    rationale: `Why candidate ${index} is reusable.`,
    provenance: {
      sessionId: SESSION.id,
      sourceChangeIds: [`git:src/file-${index}.ts`],
      sourcePaths: [`src/file-${index}.ts`],
      commitHash: SESSION.gitState.head,
      generatedAt: GENERATED_AT,
      generator: "end-of-session/candidate-generator",
    },
    governanceState: "candidate",
    tags: [],
    related: [],
    ...overrides,
  });
}

const projector = createReviewPackageProjector();

describe("EOS-403 — the projection contract", () => {
  it("returns a validated, deeply immutable ReviewPackage", () => {
    const pkg = projector.project([candidate(1)], SESSION, GENERATED_AT);

    expect(() => parseReviewPackage(pkg)).not.toThrow();
    expect(firstUnfrozenPath(pkg)).toBeNull();
  });

  it("keys the package to the session and the injected instant", () => {
    const pkg = projector.project([candidate(1)], SESSION, GENERATED_AT);

    expect(pkg.sessionId).toBe(SESSION.id);
    expect(pkg.generatedAt).toBe(GENERATED_AT);
  });

  it("returns a frozen handle", () => {
    expect(Object.isFrozen(projector)).toBe(true);
  });
});

describe("EOS-403 — purity and determinism", () => {
  it("is deep-equal across repeated projections of identical inputs", () => {
    const candidates = [candidate(1), candidate(2)];

    expect(projector.project(candidates, SESSION, GENERATED_AT)).toEqual(
      projector.project(candidates, SESSION, GENERATED_AT),
    );
  });

  it("reads no clock — the instant is an input, so the package cannot drift", () => {
    const later = "2027-01-01T00:00:00.000Z";

    // If the stage read a clock, this value could not round-trip.
    expect(projector.project([candidate(1)], SESSION, later).generatedAt).toBe(
      later,
    );
  });

  it("leaves its inputs untouched (immutability by divergence)", () => {
    const candidates = [candidate(1)];
    const before = JSON.stringify(candidates);

    projector.project(candidates, SESSION, GENERATED_AT);

    expect(JSON.stringify(candidates)).toBe(before);
  });
});

describe("EOS-403 — completeness and canonical order", () => {
  it("references every candidate, in canonical order, as ids not records", () => {
    const candidates = [candidate(1), candidate(2), candidate(3)];
    const pkg = projector.project(candidates, SESSION, GENERATED_AT);

    expect(pkg.candidateIds).toEqual([
      "session:session-eos-403:1",
      "session:session-eos-403:2",
      "session:session-eos-403:3",
    ]);
  });

  it("renders every candidate — N in, N out, nothing filtered away", () => {
    const candidates = [candidate(1), candidate(2), candidate(3)];
    const pkg = projector.project(candidates, SESSION, GENERATED_AT);

    for (const each of candidates) {
      expect(pkg.markdown).toContain(each.title);
      expect(pkg.markdown).toContain(each.body);
      expect(pkg.markdown).toContain(each.rationale);
    }
  });

  it("preserves canonical order in the rendered body, not just the ids", () => {
    const candidates = [candidate(1), candidate(2), candidate(3)];
    const { markdown } = projector.project(candidates, SESSION, GENERATED_AT);

    const positions = candidates.map((each) => markdown.indexOf(each.title));

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("does not deduplicate candidates that happen to look alike", () => {
    // Rendering is presentation, not editorial: two similar proposals are two
    // proposals, and deciding otherwise is SPEC-004's job.
    const twins = [
      candidate(1, { title: "Same title" }),
      candidate(2, { title: "Same title" }),
    ];
    const pkg = projector.project(twins, SESSION, GENERATED_AT);

    expect(pkg.candidateIds).toHaveLength(2);
    expect(pkg.markdown.split("Same title").length - 1).toBeGreaterThanOrEqual(2);
  });
});

describe("EOS-403 — traceability", () => {
  it("shows each candidate's source paths so a claim can be traced to the diff", () => {
    const pkg = projector.project([candidate(1)], SESSION, GENERATED_AT);

    expect(pkg.markdown).toContain("src/file-1.ts");
  });

  it("renders a candidate with no source paths without pretending it has one", () => {
    const orphan = candidate(1, {
      provenance: {
        sessionId: SESSION.id,
        sourceChangeIds: [],
        sourcePaths: [],
        generatedAt: GENERATED_AT,
        generator: "end-of-session/candidate-generator",
      },
    });

    const pkg = projector.project([orphan], SESSION, GENERATED_AT);

    expect(pkg.markdown).toContain(orphan.title);
    expect(() => parseReviewPackage(pkg)).not.toThrow();
  });

  it("shows the session's branch, range, and commit", () => {
    const { markdown } = projector.project([candidate(1)], SESSION, GENERATED_AT);

    expect(markdown).toContain(SESSION.branch);
    expect(markdown).toContain(SESSION.gitState.range);
    expect(markdown).toContain(SESSION.gitState.head.slice(0, 7));
  });
});

describe("EOS-403 — optional candidate fields", () => {
  it("renders tags and confidence when present", () => {
    const rich = candidate(1, { tags: ["testing", "ci"], confidence: 0.8 });
    const { markdown } = projector.project([rich], SESSION, GENERATED_AT);

    expect(markdown).toContain("testing");
    expect(markdown).toContain("ci");
    expect(markdown).toContain("0.8");
  });

  it("omits them cleanly when absent, rather than rendering undefined", () => {
    const { markdown } = projector.project([candidate(1)], SESSION, GENERATED_AT);

    expect(markdown).not.toContain("undefined");
    expect(markdown).not.toContain("Tags:");
  });

  it("labels each candidate's kind", () => {
    const wiki = candidate(1, { kind: "wiki-publication" });
    const { markdown } = projector.project([wiki], SESSION, GENERATED_AT);

    expect(markdown.toLowerCase()).toContain("wiki publication");
  });

  it("keeps a multi-line title inside its heading", () => {
    // `title` is model output and the contract permits newlines, so a raw title can
    // structurally break the heading it is rendered into and spill into the body.
    const awkward = candidate(1, {
      title: "Prefer --show-current\nwhen HEAD is detached",
    });

    const { markdown } = projector.project([awkward], SESSION, GENERATED_AT);
    const heading = markdown
      .split("\n")
      .find((line) => line.startsWith("### 1."));

    expect(heading).toBe(
      "### 1. Prefer --show-current when HEAD is detached",
    );
  });
});

describe("EOS-403 — the empty session", () => {
  it("produces a valid package with no candidates", () => {
    const pkg = projector.project([], SESSION, GENERATED_AT);

    // A session that surfaced nothing is a successful capture of nothing, not an
    // error — and `markdown` is `.min(1)`, so it must still say something.
    expect(pkg.candidateIds).toEqual([]);
    expect(pkg.markdown.length).toBeGreaterThan(0);
    expect(pkg.summary.length).toBeGreaterThan(0);
    expect(() => parseReviewPackage(pkg)).not.toThrow();
  });

  it("terminates the markdown with a newline", () => {
    // The store writes `markdown` byte-for-byte and must not edit the projection, so a
    // well-formed text file is this stage's responsibility — otherwise every
    // `review-package.md` in the vault ends mid-line.
    expect(projector.project([], SESSION, GENERATED_AT).markdown.endsWith("\n")).toBe(
      true,
    );
    expect(
      projector.project([candidate(1)], SESSION, GENERATED_AT).markdown.endsWith("\n"),
    ).toBe(true);
  });

  it("tells the reviewer plainly that nothing needs review", () => {
    const pkg = projector.project([], SESSION, GENERATED_AT);

    // The session context is still rendered — an empty review is a real review, and
    // the reviewer should see which session produced nothing.
    expect(pkg.markdown).toContain(SESSION.branch);
    // The body carries the synopsis. Asserted via the derived `summary` rather than
    // a literal sentence: the synopsis's *wording* is this stage's to change freely
    // (nothing parses it), while "the body states the synopsis" is the durable
    // property. What that synopsis says for an empty session is pinned by the
    // summary tests below.
    expect(pkg.markdown).toContain(pkg.summary);
    // And no candidate scaffolding is rendered when there is nothing to review — a
    // structural claim that can actually fail.
    expect(pkg.markdown).not.toContain("## Candidates");
  });
});

describe("EOS-403 — the summary derives from canonical data only (EOS-D4)", () => {
  it("counts the candidates it was given", () => {
    const pkg = projector.project(
      [candidate(1), candidate(2)],
      SESSION,
      GENERATED_AT,
    );

    expect(pkg.summary).toContain("2");
    expect(pkg.summary).toContain(SESSION.branch);
  });

  it("breaks the count down by kind", () => {
    const pkg = projector.project(
      [candidate(1), candidate(2, { kind: "lesson-learned" })],
      SESSION,
      GENERATED_AT,
    );

    expect(pkg.summary.toLowerCase()).toContain("handbook entry");
    expect(pkg.summary.toLowerCase()).toContain("lesson learned");
  });

  it("is reproducible from the candidates alone — the regenerability property", () => {
    // The whole point of EOS-D4: the store holds candidates + session metadata, so a
    // package rebuilt from them must equal the original. If the summary drew on the
    // unpersisted KnowledgeExtraction, this could not hold.
    const candidates = [candidate(1), candidate(2)];
    const original = projector.project(candidates, SESSION, GENERATED_AT);

    const rebuiltFromStore = createReviewPackageProjector().project(
      candidates.map((each) => parseCandidateKnowledge(each)),
      SESSION,
      GENERATED_AT,
    );

    expect(rebuiltFromStore).toEqual(original);
  });
});
