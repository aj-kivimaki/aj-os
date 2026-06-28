import type {
  DatabaseDefinition,
  PropertyCollection,
} from "../schema/database.js";
import type { RelationCollection, RelationType } from "../schema/relation.js";

import {
  isTranslatablePropertyType,
  type TranslatablePropertyType,
} from "./properties/index.js";

export interface NotionTranslationIssue {
  readonly code:
    | "UNSUPPORTED_PROPERTY_TYPE"
    | "DUPLICATE_NOTION_PROPERTY_NAME"
    | "DUPLICATE_RELATION_NAME"
    | "MISSING_RELATION_NAME"
    | "MISSING_RELATION_TARGET_DATABASE"
    | "UNSUPPORTED_RELATION_TYPE";
  readonly message: string;
}

export interface NotionTranslationValidationResult {
  readonly valid: boolean;
  readonly issues: readonly NotionTranslationIssue[];
}

const SUPPORTED_TYPES: readonly TranslatablePropertyType[] = [
  "title",
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "checkbox",
  "url",
  "email",
] as const;

const SUPPORTED_RELATION_TYPES: readonly RelationType[] = [
  "one_to_one",
  "one_to_many",
  "many_to_many",
] as const;

function isSupportedRelationType(value: string): value is RelationType {
  return SUPPORTED_RELATION_TYPES.includes(value as RelationType);
}

function validatePropertyNames(
  definition: DatabaseDefinition,
  seenNames: Set<string>,
  issues: NotionTranslationIssue[],
): void {
  for (const property of definition.properties) {
    if (!isTranslatablePropertyType(property.type)) {
      issues.push({
        code: "UNSUPPORTED_PROPERTY_TYPE",
        message: `Property "${property.key}" uses unsupported type "${property.type}". Supported types: ${SUPPORTED_TYPES.join(", ")}.`,
      });
    }

    const normalizedName = property.name.trim();
    if (seenNames.has(normalizedName)) {
      issues.push({
        code: "DUPLICATE_NOTION_PROPERTY_NAME",
        message: `Duplicate Notion property name: "${property.name}". Property names must be unique in a Notion database payload.`,
      });
      continue;
    }

    seenNames.add(normalizedName);
  }
}

function validateRelationNames(
  definition: DatabaseDefinition,
  issues: NotionTranslationIssue[],
): void {
  const seenRelationNames = new Set<string>();

  for (const relation of definition.relations ?? []) {
    const normalizedRelationName = relation.name.trim();

    if (normalizedRelationName.length === 0) {
      issues.push({
        code: "MISSING_RELATION_NAME",
        message: "Relation name is required.",
      });
    } else {
      if (seenRelationNames.has(normalizedRelationName)) {
        issues.push({
          code: "DUPLICATE_RELATION_NAME",
          message: `Duplicate relation name: "${relation.name}".`,
        });
      }

      seenRelationNames.add(normalizedRelationName);
    }

    if (!relation.targetDatabaseKey.trim()) {
      issues.push({
        code: "MISSING_RELATION_TARGET_DATABASE",
        message: `Relation "${relation.name}" must declare a target database key.`,
      });
    }

    if (!isSupportedRelationType(relation.type)) {
      issues.push({
        code: "UNSUPPORTED_RELATION_TYPE",
        message: `Relation "${relation.name}" uses unsupported type "${relation.type}". Supported types: ${SUPPORTED_RELATION_TYPES.join(", ")}.`,
      });
    }
  }
}

export function validateNotionTranslation<
  TProperties extends PropertyCollection,
  TRelations extends RelationCollection = RelationCollection,
>(
  definition: DatabaseDefinition<TProperties, TRelations>,
): NotionTranslationValidationResult {
  const issues: NotionTranslationIssue[] = [];
  const seenNames = new Set<string>();

  validatePropertyNames(definition, seenNames, issues);
  validateRelationNames(definition, issues);

  return {
    valid: issues.length === 0,
    issues,
  };
}
