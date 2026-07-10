import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import {
  parseKnowledgeItem,
  type KnowledgeItem,
  type KnowledgeProvider,
  type KnowledgeRequest,
} from "../../context-builder/index.js";
import type { RetrievalResult } from "../../platform/retrieval/index.js";

/** Identifier the Provider Registry keys this adapter on. */
const WIKI_PROVIDER_ID = "wiki";

/**
 * Adapt already-retrieved wiki articles into a Context Builder
 * {@link KnowledgeProvider}.
 *
 * This is **product composition glue**, not a platform capability. It bridges
 * two independent platform contracts that do not know about each other: the
 * Retrieval Service's {@link RetrievalResult} (`path` + `title` + `score`) and
 * the Context Builder's {@link KnowledgeItem} (`id` + citable `source` +
 * `content`). It lives in the product layer precisely because only the product
 * composes platform capabilities.
 *
 * Retrieval has **already** chosen the articles (the milestone pipeline is
 * `Question → RetrievalResult[] → Context Builder`), so this provider does not
 * rank, filter or re-retrieve, and it ignores the {@link KnowledgeRequest}. Its
 * one job is to read each chosen article's body — the `content` the
 * `RetrievalResult` contract deliberately omits — and present it as knowledge.
 * Every article is a `wiki` source, so Assembly files them under the canonical
 * `wiki-references` section.
 */
export function createWikiKnowledgeProvider(
  results: readonly RetrievalResult[],
): KnowledgeProvider {
  return {
    id: WIKI_PROVIDER_ID,
    name: "Handbook Wiki",
    description:
      "Wiki articles retrieved for the question, supplied as citable knowledge.",
    async provide(
      _request: KnowledgeRequest,
    ): Promise<readonly KnowledgeItem[]> {
      const items: KnowledgeItem[] = [];
      for (const result of results) {
        const content = (await readFile(result.path, "utf8")).trim();
        if (content.length === 0) {
          // A KnowledgeItem must carry knowledge; an empty article contributes
          // nothing and would be rejected by the KnowledgeItem contract.
          continue;
        }
        const slug = basename(result.path).replace(/\.md$/i, "");
        items.push(
          parseKnowledgeItem({
            id: slug,
            source: { id: slug, type: "wiki", title: result.title },
            content,
          }),
        );
      }
      return items;
    },
  };
}
