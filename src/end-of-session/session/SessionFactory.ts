/**
 * The Session stage — the workflow's identity and provenance anchor.
 *
 * `SessionFactory` turns the input request (`SessionContext`) into the **identified
 * run** (`Session`): a stable, opaque id plus the metadata every downstream artifact
 * keys on. Candidates are named `session:<id>:<n>`, the review store is
 * `pending/<session-id>/`, and the report references `Session.id` — so this is the
 * one place identity is minted, and the one place git observations become
 * `gitState` (EOS-D3).
 *
 * Its responsibility is **identity and assembly only**: it mints an id, records what
 * the injected ports observe, and constructs the change range. It does not collect
 * changes, extract knowledge, persist, or judge whether a session was worth
 * capturing.
 */

import type { Session, SessionContext, TriggerKind } from "../contracts/session/index.js";

export interface SessionFactoryOptions {
  /**
   * The kind of trigger that ended the session, stamped by composition from
   * `TriggerSource.trigger`. Passed as data rather than as the `TriggerSource`
   * itself: the factory records which trigger fired, and must not be able to
   * *invoke* one (EOS-D3/EOS-D9).
   */
  readonly trigger: TriggerKind;
  /**
   * Optional git ref the session is measured from (the CLI's `--since <ref>`).
   * Present ⇒ the session covers `<ref>..HEAD`; absent ⇒ it covers the
   * uncommitted and staged work against `HEAD`.
   */
  readonly since?: string;
}

export interface SessionFactory {
  /**
   * Produce one identified `Session` for a finished session.
   *
   * Asynchronous because the session's git state is **observed**, not asserted:
   * `head`, `dirty`, and `branch` come from the injected `GitPort` rather than from
   * `context`, so provenance records facts (EOS-D7). Identity is minted here and is
   * deliberately not a function of the inputs — calling `create` twice with the same
   * `context` yields two distinct sessions, because they are two distinct runs
   * (EOS-D3).
   *
   * `context` is therefore the stage's input by contract but contributes no field to
   * the returned `Session` in v1: identity is minted, state is observed, and the
   * request's own `commitHash`/`branch` are exactly the claims EOS-D7 declines to
   * trust. Its remaining fields (`sessionNotes`, `taskId`, `contextPackageRef`) have
   * no consumer anywhere in the v1 pipeline — a gap in the frozen plan raised at
   * EOS-402, not a property of this stage.
   *
   * Rejects if the repository's state cannot be read: a session whose head or
   * branch is unknown cannot be identified at all, which is fatal rather than
   * recoverable (SPEC-003 §15).
   */
  create(
    context: SessionContext,
    options: SessionFactoryOptions,
  ): Promise<Session>;
}
