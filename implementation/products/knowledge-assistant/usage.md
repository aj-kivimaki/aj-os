# PRODUCT-001 — Knowledge Assistant User Guide

**Status:** As-Built Record
**Version:** 1.0.0
**Owner:** AJ
**Category:** Product Engineering — User Guide

---

# About this guide

This is the user manual for the Knowledge Assistant, Version 1.0. It answers one
question: **how do I use it?** — not how it is built.

The Knowledge Assistant lets you ask questions, in plain language, about your own
handbook, and get back answers grounded in that handbook with citations to the
exact articles they came from. You use it through a single command: `aj ask`.

If you have never seen AJ-OS before, this guide is written for you. No knowledge of
the implementation is assumed, and none is needed.

> **Why does AJ-OS only answer from your handbook?**
> Because the whole point is *trust*. A general chatbot can sound confident about
> anything; the Knowledge Assistant only tells you what your handbook actually says,
> so you can rely on its answers and trace them back to the source. It is a way to
> *understand your own knowledge faster*, not a replacement for a search engine.

---

# Quick Start (2 minutes)

The fastest path from zero to your first answer:

```bash
# 1. Get AJ-OS and enter it
git clone <aj-os-repo-url> && cd aj-os

# 2. Install, build, and make the `aj` command available
npm install && npm run build && npm link

# 3. Point at your handbook — create aj.config.json in the project root:
#    { "handbook": { "path": "../../handbook" } }

# 4. Add your API key — create .env in the project root:
#    ANTHROPIC_API_KEY=sk-ant-your-key-here

# 5. Ask your first question
aj ask "Who am I?"
```

