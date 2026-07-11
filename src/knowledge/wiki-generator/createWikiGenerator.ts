/**
 * Wiki Generator — SPEC-005, minimal vertical slice (Step 3).
 *
 * This milestone proves the architecture end-to-end with the smallest
 * working pipeline: compose connectors + store, detect added/changed
 * sources via generator state, INGEST them into wiki pages, persist state,
 * and return a {@link GenerationReport}.
 *
 * Intentionally NOT yet implemented (later slices): RECONCILE of removed
 * sources, the reverse (provenance) index, cross-references, and LINT.
 *
 * Generator-owned state lives under a hidden metadata directory
 * (`.generator/`) inside the destination — separated from the user-facing
 * wiki, invisible to `WikiStore.list()` (which skips dot-dirs), yet still
 * inside the Wiki Store abstraction. `state.json` starts by holding source
 * hashes for change detection and has room to grow (generator/schema
 * versioning, migrations, caches).
 *
 * Boundaries kept (SPEC-005 / ADR-002): the generator never performs git
 * and never deletes pages; it only reads/writes through the store.
 */
import type { SourceRecord } from "../../ingestion/index.js";
import type { WikiStore } from "../wiki-store/index.js";
import type {
  GenerationMode,
  GenerationReport,
  LintReport,
  RunOptions,
  WikiGenerator,
  WikiGeneratorConfig,
} from "./WikiGenerator.js";

const METADATA_DIR = ".generator";
const STATE_PATH = `${METADATA_DIR}/state.json`;
const STATE_VERSION = 1;
const SOURCES_PREFIX = "sources";

/** Raised on generator misconfiguration or corrupt state. */
export class WikiGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WikiGeneratorError";
  }
}

interface SourceState {
  readonly hash: string;
  readonly page: string;
}

interface GeneratorState {
  version: number;
  sources: Record<string, SourceState>;
  updatedAt?: string;
}

function emptyState(): GeneratorState {
  return { version: STATE_VERSION, sources: {} };
}

/** Strip the `<kind>:` namespace to recover the source-relative path. */
function relativePathFromId(id: string): string {
  const idx = id.indexOf(":");
  return idx === -1 ? id : id.slice(idx + 1);
}

/** Deterministic page location: mirror the source path under `sources/`. */
function pagePathFor(record: SourceRecord): string {
  return `${SOURCES_PREFIX}/${relativePathFromId(record.id)}`;
}

/**
 * Minimal deterministic INGEST transform: one source → one page carrying
 * provenance frontmatter plus the source content. The LLM compilation that
 * will replace this transform slots in behind the same step.
 */
function renderSourcePage(record: SourceRecord, generatedAt: string): string {
  return [
    "---",
    "type: source",
    "sources:",
    `  - ${record.id}`,
    `hash: ${record.hash}`,
    `generated_at: ${generatedAt}`,
    "---",
    "",
    record.content,
  ].join("\n");
}

export function createWikiGenerator(
  config: WikiGeneratorConfig,
  now: () => Date = () => new Date(),
): WikiGenerator {
  const { connectors, store } = config;

  async function loadState(): Promise<GeneratorState> {
    const raw = await store.read(STATE_PATH);
    if (raw === null) {
      return emptyState();
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new WikiGeneratorError(`Corrupt generator state at ${STATE_PATH}.`);
    }
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as GeneratorState).sources !== "object"
    ) {
      throw new WikiGeneratorError(`Corrupt generator state at ${STATE_PATH}.`);
    }
    const state = parsed as GeneratorState;
    return { version: state.version ?? STATE_VERSION, sources: state.sources };
  }

  /** Pull and merge records from every connector; ids must be unique. */
  async function collectRecords(): Promise<SourceRecord[]> {
    const byId = new Map<string, SourceRecord>();
    for (const connector of connectors) {
      for (const record of await connector.list()) {
        if (byId.has(record.id)) {
          throw new WikiGeneratorError(
            `Duplicate source id across connectors: ${record.id}`,
          );
        }
        byId.set(record.id, record);
      }
    }
    return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  async function run(options?: RunOptions): Promise<GenerationReport> {
    const mode: GenerationMode = options?.mode ?? "incremental";
    const generatedAt = now().toISOString();

    const previous = mode === "rebuild" ? emptyState() : await loadState();
    const records = await collectRecords();

    const ingested: string[] = [];
    const updatedPages: string[] = [];
    const nextSources: Record<string, SourceState> = { ...previous.sources };

    for (const record of records) {
      const prior = previous.sources[record.id];
      const changed = prior === undefined || prior.hash !== record.hash;
      if (!changed) {
        continue;
      }
      const page = pagePathFor(record);
      await store.write(page, renderSourcePage(record, generatedAt));
      ingested.push(record.id);
      updatedPages.push(page);
      nextSources[record.id] = { hash: record.hash, page };
    }

    const nextState: GeneratorState = {
      version: STATE_VERSION,
      sources: nextSources,
      updatedAt: generatedAt,
    };
    await store.write(STATE_PATH, `${JSON.stringify(nextState, null, 2)}\n`);

    const logEntry =
      `${generatedAt} generator=v${STATE_VERSION} mode=${mode} ` +
      `ingested=${ingested.length} pages=${updatedPages.length}`;
    await store.appendLog(logEntry);

    return {
      mode,
      ingested,
      reconciled: [],
      updatedPages,
      stalePages: [],
      removalProposals: [],
      lint: { findings: [] },
      logEntry,
    };
  }

  async function lint(): Promise<LintReport> {
    // LINT is deferred to a later slice; no findings yet.
    return { findings: [] };
  }

  return { run, lint };
}
