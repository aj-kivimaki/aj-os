import { Client } from "@notionhq/client";

import { env } from "../config/env.js";

let notionClient: Client | undefined;

export function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({
      auth: env.NOTION_API_KEY,
    });
  }

  return notionClient;
}
