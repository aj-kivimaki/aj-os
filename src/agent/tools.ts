import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import {
  HandbookNotFoundError,
  listPages,
  PathEscapeError,
  readPage,
  saveInboxFile,
  searchHandbook,
  writeInboxNote,
} from "../handbook/index.js";
import type { ToolExecResult } from "./types.js";

/**
 * Tool definitions exposed to the model. The JSON schemas double as MCP tool
 * schemas later — keep them declarative and framework-agnostic.
 */
export const AGENT_TOOLS: readonly Anthropic.Tool[] = [
  {
    name: "list_handbook",
    description:
      "List the Markdown pages in AJ's handbook wiki. Call this first to see " +
      "what exists. Omit `subdir` to list the whole wiki (start with index.md); " +
      "pass a subdir like 'entities' or 'concepts' to narrow it.",
    input_schema: {
      type: "object",
      properties: {
        subdir: {
          type: "string",
          description:
            "Optional wiki subdirectory to list, e.g. 'entities' or 'concepts'.",
        },
      },
    },
  },
  {
    name: "read_handbook_page",
    description:
      "Read one wiki page by its wiki-relative path (e.g. 'index.md', " +
      "'overview.md', 'entities/aj-os.md'). Call this to get the actual content " +
      "you will answer from.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Wiki-relative path to the page, e.g. 'entities/aj-os.md'.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "search_handbook",
    description:
      "Search the wiki for a term and get matching lines with their page paths. " +
      "Call this when you need to locate where a topic is discussed before reading.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text to search for (case-insensitive)." },
        limit: {
          type: "integer",
          description: "Maximum number of hits to return (default 30).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "write_inbox_note",
    description:
      "Create a Markdown note in AJ's inbox. Call ONLY when AJ explicitly asks " +
      "to save or capture a note. Never as a side effect of answering.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Note title." },
        body: { type: "string", description: "Markdown body of the note." },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of tags.",
        },
        filename: {
          type: "string",
          description: "Optional filename stem; defaults to a slug of the title.",
        },
      },
      required: ["title", "body"],
    },
  },
  {
    name: "save_inbox_file",
    description:
      "Save a file to AJ's inbox. Call ONLY when AJ explicitly asks to save a " +
      "file. Use encoding 'base64' for binary content.",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "Filename to save as." },
        content: { type: "string", description: "File content." },
        encoding: {
          type: "string",
          enum: ["utf8", "base64"],
          description: "Encoding of `content` (default 'utf8').",
        },
      },
      required: ["filename", "content"],
    },
  },
];

const listSchema = z.object({ subdir: z.string().optional() });
const readSchema = z.object({ path: z.string().min(1) });
const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().optional(),
});
const noteSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  tags: z.array(z.string()).optional(),
  filename: z.string().optional(),
});
const fileSchema = z.object({
  filename: z.string().min(1),
  content: z.string(),
  encoding: z.enum(["utf8", "base64"]).optional(),
});

function ok(value: unknown): ToolExecResult {
  return {
    content: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    isError: false,
  };
}

function fail(message: string): ToolExecResult {
  return { content: message, isError: true };
}

/**
 * Execute a tool by name against the handbook capability layer.
 * Validation and expected errors are returned as `isError` tool results so the
 * model can recover, rather than thrown.
 */
export async function executeTool(name: string, input: unknown): Promise<ToolExecResult> {
  try {
    switch (name) {
      case "list_handbook": {
        const { subdir } = listSchema.parse(input);
        return ok(await listPages(subdir));
      }
      case "read_handbook_page": {
        const { path } = readSchema.parse(input);
        return ok(await readPage(path));
      }
      case "search_handbook": {
        const { query, limit } = searchSchema.parse(input);
        return ok(await searchHandbook(query, limit === undefined ? {} : { limit }));
      }
      case "write_inbox_note": {
        const parsed = noteSchema.parse(input);
        return ok(await writeInboxNote(parsed));
      }
      case "save_inbox_file": {
        const parsed = fileSchema.parse(input);
        return ok(await saveInboxFile(parsed));
      }
      default:
        return fail(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (
      error instanceof HandbookNotFoundError ||
      error instanceof PathEscapeError ||
      error instanceof z.ZodError
    ) {
      return fail(`${name} failed: ${error.message}`);
    }
    throw error;
  }
}
