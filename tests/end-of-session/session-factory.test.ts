/**
 * Session factory behaviour tests (EOS-402).
 *
 * The factory is the workflow's identity and provenance anchor: every candidate is
 * `session:<id>:<n>`, the review store is `pending/<session-id>/`, and provenance
 * carries the session's observed `head`. These tests drive it entirely through a
 * **stub `GitPort`** and a pinned clock and id source — no real git — so the stage's
 * only intentional non-determinism (identity and time) is controlled and everything
 * else is asserted as a pure function of its inputs.
 *
 * Everything is reached through the module's public surface only.
 */

import { describe, it, expect } from "vitest";

import {
  createSessionFactory,
  type GitFileChange,
  type GitPort,
  type SessionContext,
  type SessionFactory,
} from "../../src/end-of-session/index.js";

import { firstUnfrozenPath } from "./support.js";

const CONTEXT: SessionContext = Object.freeze({
  project: "aj-os",
  repository: "systems/aj-os",
  branch: "feat/spec-003-m5-composition",
}) as SessionContext;

const FIXED_INSTANT = new Date("2026-07-16T10:30:00.000Z");
const HEAD = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";

interface StubState {
  readonly head?: string;
  readonly dirty?: boolean;
  readonly branch?: string | null;
}

/**
 * A stub GitPort reporting fixed state.
 *
 * `changes` throws: the Session factory shares the read-only git seam with the
 * analyzer (EOS-D7) but must never collect changes — that is the collection stage's
 * job (EOS-101). Making it throw turns that boundary into a guarantee rather than a
 * comment.
 */
function stubGitPort(state: StubState = {}): GitPort {
  return {
    async changes(): Promise<readonly GitFileChange[]> {
      throw new Error(
        "SessionFactory must not collect changes — it called changes().",
      );
    },
    async head(): Promise<string> {
      return state.head ?? HEAD;
    },
    async dirty(): Promise<boolean> {
      return state.dirty ?? false;
    },
    async branch(): Promise<string | null> {
      return state.branch === undefined ? "main" : state.branch;
    },
  };
}

/** A fully pinned factory: fixed clock and fixed identity, so `create` is pure. */
function pinnedFactory(state: StubState = {}, id = "session-fixed"): SessionFactory {
  return createSessionFactory({
    gitPort: stubGitPort(state),
    now: () => FIXED_INSTANT,
    id: () => id,
  });
}

describe("EOS-402 — construction", () => {
  it("throws without a GitPort", () => {
    expect(() =>
      createSessionFactory(undefined as unknown as { gitPort: GitPort }),
    ).toThrow(/GitPort is required/);
    expect(() => createSessionFactory({ gitPort: null as unknown as GitPort })).toThrow(
      /GitPort is required/,
    );
  });

  it("returns a frozen handle", () => {
    expect(Object.isFrozen(pinnedFactory())).toBe(true);
  });
});

describe("EOS-402 — observed git state", () => {
  it("records head and dirty from the port, not from the request", async () => {
    const session = await pinnedFactory({ head: HEAD, dirty: true }).create(
      // The request carries no commit hash at all; the session's head must still be
      // right, because it is observed rather than asserted (EOS-D7).
      CONTEXT,
      { trigger: "manual" },
    );

    expect(session.gitState.head).toBe(HEAD);
    expect(session.gitState.dirty).toBe(true);
  });

  it("records the observed branch, even when the request disagrees", async () => {
    const session = await pinnedFactory({ branch: "actually-here" }).create(
      // CONTEXT claims `feat/spec-003-m5-composition`; git says otherwise. The
      // observation wins — a request's claim is not provenance.
      CONTEXT,
      { trigger: "manual" },
    );

    expect(session.branch).toBe("actually-here");
  });

  it("stamps the trigger supplied by composition", async () => {
    const session = await pinnedFactory().create(CONTEXT, { trigger: "manual" });

    expect(session.trigger).toBe("manual");
  });

  it("propagates a git failure — an unidentifiable session is fatal", async () => {
    const failing: GitPort = {
      ...stubGitPort(),
      async head(): Promise<string> {
        throw new Error("repository unavailable");
      },
    };

    // SPEC-003 §15: a session whose head cannot be read cannot be identified, so
    // this must reject rather than degrade into a session with invented state.
    await expect(
      createSessionFactory({ gitPort: failing }).create(CONTEXT, {
        trigger: "manual",
      }),
    ).rejects.toThrow(/repository unavailable/);
  });
});

