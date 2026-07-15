/**
 * Collection stage — public surface: the analyzer-agnostic execution function
 * `collectChanges`, which runs a registry's analyzers against a `Session` and
 * assembles an immutable `ChangeSet` under the partial-collection model.
 */

export { collectChanges } from "./collectChanges.js";
