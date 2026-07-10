import {
  KnowledgeAssistant,
  type AskOptions,
} from "../../products/knowledge-assistant/index.js";

/**
 * Launch the Knowledge Assistant in one of its two interaction modes.
 *
 * The CLI only decides *which* mode to run and whether debug output is on; all
 * orchestration lives in the product. With a question, answer it once and exit
 * (one-shot). Without one, start the interactive session. `options` is passed
 * straight through — the CLI adds no behavior of its own.
 */
export async function askCommand(
  question?: string,
  options: AskOptions = {},
): Promise<void> {
  const assistant = new KnowledgeAssistant();

  const trimmed = question?.trim();
  if (trimmed) {
    await assistant.answer(trimmed, options);
    return;
  }

  await assistant.run(options);
}
