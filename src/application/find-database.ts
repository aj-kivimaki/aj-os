import { env } from "../config/env.js";
import { getNotionClient } from "../notion/client.js";

export interface ExistingDatabase {
  readonly id: string;
  readonly title: string;
}

interface ChildDatabaseBlock {
  readonly id: string;
  readonly type: "child_database";
  readonly child_database: {
    readonly title: string;
  };
}

function isTypedBlock(
  block: unknown,
): block is { readonly id: string; readonly type: string } {
  return (
    typeof block === "object" &&
    block !== null &&
    "id" in block &&
    "type" in block
  );
}

function normalizeDatabaseTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function isChildDatabaseBlock(block: {
  readonly id: string;
  readonly type: string;
}): block is ChildDatabaseBlock {
  return block.type === "child_database";
}

export async function listChildDatabases(
  parentPageId: string = env.NOTION_PARENT_PAGE_ID,
): Promise<readonly ExistingDatabase[]> {
  const notion = getNotionClient();

  const databases: ExistingDatabase[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: parentPageId,
      ...(cursor ? { start_cursor: cursor } : {}),
      page_size: 100,
    });

    for (const block of response.results) {
      if (!isTypedBlock(block)) {
        continue;
      }

      if (!isChildDatabaseBlock(block)) {
        continue;
      }

      databases.push({
        id: block.id,
        title: block.child_database.title,
      });
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return databases;
}

export async function findDatabaseByTitle(
  title: string,
  parentPageId: string = env.NOTION_PARENT_PAGE_ID,
): Promise<ExistingDatabase | null> {
  const titleLookup = normalizeDatabaseTitle(title);
  const childDatabases = await listChildDatabases(parentPageId);

  const found = childDatabases.find(
    (database) => normalizeDatabaseTitle(database.title) === titleLookup,
  );

  return found ?? null;
}

export function mapDatabasesByNormalizedTitle(
  databases: readonly ExistingDatabase[],
): ReadonlyMap<string, ExistingDatabase> {
  const mapped = new Map<string, ExistingDatabase>();

  for (const database of databases) {
    const titleKey = normalizeDatabaseTitle(database.title);
    if (!mapped.has(titleKey)) {
      mapped.set(titleKey, database);
    }
  }

  return mapped;
}

export function normalizeTitleForLookup(title: string): string {
  return normalizeDatabaseTitle(title);
}
