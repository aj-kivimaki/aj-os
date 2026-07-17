import type { FastifyError, FastifyInstance } from "fastify";
import { z } from "zod";

import { HandbookNotFoundError, PathEscapeError } from "../handbook/index.js";

/** Map domain + validation errors to clean HTTP responses (no stack leaks). */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof z.ZodError) {
      reply.status(400).send({
        error: "invalid_request",
        message: "Request body failed validation.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (error instanceof PathEscapeError) {
      reply.status(400).send({ error: "invalid_path", message: error.message });
      return;
    }

    if (error instanceof HandbookNotFoundError) {
      reply.status(404).send({ error: "not_found", message: error.message });
      return;
    }

    // Fastify's own body-parse / validation errors carry a statusCode.
    if (typeof error.statusCode === "number" && error.statusCode < 500) {
      reply.status(error.statusCode).send({
        error: "bad_request",
        message: error.message,
      });
      return;
    }

    request.log.error(error);
    reply.status(500).send({
      error: "internal_error",
      message: "An unexpected error occurred.",
    });
  });
}
