import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints/databases.js";

import { env } from "../config/env.js";
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
): Promise<CreatedDatabaseResult> {
  const payload = translator.translateDatabase(definition);
  const notion = getNotionClient();

  const response = await notion.databases.create({
    parent: { type: "page_id", page_id: env.NOTION_PARENT_PAGE_ID },
    ...payload,
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
