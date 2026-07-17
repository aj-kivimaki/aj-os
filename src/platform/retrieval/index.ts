// Public surface of the retrieval platform capability. Explicit named re-exports,
// not a wildcard: the barrel names exactly what consumers may import (REX-302, F-037).
export type { RetrievalResult } from "./types.js";
export { RetrievalService } from "./RetrievalService.js";
