/**
 * Knowledge Provider contracts — public surface: the schemas, validators, and
 * inferred types for `KnowledgeRequest`, `KnowledgeItem`, and provider metadata,
 * plus the `KnowledgeProvider` interface. Defines how knowledge enters the
 * platform, not how it is collected or processed.
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
