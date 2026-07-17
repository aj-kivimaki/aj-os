/**
 * The Review Package projector — canonical candidates + session → human-readable
 * markdown (EOS-D4).
 *
 * Pure and deterministic by construction: it holds no dependency, reads no clock, and
 * touches no filesystem. Every value it renders comes from the candidates or the
 * session, so the package is regenerable from the review store alone — the property
 * that lets the markdown stay a *view* rather than a second source of truth.
 *
 * Rendering choices here are presentation, not contract: nothing parses this markdown,
 * and nothing may start. The layout may change freely; what may not change is that
 * every candidate appears, in canonical order, traceable to the changes it came from.
 */

import { parseReviewPackage } from "../contracts/review-package/index.js";
import type { CandidateKnowledge } from "../contracts/candidate/index.js";
import type { ReviewPackage } from "../contracts/review-package/index.js";
import type { Session } from "../contracts/session/index.js";

import type { ReviewPackageProjector } from "./ReviewPackageProjector.js";

/** Length of the abbreviated commit shown in the session context line. */
const SHORT_HEAD_LENGTH = 7;

/**
 * Human-readable labels for the candidate kinds. The contract's kebab-case values are
 * a machine vocabulary shared with SPEC-004; this is the human's copy of it. A kind
 * absent from this map cannot occur — `kind` is a closed enum by the time it reaches
 * a candidate — but the lookup falls back to the raw value rather than rendering
 * `undefined` if the domain ever grows ahead of this map.
 */
const KIND_LABELS: Readonly<Record<string, string>> = Object.freeze({
  "handbook-entry": "Handbook entry",
  playbook: "Playbook",
  "wiki-publication": "Wiki publication",
  "lesson-learned": "Lesson learned",
  "doc-update": "Doc update",
  "automation-idea": "Automation idea",
});

function labelFor(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}

/**
 * Flatten a value onto one line for rendering inside a heading.
 *
 * `title` is model output and the contract permits any non-empty string, newlines
 * included; a raw newline would split the `###` heading and spill the rest of the
 * title into the body as stray prose. Collapsing whitespace is presentation, not
 * interpretation — the title is not altered anywhere it is *stored*, only where a
 * heading structurally cannot hold it. The canonical candidate keeps the original.
 */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Count the candidates of each kind, in the canonical order they first appear. Used
 * for the synopsis, so it reflects what the reviewer is about to read rather than an
 * alphabetical abstraction of it.
 */
function countByKind(
  candidates: readonly CandidateKnowledge[],
): readonly (readonly [string, number])[] {
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    counts.set(candidate.kind, (counts.get(candidate.kind) ?? 0) + 1);
  }
  return [...counts.entries()];
}

/**
 * The at-a-glance synopsis, derived from the candidates and the session **only**.
 *
 * The model's own prose summary would read better and is deliberately not used: it
 * lives on the `KnowledgeExtraction`, which is never persisted, so a package
 * regenerated from the review store could not reproduce it (EOS-D4). A structural
 * synopsis is duller and always true.
 */
function summaryFor(candidates: readonly CandidateKnowledge[], session: Session): string {
  if (candidates.length === 0) {
    return `No candidate knowledge was proposed from this session on ${session.branch}.`;
  }

  const noun = candidates.length === 1 ? "candidate" : "candidates";
  const breakdown = countByKind(candidates)
    .map(([kind, count]) => `${count} ${labelFor(kind).toLowerCase()}`)
    .join(", ");

  return `${candidates.length} ${noun} proposed from this session on ${session.branch} (${breakdown}).`;
}

/** Render a bullet list, or a single "none" line when there is nothing to list. */
function bulletsOr(items: readonly string[], fallback: string): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

/**
 * Render one candidate as a reviewable section.
 *
 * Provenance is rendered alongside the claim on purpose: the review gate exists to
 * judge whether a proposal is worth keeping, and that judgement needs the diff it came
 * from (AJS-006 §Traceability). Every field shown is the candidate's own.
 */
