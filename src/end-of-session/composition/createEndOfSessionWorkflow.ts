/**
 * End-of-Session Workflow composition root.
 *
 * The one place that assembles the workflow from configuration into a ready-to-run
 * pipeline: git port + analyzer registry + session factory + extractor + candidate
 * generator + review store + projector + notifier → {@link EndOfSessionWorkflow}, plus the
 * trigger that produces its input. Entry points call this and nothing else knows how to
 * build the workflow — the `aj session end` CLI today; a git hook, scheduled run, or n8n
 * automation later.
 *
 * It is deliberately the only module allowed to depend on every concrete piece at once —
 * composition needs them all. The pieces themselves stay reusable and unaware of one
 * another. (The direct analog of `createKnowledgePipeline`.)
 *
 * **It constructs; it does not orchestrate.** No stage is invoked here except the store's
 * `locate()` precondition, and no policy, stage logic, or filesystem work happens beyond
 * what the approved adapters need in order to exist: resolving the destination and ensuring
 * it is there. Sequencing is `run`'s job (EOS-406); every decision is a stage's.
 */

import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { AIClient } from "../../platform/ai/index.js";
import type { AjConfig } from "../../platform/config/index.js";

import { createGitChangeAnalyzer, createGitPort } from "../analyzers/git/index.js";
import { createCandidateGenerator } from "../generation/index.js";
import { createKnowledgeExtractor } from "../extraction/index.js";
import { createNoopNotificationPort } from "../notification/index.js";
import { createAnalyzerRegistry } from "../registry/index.js";
import { createReviewPackageProjector } from "../projection/index.js";
import { createSessionFactory } from "../session/index.js";
import { createFilesystemReviewStore } from "../store/index.js";
import { createManualTriggerSource } from "../trigger/index.js";
import { createSessionWorkflow } from "../workflow/index.js";
import type { GitPort } from "../analyzers/git/index.js";
import type { TextGenerator } from "../extraction/index.js";
import type { ReviewStore } from "../store/index.js";
import type { TriggerSource } from "../trigger/index.js";
import type { EndOfSessionWorkflow } from "../workflow/index.js";

/**
 * `SessionContext.branch` when HEAD is detached.
 *
 * Not the Session's answer, and deliberately so. The **Branch Policy** (EOS-402) belongs to
 * the Session factory, which synthesizes `detached@<short-head>` for the *observed*
 * `Session.branch` that provenance and the review package actually use. This is the
 * *request's* field — required by the contract, and consumed by nothing in v1 (EOS-402
 * found the whole `SessionContext` inert). Rather than reimplement the factory's policy for
 * a field nobody reads, the request states plainly that there was no branch.
 */
const NO_BRANCH = "detached";

export interface EndOfSessionWorkflowDeps {
  /**
   * The text-generation capability behind the extraction seam. Defaults to the platform
   * {@link AIClient}; tests inject a stub so the workflow composes without a network call.
   */
  readonly generator?: TextGenerator;
  /** Clock for the run window, provenance, and the projection. Defaults to the wall clock. */
  readonly now?: () => Date;
  /**
   * The repository whose session ended. Defaults to the working directory — `aj session
   * end` runs inside the repo — and is injectable so tests point it at a fixture.
   * Repository *discovery* is composition's concern, never the adapter's (EOS-103).
   */
  readonly repositoryPath?: string;
  /** The CLI's `--since <ref>`: the session covers `<ref>..HEAD` instead of the working tree. */
  readonly since?: string;
  /** The CLI's `--notes <text>`: the engineer's account of the session (EOS-D10). */
  readonly sessionNotes?: string;
}

/**
 * The assembled workflow, plus the two handles an entry point needs.
 *
 * `trigger` is exposed (EOS-D9) so the CLI can obtain its `SessionContext` without touching
 * git or knowing how a session is identified; `store` is exposed so orchestration can
 * locate the review area — the `KnowledgePipeline` precedent, which exposes its store for
 * the same reason.
 */
