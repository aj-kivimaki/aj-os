import type {
  InitialDataSourceRequest,
  PropertyConfigurationRequest,
  RichTextItemRequest,
} from "@notionhq/client/build/src/api-endpoints.js";

import type { DatabaseDefinition } from "../schema/database.js";
import type { PropertyCollection } from "../schema/database.js";
import { validateDatabaseDefinition } from "../schema/validation.js";
import { translateProperty } from "./properties/index.js";
import { validateNotionTranslation } from "./validation.js";

export interface NotionDatabaseCreatePayload {
  readonly title: RichTextItemRequest[];
  readonly description?: RichTextItemRequest[];
  readonly initial_data_source: InitialDataSourceRequest;
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

function buildNotionProperties<TProperties extends PropertyCollection>(
  definition: DatabaseDefinition<TProperties>,
): Record<string, PropertyConfigurationRequest> {
  const properties: Record<string, PropertyConfigurationRequest> = {};

  for (const property of definition.properties) {
    properties[property.name] = translateProperty(property);
  }

  return properties;
}

export class NotionTranslator {
  public translateDatabase<TProperties extends PropertyCollection>(
    definition: DatabaseDefinition<TProperties>,
  ): NotionDatabaseCreatePayload {
    const schemaValidation = validateDatabaseDefinition(definition);
    if (!schemaValidation.valid) {
      const issueText = schemaValidation.issues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join("\n");

      throw new Error(
        `Schema validation failed for database \"${definition.key}\":\n${issueText}`,
      );
    }

    const translationValidation = validateNotionTranslation(definition);
    if (!translationValidation.valid) {
      const issueText = translationValidation.issues
        .map((issue) => `- ${issue.code}: ${issue.message}`)
        .join("\n");

      throw new Error(
        `Notion translation validation failed for database \"${definition.key}\":\n${issueText}`,
      );
    }

    return {
      title: toRichText(definition.name),
      ...(definition.description
        ? { description: toRichText(definition.description) }
        : {}),
      initial_data_source: {
        properties: buildNotionProperties(definition),
      },
    };
  }
}