function renderCandidate(candidate: CandidateKnowledge, position: number): string {
  const lines = [
    `### ${position}. ${oneLine(candidate.title)}`,
    "",
    `- **Kind:** ${labelFor(candidate.kind)}`,
    `- **Candidate id:** \`${candidate.id}\``,
  ];

  if (candidate.tags.length > 0) {
    lines.push(`- **Tags:** ${candidate.tags.join(", ")}`);
  }
  if (candidate.confidence !== undefined) {
    lines.push(`- **Model confidence:** ${candidate.confidence}`);
  }

  lines.push(
    "",
    "**Why it is reusable**",
    "",
    candidate.rationale,
    "",
    "**Proposed knowledge**",
    "",
    candidate.body,
    "",
    "**Traces back to**",
    "",
    bulletsOr(
      [...candidate.provenance.sourcePaths],
      "no specific path — derived from the session as a whole",
    ),
  );

  return lines.join("\n");
}

/** The session context line — what was reviewed, and where it came from. */
function renderSessionContext(session: Session, generatedAt: string): string {
  const head = session.gitState.head.slice(0, SHORT_HEAD_LENGTH);
  const tree = session.gitState.dirty ? "dirty" : "clean";

  return [
    `- **Session:** \`${session.id}\``,
    `- **Branch:** ${session.branch}`,
    `- **Commit:** \`${head}\` (working tree ${tree})`,
    `- **Range analyzed:** \`${session.gitState.range}\``,
    `- **Trigger:** ${session.trigger}`,
    `- **Generated:** ${generatedAt}`,
  ].join("\n");
}

/**
 * Render the package body.
 *
 * Takes the `summary` rather than deriving its own, so the package's `summary` field
 * and the synopsis the reviewer reads are the same sentence by construction and
 * cannot drift apart.
 *
 * The empty case is a real review, not an error: a session that surfaced no reusable
 * knowledge is a successful capture of nothing, and the reviewer deserves to be told
 * so plainly. `markdown` is `.min(1)` in the contract, so this always returns prose.
 */
function renderMarkdown(
  candidates: readonly CandidateKnowledge[],
  session: Session,
  generatedAt: string,
  summary: string,
): string {
  const sections = [
    "# Session review package",
    "",
    renderSessionContext(session, generatedAt),
    "",
    summary,
  ];

  if (candidates.length === 0) {
    sections.push("", "Nothing is proposed for review. No action is needed.");
  } else {
    sections.push(
      "",
      "## Candidates",
      "",
      "Each candidate below is *proposed*, never approved — automation proposes, humans",
      "approve (AJS-006). Reviewing them is SPEC-004's Knowledge Review Workflow.",
      "",
      candidates
        .map((candidate, index) => renderCandidate(candidate, index + 1))
        .join("\n\n"),
    );
  }

  // Terminated with a newline: the store persists `markdown` byte-for-byte (it must not
  // edit the projection), so if this file is to end the way a text file should, the
  // projector is the stage that has to say so.
  return `${sections.join("\n")}\n`;
}

/**
 * Create the Review Package projector.
 *
 * Takes no dependencies, yet is a factory — unlike `buildSessionReport` (EOS-405),
 * which is dependency-free and therefore a plain function. The difference is not the
 * dependencies but the **seam**: the projector is *injected into* orchestration as a
 * replaceable stage, because EOS-D4 anticipates further projections of the same
 * canonical candidates (a review UI, another format), and a handle is what makes that
 * substitution possible. The report builder is called directly, like `collectChanges`,
 * because the report's shape is fixed. Hence a factory here and a function there.
 *
 * The returned handle is frozen (the module's factory convention).
 *
 * @example
 * const projector = createReviewPackageProjector();
 * const pkg = projector.project(candidates, session, new Date().toISOString());
 */
export function createReviewPackageProjector(): ReviewPackageProjector {
  function project(
    candidates: readonly CandidateKnowledge[],
    session: Session,
    generatedAt: string,
  ): ReviewPackage {
    // Derived once and shared with the body: the field and the synopsis the reviewer
    // reads are then the same sentence by construction, not by coincidence.
    const summary = summaryFor(candidates, session);

    return parseReviewPackage({
      sessionId: session.id,
      generatedAt,
      summary,
      // References into the store, not embedded records: the candidates are the
      // canonical artifact and are never duplicated here (EOS-D4). Canonical order
      // is preserved — the projector reorders nothing.
      candidateIds: candidates.map((candidate) => candidate.id),
      markdown: renderMarkdown(candidates, session, generatedAt, summary),
    });
  }

  return Object.freeze({ project });
}
