# Handbook Agent

The handbook agent is AJ-OS's first AI service.

It answers questions grounded in the handbook wiki and captures notes and files to the
handbook inbox. It is reached over HTTP today and is designed to be reached over MCP later.

The agent is an interface onto a capability layer, not a standalone application — the same
capability functions are shared by the HTTP routes and a future MCP server.

---

# Responsibilities

The agent does two things:

- **Answer questions** about AJ's projects and knowledge, grounded exclusively in the handbook
  wiki. It cites the pages it used and states plainly when the wiki does not contain an answer.
- **Capture to the inbox** — write Markdown notes or save files into the handbook's
  `workspace/inbox/`, on explicit request.

The handbook is a sibling Obsidian vault (configured via `HANDBOOK_PATH`). Reads are scoped to
its `wiki/` directory; writes are scoped to its `workspace/inbox/` directory.

---

# Architecture

The agent follows the same layered separation as the rest of the platform: capability logic is
independent of the transport that exposes it.

```text
HTTP Request
    ↓
Fastify Route            src/api/
    ↓
Agent Loop               src/agent/        (Anthropic tool-use loop)
    ↓
Handbook Capabilities    src/handbook/     (path-safe reads + writes)
    ↓
Handbook Vault           (wiki/ read-only, workspace/inbox/ write)
```

## Handbook capability layer — `src/handbook/`

Framework-agnostic functions with no HTTP or model dependencies:

- `readIndex`, `listPages`, `readPage`, `searchHandbook` — wiki-scoped reads.
- `writeInboxNote`, `saveInboxFile` — inbox-scoped writes (no overwrite, sanitized filenames).
- Path safety (`resolveInWiki`, `resolveInInbox`) rejects absolute paths, `..` traversal, and
  symlink escapes, confining every operation to the two allowed subtrees.

Keeping this layer transport-agnostic is what lets a future MCP server reuse it unchanged.

## Agent loop — `src/agent/`

A manual Anthropic tool-use loop (`runAgent`) that lets the model navigate the wiki and, when
asked, write to the inbox. The model is **Claude** (`ANTHROPIC_MODEL`, default `claude-sonnet-5`).
Five tools map directly onto the handbook capability functions:

| Tool                 | Backing function   |
| -------------------- | ------------------ |
| `list_handbook`      | `listPages` / `readIndex` |
| `read_handbook_page` | `readPage`         |
| `search_handbook`    | `searchHandbook`   |
| `write_inbox_note`   | `writeInboxNote`   |
| `save_inbox_file`    | `saveInboxFile`    |

The system prompt directs the agent to start from the wiki index, drill into the relevant
pages, cite them, and admit gaps rather than answer from general knowledge.

## HTTP layer — `src/api/`

A thin Fastify server with no business logic: routing, Zod validation, bearer authentication,
error mapping, and logging.

---

# Endpoints

All routes except `/health` require `Authorization: Bearer <API_AUTH_TOKEN>`.

| Method | Path          | Body                                          | Purpose |
| ------ | ------------- | --------------------------------------------- | ------- |
| GET    | `/health`     | —                                             | Liveness check |
| POST   | `/agent/ask`  | `{ "message": "..." }`                         | Ask the agent → `{ answer, toolCalls, iterations, stopReason }` |
| POST   | `/inbox/note` | `{ "title", "body", "tags"?, "filename"? }`   | Write a note to the inbox (deterministic, no LLM) |
| POST   | `/inbox/file` | `{ "filename", "content", "encoding"? }`      | Save a file to the inbox (`encoding`: `utf8` \| `base64`) |

The inbox endpoints call the same capability functions the agent's tools use — a deterministic
capture path that does not involve the model.

---

# Running it

```bash
npm run serve        # tsx src/server.ts (development)
npm run serve:prod   # node dist/server.js (after npm run build)
```

Required configuration (see `docs/guides/configuration.md`): `ANTHROPIC_API_KEY`,
`HANDBOOK_PATH`, `API_AUTH_TOKEN` (plus optional `ANTHROPIC_MODEL`, `API_PORT`, `API_HOST`).
These are only needed for the server.

Example:

```bash
curl -s localhost:3000/agent/ask \
  -H "Authorization: Bearer $API_AUTH_TOKEN" \
  -H "content-type: application/json" \
  -d '{"message":"What am I working on?"}'
```

---

# Security

- **Bearer authentication** on every route except `/health`.
- **Path scoping** — reads confined to `wiki/`, writes confined to `workspace/inbox/`; traversal
  and symlink escapes are rejected.
- **Inbox writes never overwrite** and use sanitized filenames.

---

# Orchestration

n8n drives the agent over HTTP (`host.docker.internal:3000`). Importable workflows for a chat
window and for messaging from a phone via Telegram live in `infrastructure/n8n/workflows/`;
setup is documented in `infrastructure/n8n/README.md`.

---

# Future Direction

- Expose the same handbook capabilities over **MCP**, reusing `src/handbook/` unchanged.
- Extend the agent to additional context sources as they become available,
  keeping capability logic transport-agnostic.

> **The agent is an interface onto shared capabilities — not a separate application.**
