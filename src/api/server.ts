import Fastify, { type FastifyInstance } from "fastify";

import type { AgentEnv } from "../config/agent-env.js";
import { registerAuth } from "./auth.js";
import { registerErrorHandler } from "./errors.js";
import { agentRoutes } from "./routes/agent.js";
import { healthRoutes } from "./routes/health.js";
import { inboxRoutes } from "./routes/inbox.js";

/**
 * Build the Fastify app: the thin HTTP interface over the agent + handbook
 * capability layer. No business logic lives here.
 */
export async function buildServer(config: AgentEnv): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  registerErrorHandler(app);
  registerAuth(app, config.apiAuthToken);

  await app.register(healthRoutes);
  await app.register(agentRoutes);
  await app.register(inboxRoutes);

  return app;
}