export interface EndOfSessionPipeline {
  readonly workflow: EndOfSessionWorkflow;
  readonly store: ReviewStore;
  readonly trigger: TriggerSource;
}

/**
 * The manual trigger's raw input — the fields of `SessionContext` this root resolves.
 *
 * Named rather than `Record<string, unknown>` so a mistyped key fails at the point it is
 * written, instead of surviving to a `ZodError` when `createContext()` validates it.
 */
interface SessionRequest {
  readonly project: string;
  readonly repository: string;
  readonly branch: string;
  readonly sessionNotes?: string;
}

/**
 * Build the manual trigger's raw input.
 *
 * Resolves what the request needs and the CLI must not (EOS-D9): `branch` through the same
 * read-only git seam every other observation uses, `repository`/`project` from the injected
 * repository path. The value is still *unvalidated* — `createManualTriggerSource` turns it
 * into an immutable `SessionContext` when the context is produced.
 */
async function sessionRequest(
  gitPort: GitPort,
  repositoryPath: string,
  sessionNotes: string | undefined,
): Promise<SessionRequest> {
  const branch = await gitPort.branch();

  return {
    project: basename(repositoryPath),
    repository: repositoryPath,
    branch: branch ?? NO_BRANCH,
    ...(sessionNotes !== undefined ? { sessionNotes } : {}),
  };
}

/**
 * Assemble the End-of-Session Workflow into a ready-to-run {@link EndOfSessionPipeline}.
 *
 * Async because it owns two construction preconditions: the guarded review store requires
 * its destination to exist (`mkdir -p` — exactly `createKnowledgePipeline`'s flow), and the
 * trigger's request needs the branch read. `locate()` then fails fast, so a `reviewPath`
 * mis-set at canonical knowledge is refused before any git or model work happens.
 *
 * @example
 * const { workflow, trigger } = await createEndOfSessionWorkflow(config, { since: "main" });
 * const report = await workflow.run(await trigger.createContext());
 */
export async function createEndOfSessionWorkflow(
  config: AjConfig,
  deps: EndOfSessionWorkflowDeps = {},
): Promise<EndOfSessionPipeline> {
  const generator = deps.generator ?? new AIClient();
  const now = deps.now ?? (() => new Date());
  const repositoryPath = deps.repositoryPath ?? process.cwd();

  // The store writes to `<destination>/pending/<session-id>/`; the root resolves only the
  // destination and leaves every path beneath it to the store (EOS-D6/EOS-D8).
  const destination = resolve(config.handbook.path, config.handbook.reviewPath);
  await mkdir(destination, { recursive: true });

  const store = createFilesystemReviewStore({ destination });
  // Fail fast: validates the destination exists, is a directory, and is non-canonical
  // (EOS-302 names this root as `locate`'s caller). A mis-set `reviewPath` is refused here
  // rather than after a model call has already been paid for.
  await store.locate();

  const gitPort = createGitPort(repositoryPath);
  const trigger = createManualTriggerSource(
    await sessionRequest(gitPort, repositoryPath, deps.sessionNotes),
  );

  const workflow = createSessionWorkflow({
    sessionFactory: createSessionFactory({ gitPort, now }),
    // v1 registers exactly one analyzer. A second is an edit *here* and nowhere else —
    // that is what the registry seam is for.
    registry: createAnalyzerRegistry([createGitChangeAnalyzer(gitPort)]),
    extractor: createKnowledgeExtractor({ generator }),
    candidateGenerator: createCandidateGenerator({ now }),
    store,
    projector: createReviewPackageProjector(),
    notifier: createNoopNotificationPort(),
    // The workflow owns the trigger's *kind* but never invokes a trigger (EOS-D9).
    trigger: trigger.trigger,
    ...(deps.since !== undefined ? { since: deps.since } : {}),
    now,
  });

  return Object.freeze({ workflow, store, trigger });
}
