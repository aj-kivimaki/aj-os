import type { DatabaseDefinition } from "../schema/database.js";
import type { PropertyCollection } from "../schema/database.js";

import { isTranslatablePropertyType, type TranslatablePropertyType } from "./properties/index.js";

export interface NotionTranslationIssue {
  readonly code:
    | "UNSUPPORTED_PROPERTY_TYPE"
    | "DUPLICATE_NOTION_PROPERTY_NAME";
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
] as const;

export function validateNotionTranslation<
  TProperties extends PropertyCollection,
>(
  definition: DatabaseDefinition<TProperties>,
): NotionTranslationValidationResult {
  const issues: NotionTranslationIssue[] = [];
  const seenNames = new Set<string>();

  for (const property of definition.properties) {
    if (!isTranslatablePropertyType(property.type)) {
      issues.push({
        code: "UNSUPPORTED_PROPERTY_TYPE",
        message: `Property \"${property.key}\" uses unsupported type \"${property.type}\". Supported types: ${SUPPORTED_TYPES.join(", ")}.`,
      });
    }

    const normalizedName = property.name.trim();
    if (seenNames.has(normalizedName)) {
      issues.push({
        code: "DUPLICATE_NOTION_PROPERTY_NAME",
        message: `Duplicate Notion property name: \"${property.name}\". Property names must be unique in a Notion database payload.`,
      });
      continue;
    }

    seenNames.add(normalizedName);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