describe("EOS-402 — range construction", () => {
  it("covers uncommitted and staged work by default", async () => {
    const session = await pinnedFactory().create(CONTEXT, { trigger: "manual" });

    expect(session.gitState.range).toBe("HEAD");
  });

  it("covers <ref>..HEAD when a since ref is supplied", async () => {
    const session = await pinnedFactory().create(CONTEXT, {
      trigger: "manual",
      since: "main",
    });

    expect(session.gitState.range).toBe("main..HEAD");
  });

  it("treats a blank since ref as absent rather than building '..HEAD'", async () => {
    const session = await pinnedFactory().create(CONTEXT, {
      trigger: "manual",
      since: "   ",
    });

    expect(session.gitState.range).toBe("HEAD");
  });

  it("passes an unresolvable ref through — validating refs is git's job", async () => {
    const session = await pinnedFactory().create(CONTEXT, {
      trigger: "manual",
      since: "no-such-ref",
    });

    // The factory constructs ranges; it does not resolve them. A bad ref surfaces
    // later as a recoverable AnalyzerError (EOS-101), never as a session failure.
    expect(session.gitState.range).toBe("no-such-ref..HEAD");
  });
});

describe("EOS-402 — the Branch Policy (detached HEAD)", () => {
  it("synthesizes detached@<short-head> when git reports no branch", async () => {
    const session = await pinnedFactory({ branch: null, head: HEAD }).create(
      CONTEXT,
      { trigger: "manual" },
    );

    expect(session.branch).toBe("detached@a1b2c3d");
  });

  it("captures a detached session rather than failing it", async () => {
    // A rebase or bisect is exactly when a session's lessons are worth keeping, so
    // detached HEAD must not be fatal.
    const session = await pinnedFactory({ branch: null }).create(CONTEXT, {
      trigger: "manual",
    });

    expect(session.id).toBe("session-fixed");
    expect(session.gitState.head).toBe(HEAD);
  });

  it("keeps Session.branch non-empty, so no null escapes the stage", async () => {
    const session = await pinnedFactory({ branch: null }).create(CONTEXT, {
      trigger: "manual",
    });

    // The contract stays required and non-empty (it parsed at all), and nothing
    // downstream — candidates, projection, report, SPEC-004 — ever sees a null.
    expect(session.branch.length).toBeGreaterThan(0);
    expect(session.branch).not.toBe("HEAD");
  });

  it("derives the short head from the session's own head commit", async () => {
    const other = "0f1e2d3c4b5a69788796a5b4c3d2e1f001234567";
    const session = await pinnedFactory({ branch: null, head: other }).create(
      CONTEXT,
      { trigger: "manual" },
    );

    expect(session.branch).toBe("detached@0f1e2d3");
  });
});

describe("EOS-402 — identity (EOS-D3)", () => {
  it("mints a distinct id per run, even for an identical request", async () => {
    // Identity is not a pure function of the inputs: two runs over the same context
    // are two different sessions, and their candidates must not collide.
    const factory = createSessionFactory({ gitPort: stubGitPort() });

    const first = await factory.create(CONTEXT, { trigger: "manual" });
    const second = await factory.create(CONTEXT, { trigger: "manual" });

    expect(first.id).not.toBe(second.id);
  });

  it("defaults to an opaque UUID", async () => {
    const session = await createSessionFactory({ gitPort: stubGitPort() }).create(
      CONTEXT,
      { trigger: "manual" },
    );

    // The ratified default (EOS-D3 left the generator to M5). The *non-derivation*
    // property this pins is proven by the distinct-id-per-run test above: a
    // branch-or-timestamp-derived id would repeat across two runs of one context.
    expect(session.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

describe("EOS-402 — timestamps", () => {
  it("records the trigger instant, not an invented span", async () => {
    const session = await pinnedFactory().create(CONTEXT, { trigger: "manual" });

    // v1 does not observe when a session *started* — a manual trigger only tells us
    // it ended. Both stamps record that instant; the workflow *run*'s window is a
    // separate concern owned by the SessionReport (EOS-405).
    expect(session.startedAt).toBe(FIXED_INSTANT.toISOString());
    expect(session.endedAt).toBe(session.startedAt);
  });
});

describe("EOS-402 — contract conformance", () => {
  it("returns a validated, deeply immutable Session", async () => {
    const session = await pinnedFactory().create(CONTEXT, { trigger: "manual" });

    expect(firstUnfrozenPath(session)).toBeNull();
  });

  it("leaves the request untouched (immutability by divergence)", async () => {
    const before = JSON.stringify(CONTEXT);
    await pinnedFactory().create(CONTEXT, { trigger: "manual" });

    expect(JSON.stringify(CONTEXT)).toBe(before);
  });

  it("is deterministic once the clock, id, and port are pinned", async () => {
    const first = await pinnedFactory({ dirty: true }).create(CONTEXT, {
      trigger: "manual",
      since: "main",
    });
    const second = await pinnedFactory({ dirty: true }).create(CONTEXT, {
      trigger: "manual",
      since: "main",
    });

    expect(first).toEqual(second);
  });
});
