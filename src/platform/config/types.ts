/**
 * The typed shape of `aj.config.json`.
 *
 * Future configuration options are added by the milestone that needs them,
 * not ahead of time.
 */
export interface AjConfig {
  readonly handbook: {
    /** Path to the handbook, as written in the configuration file. */
    readonly path: string;
    /**
     * The generated knowledge store, relative to {@link path}. This is the
     * contract between the two sides of the loop: the Wiki Generator writes
     * here and the Knowledge Assistant reads from here — neither knows about
     * the other. Optional in the file; always resolved here (defaulting to
     * `"wiki-generated"`) so consumers never re-default it.
     */
    readonly generatedWikiPath: string;
    /**
     * The knowledge-review area, relative to {@link path}. The End-of-Session
     * Workflow writes candidate knowledge here (under `pending/<session-id>/`)
     * and the Knowledge Review Workflow reads from here — a non-canonical area,
     * never `foundation/`/`library/`/`wiki/` (EOS-D2). Optional in the file;
     * always resolved here (defaulting to `"knowledge-review"`) so consumers
     * never re-default it. Turning it into an absolute location is the
     * composition root's job, not this contract's.
     */
    readonly reviewPath: string;
  };
}
