/**
 * The Session factory — mints the identified run from the session's observed git
 * state (EOS-D3).
 *
 * The mapping is small and deliberate: identity is **minted** (opaque, never derived
 * from branch or timestamp); `head`/`dirty`/`branch` are **observed** through the
 * injected read-only `GitPort` (EOS-D7) rather than taken from the caller, so
 * provenance records facts rather than claims; the change `range` is **constructed**
 * from the optional `since` ref; and the timestamps come from the injected clock.
 *
 * Non-determinism is confined to the two injected sources — the clock and the id
 * generator — exactly as `createCandidateGenerator` injects `now`. Tests pin both and
 * stub the port, making `create` a pure function of its inputs.
 */

import { randomUUID } from "node:crypto";

import { parseSession } from "../contracts/session/index.js";
import type { Session, SessionContext } from "../contracts/session/index.js";
import type { GitPort } from "../analyzers/git/index.js";

import type { SessionFactory, SessionFactoryOptions } from "./SessionFactory.js";

/**
 * Length of the `<short-head>` in a synthesized detached branch value. Seven hex
 * characters is git's historical default abbreviation, so the value reads the way a
 * developer expects a short commit to look. Git scales its own abbreviation up in
 * repositories large enough for seven characters to collide; this label does not,
 * and does not need to — it is human-facing, and `gitState.head` carries the full
 * hash that provenance actually relies on.
 */
const SHORT_HEAD_LENGTH = 7;

/**
 * The range covering a session that named no `--since` ref: everything uncommitted
 * and staged, measured against HEAD. `git diff … HEAD` reports exactly that — the
 * default session semantics of EOS-002/M2, fixed here because this is where the
 * workflow first decides what "the session" means.
 */
const WORKING_TREE_RANGE = "HEAD";

export interface SessionFactoryConfig {
  /** The read-only git access the session's state is observed through (EOS-D7). */
  readonly gitPort: GitPort;
  /**
   * Clock for the session's timestamps. Defaults to the wall clock (the
   * `createKnowledgePipeline` precedent); tests pin it.
   */
  readonly now?: () => Date;
  /**
   * Source of the session's opaque identity. Defaults to `randomUUID` — built in, no
   * dependency, and satisfying the contract exactly (non-empty, opaque, stable).
   * Injected so tests can pin it; EOS-D3 fixes the *invariant*, never the generator.
   */
  readonly id?: () => string;
}

/**
 * Build the change range the session covers.
 *
 * A named ref measures the session as a commit range; its absence measures the
 * working tree. A blank `since` is treated as absent rather than spliced into a
 * malformed `"..HEAD"`: the factory constructs ranges, it does not validate refs —
 * an unresolvable ref is git's to reject, and the collection stage already degrades
 * that into a recoverable `AnalyzerError`.
 */
function rangeFor(since: string | undefined): string {
  const ref = since?.trim();
  return ref === undefined || ref.length === 0 ? WORKING_TREE_RANGE : `${ref}..HEAD`;
}

/**
 * The branch value for a session whose HEAD is detached (the frozen Branch Policy,
 * EOS-402).
 *
 * When git reports no current branch — mid-rebase, mid-bisect, or on a checked-out
 * tag — there is genuinely no branch to record, yet `Session.branch` is required and
 * non-empty. Rather than weaken the contract or fail a capture that is often worth
 * keeping, the factory synthesizes a value that states *that* the session was
 * detached and *where*. Nullable branch handling stops here and never reaches the
 * candidates, the projection, the report, or SPEC-004.
 *
 * Reuses the already-observed `head`, so it costs no extra git read.
 */
function describeDetached(head: string): string {
  return `detached@${head.slice(0, SHORT_HEAD_LENGTH)}`;
}

/**
 * Create the Session factory over an injected {@link GitPort}, clock, and id source.
 *
 * A missing port throws — the factory is rejected rather than constructed in a
 * broken state. The returned handle is frozen (the module's factory convention).
 *
 * @example
 * const factory = createSessionFactory({ gitPort });
 * const session = await factory.create(context, { trigger: "manual", since: "main" });
 */
export function createSessionFactory(config: SessionFactoryConfig): SessionFactory {
  if (config?.gitPort === null || config?.gitPort === undefined) {
    throw new Error("createSessionFactory: a GitPort is required.");
  }

  const gitPort = config.gitPort;
  const now = config.now ?? (() => new Date());
  const id = config.id ?? (() => randomUUID());

  async function create(
    // Unread: every `Session` field is either minted here or observed through the
    // port, so nothing the request claims can enter provenance unverified (EOS-D7).
    _context: SessionContext,
    options: SessionFactoryOptions,
  ): Promise<Session> {
    // The three reads are independent, so they run together; any rejection is fatal
    // to session creation and propagates (SPEC-003 §15 — repository unavailable).
    const [head, dirty, branch] = await Promise.all([
      gitPort.head(),
      gitPort.dirty(),
      gitPort.branch(),
    ]);

    // One instant for the session: a manual trigger observes only that the session
    // *ended* — when it started is not observable in v1, so both timestamps record
    // the trigger instant rather than inventing a span. The workflow *run*'s timing
    // is a separate window, recorded by the SessionReport (EOS-405).
    const instant = now().toISOString();

    return parseSession({
      id: id(),
      startedAt: instant,
      endedAt: instant,
      trigger: options.trigger,
      gitState: { head, dirty, range: rangeFor(options.since) },
      branch: branch ?? describeDetached(head),
    });
  }

  return Object.freeze({ create });
}
