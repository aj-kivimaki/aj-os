/**
 * The Candidate Generator — the deterministic map from a validated
 * {@link KnowledgeExtraction} to the canonical `CandidateKnowledge[]` (the SPEC-003 →
 * SPEC-004 boundary; EOS-D1/D4).
 *
 * It is a **deterministic one-to-one structural mapping** (the frozen Candidate
 * Generation Invariant): each finding produces exactly one candidate, in order — no
 * merge, split, reorder, invent, or remove, so `candidates.length ===
 * extraction.findings.length` always. The only fields it *introduces* are identity
 * (`id`), the governance literal, and provenance; every other field is the model's
 * content, carried verbatim. It does not call the model, deduplicate against the
 * Handbook, score, persist, or approve — those are downstream or other stages.
 *
 * Non-determinism is confined to the injected clock (`now`), exactly as the Context
 * Builder / `createKnowledgePipeline` inject `now` for provenance timestamps; tests
 * pin it to a fixed instant to assert deep-equal output across runs.
 */

import { parseCandidateKnowledge } from "../contracts/candidate/index.js";
import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type {
  KnowledgeExtraction,
  KnowledgeFinding,
} from "../contracts/knowledge-extraction/index.js";
import type { Session } from "../contracts/session/index.js";

import type { CandidateGenerator } from "./CandidateGenerator.js";

/**
 * Identifies the producer that generated a candidate, recorded in
 * `provenance.generator` for audit (AJS-006 §Traceability). A stable module constant —
 * not version-coupled, so it does not churn tests.
 */
const GENERATOR_ID = "end-of-session/candidate-generator";

export interface CandidateGeneratorConfig {
  /**
   * Clock for the provenance `generatedAt` timestamp. Defaults to the wall clock (the
   * `createKnowledgePipeline` precedent); tests inject a fixed clock so generation is
   * fully deterministic.
   */
  readonly now?: () => Date;
}

/**
 * Build one canonical `CandidateKnowledge` from a single finding at position `index`.
 *
 * The mapping (see EOS-301): identity `session:<sessionId>:<n>` (`n` = 1-based
 * position); `kind` resolved authoritatively through the candidate contract (the soft
 * finding hint is validated into the closed `CandidateKind`, unknown ⇒ `handbook-entry`);
 * `title`/`body`/`rationale`/`tags`/`confidence` carried verbatim; `related` empty in
 * v1; `governanceState` the `candidate` literal; provenance assembled from the finding's
 * advisory source linkage plus the session and the injected clock. Validated and
 * deep-frozen by `parseCandidateKnowledge` — the single candidate validator (EOS-003).
 */
function toCandidate(
  finding: KnowledgeFinding,
  index: number,
  session: Session,
  generatedAt: string,
): CandidateKnowledge {
  return parseCandidateKnowledge({
    id: `session:${session.id}:${index + 1}`,
    kind: finding.kind,
    title: finding.title,
    body: finding.body,
    rationale: finding.rationale,
    provenance: {
      sessionId: session.id,
      sourceChangeIds: finding.relatedChangeIds,
      sourcePaths: finding.relatedPaths,
      commitHash: session.gitState.head,
      generatedAt,
      generator: GENERATOR_ID,
    },
    governanceState: "candidate",
    tags: finding.tags,
    related: [],
    // Carried verbatim; omitted (not sent as `undefined`) when the model gave none.
    ...(finding.confidence !== undefined
      ? { confidence: finding.confidence }
      : {}),
  });
}

/**
 * Create the Candidate Generator over an injected clock.
 *
 * The returned handle is frozen (the module's factory convention). `generate` is a
 * pure, synchronous transform — no I/O, no model call, no persistence.
 *
 * @example
 * const generator = createCandidateGenerator({ now: () => fixedDate });
 * const candidates = generator.generate(extraction, session);
 */
export function createCandidateGenerator(
  config: CandidateGeneratorConfig = {},
): CandidateGenerator {
  const now = config.now ?? (() => new Date());

  function generate(
    extraction: KnowledgeExtraction,
    session: Session,
  ): CandidateKnowledge[] {
    // Fail fast on inconsistent inputs: the extraction and the session must describe
    // the same run, or the provenance would be silently wrong. This is an
    // orchestration error (M5 wires the same session through both stages), not model
    // output, so it throws rather than degrading.
    if (extraction.sessionId !== session.id) {
      throw new Error(
        `createCandidateGenerator: extraction.sessionId (${extraction.sessionId}) ` +
          `does not match session.id (${session.id}).`,
      );
    }

    // One timestamp for the whole run: all candidates from one generation share it.
    const generatedAt = now().toISOString();

    // One-to-one, order-preserving: candidate n derives solely from finding n. The
    // array is frozen so the canonical output is immutable as a whole, not only per
    // element — consistent with the module's deep-freeze convention for its outputs.
    return Object.freeze(
      extraction.findings.map((finding, index) =>
        toCandidate(finding, index, session, generatedAt),
      ),
    ) as CandidateKnowledge[];
  }

  return Object.freeze({ generate });
}
