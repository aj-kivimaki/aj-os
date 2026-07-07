# n8n — orchestrating the AJ-OS agents

n8n runs in Docker (see `../docker-compose.yml`, container `aj-os-n8n`, port **5678**) and
drives the AJ-OS agents over HTTP. This directory holds importable workflows so they are
versioned in git — n8n's own data (`./data/`) is gitignored, since workflows live in n8n's
SQLite database.

The first workflow connects n8n's chat window to the **handbook agent** (`POST /agent/ask`):
ask a question, get an answer grounded in your handbook wiki.

## How it connects

```
[Chat Trigger] → [HTTP Request] → [Edit Fields]
   chatInput      POST /agent/ask     output = answer
```

The n8n container reaches the host-run API at **`host.docker.internal:3000`**. On macOS and
Windows (Docker Desktop) this resolves to the host automatically — no Compose change needed.
On **Linux**, add this to the `n8n` service in `docker-compose.yml`:

```yaml
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

## Setup (one time)

1. **Start the API** on the host (not in Docker):
   ```bash
   npm run serve
   ```
   Requires `.env` with `ANTHROPIC_API_KEY`, `HANDBOOK_PATH`, and `API_AUTH_TOKEN`
   (see `../../.env.example`). It serves `0.0.0.0:3000`.

2. **Start n8n** and open it:
   ```bash
   npm run infra:up      # from the repo root
   ```
   Open http://localhost:5678.

3. **Create the auth credential** in n8n:
   Credentials → **New** → **Header Auth**
   - **Name:** `Authorization`
   - **Value:** `Bearer <your API_AUTH_TOKEN>` (the exact token from `.env`)

   Give the credential a memorable name, e.g. `AJ-OS API`.

4. **Import the workflow:**
   Workflows → **Import from File** → `workflows/handbook-agent-chat.json`.
   Open the **Handbook Agent** (HTTP Request) node and select the credential from step 3.

5. **Chat:** click **Open Chat**, ask e.g. _"What am I working on?"_ →
   a grounded, cited answer appears.

## Message from your phone (Telegram)

Talk to the agent from anywhere via a Telegram bot: **plain text → the agent answers**;
**a message starting with `note:` → it's saved to your handbook inbox**. Workflow file:
`workflows/handbook-agent-telegram.json`.

### Why a tunnel is needed
Telegram delivers messages by calling an n8n **webhook**, so n8n must be reachable from the
internet. Since n8n runs locally, expose it with a tunnel to port **5678**:

- **ngrok (recommended, stable URL):** sign up (free), then
  `ngrok http 5678 --domain=your-name.ngrok-free.app` (claim one free static domain in the
  ngrok dashboard). The URL survives restarts.
- **cloudflared (no account, ephemeral):** `cloudflared tunnel --url http://localhost:5678` →
  prints a random `https://….trycloudflare.com` URL. Changes every run (you must update
  `WEBHOOK_URL` and re-activate the workflow each time).

### Security — read this
The bot is messageable by anyone who finds its handle, and it reads your private notes and
writes to your inbox. Two protections:
1. **Sender allowlist (in the workflow):** the **Authorized?** node drops any message whose
   chat id isn't yours. You must set your chat id (below) or the bot answers no one.
2. **n8n owner login:** on first launch n8n prompts you to create an owner account — do it, so
   the tunneled editor UI is password-gated. (Webhook endpoints stay public by design, which is
   what Telegram needs.)

### Setup
1. **Create the bot:** in Telegram, message **@BotFather** → `/newbot` → copy the **bot token**.
2. **Find your chat id:** message **@userinfobot** → it replies with your numeric id. (Or import
   the workflow first, message your bot, and read `message.chat.id` in the Trigger node's
   execution output.)
3. **Start a tunnel** to `localhost:5678` (see above) and copy its `https://…` URL.
4. **Set `WEBHOOK_URL`:** copy `infrastructure/.env.example` → `infrastructure/.env` and set
   `WEBHOOK_URL=<your tunnel URL>`. Then `npm run infra:restart`.
5. **Credentials in n8n:** create a **Telegram API** credential (paste the bot token); reuse the
   **Header Auth** credential (`Authorization: Bearer <API_AUTH_TOKEN>`) from the chat setup.
6. **Import** `workflows/handbook-agent-telegram.json`. On the **Authorized?** node, replace
   `<YOUR_TELEGRAM_CHAT_ID>` with your id. Select the **Telegram** credential on the *Telegram
   Trigger* and *Reply on Telegram* nodes, and the **Header Auth** credential on the *Ask agent*
   and *Save to inbox* nodes.
7. **Activate** the workflow (toggle top-right). Activation registers the webhook with Telegram.
8. **Use it:** message your bot `What am I working on?` → grounded answer;
   `note: try the new reverb plugin` → saved to `handbook/workspace/inbox/`, bot replies
   `Saved to …`.

### Telegram troubleshooting
- **Bot silent** — the workflow isn't **active**, or your chat id doesn't match the
  **Authorized?** node (mismatched id = silently dropped, by design).
- **Webhook won't register** — `WEBHOOK_URL` is missing, not `https`, or n8n wasn't restarted
  after setting it. Confirm with `docker exec aj-os-n8n printenv WEBHOOK_URL`.
- **`ECONNREFUSED` in the execution** — the API isn't running (`npm run serve`).
- Everything here needs the Mac awake with the API, n8n, and the tunnel all running. For
  always-on, host n8n + the API on a small server.

## API reference

The API is bearer-authenticated on every route except `/health`. Send
`Authorization: Bearer <API_AUTH_TOKEN>` (the Header Auth credential above). Base URL from n8n:
`http://host.docker.internal:3000`.

| Method | Path          | Body                                             | Purpose |
|--------|---------------|--------------------------------------------------|---------|
| GET    | `/health`     | —                                                | Liveness check (no auth) |
| POST   | `/agent/ask`  | `{ "message": "..." }`                           | Ask the handbook agent → `{ answer, toolCalls, iterations, stopReason }` |
| POST   | `/inbox/note` | `{ "title", "body", "tags"?, "filename"? }`      | Write a Markdown note to the handbook inbox (deterministic, no LLM) |
| POST   | `/inbox/file` | `{ "filename", "content", "encoding"? }`         | Save a file to the inbox (`encoding`: `utf8` \| `base64`) |

To build a capture workflow (e.g. a Webhook that files notes to your inbox), copy the
**Handbook Agent** HTTP Request node, point it at `/inbox/note`, and set the JSON body
accordingly.

## Troubleshooting

- **`ECONNREFUSED` / connection refused** — the API isn't running (`npm run serve`) or the URL
  is wrong. From the container: `docker exec aj-os-n8n wget -qO- http://host.docker.internal:3000/health`
  should print `{"status":"ok"}`.
- **`401 unauthorized`** — the Header Auth credential is missing, not selected on the node, or
  the token doesn't match `API_AUTH_TOKEN` in `.env`.
- **Empty chat reply** — confirm the **Format reply** node maps `output = {{ $json.answer }}`;
  the chat window renders the last node's `output` field.
- **Slow first reply** — agent runs make several model round-trips; the HTTP Request node has a
  120s timeout for this reason.
