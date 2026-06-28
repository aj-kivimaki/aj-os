import type { DatabaseDefinition } from "../schema/database.js";
import { env } from "../config/env.js";
import { getRegisteredModules } from "../modules/registry.js";
import type { DashboardModuleKey } from "../dashboard/index.js";
import {
  createDatabase,
  type CreatedDatabaseResult,
} from "./create-database.js";
import {
  listChildDatabases,
  mapDatabasesByNormalizedTitle,
  normalizeTitleForLookup,
  type ExistingDatabase,
} from "./find-database.js";
import {
  updateDatabaseRelations,
  type DatabaseRelationUpdateResult,
  type RelationUpdateResult,
} from "./update-database-relations.js";
import {
  publishCEODashboard,
  type PublishDashboardResult,
} from "./publish-dashboard.js";

export interface WorkspaceModuleSyncTarget {
  readonly key: string;
  readonly label: string;
  readonly definition: DatabaseDefinition;
}

export type WorkspaceSyncStatus = "created" | "skipped" | "failed";

export interface WorkspaceSyncItemResult {
  readonly module: string;
  readonly status: WorkspaceSyncStatus;
  readonly existingDatabase?: ExistingDatabase;
  readonly createdDatabase?: CreatedDatabaseResult;
  readonly errorMessage?: string;
}

export interface WorkspaceSyncSummary {
  readonly created: number;
  readonly skipped: number;
  readonly failed: number;
  readonly relationsCreated: number;
  readonly relationsSkipped: number;
  readonly relationsFailed: number;
  readonly dashboardGenerated: number;
  readonly dashboardFailed: number;
}

export interface WorkspaceRelationSyncItemResult {
  readonly module: string;
  readonly relationResults: readonly RelationUpdateResult[];
  readonly errorMessage?: string;
}

export interface WorkspaceSyncResult {
  readonly items: readonly WorkspaceSyncItemResult[];
  readonly relationItems: readonly WorkspaceRelationSyncItemResult[];
  readonly dashboardResult?: PublishDashboardResult;
  readonly summary: WorkspaceSyncSummary;
}

export const workspaceSyncTargets: readonly WorkspaceModuleSyncTarget[] = [
  ...getRegisteredModules().map((module) => ({
    key: module.key,
    label: module.displayName,
    definition: module.databaseDefinition,
  })),
];

function printHeader(): void {
  console.log("Workspace Synchronization");
  console.log("");
}

function printFlowStep(step: string): void {
  console.log(step);
  console.log("");
}

function printModuleCreated(
  target: WorkspaceModuleSyncTarget,
  createdDatabase: CreatedDatabaseResult,
): void {
  console.log(target.label);
  console.log("✓ Created");
  console.log(`  ID: ${createdDatabase.id}`);
  console.log(`  URL: ${createdDatabase.url}`);
  console.log("");
}

function printModuleSkipped(target: WorkspaceModuleSyncTarget): void {
  console.log(target.label);
  console.log("✓ Already exists");
  console.log("");
}

function printModuleFailed(
  target: WorkspaceModuleSyncTarget,
  errorMessage: string,
): void {
  console.log(target.label);
  console.log(`✗ Failed: ${errorMessage}`);
  console.log("");
}

function printRelationSynchronizationResult(
  target: WorkspaceModuleSyncTarget,
  result: DatabaseRelationUpdateResult,
): void {
  if (result.relationResults.length === 0) {
    return;
  }

  console.log(`${target.label} Relations`);

  for (const relationResult of result.relationResults) {
    if (relationResult.status === "created") {
      console.log(`✓ Created relation: ${relationResult.name}`);
      continue;
    }

    if (relationResult.status === "skipped") {
      console.log(`✓ Relation exists: ${relationResult.name}`);
      continue;
    }

    const errorSuffix = relationResult.errorMessage
      ? ` (${relationResult.errorMessage})`
      : "";
    console.log(`✗ Failed relation: ${relationResult.name}${errorSuffix}`);
  }

  console.log("");
}

