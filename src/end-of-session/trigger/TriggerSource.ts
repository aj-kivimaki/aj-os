/**
 * TriggerSource — the extensibility seam for *how a session is triggered*.
 *
 * A trigger source determines *when* a session ends and produces the
 * `SessionContext` the workflow runs on. v1 ships only the manual trigger; git-hook,
 * scheduled, and IDE triggers are later implementations of this same port, added
 * behind it without changing orchestration (`run` never changes).
 *
 * The port is intentionally minimal: it advertises which `TriggerKind` it represents
 * and exposes a single method that produces a `SessionContext`. It owns **no**
 * orchestration, policy, retry, routing, or lifecycle management — those are not a
 * trigger's concern.
 */

import type { SessionContext, TriggerKind } from "../contracts/session/index.js";

export interface TriggerSource {
  /**
   * The kind of trigger this source represents. Static identity the composition
   * root stamps onto the `Session` (EOS-D3); independent of the produced context.
   */
  readonly trigger: TriggerKind;
  /**
   * Produce the `SessionContext` for a finished session.
   *
   * Asynchronous so future file-, git-, or API-backed triggers satisfy the same
   * contract without a signature change; the manual trigger performs no I/O and
   * resolves synchronously. The source does not build a `Session`, generate its id,
   * or notify — it only produces the input context.
   */
  createContext(): Promise<SessionContext>;
}
