import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints/databases.js";

import { env } from "../config/env.js";
import { hasModule } from "../modules/registry.js";
import { getNotionClient } from "../notion/client.js";
import { NotionTranslator } from "../notion/translator.js";
import type {
  DatabaseDefinition,
  PropertyCollection,
} from "../schema/database.js";

export interface CreatedDatabaseResult {
  readonly id: string;
  readonly url: string;
  readonly name: string;
  readonly createdTime: string;
}

export interface CreateDatabaseOptions {
  readonly resolveDatabaseId?: (moduleKey: string) => string | undefined;
}

function isFullDatabaseResponse(response: {
  object: "database";
  id: string;
}): response is DatabaseObjectResponse {
  return "url" in response;
}

function extractDatabaseName(response: DatabaseObjectResponse): string {
  const firstTitle = response.title[0];
  return firstTitle?.plain_text ?? response.id;
}

const translator = new NotionTranslator();

export async function createDatabase<TProperties extends PropertyCollection>(
  definition: DatabaseDefinition<TProperties>,
  options?: CreateDatabaseOptions,
): Promise<CreatedDatabaseResult> {
  const payload = translator.translateDatabase(definition, {
    hasModule,
    ...(options?.resolveDatabaseId
      ? { resolveDatabaseId: options.resolveDatabaseId }
      : {}),
  });
  const { relationProperties: _relationProperties, ...databasePayload } =
    payload;
  const notion = getNotionClient();

  const response = await notion.databases.create({
    parent: { type: "page_id", page_id: env.NOTION_PARENT_PAGE_ID },
    ...databasePayload,
  });

  if (!isFullDatabaseResponse(response)) {
    throw new Error(
      `Database creation returned a partial response. Database ID: ${response.id}`,
    );
  }

  return {
    id: response.id,
    url: response.url,
    name: extractDatabaseName(response),
    createdTime: response.created_time,
  };
}
