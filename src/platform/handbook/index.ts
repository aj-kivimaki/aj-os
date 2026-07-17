// Public surface of the handbook platform capability. Explicit named re-exports,
// not a wildcard (REX-302, F-037). `HandbookInfo` is the return type of the public
// `HandbookService.locateWiki()`, so it is part of the contract even though no
// consumer imports it by name today — kept deliberately, not dropped.
export type { HandbookInfo } from "./types.js";
export { HandbookService, HandbookError } from "./HandbookService.js";
