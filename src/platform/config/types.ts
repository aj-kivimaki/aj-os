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
  };
}
