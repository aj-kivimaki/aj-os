/**
 * Knowledge Platform composition root.
 *
 * The one place that assembles the Knowledge Platform from configuration into a
 * ready-to-run pipeline: connectors + store + compiler + resolver + renderer +
 * merge engine → {@link WikiGenerator}. Entry points call this and nothing else
 * knows how to build the pipeline — the `aj wiki build` CLI today, and
 * End-of-Session, CI, automations, or a UI later.
 *
 * It is deliberately the only module allowed to depend across `ingestion/`,
 * `knowledge/*`, and `platform/ai` at once — composition needs every concrete
 * piece. The pieces themselves stay reusable and unaware of one another.
 */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { AIClient } from "../../platform/ai/index.js";
import type { AjConfig } from "../../platform/config/index.js";
import { createFilesystemSourceConnector } from "../../ingestion/index.js";
import {
  createAnthropicKnowledgeCompiler,
  createLlmMergeEngine,
  type TextGenerator,
} from "../compiler/index.js";
import { createSlugIdentityResolver } from "../identity/index.js";
import { GENERATED_WIKI_ARTIFACTS } from "../naming.js";
import { createWikiRenderer } from "../renderer/index.js";
import {
  createFilesystemWikiStore,
  type WikiStore,
} from "../wiki-store/index.js";
import {
  createWikiGenerator,
  type WikiGenerator,
} from "../wiki-generator/index.js";

/**
 * The Handbook source directories the connector scans, relative to the
 * handbook root. Hardcoded until a second source actually needs configuring.
 */
const HANDBOOK_SOURCES = ["foundation", "library"] as const;

/** The connector kind that namespaces Handbook record ids. */
const HANDBOOK_KIND = "handbook";

export interface KnowledgePipelineDeps {
  /**
   * The text-generation capability shared by the compiler, resolver and merge
   * engine. Defaults to the platform {@link AIClient}; tests inject a stub so
   * the pipeline composes without any network call.
   */
  readonly generator?: TextGenerator;
  /** Clock for provenance timestamps. Defaults to the wall clock. */
  readonly now?: () => Date;
}

/**
 * The assembled Knowledge Platform: the ready-to-run generator plus the store it
 * writes to. The store is exposed so orchestration can manage the lifecycle of
 * generated outputs — notably resetting them for a `--rebuild` (see
 * {@link resetGeneratedWiki}) — without the generator engine ever deleting headless.
 */
export interface KnowledgePipeline {
  readonly generator: WikiGenerator;
  readonly store: WikiStore;
}

/**
 * Assemble the Knowledge Platform into a ready-to-run {@link KnowledgePipeline}.
 *
 * Async because it ensures the store's destination exists (`mkdir -p`): the
 * FilesystemWikiStore requires its destination to be present, and the
 * composition root owns that precondition.
 */
export async function createKnowledgePipeline(
  config: AjConfig,
  deps: KnowledgePipelineDeps = {},
): Promise<KnowledgePipeline> {
  const generator = deps.generator ?? new AIClient();
  const now = deps.now ?? (() => new Date());

  const handbookPath = config.handbook.path;
  const destination = resolve(handbookPath, config.handbook.generatedWikiPath);
  await mkdir(destination, { recursive: true });

  const store = createFilesystemWikiStore({ destination });
  const connectors = [
    createFilesystemSourceConnector({
      kind: HANDBOOK_KIND,
      baseDir: handbookPath,
      sources: [...HANDBOOK_SOURCES],
    }),
  ];

  return {
    generator: createWikiGenerator(
      {
        connectors,
        store,
        compiler: createAnthropicKnowledgeCompiler({ generator }),
        resolver: createSlugIdentityResolver(),
        renderer: createWikiRenderer(),
        mergeEngine: createLlmMergeEngine({ generator }),
      },
      now,
    ),
    store,
  };
}

/**
 * Reset the generator-owned outputs in `store` — the precondition for a true
 * `--rebuild`. Removes exactly {@link GENERATED_WIKI_ARTIFACTS} and preserves
 * everything else in the destination, because `aj wiki build` owns the
 * lifecycle of what it generates and nothing more.
 */
export async function resetGeneratedWiki(store: WikiStore): Promise<void> {
  for (const artifact of GENERATED_WIKI_ARTIFACTS) {
    await store.removeTree(artifact);
  }
}
