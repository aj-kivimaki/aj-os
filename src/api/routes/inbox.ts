import type { FastifyInstance } from "fastify";

import { saveInboxFile, writeInboxNote } from "../../handbook/index.js";
import { inboxFileBodySchema, inboxNoteBodySchema } from "../schemas.js";

export async function inboxRoutes(app: FastifyInstance): Promise<void> {
  app.post("/inbox/note", async (request, reply) => {
    const body = inboxNoteBodySchema.parse(request.body);
    const result = await writeInboxNote(body);
    reply.status(201);
    return result;
  });

  app.post("/inbox/file", async (request, reply) => {
    const body = inboxFileBodySchema.parse(request.body);
    const result = await saveInboxFile(body);
    reply.status(201);
    return result;
  });
}
