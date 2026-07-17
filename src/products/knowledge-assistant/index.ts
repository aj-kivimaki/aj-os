// Public surface of the Knowledge Assistant product. Explicit named re-exports,
// not a wildcard: the barrel names exactly what consumers may import (REX-302, F-037).
export type { AskOptions, KnowledgeAssistantDeps } from "./KnowledgeAssistant.js";
export { KnowledgeAssistant } from "./KnowledgeAssistant.js";
