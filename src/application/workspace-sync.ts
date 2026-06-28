import type { DatabaseDefinition } from "../schema/database.js";
import { getRegisteredModules } from "../modules/registry.js";
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
}

export interface WorkspaceSyncResult {
  readonly items: readonly WorkspaceSyncItemResult[];
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
): WorkspaceSyncSummary {
  const created = items.filter((item) => item.status === "created").length;
  const skipped = items.filter((item) => item.status === "skipped").length;
  const failed = items.filter((item) => item.status === "failed").length;

  return {
    created,
    skipped,
    failed,
  };
}

function printSummary(summary: WorkspaceSyncSummary): void {
  console.log("Summary");
  console.log("");
  console.log(`Created: ${summary.created}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
}

export async function synchronizeWorkspace(): Promise<WorkspaceSyncResult> {
  printHeader();

  const existingDatabases = await listChildDatabases();
  const byTitle = new Map(mapDatabasesByNormalizedTitle(existingDatabases));
  const databaseIdByModuleKey = new Map<string, string>();

  for (const target of workspaceSyncTargets) {
    const normalizedTitle = normalizeTitleForLookup(target.definition.name);
    const existingDatabase = byTitle.get(normalizedTitle);
    if (existingDatabase) {
      databaseIdByModuleKey.set(target.key, existingDatabase.id);
    }
  }

  const itemResults: WorkspaceSyncItemResult[] = [];

  for (const target of workspaceSyncTargets) {
    const normalizedTitle = normalizeTitleForLookup(target.definition.name);
    const existingDatabase = byTitle.get(normalizedTitle);

    if (existingDatabase) {
      printModuleSkipped(target);
      databaseIdByModuleKey.set(target.key, existingDatabase.id);
      itemResults.push({
        module: target.label,
        status: "skipped",
        existingDatabase,
      });
      continue;
    }

    try {
      const createdDatabase = await createDatabase(target.definition, {
        resolveDatabaseId: (moduleKey) => databaseIdByModuleKey.get(moduleKey),
      });
      byTitle.set(normalizedTitle, {
        id: createdDatabase.id,
        title: createdDatabase.name,
      });
      databaseIdByModuleKey.set(target.key, createdDatabase.id);

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

  const summary = buildSummary(itemResults);
  printSummary(summary);

  return {
    items: itemResults,
    summary,
  };
}
