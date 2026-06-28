# Installation

This guide explains how to install and configure AJ-OS for the first time.

---

# Requirements

Before installing AJ-OS, ensure you have:

- Node.js 22 or newer
- npm
- A Notion account
- A Notion integration
- A Notion page that will act as the workspace root

---

# Clone the Repository

```bash
git clone https://github.com/aj-kivimaki/aj-os.git

cd aj-os
```

---

# Install Dependencies

```bash
npm install
```

---

# Create Environment File

Create a `.env` file in the project root.

Example:

```env
NOTION_API_KEY=your_notion_api_key

NOTION_PARENT_PAGE_ID=your_parent_page_id
```

---

# Configure Notion

## Step 1

Create a new Notion Integration.

Copy the Internal Integration Token.

Use it as:

```env
NOTION_API_KEY=...
```

---

## Step 2

Create a new page inside your Notion workspace.

This page becomes the root of your AJ-OS workspace.

Share the page with your integration.

Without this step AJ-OS cannot access the page.

---

## Step 3

Copy the page ID from the URL.

Example:

```
https://www.notion.so/My-Workspace/38d2d7cf41c78183a388c8e2aba8e125
```

Page ID:

```
38d2d7cf41c78183a388c8e2aba8e125
```

Use it as:

```env
NOTION_PARENT_PAGE_ID=38d2d7cf41c78183a388c8e2aba8e125
```

---

# Verify Installation

Run:

```bash
npm run typecheck

npm run build

npm run sync
```

Successful synchronization should:

- discover existing databases
- create missing databases
- synchronize relations
- generate the CEO Dashboard

---

# Expected Output

Typical synchronization:

```text
Workspace Synchronization

Discover existing databases

Create missing databases

Collect database IDs

Resolve relations

Generate CEO Dashboard

Summary

Created: X
Skipped: X
Relations created: X
Dashboard generated: 1
```

Running synchronization multiple times should never create duplicate databases or relations.

---

# Troubleshooting

## Page not found

Ensure the parent page has been shared with your Notion integration.

---

## Unauthorized

Verify that your API key is correct.

---

## Missing databases

Run synchronization again.

AJ-OS is idempotent and safely retries incomplete synchronization.

---

# Next Steps

Once installation is complete:

- Read the Configuration guide.
- Explore the generated workspace.
- Review the CEO Dashboard.
- Begin customizing business modules for your own workflow.
