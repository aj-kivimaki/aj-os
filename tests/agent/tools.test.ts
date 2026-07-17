/**
 * Agent tool dispatcher tests (REX-403, F-054).
 *
 * `executeTool` is the dispatch + validation + error-mapping layer the agent
 * loop calls for every tool use on the live `/agent/ask` path. Before M4 the
 * agent layer had zero tests. These characterise the deterministic contract —
 * unknown-tool handling, input validation, and the tool manifest — without
 * touching the handbook filesystem (every case here fails validation or dispatch
 * before any IO, so no `HANDBOOK_PATH` is required).
 */
import { describe, it, expect } from "vitest";

import { AGENT_TOOLS, executeTool } from "../../src/agent/index.js";

describe("executeTool — dispatch & error contract", () => {
  it("reports an unknown tool as an error result, not a throw", async () => {
    const result = await executeTool("no_such_tool", {});
    expect(result.isError).toBe(true);
    expect(result.content).toMatch(/Unknown tool: no_such_tool/);
  });

  it.each([
    ["read_handbook_page", {}], // missing required `path`
    ["search_handbook", {}], // missing required `query`
    ["write_inbox_note", {}], // missing required fields
    ["save_inbox_file", {}], // missing required fields
  ])("maps invalid input for %s to a failed result", async (tool, input) => {
    const result = await executeTool(tool, input);
    expect(result.isError).toBe(true);
    expect(result.content).toMatch(new RegExp(`${tool} failed`));
  });
});

describe("AGENT_TOOLS — manifest", () => {
  it("declares each handbook tool with an input schema", () => {
    const names = AGENT_TOOLS.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "list_handbook",
        "read_handbook_page",
        "search_handbook",
        "write_inbox_note",
        "save_inbox_file",
      ]),
    );
    for (const tool of AGENT_TOOLS) {
      expect(tool.input_schema).toBeDefined();
    }
  });
});