function printRelationSynchronizationFailed(
  target: WorkspaceModuleSyncTarget,
  errorMessage: string,
): void {
  console.log(`${target.label} Relations`);
  console.log(`✗ Failed: ${errorMessage}`);
  console.log("");
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function buildSummary(
  items: readonly WorkspaceSyncItemResult[],
  relationItems: readonly WorkspaceRelationSyncItemResult[],
  dashboardResult?: PublishDashboardResult,
): WorkspaceSyncSummary {
  const created = items.filter((item) => item.status === "created").length;
  const skipped = items.filter((item) => item.status === "skipped").length;
  const failed = items.filter((item) => item.status === "failed").length;
  const relationResults = relationItems.flatMap((item) => item.relationResults);
  const relationsCreated = relationResults.filter(
    (result) => result.status === "created",
  ).length;
  const relationsSkipped = relationResults.filter(
    (result) => result.status === "skipped",
  ).length;
  const relationsFailed = relationResults.filter(
    (result) => result.status === "failed",
  ).length;
  const dashboardGenerated = dashboardResult?.status === "generated" ? 1 : 0;
  const dashboardFailed = dashboardResult?.status === "failed" ? 1 : 0;

  return {
    created,
    skipped,
    failed,
    relationsCreated,
    relationsSkipped,
    relationsFailed,
    dashboardGenerated,
    dashboardFailed,
  };
}

function printSummary(summary: WorkspaceSyncSummary): void {
  console.log("Summary");
  console.log("");
  console.log(`Created: ${summary.created}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Relations created: ${summary.relationsCreated}`);
  console.log(`Relations skipped: ${summary.relationsSkipped}`);
  console.log(`Relations failed: ${summary.relationsFailed}`);
  console.log(`Dashboard generated: ${summary.dashboardGenerated}`);
  console.log(`Dashboard failed: ${summary.dashboardFailed}`);
}

function printDashboardResult(result: PublishDashboardResult): void {
  if (result.status === "generated") {
    console.log("CEO Dashboard");
    console.log("✓ Generated");
    if (result.pageUrl) {
      console.log(`  URL: ${result.pageUrl}`);
    }
    console.log("");
    return;
  }

  console.log("CEO Dashboard");
  console.log(`✗ Failed: ${result.errorMessage ?? "Unknown error"}`);
  console.log("");
}

export async function synchronizeWorkspace(): Promise<WorkspaceSyncResult> {
  printHeader();

  printFlowStep("Discover existing databases");
  const existingDatabases = await listChildDatabases();
  const byTitle = new Map(mapDatabasesByNormalizedTitle(existingDatabases));
  const dataSourceIdByModuleKey = new Map<string, string>();
  const databaseByModuleKey = new Map<string, ExistingDatabase>();

  for (const target of workspaceSyncTargets) {
    const normalizedTitle = normalizeTitleForLookup(target.definition.name);
    const existingDatabase = byTitle.get(normalizedTitle);
    if (existingDatabase) {
      dataSourceIdByModuleKey.set(target.key, existingDatabase.dataSourceId);
      databaseByModuleKey.set(target.key, existingDatabase);
    }
  }

  const itemResults: WorkspaceSyncItemResult[] = [];

  printFlowStep("Create missing databases");

  for (const target of workspaceSyncTargets) {
    const normalizedTitle = normalizeTitleForLookup(target.definition.name);
    const existingDatabase = byTitle.get(normalizedTitle);

    if (existingDatabase) {
      printModuleSkipped(target);
      dataSourceIdByModuleKey.set(target.key, existingDatabase.dataSourceId);
      databaseByModuleKey.set(target.key, existingDatabase);
      itemResults.push({
        module: target.label,
        status: "skipped",
        existingDatabase,
      });
      continue;
    }

    try {
      const createdDatabase = await createDatabase(target.definition, {
        resolveDatabaseId: (moduleKey) =>
          dataSourceIdByModuleKey.get(moduleKey),
      });
      byTitle.set(normalizedTitle, {
        id: createdDatabase.id,
        dataSourceId: createdDatabase.dataSourceId,
        title: createdDatabase.name,
      });
      databaseByModuleKey.set(target.key, {
        id: createdDatabase.id,
        dataSourceId: createdDatabase.dataSourceId,
        title: createdDatabase.name,
      });
      dataSourceIdByModuleKey.set(target.key, createdDatabase.dataSourceId);

      printModuleCreated(target, createdDatabase);
      itemResults.push({
        module: target.label,
        status: "created",
        createdDatabase,
      });
    } catch (error: unknown) {
      const errorMessage = toErrorMessage(error);
      printModuleFailed(target, errorMessage);
      itemResults.push({
        module: target.label,
        status: "failed",
        errorMessage,
      });
    }
  }

  printFlowStep("Collect database IDs");

  for (const target of workspaceSyncTargets) {
    const normalizedTitle = normalizeTitleForLookup(target.definition.name);
    const existingDatabase = byTitle.get(normalizedTitle);

    if (existingDatabase) {
      dataSourceIdByModuleKey.set(target.key, existingDatabase.dataSourceId);
      databaseByModuleKey.set(target.key, existingDatabase);
    }
  }

  printFlowStep("Resolve relations");
  printFlowStep("Update databases");

  const relationItems: WorkspaceRelationSyncItemResult[] = [];

  for (const target of workspaceSyncTargets) {
    const sourceDataSourceId = dataSourceIdByModuleKey.get(target.key);

    if (!sourceDataSourceId) {
      const errorMessage = `Source database id could not be resolved for module "${target.key}".`;
      printRelationSynchronizationFailed(target, errorMessage);
      relationItems.push({
        module: target.label,
        relationResults: [],
        errorMessage,
      });
      continue;
    }

    try {
      const result = await updateDatabaseRelations(
        target.definition,
        sourceDataSourceId,
        {
          resolveDatabaseId: (moduleKey) =>
            dataSourceIdByModuleKey.get(moduleKey),
        },
      );

      printRelationSynchronizationResult(target, result);

      relationItems.push({
        module: target.label,
        relationResults: result.relationResults,
      });
    } catch (error: unknown) {
      const errorMessage = toErrorMessage(error);
      printRelationSynchronizationFailed(target, errorMessage);
      relationItems.push({
        module: target.label,
        relationResults: [],
        errorMessage,
      });
    }
  }

  printFlowStep("Generate CEO Dashboard");
  const dashboardResult = await publishCEODashboard(env.NOTION_PARENT_PAGE_ID, {
    databaseByModuleKey: databaseByModuleKey as ReadonlyMap<
      DashboardModuleKey,
      ExistingDatabase
    >,
  });
  printDashboardResult(dashboardResult);

  const summary = buildSummary(itemResults, relationItems, dashboardResult);
  printFlowStep("Summary");
  printSummary(summary);

  return {
    items: itemResults,
    relationItems,
    dashboardResult,
    summary,
  };
}
