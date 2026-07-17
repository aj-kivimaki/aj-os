import { requireAgentEnv } from "./config/agentEnv.js";
import { getVaultRoot } from "./handbook/index.js";
import { buildServer } from "./api/index.js";

async function main(): Promise<void> {
  const config = requireAgentEnv();

  // Fail fast if the handbook vault is missing or misconfigured.
  const vaultRoot = getVaultRoot();

  const app = await buildServer(config);
  await app.listen({ port: config.apiPort, host: config.apiHost });
  app.log.info(`Handbook agent API serving from vault: ${vaultRoot}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to start API server: ${message}`);
  process.exitCode = 1;
});
