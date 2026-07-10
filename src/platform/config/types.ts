/**
 * The typed shape of `aj.config.json`.
 *
 * Only the `handbook.path` property is supported for now. Future
 * configuration options are added by the milestone that needs them, not
 * ahead of time.
 */
export interface AjConfig {
  readonly handbook: {
    /** Path to the handbook, as written in the configuration file. */
    readonly path: string;
  };
}
