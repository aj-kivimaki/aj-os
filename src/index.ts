import { synchronizeWorkspace } from "./application/index.js";

async function main(): Promise<void> {
  const result = await synchronizeWorkspace();
  if (result.summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Workspace synchronization failed: ${message}`);
  process.exitCode = 1;
});
