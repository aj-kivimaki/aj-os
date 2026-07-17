/**
 * Session stage barrel — the identified run (EOS-402).
 *
 * The `Session` *contract* lives in `contracts/session/`; this module is the stage
 * that *produces* one from a `SessionContext`, observed git state, and injected
 * identity.
 */

export { createSessionFactory } from "./createSessionFactory.js";
export type { SessionFactoryConfig } from "./createSessionFactory.js";
export type {
  SessionFactory,
  SessionFactoryOptions,
} from "./SessionFactory.js";
