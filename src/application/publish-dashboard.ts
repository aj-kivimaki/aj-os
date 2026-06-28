import type {
  BlockObjectRequest,
  PageObjectResponse,
  RichTextItemRequest,
} from "@notionhq/client/build/src/api-endpoints.js";

import {
  buildDashboardModel,
  type CrmDashboardRecord,
  type DashboardBusinessData,
  type DashboardModuleKey,
  type FinanceDashboardRecord,
  type GameJamsDashboardRecord,
  type PortfolioDashboardRecord,
  type ProductionMusicDashboardRecord,
  type ProjectDashboardRecord,
} from "../dashboard/index.js";
import { getNotionClient } from "../notion/client.js";
import type { ExistingDatabase } from "./find-database.js";

const CEO_DASHBOARD_TITLE = "CEO Dashboard";

type NotionPropertyValue = PageObjectResponse["properties"][string];

export interface PublishDashboardOptions {
  readonly databaseByModuleKey: ReadonlyMap<
    DashboardModuleKey,
    ExistingDatabase
  >;
}

export interface PublishDashboardResult {
  readonly status: "generated" | "failed";
  readonly pageId?: string;
  readonly pageUrl?: string;
  readonly errorMessage?: string;
}

function notionUrlFromId(id: string): string {
  return `https://www.notion.so/${id.replace(/-/g, "")}`;
}

function isBlockWithId(value: unknown): value is { readonly id: string } {
  return typeof value === "object" && value !== null && "id" in value;
}

function isChildPageBlock(value: unknown): value is {
  readonly id: string;
  readonly type: "child_page";
  readonly child_page: { readonly title: string };
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { readonly type?: unknown }).type === "child_page" &&
    "child_page" in value
  );
}

function isFullPageObject(value: {
  readonly object: "page";
  readonly id: string;
}): value is PageObjectResponse {
  return "properties" in value;
}

function toRichText(content: string, url?: string): RichTextItemRequest[] {
  return [
    {
      type: "text",
      text: {
        content,
        ...(url ? { link: { url } } : {}),
      },
    },
  ];
}

function heading1(text: string): BlockObjectRequest {
  return {
    type: "heading_1",
    heading_1: {
      rich_text: toRichText(text),
    },
  };
}

function heading2(text: string): BlockObjectRequest {
  return {
    type: "heading_2",
    heading_2: {
      rich_text: toRichText(text),
    },
  };
}

function paragraph(text: string, url?: string): BlockObjectRequest {
  return {
    type: "paragraph",
    paragraph: {
      rich_text: toRichText(text, url),
    },
  };
}

function bullet(text: string): BlockObjectRequest {
  return {
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: toRichText(text),
    },
  };
}

function divider(): BlockObjectRequest {
  return {
    type: "divider",
    divider: {},
  };
}

function readSelect(
  property: NotionPropertyValue | undefined,
): string | undefined {
  if (!property) {
    return undefined;
  }

  if (property.type === "select") {
    return property.select?.name;
  }

  if (property.type === "status") {
    return property.status?.name;
  }

  return undefined;
}

function readDate(
  property: NotionPropertyValue | undefined,
): string | undefined {
  if (!property || property.type !== "date") {
    return undefined;
  }

  return property.date?.start;
}

function readNumber(
  property: NotionPropertyValue | undefined,
): number | undefined {
  if (!property || property.type !== "number") {
    return undefined;
  }

  return property.number ?? undefined;
}

function readCheckbox(
  property: NotionPropertyValue | undefined,
): boolean | undefined {
  if (!property || property.type !== "checkbox") {
    return undefined;
  }

  return property.checkbox;
}

async function queryAllPages(
  dataSourceId: string,
): Promise<PageObjectResponse[]> {
  const notion = getNotionClient();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      result_type: "page",
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const result of response.results) {
      if (result.object !== "page" || !isFullPageObject(result)) {
        continue;
      }

      pages.push(result);
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return pages;
}

function mapProject(page: PageObjectResponse): ProjectDashboardRecord {
  const status = readSelect(page.properties["Status"]);
  const priority = readSelect(page.properties["Priority"]);
  const targetCompletion = readDate(page.properties["Target Completion"]);

  return {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(targetCompletion ? { targetCompletion } : {}),
  };
}

