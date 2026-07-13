/**
 * Wiki Generator — the single INGEST pipeline (SPEC-005 §22).
 *
 * The generator orchestrates; it owns no knowledge and no persistence
 * mechanics of its own. It composes:
 *   - KnowledgeCompiler — compiles a source into pages (extraction + render);
 *   - MergeEngine       — folds a new contribution into an existing page;
 *   - WikiStore         — persists pages.
 *
 * Per changed source it compiles the source and, for each produced page,
 * decides by identity (slug = page path) and provenance:
 *   - page absent            → CREATE it;
 *   - source not yet on page → MERGE the new contribution (ADR-004);
 *   - page is this source's alone → RE-DERIVE it (a plain refresh);
 *   - shared page, this source modified → mark STALE (source-modified),
 *     never re-merge (no double-counting; ADR-003).
 * Removed sources are RECONCILEd via the reverse index: fully-orphaned pages
 * become stale + a removal proposal; partial orphans stay stale-but-kept.
 *
 * Generator-owned state lives under `.generator/` and is pure bookkeeping —
 * a reverse index (`source → [pages]`) and a per-page generated-region hash
 * (for future in-region drift detection) — never knowledge (ADR-004).
 */
import { createHash } from "node:crypto";

import type { SourceRecord } from "../../ingestion/index.js";
import {
  carryLearnedMetadata,
  parsePage,
  readFrontmatter,
} from "../compiler/index.js";
import type { CompiledPage, SourceExtraction } from "../compiler/index.js";
import type {
  Candidate,
  ExistingPage,
} from "../identity/index.js";
import { pagePathFor } from "../naming.js";
import type { ResolvedIdentity } from "../renderer/index.js";
import type {
  GenerationMode,
  GenerationReport,
  LintReport,
  RemovalProposal,
  RunOptions,
  WikiGenerator,
  WikiGeneratorConfig,
} from "./WikiGenerator.js";

const METADATA_DIR = ".generator";
const STATE_PATH = `${METADATA_DIR}/state.json`;
const STATE_VERSION = 2;
/** The corpus catalog RetrievalService reads (SPEC-007 §consumer contract). */
const INDEX_PATH = "index.md";
const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;
const STALE_KEY_RE = /^(status|stale_reason|stale_since):/;

/** Raised on generator misconfiguration or corrupt state. */
export class WikiGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WikiGeneratorError";
  }
}

interface SourceState {
  readonly hash: string;
  /** Reverse index: every page this source contributed to. */
  readonly pages: string[];
}

interface PageState {
  /** Hash of the page's generator-owned region (drift detection). */
  readonly hash: string;
}

interface GeneratorState {
  version: number;
  sources: Record<string, SourceState>;
  pages: Record<string, PageState>;
  updatedAt?: string;
}

/** Mutable accumulators threaded through one run. */
interface RunContext {
  readonly generatedAt: string;
  readonly currentIds: ReadonlySet<string>;
  readonly previous: GeneratorState;
  readonly nextSources: Record<string, SourceState>;
  readonly nextPages: Record<string, PageState>;
  readonly ingested: string[];
  readonly failed: string[];
  readonly reconciled: string[];
  readonly updated: Set<string>;
  readonly stale: Set<string>;
  readonly merged: Set<string>;
  readonly removalProposals: RemovalProposal[];
}

