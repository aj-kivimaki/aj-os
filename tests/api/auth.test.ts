/**
 * API bearer-token auth tests (REX-403, F-054).
 *
 * `registerAuth` is the guard on every live route except `GET /health` — the
 * gate n8n crosses on both `/agent/ask` and `/inbox/note`. Before M4 it had zero
 * tests. These characterise the gate with Fastify's `inject` (no socket, no
 * network): health is open, everything else requires the exact bearer token.
 */
import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, describe, it, expect } from "vitest";

import { registerAuth } from "../../src/api/auth.js";

const TOKEN = "s3cret-token";
let app: FastifyInstance;

function buildApp(): FastifyInstance {
  app = Fastify();
  registerAuth(app, TOKEN);
  app.get("/health", async () => ({ ok: true }));
  app.post("/agent/ask", async () => ({ answer: "ok" }));
  app.post("/inbox/note", async () => ({ saved: true }));
  return app;
}

afterEach(async () => {
  await app.close();
});

describe("registerAuth — bearer-token gate", () => {
  it("lets GET /health through without a token", async () => {
    const res = await buildApp().inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
  });

  it("rejects a protected route with no token", async () => {
    const res = await buildApp().inject({ method: "POST", url: "/agent/ask" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ error: "unauthorized" });
  });

  it("rejects a wrong token", async () => {
    const res = await buildApp().inject({
      method: "POST",
      url: "/inbox/note",
      headers: { authorization: "Bearer wrong-token" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("accepts the exact bearer token on a protected route", async () => {
    const res = await buildApp().inject({
      method: "POST",
      url: "/agent/ask",
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ answer: "ok" });
  });

  it("rejects a token of a different length (no length leak)", async () => {
    const res = await buildApp().inject({
      method: "POST",
      url: "/agent/ask",
      headers: { authorization: `Bearer ${TOKEN}-extra` },
    });
    expect(res.statusCode).toBe(401);
  });
});
