/**
 * Git change analyzer — public surface: the read-only `GitPort` seam (+ its
 * `GitFileChange` observation type) and the `createGitChangeAnalyzer` factory that
 * translates git observations into normalized `SessionChange`s. The concrete
 * git-backed `GitPort` adapter arrives in EOS-103.
 */

export { createGitChangeAnalyzer } from "./createGitChangeAnalyzer.js";
export type { GitPort, GitFileChange } from "./GitPort.js";