function emptyState(): GeneratorState {
  return { version: STATE_VERSION, sources: {}, pages: {} };
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

/** Hash of the generator-owned body — the drift-detection signal (ADR-002). */
function generatedHash(content: string): string {
  return createHash("sha256")
    .update(parsePage(content).body, "utf8")
    .digest("hex");
}

/** A page's contributing source ids, read from its frontmatter. */
function provenanceOf(content: string): string[] {
  return [...readFrontmatter(parsePage(content).frontmatter).sources];
}

/** Bare filename slug of a page path: `entities/acme-corp.md` → `acme-corp`. */
function bareSlug(pagePath: string): string {
  return pagePath.slice(pagePath.lastIndexOf("/") + 1).replace(/\.md$/, "");
}

/**
 * Build the corpus catalog `index.md` — a simple list of wiki-links grouped by
 * sources, entities and concepts. This is the catalog the consumer contract
 * (RetrievalService) expects the generator to maintain. Entities and concepts
 * are linked by bare slug — the form retrieval resolves — while sources are
 * linked by their wiki-relative path, since they nest under `sources/`.
 */
function buildIndex(
  sources: readonly string[],
  entities: readonly string[],
  concepts: readonly string[],
): string {
  const lines: string[] = [
    "# Index",
    "",
    "Generated catalog of the wiki. Rebuilt on every generation cycle.",
  ];
  const section = (title: string, items: readonly string[]): void => {
    if (items.length > 0) {
      lines.push("", `## ${title}`, ...items);
    }
  };
  section("Sources", sources.map((p) => `- [[${p.replace(/\.md$/, "")}]]`));
  section("Entities", entities.map((p) => `- [[${bareSlug(p)}]]`));
  section("Concepts", concepts.map((p) => `- [[${bareSlug(p)}]]`));
  lines.push("");
  return lines.join("\n");
}

/** Inject stale lifecycle fields into a page's frontmatter (ADR-003). */
function markPageStale(content: string, reason: string, since: string): string {
  const match = FRONTMATTER_RE.exec(content);
  if (match === null) {
    throw new WikiGeneratorError(
      "Cannot mark a page without frontmatter as stale.",
    );
  }
  const whole = match[0] ?? "";
  const block = match[1] ?? "";
  const body = content.slice(whole.length);
  const frontmatter = [
    ...block.split("\n").filter((line) => !STALE_KEY_RE.test(line)),
    "status: stale",
    `stale_reason: ${reason}`,
    `stale_since: ${since}`,
  ].join("\n");
  return `---\n${frontmatter}\n---\n${body}`;
}

async function noLint(): Promise<LintReport> {
  return { findings: [] };
}

export function createWikiGenerator(
  config: WikiGeneratorConfig,
  now: () => Date = () => new Date(),
): WikiGenerator {
  const { connectors, store, compiler, resolver, renderer, mergeEngine } =
    config;

  /** Snapshot of existing entity/concept pages for the resolver (live per run). */
  async function buildCatalog(): Promise<ExistingPage[]> {
    const paths = [
      ...(await store.list("entities")),
      ...(await store.list("concepts")),
    ];
    const catalog: ExistingPage[] = [];
    for (const path of paths) {
      const content = await store.read(path);
      if (content === null) {
        continue;
      }
      const parsed = parsePage(content);
      const fm = readFrontmatter(parsed.frontmatter);
      catalog.push({
        path,
        kind: path.startsWith("entities/") ? "entity" : "concept",
        title: fm.fields.title ?? "",
        description: parsed.body,
        aliases: [...fm.aliases],
      });
    }
    return catalog;
  }

  /** Resolve one source's candidates to canonical identities. */
  async function resolveIdentities(
    extraction: SourceExtraction,
    existing: readonly ExistingPage[],
  ): Promise<Map<string, ResolvedIdentity>> {
    const candidates: Candidate[] = [
      ...extraction.entities.map((e) => ({
        name: e.name,
        kind: "entity" as const,
        description: e.description,
      })),
      ...extraction.concepts.map((c) => ({
        name: c.name,
        kind: "concept" as const,
        description: c.description,
      })),
    ];
    const identities = new Map<string, ResolvedIdentity>();
    for (const candidate of candidates) {
      if (identities.has(candidate.name)) {
        continue;
      }
      const resolution = await resolver.resolve(candidate, existing);
      // `unsure` is treated as `new` here (a new page), but the resolver
      // still records the distinction for future review workflows (ADR-005).
      const path =
        resolution.kind === "existing"
          ? resolution.targetPath
          : pagePathFor(candidate.kind, candidate.name);
      identities.set(candidate.name, {
        path,
        title: candidate.name,
        kind: candidate.kind,
        isNew: resolution.kind !== "existing",
      });
    }
    return identities;
  }

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
      (parsed as GeneratorState).version !== STATE_VERSION
    ) {
      throw new WikiGeneratorError(
        `Incompatible generator state at ${STATE_PATH} (expected v${STATE_VERSION}); run a rebuild.`,
      );
    }
    const state = parsed as GeneratorState;
    return {
      version: STATE_VERSION,
      sources: state.sources ?? {},
      pages: state.pages ?? {},
    };
  }

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

  async function writePage(
    ctx: RunContext,
    path: string,
    content: string,
  ): Promise<void> {
    ctx.nextPages[path] = { hash: generatedHash(content) };
    await store.write(path, content);
  }

  /** Apply one compiled page for `record` (CREATE / MERGE / RE-DERIVE / STALE). */
  async function ingestPage(
    ctx: RunContext,
    record: SourceRecord,
    page: CompiledPage,
  ): Promise<void> {
    const existing = await store.read(page.path);
    if (existing === null) {
      await writePage(ctx, page.path, page.content); // CREATE
      ctx.updated.add(page.path);
      return;
    }
    const prov = provenanceOf(existing);
    if (!prov.includes(record.id)) {
      const outcome = await mergeEngine.merge(existing, page); // MERGE
      if (outcome.mode === "deferred" || outcome.content === undefined) {
        return; // cannot merge safely; leave existing untouched
      }
      await writePage(ctx, page.path, outcome.content);
      ctx.updated.add(page.path);
      ctx.merged.add(page.path);
    } else if (prov.length === 1) {
      // RE-DERIVE own page; carry learned metadata (aliases) forward.
      await writePage(ctx, page.path, carryLearnedMetadata(existing, page.content));
      ctx.updated.add(page.path);
    } else {
      // Shared page this source already backs, now modified → stale, never
      // re-merge (avoids double-counting; ADR-003).
      await writePage(
        ctx,
        page.path,
        markPageStale(existing, "source-modified", ctx.generatedAt),
      );
      ctx.stale.add(page.path);
    }
  }

  async function ingestRecord(
    ctx: RunContext,
    record: SourceRecord,
  ): Promise<void> {
    // extract → resolve → render (ADR-005).
    const extracted = await compiler.compile(record);
    const catalog = await buildCatalog();
    const identities = await resolveIdentities(extracted.extraction, catalog);
    const rendered = renderer.render(extracted, identities, ctx.generatedAt);

    const pages = [...rendered].sort((a, b) => a.path.localeCompare(b.path));
    for (const page of pages) {
      await ingestPage(ctx, record, page);
    }
    ctx.ingested.push(record.id);
    ctx.nextSources[record.id] = {
      hash: record.hash,
      pages: sorted(new Set(pages.map((p) => p.path))),
    };
  }

  /** RECONCILE the pages a removed source contributed to (ADR-003). */
  async function reconcileRemoved(ctx: RunContext, id: string): Promise<void> {
    ctx.reconciled.push(id);
    const entry = ctx.previous.sources[id];
    if (entry === undefined) {
      return;
    }
    for (const path of entry.pages) {
      const existing = await store.read(path);
      if (existing === null) {
        continue;
      }
      const prov = provenanceOf(existing);
      const live = prov.filter((s) => ctx.currentIds.has(s));
      if (live.length === 0) {
        await writePage(
          ctx,
          path,
          markPageStale(existing, "orphaned", ctx.generatedAt),
        );
        ctx.stale.add(path);
        ctx.removalProposals.push({
          path,
          reason: "All contributing sources were removed.",
          orphanedSources: prov.filter((s) => !ctx.currentIds.has(s)),
        });
      } else {
        await writePage(
          ctx,
          path,
          markPageStale(existing, "partial-orphan", ctx.generatedAt),
        );
        ctx.stale.add(path);
      }
    }
    delete ctx.nextSources[id];
  }

  /** Regenerate the corpus catalog (`index.md`) from the store's pages. */
  async function writeIndex(): Promise<void> {
    const [sources, entities, concepts] = await Promise.all([
      store.list("sources"),
      store.list("entities"),
      store.list("concepts"),
    ]);
    await store.write(INDEX_PATH, buildIndex(sources, entities, concepts));
  }

  async function run(options?: RunOptions): Promise<GenerationReport> {
    const mode: GenerationMode = options?.mode ?? "incremental";
    const previous = mode === "rebuild" ? emptyState() : await loadState();
    const records = await collectRecords();

    const ctx: RunContext = {
      generatedAt: now().toISOString(),
      currentIds: new Set(records.map((r) => r.id)),
      previous,
      nextSources: { ...previous.sources },
      nextPages: { ...previous.pages },
      ingested: [],
      failed: [],
      reconciled: [],
      updated: new Set<string>(),
      stale: new Set<string>(),
      merged: new Set<string>(),
      removalProposals: [],
    };

    for (const record of records) {
      if (previous.sources[record.id]?.hash === record.hash) {
        continue; // unchanged
      }
      try {
        await ingestRecord(ctx, record);
      } catch (error) {
        // A single source's failure must not abort the batch (SPEC-005 §14).
        ctx.failed.push(record.id);
        const message = error instanceof Error ? error.message : String(error);
        await store.appendLog(
          `${ctx.generatedAt} INGEST-FAILED ${record.id}: ${message}`,
        );
      }
    }

    for (const id of sorted(
      Object.keys(previous.sources).filter((id) => !ctx.currentIds.has(id)),
    )) {
      await reconcileRemoved(ctx, id);
    }

    // Regenerate the corpus catalog the consumer (RetrievalService) reads. It
    // is a derived projection of the current pages, not knowledge, so it is
    // rewritten every run and kept out of the page/provenance state.
    await writeIndex();

    const nextState: GeneratorState = {
      version: STATE_VERSION,
      sources: ctx.nextSources,
      pages: ctx.nextPages,
      updatedAt: ctx.generatedAt,
    };
    await store.write(STATE_PATH, `${JSON.stringify(nextState, null, 2)}\n`);

    const updatedPages = sorted(ctx.updated);
    const stalePages = sorted(ctx.stale);
    const logEntry =
      `${ctx.generatedAt} generator=v${STATE_VERSION} mode=${mode} ` +
      `ingested=${ctx.ingested.length} failed=${ctx.failed.length} ` +
      `pages=${updatedPages.length} merged=${ctx.merged.size} ` +
      `reconciled=${ctx.reconciled.length} stale=${stalePages.length} ` +
      `proposals=${ctx.removalProposals.length}`;
    await store.appendLog(logEntry);

    return {
      mode,
      ingested: ctx.ingested,
      failed: ctx.failed,
      reconciled: ctx.reconciled,
      updatedPages,
      stalePages,
      removalProposals: ctx.removalProposals,
      lint: { findings: [] },
      logEntry,
    };
  }

  return { run, lint: noLint };
}
