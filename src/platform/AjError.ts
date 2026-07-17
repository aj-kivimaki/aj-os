/**
 * Base class for every AJ-OS domain error (REX-502, F-060).
 *
 * A shared base makes `catch (e) { if (e instanceof AjError) }` possible, so a
 * friendly-message path can match *every* domain error without enumerating each
 * class by name — the enumeration F-060 proved goes stale (a new error class
 * silently bypassed the handler in `wiki.ts`). Every concrete error extends this
 * instead of `Error` directly.
 *
 * - `name` is set from the concrete subclass (`new.target`), so subclasses need
 *   no `this.name = "…"` line and it can never fall out of sync with the class.
 * - `cause` is forwarded to `Error`, so a wrapped underlying error is preserved
 *   for diagnostics instead of discarded (F-063).
 *
 * Backward-compatible: each concrete class still exists and still matches its own
 * `instanceof`; this only adds `instanceof AjError` and the `cause` channel.
 */
export class AjError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
