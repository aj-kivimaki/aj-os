import type { FastifyInstance } from "fastify";

import { runAgent } from "../../agent/index.js";
import { askBodySchema } from "../schemas.js";

export async function agentRoutes(app: FastifyInstance): Promise<void> {
  app.post("/agent/ask", async (request) => {
    const { message } = askBodySchema.parse(request.body);
    const result = await runAgent({ question: message });
    return {
      answer: result.answer,
      toolCalls: result.toolCalls,
      iterations: result.iterations,
      stopReason: result.stopReason,
    };
  });
}
