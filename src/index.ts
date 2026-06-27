import { getNotionClient } from "./notion/client.js";

async function main(): Promise<void> {
  const notion = getNotionClient();

  await notion.users.me({});
  console.log("Notion connection successful.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Notion connection failed: ${message}`);
  process.exitCode = 1;
});
