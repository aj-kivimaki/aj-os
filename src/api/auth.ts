import { timingSafeEqual } from "node:crypto";

import type { FastifyInstance } from "fastify";

/** Constant-time compare that also guards against length leaks. */
function tokensMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Require a bearer token on every route except `GET /health`.
 * n8n sends `Authorization: Bearer <API_AUTH_TOKEN>`.
 */
export function registerAuth(app: FastifyInstance, token: string): void {
  app.addHook("onRequest", async (request, reply) => {
    if (request.method === "GET" && request.url === "/health") {
      return;
    }

    const header = request.headers.authorization ?? "";
    const prefix = "Bearer ";
    const provided = header.startsWith(prefix)
      ? header.slice(prefix.length)
      : "";

    if (!provided || !tokensMatch(provided, token)) {
      reply
        .status(401)
        .send({ error: "unauthorized", message: "Missing or invalid bearer token" });
    }
  });
}
