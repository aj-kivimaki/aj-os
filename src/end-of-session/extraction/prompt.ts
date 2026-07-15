/**
 * The extraction prompt — a **pure, deterministic** function of the `ChangeSet`.
 *
 * It renders the session's changes and asks the model to identify the reusable
 * knowledge worth capturing, returning strict JSON matching the EOS-201
 * `KnowledgeExtraction` schema. Everything here is deterministic: the same
 * `ChangeSet` always produces the same `RenderedPrompt`. The one non-deterministic
 * step — generation — happens in `createKnowledgeExtractor`, behind the injected
 * `TextGenerator`. Rendering to a validated extraction is deterministic and happens
 * in `parseExtractionResponse` (EOS-201).
 *
 * The prompt supplies the `sessionId` and asks the model to echo it verbatim, so the
 * extractor never has to stamp or interpret provenance itself — it validates what the
 * model returns (the Extractor Invariant: no interpretation beyond structural
 * validation).
 */

import type { RenderedPrompt } from "../../platform/prompt/index.js";
import type { ChangeSet } from "../contracts/change/index.js";
import { EXTRACTION_KINDS } from "../contracts/knowledge-extraction/index.js";

const SYSTEM = `You are the Knowledge Extractor for a software project's \
End-of-Session Workflow. Given the file changes made during one coding session, \
identify the REUSABLE knowledge worth capturing for a human to review — the \
durable lessons, conventions, decisions, and follow-ups a teammate would benefit \
from, not a play-by-play of the diff.

Produce:

- summary: a faithful, concise title and the key points describing what the \
session accomplished. Distill; do not restate every change.
- findings: the discrete pieces of reusable knowledge the session surfaced. Each \
finding has:
  - kind: the single best-fit hint from ${EXTRACTION_KINDS.join(", ")}. This is \
only a hint; if unsure, choose the closest.
  - title: a short, searchable title.
  - body: the knowledge itself, as concise markdown.
  - rationale: why it is reusable — the case for capturing it.
  - relatedChangeIds: the ids of the session changes this finding derives from \
(from the list below); may be empty.
  - relatedPaths: the repo-relative paths this finding derives from; may be empty.
  - tags: optional free-form tags for grouping; may be empty.
  - confidence: optional number in [0, 1] expressing your confidence.

Rules:
- Extract only what the changes actually support. Never invent facts.
- If the session surfaced no reusable knowledge, return an empty findings array \
(still return a summary).
- Return ONLY a JSON object, no prose and no code fence, matching exactly:

{
  "sessionId": string,
  "summary": { "title": string, "keyPoints": string[] },
  "findings": [ { "kind": string, "title": string, "body": string, "rationale": string, "relatedChangeIds": string[], "relatedPaths": string[], "tags": string[], "confidence": number } ]
}`;

/** Render one change as a deterministic, human-readable bullet the model can cite. */
function renderChange(change: ChangeSet["changes"][number]): string {
  return `- ${change.id} [${change.changeType}, ${change.kind}] ${change.path} — ${change.summary}`;
}

/**
 * Build the extraction prompt for a session's `ChangeSet`. Pure and deterministic:
 * the changes are rendered in the set's given order (already deterministic from
 * collection), and the `sessionId` the model must echo is stated explicitly.
 */
export function buildExtractionPrompt(changeSet: ChangeSet): RenderedPrompt {
  const changeList =
    changeSet.changes.length > 0
      ? changeSet.changes.map(renderChange).join("\n")
      : "(no file changes were detected in this session)";

  const user = `Session id: ${changeSet.sessionId}

Session changes:
${changeList}

Identify the reusable knowledge in these changes. Return only the JSON object \
described in the system instructions, with "sessionId" set to "${changeSet.sessionId}".`;

  return { system: SYSTEM, user };
}