function mapCRM(page: PageObjectResponse): CrmDashboardRecord {
  const relationshipStatus = readSelect(page.properties["Relationship Status"]);
  const nextFollowUp = readDate(page.properties["Next Follow-up"]);
  const lastContact = readDate(page.properties["Last Contact"]);

  return {
    ...(relationshipStatus ? { relationshipStatus } : {}),
    ...(nextFollowUp ? { nextFollowUp } : {}),
    ...(lastContact ? { lastContact } : {}),
  };
}

function mapFinance(page: PageObjectResponse): FinanceDashboardRecord {
  const transactionType = readSelect(page.properties["Transaction Type"]);
  const status = readSelect(page.properties["Status"]);
  const amount = readNumber(page.properties["Amount"]);
  const date = readDate(page.properties["Date"]);

  return {
    ...(transactionType ? { transactionType } : {}),
    ...(status ? { status } : {}),
    ...(amount !== undefined ? { amount } : {}),
    ...(date ? { date } : {}),
  };
}

function mapProductionMusic(
  page: PageObjectResponse,
): ProductionMusicDashboardRecord {
  const status = readSelect(page.properties["Status"]);
  const published = readCheckbox(page.properties["Published"]);

  return {
    ...(status ? { status } : {}),
    ...(published !== undefined ? { published } : {}),
  };
}

function mapPortfolio(page: PageObjectResponse): PortfolioDashboardRecord {
  const status = readSelect(page.properties["Status"]);
  const featured = readCheckbox(page.properties["Featured"]);

  return {
    ...(status ? { status } : {}),
    ...(featured !== undefined ? { featured } : {}),
  };
}

function mapGameJams(page: PageObjectResponse): GameJamsDashboardRecord {
  const status = readSelect(page.properties["Status"]);
  const startDate = readDate(page.properties["Start Date"]);
  const endDate = readDate(page.properties["End Date"]);

  return {
    ...(status ? { status } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };
}

function requireDatabase(
  options: PublishDashboardOptions,
  moduleKey: DashboardModuleKey,
): ExistingDatabase {
  const value = options.databaseByModuleKey.get(moduleKey);
  if (!value) {
    throw new Error(
      `Missing database mapping for dashboard module "${moduleKey}".`,
    );
  }

  return value;
}

async function findDashboardPageId(
  parentPageId: string,
): Promise<string | null> {
  const notion = getNotionClient();
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: parentPageId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const block of response.results) {
      if (!isChildPageBlock(block)) {
        continue;
      }

      if (block.child_page.title === CEO_DASHBOARD_TITLE) {
        return block.id;
      }
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return null;
}

async function ensureDashboardPage(parentPageId: string): Promise<string> {
  const existingPageId = await findDashboardPageId(parentPageId);
  if (existingPageId) {
    return existingPageId;
  }

  const notion = getNotionClient();
  const response = await notion.pages.create({
    parent: {
      page_id: parentPageId,
      type: "page_id",
    },
    properties: {
      title: {
        title: toRichText(CEO_DASHBOARD_TITLE),
      },
    },
  });

  if (response.object !== "page" || !isFullPageObject(response)) {
    throw new Error("Creating CEO Dashboard returned a partial page response.");
  }

  return response.id;
}

async function listChildBlockIds(blockId: string): Promise<readonly string[]> {
  const notion = getNotionClient();
  const ids: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const block of response.results) {
      if (!isBlockWithId(block)) {
        continue;
      }

      ids.push(block.id);
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return ids;
}

async function clearDashboardContent(pageId: string): Promise<void> {
  const notion = getNotionClient();
  const blockIds = await listChildBlockIds(pageId);

  for (const blockId of blockIds) {
    await notion.blocks.delete({ block_id: blockId });
  }
}

function chunkBlocks(
  blocks: readonly BlockObjectRequest[],
  chunkSize: number,
): BlockObjectRequest[][] {
  const chunks: BlockObjectRequest[][] = [];
  for (let index = 0; index < blocks.length; index += chunkSize) {
    chunks.push(blocks.slice(index, index + chunkSize));
  }

  return chunks;
}

function buildDashboardBlocks(
  data: ReturnType<typeof buildDashboardModel>,
): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  blocks.push(heading1(data.title));
  blocks.push(
    paragraph(`Generated: ${new Date(data.generatedAtIso).toISOString()}`),
  );

  blocks.push(heading2("Executive Summary"));
  blocks.push(
    bullet(`Business Health: ${data.executiveSummary.businessHealth.label}`),
  );
  blocks.push(
    bullet(`Active Projects: ${data.executiveSummary.activeProjects}`),
  );
  blocks.push(
    bullet(`Current Priorities: ${data.executiveSummary.currentPriorities}`),
  );
  blocks.push(
    bullet(`Financial Snapshot: ${data.executiveSummary.financialSnapshot}`),
  );

  for (const risk of data.executiveSummary.immediateRisks) {
    blocks.push(bullet(`Immediate Risk: ${risk}`));
  }

  blocks.push(divider());
  blocks.push(heading2("Today's Priorities"));

  if (data.priorities.length === 0) {
    blocks.push(paragraph("No urgent priorities detected today."));
  } else {
    for (const priority of data.priorities) {
      blocks.push(
        bullet(
          `[${priority.severity.toUpperCase()}] ${priority.action} (${priority.reason})`,
        ),
      );
    }
  }

  blocks.push(divider());

  for (const widget of data.widgets) {
    blocks.push(heading2(widget.title));

    for (const metric of widget.metrics) {
      blocks.push(bullet(`${metric.label}: ${metric.value}`));
    }

    blocks.push(paragraph(`Insight: ${widget.insight}`));
    blocks.push(paragraph(`Recommended Action: ${widget.recommendedAction}`));
    blocks.push(paragraph(widget.databaseLink.label, widget.databaseLink.url));
    blocks.push(divider());
  }

  return blocks;
}

