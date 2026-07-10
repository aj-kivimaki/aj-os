/**
 * Contract tests for the platform AI Client (PRODUCT-001).
 *
 * The AI Client owns the provider, model, SDK and transport. These tests mock
 * the `@anthropic-ai/sdk` so they exercise the client's *contract* — how it maps
 * a RenderedPrompt onto a request, extracts the answer, selects the model, and
 * reports failures — without any network access. They know nothing of the
 * Knowledge Assistant or the rest of the pipeline.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RenderedPrompt } from "../../src/platform/prompt/index.js";

// Hoisted so the mock factory (itself hoisted above imports) can reference it.
const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class Anthropic {
    messages = { create };
    constructor(_options: unknown) {}
  },
}));

const PROMPT: RenderedPrompt = { system: "system rules", user: "who am i?" };

let priorKey: string | undefined;
let priorModel: string | undefined;

beforeEach(() => {
  priorKey = process.env.ANTHROPIC_API_KEY;
  priorModel = process.env.ANTHROPIC_MODEL;
  create.mockReset();
});

afterEach(() => {
  restore("ANTHROPIC_API_KEY", priorKey);
  restore("ANTHROPIC_MODEL", priorModel);
  vi.resetModules();
});

function restore(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

/** Import a fresh AIClient after the environment for the test is set. */
async function freshClient() {
  vi.resetModules();
  return import("../../src/platform/ai/index.js");
}

describe("AIClient", () => {
  it("throws AIError when no API key is configured", async () => {
    // Empty (not deleted): dotenv won't override an already-set var, so this
    // holds even when a real key exists in the developer's .env.
    process.env.ANTHROPIC_API_KEY = "";
    const { AIClient, AIError } = await freshClient();

    await expect(new AIClient().answer(PROMPT)).rejects.toBeInstanceOf(AIError);
    expect(create).not.toHaveBeenCalled();
  });

  it("maps the rendered prompt onto a Messages request and returns the text", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    // An arbitrary sentinel — never a real model name. The test asserts the
    // client uses *whatever* ANTHROPIC_MODEL is configured, so it stays green
    // regardless of which Anthropic model the developer sets locally.
    process.env.ANTHROPIC_MODEL = "test-configured-model";
    create.mockResolvedValue({
      content: [
        { type: "text", text: "You are AJ." },
        { type: "text", text: " A builder." },
      ],
    });
    const { AIClient } = await freshClient();

    const response = await new AIClient().answer(PROMPT);

    expect(create).toHaveBeenCalledWith({
      model: "test-configured-model",
      max_tokens: 1024,
      system: "system rules",
      messages: [{ role: "user", content: "who am i?" }],
    });
    expect(response).toEqual({
      text: "You are AJ. A builder.",
      model: "test-configured-model",
    });
  });

  it("uses ANTHROPIC_MODEL when it is configured", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.ANTHROPIC_MODEL = "some-other-model";
    create.mockResolvedValue({ content: [{ type: "text", text: "hi" }] });
    const { AIClient } = await freshClient();

    const response = await new AIClient().answer(PROMPT);

    // Whatever is configured is exactly what the client selects and reports.
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: "some-other-model" }),
    );
    expect(response.model).toBe("some-other-model");
  });

  it("falls back to the documented default when ANTHROPIC_MODEL is absent", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    // Empty (not deleted): dotenv won't override an already-set var, so the
    // model stays unset even though the developer's real .env defines one. This
    // is the only way to genuinely exercise the fallback path in-process.
    process.env.ANTHROPIC_MODEL = "";
    create.mockResolvedValue({ content: [{ type: "text", text: "hi" }] });
    const { AIClient, DEFAULT_MODEL } = await freshClient();

    const response = await new AIClient().answer(PROMPT);

    // Asserted against the exported default — the single source of truth — so
    // the test tracks the documented default rather than a hardcoded string.
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: DEFAULT_MODEL }),
    );
    expect(response.model).toBe(DEFAULT_MODEL);
  });

  it("wraps SDK/transport failures in AIError", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    create.mockRejectedValue(new Error("network down"));
    const { AIClient, AIError } = await freshClient();

    await expect(new AIClient().answer(PROMPT)).rejects.toBeInstanceOf(AIError);
  });
});
