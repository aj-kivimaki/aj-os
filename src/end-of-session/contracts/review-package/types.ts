/**
 * ReviewPackage contract type, inferred from the Zod schema and wrapped in
 * `DeepReadonly` so the runtime and compile-time contracts can never drift and the
 * projection is immutable at every level.
 */

import type { z } from "zod";

import type { DeepReadonly } from "../immutable.js";

import type { reviewPackageSchema } from "./schema.js";

/** The human-readable projection of a session's candidates (non-canonical, EOS-D4). */
export type ReviewPackage = DeepReadonly<z.infer<typeof reviewPackageSchema>>;