If step 5 prints an answer followed by a **Citations** list, you are up and
running. Each step is explained in full below, and if anything goes wrong,
[Section 9 — Common errors](#9-common-errors) tells you exactly what to fix.

---

# Your first successful answer

Here is what a working installation looks like end to end:

```text
$ aj ask "Who am I?"

You are AJ — a developer building AJ-OS, a knowledge-driven operating system
for building software with AI. Your work spans platform architecture, engineering
standards, and the products built on top of them [1]. Your background also
includes music and game development [2].

Citations:
  [1] About Me
  [2] Career Timeline
```

The two things that tell you it worked: **an answer**, and a numbered **Citations**
list beneath it that traces the answer back to your wiki. If you see that, your
handbook, API key, and build are all configured correctly — you can start asking
real questions. If you see an error message instead, it is not a crash: go to
[Section 9](#9-common-errors), where every message is paired with its fix.

---

# 1. Prerequisites

Before you can ask anything, you need three things:

1. **Node.js** installed (a current LTS version).
2. **An Anthropic API key** — the assistant uses Anthropic's models to write
   answers. You can get a key from your Anthropic account.
3. **A handbook with a generated wiki** — a folder of knowledge whose AI wiki you
   generate with `aj wiki build`. See [Section 4](#4-the-handbook-requirement).

If you have all three, setup takes a couple of minutes.

---

# 2. Installation / local setup

The Knowledge Assistant ships as part of the AJ-OS project. From the project root:

```bash
# 1. Install dependencies
npm install

# 2. (Recommended) build and link the `aj` command so you can call it directly
npm run build
npm link
```

After `npm link`, the `aj` command is available in your shell:

```bash
aj ask "How does the Context Builder work?"
```

**Prefer not to build?** You can run the assistant straight from source in
development mode. Anywhere this guide shows `aj ask ...`, the equivalent is:

```bash
npm run dev -- ask "How does the Context Builder work?"
```

(The `--` passes the rest of the line through to the command.) The examples below
use the shorter `aj ask` form.

---

# 3. Configuration

The assistant needs two pieces of configuration: **where your handbook is**, and
**your API key**.

### 3a. Point at your handbook — `aj.config.json`

Create a file called `aj.config.json` in the project root:

```json
{
  "handbook": {
    "path": "../../handbook"
  }
}
```

- `handbook.path` is the location of your handbook folder, relative to the project
  root (an absolute path works too).
- The path must exist and be a directory. The assistant checks this on startup and
  tells you clearly if it is wrong.

### 3b. Provide your API key — `.env`

Create a `.env` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Optionally, choose a specific model:

```bash
# Optional — defaults to a sensible current model if omitted
ANTHROPIC_MODEL=claude-sonnet-5
```

That is all the configuration there is. You are ready to ask questions.

> **Why do I have to bring my own API key?**
> The Knowledge Assistant runs on *your* machine and answers from *your* handbook
> using *your* Anthropic account. Nothing is sent to a third-party server in the
> middle — the assistant talks directly to Anthropic with your key.

### 3c. Configuration checklist

A quick reference to confirm you are ready — and a troubleshooting list when
something is off:

- ☐ Handbook path in `aj.config.json` exists and is a directory
- ☐ Generated wiki directory exists inside the handbook (`aj wiki build` creates it)
- ☐ `ANTHROPIC_API_KEY` is set in `.env`
- ☐ *(Optional)* `ANTHROPIC_MODEL` is set in `.env`
- ☐ Project built (`npm run build`)
- ☐ `aj` command available (`npm link`) — or use `npm run dev -- ask` instead

If an answer isn't working, walk this list top to bottom; the first unchecked box
is almost always the cause, and it maps directly to a message in
[Section 9](#9-common-errors).

---

# 4. The handbook requirement

The Knowledge Assistant does **not** read your handbook's raw source. It reads a
**generated wiki** inside the handbook — an AI-optimized version of your knowledge.
Your handbook folder must therefore contain the generated-wiki directory named by
`handbook.generatedWikiPath` (default `wiki-generated/`):

```text
handbook/
├── ...your source knowledge...
└── wiki-generated/
    ├── index.md          ← the catalog of what counts as knowledge
    ├── sources/
    ├── concepts/
    └── entities/
```

- The generated wiki is produced by the AJ-OS **Wiki Generator**, which you run
  with `aj wiki build` (see the main README). If the directory is missing, the
  assistant will tell you the wiki has not been generated yet — run
  `aj wiki build` to create it.
- `index.md` is the catalog: it lists which articles are part of your knowledge
  base. The assistant only ever searches articles the index links to, and the
  generator regenerates it on every build.

> **Why does it read a generated wiki instead of my actual notes?**
> Your handbook is written for *you* — full of shorthand, drafts, and files that
> aren't really "knowledge" (READMEs, logs). The generated wiki is a clean,
> curated, AI-friendly version of the same knowledge. Reading it gives better,
> more consistent answers, and it keeps your original notes untouched.

> **Why does the assistant never change my handbook?**
> `aj ask` is strictly read-only: it retrieves and explains; it never writes or
> edits. Generating the wiki is a separate, explicit command (`aj wiki build`),
> and even that only writes the generated-wiki directory it owns — your source
> notes are never touched.

---

# 5. Interactive mode

Run `aj ask` with no question to start an interactive session:

```bash
aj ask
```

You will see a welcome screen and a prompt. Type questions and press Enter; keep
asking as many as you like:

```text
────────────────────────────────────────
AJ-OS Knowledge Assistant
Version 0.1
────────────────────────────────────────

Ask me anything about your handbook.
Type 'exit' or 'quit' to leave.

> How does the Context Builder work?

The Context Builder assembles retrieved knowledge into a single, immutable
context package… [1][2]

Citations:
  [1] Context Builder Architecture
  [2] Context Assembly Standard

> exit

Goodbye!
```

To leave, type `exit` or `quit`, or press **Ctrl-D**.

> **Note — the banner still says "Version 0.1".** The current interactive banner
> still displays *Version 0.1*, as shown above. This is a known cosmetic issue
> scheduled to be corrected before the Version 1.0 release is finalized. The
> functionality is Version 1.0; only the printed label is out of date.

---

# 6. One-shot mode

Supply a question directly to get a single answer and return to your shell — ideal
for quick lookups or scripting:

```bash
aj ask "How does the Context Builder work?"
```

The assistant prints the answer and its citations, then exits. Remember to quote
your question so your shell treats it as one argument.

```bash
# A few realistic examples
aj ask "What is the AJ-OS knowledge pipeline?"
aj ask "Who am I?"
aj ask "What are the engineering standards?"
```

---

# 7. Debug mode

Add `--debug` (in either mode) to see what happened behind the answer:

```bash
aj ask "How does the Context Builder work?" --debug
```

You will get a diagnostics block *in addition to* the normal answer:

```text
── Debug diagnostics ─────────────────────
  Handbook           : /path/to/handbook
  Retrieved articles : 3
      • Context Builder Architecture
      • Context Assembly Standard
      • Knowledge Pipeline
  Included sources   : 3
  Context size       : 4.2 KB
  Estimated tokens   : ~1080
  Prompt rendered    : ✓
  AI model           : claude-sonnet-5
  Stage timings      :
      config   : 1.2 ms
      handbook : 0.8 ms
      retrieval: 12.4 ms
      context  : 3.1 ms
      prompt   : 0.4 ms
      ai       : 940.0 ms
──────────────────────────────────────────
```

`--debug` never changes the answer — it only *shows you more* about how it was
produced (which articles were found, how big the context was, how long each step
took). It is useful when an answer seems off and you want to see what the assistant
actually retrieved.

---

# 8. Reading answers and citations

Every answer has two parts: the **answer** and its **citations**.

```text
The Context Builder runs three stages — collection, selection, and assembly —
to turn retrieved articles into an immutable context package [1]. Assembly files
each source under a canonical section and preserves a numbered reference list [2].

Citations:
  [1] Context Builder Architecture
  [2] Context Assembly Standard
```

- The bracketed markers in the text — `[1]`, `[2]` — correspond to the numbered
  **Citations** list underneath.
- Each citation names the wiki article the assistant drew that part of its answer
  from, so you can go read the original.

> **Why is every answer cited?**
> So you never have to take the assistant's word for it. Citations let you verify
> exactly where each claim came from and read the fuller article if you want. An
> answer you can trace is an answer you can trust.

If the assistant can't ground something in your handbook, it will say so plainly
rather than guess.

> **Why does it sometimes say "I don't know" instead of answering?**
> Because it would rather be honest than impressive. If your handbook doesn't
> contain the answer, the assistant tells you — it will not invent facts or pull
> them from the open internet.

---

# 9. Common errors

The assistant is designed to explain problems in plain language. Here are the
messages you are most likely to see, and what to do about each.

| What you see | What it means | How to fix it |
| --- | --- | --- |
| *Configuration file not found…* | There is no `aj.config.json` at the project root. | Create it — see [Section 3a](#3a-point-at-your-handbook--ajconfigjson). |
| *Invalid JSON in aj.config.json.* | The config file has a syntax error. | Check for a missing comma or quote. |
| *aj.config.json must set "handbook.path"…* | The config is missing the handbook path. | Add the `handbook.path` value. |
| *Configured handbook path does not exist…* | The path in your config points nowhere. | Correct the path to your handbook folder. |
| *The configured handbook does not contain a generated wiki.* | The handbook has no generated-wiki directory. | Run `aj wiki build` to generate it, see [Section 4](#4-the-handbook-requirement). |
| *No relevant handbook articles were found for that question.* | Nothing in your wiki matched. | Rephrase, or ask about a topic your handbook actually covers. |
| *ANTHROPIC_API_KEY is not configured…* | No API key was found. | Add it to `.env` — see [Section 3b](#3b-provide-your-api-key--env). |
| *The AI request failed: …* | The call to Anthropic failed (network, quota, etc.). | Check your connection and account, then retry. |

None of these are crashes — they are the assistant telling you exactly what it
needs.

---

# 10. Current limitations

Version 1.0 does a few things deliberately, and it is best to know them up front:

- **It doesn't remember previous questions.** Each question is answered on its own,
  even in an interactive session. Ask follow-ups as complete questions.
- **It only knows your handbook.** No internet search, no outside knowledge.
- **It never changes anything.** Strictly read-only.
- **Its search is keyword-based.** It matches on words, so phrasing your question
  with the terms your handbook uses gets the best results.
- **It answers one question at a time**, and shows the full answer at once (no
  live streaming).

> **Why doesn't it use internet search?**
> Because the moment it reaches outside your handbook, you lose the guarantee that
> its answers are grounded in *your* knowledge and traceable to *your* sources.
> Staying inside the handbook is what makes the assistant trustworthy. Broader
> capabilities are planned for future versions — but they will be opt-in, not a
> silent blend of your knowledge and the open web.

---

# 11. Frequently asked questions

**Do I need to be online?**
Yes — the assistant calls Anthropic's API to write answers, so you need an internet
connection and a valid API key. Your handbook itself is read locally.

**Can I use it with any handbook?**
Yes, as long as the handbook follows the expected structure and has a generated
wiki directory. Point `aj.config.json` at the handbook and run `aj wiki build`.

**Does my handbook content get sent anywhere?**
Only the relevant retrieved article text is sent to Anthropic as context for your
question, using your own API key. Nothing goes to any other server.

**What model does it use?**
A current Anthropic model by default; you can override it with `ANTHROPIC_MODEL` in
`.env`.

**I typed `aj knowledge ask` and got a deprecation warning. Why?**
`aj knowledge ask` is the old command name. It still works but is deprecated — use
`aj ask` instead.

**How do I get better answers?**
Ask specific questions using the vocabulary your handbook uses, and keep your
generated wiki up to date. Use `--debug` to see which articles a question is
actually matching.

**It says nothing was found, but I know the topic is in my handbook. Why?**
The assistant searches your *generated wiki*, and only the articles its
`index.md` links to. If the topic isn't in the wiki yet, regenerate it with
`aj wiki build`; if it's there, try phrasing the question with the same words the
article uses.

---

# Where to go next

Pick your path depending on what you want to do:

**Just use it**
- You already have everything you need above. Start with the
  [Quick Start](#quick-start-2-minutes) and keep [Section 9 — Common errors](#9-common-errors)
  and the [configuration checklist](#3c-configuration-checklist) handy.

**Understand what it's for and how it should behave**
- The [product specification](../../../docs/specifications/products/PRODUCT-001-knowledge-assistant.md)
  and [principles](../../../docs/specifications/products/PRODUCT-001-principles.md) —
  the *why* behind the "Why?" boxes in this guide.

**Understand how it works inside**
- [system-walkthrough.md](./system-walkthrough.md) — a guided tour of what happens
  when you ask a question, from command to cited answer.
- [architecture.md](./architecture.md) — the structural map of the product.

**Maintain or extend it**
- [decisions.md](./decisions.md) — why the product is built the way it is.
- [testing.md](./testing.md) — how it is tested and why.
- [lessons-learned.md](./lessons-learned.md) — the honest retrospective.

**See what shipped in this version**
- [release/v1.0.0.md](./release/v1.0.0.md) — the Version 1.0 release notes: new
  capabilities, known limitations, and what comes next.

You never need any of these just to *use* the assistant — but they are here when you
want to go deeper.
