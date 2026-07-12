/**
 * Wiki Renderer stage — ADR-005.
 */
export type { WikiRenderer, ResolvedIdentity } from "./WikiRenderer.js";
export {
  createWikiRenderer,
  renderPages,
  buildSlugIdentities,
} from "./createWikiRenderer.js";
