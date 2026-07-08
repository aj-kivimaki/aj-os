/**
 * Knowledge Provider contracts — public surface (CB-004).
 *
 * This barrel exposes the platform's *input contracts* only: the schemas,
 * validators and inferred types for `KnowledgeRequest`, `KnowledgeItem` and
 * provider metadata, plus the `KnowledgeProvider` interface. It defines how
 * knowledge enters the platform — not how it is collected or processed. Future
 * milestones implement providers, the registry and collection against these
 * contracts without redesigning them.
 */

export {
  knowledgeRequestSchema,
  knowledgeItemSchema,
  providerMetadataSchema,
  parseKnowledgeRequest,
  parseKnowledgeItem,
} from "./schema.js";

export type {
  KnowledgeRequest,
  KnowledgeItem,
  ProviderMetadata,
  KnowledgeProvider,
} from "./types.js";