async function appendDashboardBlocks(
  pageId: string,
  blocks: readonly BlockObjectRequest[],
): Promise<void> {
  if (blocks.length === 0) {
    return;
  }

  const notion = getNotionClient();
  for (const chunk of chunkBlocks(blocks, 100)) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk,
    });
  }
}

async function buildBusinessData(
  options: PublishDashboardOptions,
): Promise<DashboardBusinessData> {
  const projectsDatabase = requireDatabase(options, "projects");
  const crmDatabase = requireDatabase(options, "crm");
  const financeDatabase = requireDatabase(options, "finance");
  const productionMusicDatabase = requireDatabase(options, "production-music");
  const portfolioDatabase = requireDatabase(options, "portfolio");
  const gameJamsDatabase = requireDatabase(options, "game-jams");

  const [
    projectsPages,
    crmPages,
    financePages,
    productionMusicPages,
    portfolioPages,
    gameJamsPages,
  ] = await Promise.all([
    queryAllPages(projectsDatabase.dataSourceId),
    queryAllPages(crmDatabase.dataSourceId),
    queryAllPages(financeDatabase.dataSourceId),
    queryAllPages(productionMusicDatabase.dataSourceId),
    queryAllPages(portfolioDatabase.dataSourceId),
    queryAllPages(gameJamsDatabase.dataSourceId),
  ]);

  const generatedAtIso = new Date().toISOString();

  return {
    generatedAtIso,
    projects: projectsPages.map(mapProject),
    crm: crmPages.map(mapCRM),
    finance: financePages.map(mapFinance),
    productionMusic: productionMusicPages.map(mapProductionMusic),
    portfolio: portfolioPages.map(mapPortfolio),
    gameJams: gameJamsPages.map(mapGameJams),
    links: {
      projects: {
        moduleKey: "projects",
        label: "Projects Database",
        url: notionUrlFromId(projectsDatabase.id),
      },
      crm: {
        moduleKey: "crm",
        label: "CRM Database",
        url: notionUrlFromId(crmDatabase.id),
      },
      finance: {
        moduleKey: "finance",
        label: "Finance Database",
        url: notionUrlFromId(financeDatabase.id),
      },
      "production-music": {
        moduleKey: "production-music",
        label: "Production Music Database",
        url: notionUrlFromId(productionMusicDatabase.id),
      },
      portfolio: {
        moduleKey: "portfolio",
        label: "Portfolio Database",
        url: notionUrlFromId(portfolioDatabase.id),
      },
      "game-jams": {
        moduleKey: "game-jams",
        label: "Game Jams Database",
        url: notionUrlFromId(gameJamsDatabase.id),
      },
    },
  };
}

export async function publishCEODashboard(
  parentPageId: string,
  options: PublishDashboardOptions,
): Promise<PublishDashboardResult> {
  try {
    const businessData = await buildBusinessData(options);
    const dashboardModel = buildDashboardModel(businessData);
    const dashboardPageId = await ensureDashboardPage(parentPageId);

    await clearDashboardContent(dashboardPageId);
    await appendDashboardBlocks(
      dashboardPageId,
      buildDashboardBlocks(dashboardModel),
    );

    return {
      status: "generated",
      pageId: dashboardPageId,
      pageUrl: notionUrlFromId(dashboardPageId),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: "failed",
      errorMessage,
    };
  }
}
