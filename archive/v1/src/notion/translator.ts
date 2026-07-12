import type {
  PropertyConfigurationRequest,
  RichTextItemRequest,
} from "./types.js";

import type {
  DatabaseDefinition,
  PropertyCollection,
} from "../schema/database.js";
import type { RelationCollection, RelationType } from "../schema/relation.js";
import {
  validateDatabaseDefinition,
  type DatabaseValidationOptions,
} from "../schema/validation.js";
import {
  translateProperty,
  translateRelationProperty,
  type RelationTranslationContext,
} from "./properties/index.js";
import { validateNotionTranslation } from "./validation.js";

export interface NotionTranslationOptions
  extends DatabaseValidationOptions, RelationTranslationContext {}

export type NotionRelationDeferredReason =
  | "missing_target_database_id"
  | "name_conflict";

export interface NotionRelationPayload {
  readonly name: string;
  readonly type: RelationType;
  readonly targetDatabaseKey: string;
  readonly targetDatabaseId?: string;
  readonly deferred: boolean;
  readonly deferredReason?: NotionRelationDeferredReason;
  readonly property: PropertyConfigurationRequest;
}

export interface NotionDatabaseCreatePayload {
  readonly title: RichTextItemRequest[];
  readonly description?: RichTextItemRequest[];
  readonly properties: Record<string, PropertyConfigurationRequest>;
  readonly relationProperties: readonly NotionRelationPayload[];
}

interface BuiltNotionProperties {
  readonly properties: Record<string, PropertyConfigurationRequest>;
  readonly relationProperties: readonly NotionRelationPayload[];
}

function toRichText(content: string): RichTextItemRequest[] {
  return [
    {
      type: "text",
      text: {
        content,
      },
    },
  ];
}

function buildNotionProperties<
  TProperties extends PropertyCollection,
  TRelations extends RelationCollection,
>(
  definition: DatabaseDefinition<TProperties, TRelations>,
  options?: NotionTranslationOptions,
): BuiltNotionProperties {
  const properties: Record<string, PropertyConfigurationRequest> = {};
  const relationProperties: NotionRelationPayload[] = [];

  for (const property of definition.properties) {
    properties[property.name] = translateProperty(property);
  }

  for (const relation of definition.relations ?? []) {
    const translatedRelation = translateRelationProperty(relation, {
      ...(options?.resolveDatabaseId
        ? { resolveDatabaseId: options.resolveDatabaseId }
        : {}),
    });

    const hasNameConflict = Object.prototype.hasOwnProperty.call(
      properties,
      translatedRelation.name,
    );

    const deferred = translatedRelation.deferred || hasNameConflict;
    const deferredReason: NotionRelationDeferredReason | undefined =
      translatedRelation.deferred
        ? "missing_target_database_id"
        : hasNameConflict
          ? "name_conflict"
          : undefined;

    relationProperties.push({
      name: translatedRelation.name,
      type: relation.type,
      targetDatabaseKey: translatedRelation.targetDatabaseKey,
      ...(translatedRelation.targetDatabaseId
        ? { targetDatabaseId: translatedRelation.targetDatabaseId }
        : {}),
      deferred,
      ...(deferredReason ? { deferredReason } : {}),
      property: translatedRelation.property,
    });

    if (!deferred) {
      properties[translatedRelation.name] = translatedRelation.property;
    }
  }

  return {
    properties,
    relationProperties,
  };
}

export class NotionTranslator {
  public translateDatabase<
    TProperties extends PropertyCollection,
    TRelations extends RelationCollection,
  >(
    definition: DatabaseDefinition<TProperties, TRelations>,
    options?: NotionTranslationOptions,
  ): NotionDatabaseCreatePayload {
    const schemaValidation = validateDatabaseDefinition(definition, options);
    if (!schemaValidation.valid) {
      const issueText = schemaValidation.issues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join("\n");

      throw new Error(
        `Schema validation failed for database "${definition.key}":\n${issueText}`,
      );
    }

    const translationValidation = validateNotionTranslation(definition);
    if (!translationValidation.valid) {
      const issueText = translationValidation.issues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join("\n");

      throw new Error(
        `Notion translation validation failed for database "${definition.key}":\n${issueText}`,
      );
    }

    const translatedProperties = buildNotionProperties(definition, options);

    return {
      title: toRichText(definition.name),
      ...(definition.description
        ? { description: toRichText(definition.description) }
        : {}),
      properties: translatedProperties.properties,
      relationProperties: translatedProperties.relationProperties,
    };
  }
}
