# Configuration

This guide explains how to configure AJ-OS to communicate with your Notion workspace.

---

# Environment Variables

AJ-OS is configured using environment variables.

Create a `.env` file in the project root.

```env
NOTION_API_KEY=your_notion_api_key
NOTION_PARENT_PAGE_ID=your_parent_page_id
```

---

# NOTION_API_KEY

This is your Notion Integration Token.

Create one by:

1. Visit https://www.notion.so/profile/integrations
2. Create a new Internal Integration.
3. Give it a name.
4. Copy the Internal Integration Token.
5. Paste it into:

```env
NOTION_API_KEY=ntn_xxxxxxxxxxxxxxxxx
```

Keep this token private.

Never commit it to Git.

---

# NOTION_PARENT_PAGE_ID

AJ-OS creates all databases underneath a single parent page.

Create a new page in your Notion workspace.

Example:

```
Game Audio Business OS
```

Share this page with your Notion Integration.

Copy the page ID from the URL.

Example:

```
https://www.notion.so/Game-Audio-Business-OS-38d2d7cf41c78183a388c8e2aba8e125
```

The page ID is:

```
38d2d7cf41c78183a388c8e2aba8e125
```

Configure it as:

```env
NOTION_PARENT_PAGE_ID=38d2d7cf41c78183a388c8e2aba8e125
```

---

# Sharing the Parent Page

This is the most common setup issue.

After creating your integration:

1. Open the parent page.
2. Click **Share**.
3. Select **Invite**.
4. Search for your integration.
5. Add it.
6. Save.

Without this permission AJ-OS cannot access the page.

---

# API & Handbook Agent Variables

These variables are **only** required to run the REST API and handbook agent
(`npm run serve`). The workspace sync CLI (`npm run sync`) does not use them, so you can leave
them unset if you only sync to Notion.

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-5
HANDBOOK_PATH=/absolute/path/to/your/handbook
API_PORT=3000
API_HOST=0.0.0.0
API_AUTH_TOKEN=a_long_random_secret
```

| Variable            | Required | Purpose                                                                 |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | yes      | Anthropic API key that powers the agent                                 |
| `ANTHROPIC_MODEL`   | no       | Model id (default `claude-sonnet-5`); change without editing code       |
| `HANDBOOK_PATH`     | yes      | Absolute path to the handbook vault the agent reads/writes              |
| `API_PORT`          | no       | HTTP port (default `3000`)                                              |
| `API_HOST`          | no       | Bind address (default `0.0.0.0`; keep it so Docker n8n can reach the host) |
| `API_AUTH_TOKEN`    | yes      | Bearer token clients must send; minimum 16 characters                   |

The server fails fast with a clear message if a required variable is missing. See
`docs/api/agent.md` for the agent architecture and endpoints.

---

# Synchronization

Once configured, synchronize the workspace.

```bash
npm run sync
```

Synchronization performs the following steps:

```
Discover existing databases

↓

Create missing databases

↓

Collect database IDs

↓

Resolve relations

↓

Generate CEO Dashboard

↓

Summary
```

Synchronization is idempotent.

Running it repeatedly will never create duplicate databases or duplicate relations.

---

# Project Structure

AJ-OS generates a connected workspace.

Current business modules include:

- Projects
- CRM
- Portfolio
- Production Music
- Finance
- Game Jams

The CEO Dashboard is generated automatically after synchronization.

---

# Security

Never commit:

- `.env`
- API keys
- Personal workspace IDs

Ensure `.env` is listed in `.gitignore`.

---

# Multiple Workspaces

You can maintain multiple AJ-OS workspaces by changing the environment variables.

For example:

```
.env.local

.env.production

.env.demo
```

Each environment can target a different Notion workspace.

---

# Verification Checklist

Before using AJ-OS, verify:

- Node.js is installed.
- Dependencies are installed.
- `.env` exists.
- API key is valid.
- Parent page is shared with the integration.
- Synchronization completes successfully.
- CEO Dashboard is generated.

---

# Next Steps

After configuration:

- Explore the generated workspace.
- Review the CEO Dashboard.
- Customize business modules.
- Read the Development guide to extend AJ-OS.
