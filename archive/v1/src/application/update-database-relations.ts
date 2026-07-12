import type {
  DatabaseObjectResponse,
  GetDatabaseResponse,
  UpdateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints.js";

import { hasModule } from "../modules/registry.js";
import { getNotionClient } from "../notion/client.js";
import {
  NotionTranslator,
  type NotionRelationPayload,
} from "../notion/translator.js";
import type { DatabaseDefinition } from "../schema/database.js";

export type RelationUpdateStatus = "created" | "skipped" | "failed";

export interface RelationUpdateResult {
  readonly name: string;
  readonly targetDatabaseKey: string;
  readonly status: RelationUpdateStatus;
  readonly errorMessage?: string;
}

export interface DatabaseRelationUpdateResult {
  readonly sourceDatabaseKey: string;
  readonly sourceDataSourceId: string;
  readonly relationResults: readonly RelationUpdateResult[];
}

export interface UpdateDatabaseRelationsOptions {
  readonly resolveDatabaseId: (moduleKey: string) => string | undefined;
}

type DataSourcePropertyUpdates = NonNullable<
  UpdateDatabaseParameters["properties"]
>;
type DataSourcePropertyUpdateValue = Exclude<
  DataSourcePropertyUpdates[string],
  null
>;
type RelationDataSourcePropertyUpdate = Extract<
  DataSourcePropertyUpdateValue,
  { relation: { database_id: string } }
>;

function isFullDataSourceResponse(
  response: GetDatabaseResponse,
): response is DatabaseObjectResponse {
  return "url" in response;
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

function getExistingRelationDataSourceId(
  value: DatabaseObjectResponse["properties"][string],
): string | undefined {
  if (value.type !== "relation") {
    return undefined;
  }

  return value.relation.database_id;
}

function validateTranslatedRelation(
  relation: NotionRelationPayload,
): string | undefined {
  if (
    relation.deferred &&
    relation.deferredReason === "missing_target_database_id"
  ) {
    return `Relation "${relation.name}" could not be resolved to a target database id.`;
  }

  if (!relation.targetDatabaseId) {
    return `Relation "${relation.name}" could not be resolved to a target database id.`;
  }

  if (!("relation" in relation.property)) {
    return `Relation "${relation.name}" did not produce a relation payload.`;
  }

  const relationProperty = relation.property.relation;
  if (!relationProperty) {
    return `Relation "${relation.name}" did not produce a relation payload.`;
  }

  if (relationProperty.database_id !== relation.targetDatabaseId) {
    return `Relation "${relation.name}" payload target id does not match resolved target id.`;
  }

  return undefined;
}

function toRelationUpdateProperty(
  relation: NotionRelationPayload,
): RelationDataSourcePropertyUpdate | null {
  if (!relation.targetDatabaseId) {
    return null;
  }

  return {
    relation: {
      database_id: relation.targetDatabaseId,
      type: "dual_property",
      dual_property: {},
    },
  };
}

const translator = new NotionTranslator();

export async function updateDatabaseRelations(
  definition: DatabaseDefinition,
  sourceDataSourceId: string,
  options: UpdateDatabaseRelationsOptions,
): Promise<DatabaseRelationUpdateResult> {
  const payload = translator.translateDatabase(definition, {
    hasModule,
    resolveDatabaseId: options.resolveDatabaseId,
  });

  const notion = getNotionClient();
  const relationResults: RelationUpdateResult[] = [];
  const relationUpdates: DataSourcePropertyUpdates = {};

  if (payload.relationProperties.length === 0) {
    return {
      sourceDatabaseKey: definition.key,
      sourceDataSourceId,
      relationResults,
    };
  }

  const dataSourceResponse = await notion.databases.retrieve({
    database_id: sourceDataSourceId,
  });

  if (!isFullDataSourceResponse(dataSourceResponse)) {
    throw new Error(
      `Data source lookup returned a partial response for "${sourceDataSourceId}".`,
    );
  }

  const existingProperties = dataSourceResponse.properties;

  for (const relation of payload.relationProperties) {
    const translationError = validateTranslatedRelation(relation);
    if (translationError) {
      relationResults.push({
        name: relation.name,
        targetDatabaseKey: relation.targetDatabaseKey,
        status: "failed",
        errorMessage: translationError,
      });
      continue;
    }

    const existingProperty = existingProperties[relation.name];
    const existingRelationDataSourceId = existingProperty
      ? getExistingRelationDataSourceId(existingProperty)
      : undefined;

    if (existingRelationDataSourceId === relation.targetDatabaseId) {
      relationResults.push({
        name: relation.name,
        targetDatabaseKey: relation.targetDatabaseKey,
        status: "skipped",
      });
      continue;
    }

    if (existingProperty?.type === "relation") {
      relationResults.push({
        name: relation.name,
        targetDatabaseKey: relation.targetDatabaseKey,
        status: "failed",
        errorMessage: `Property "${relation.name}" already exists as a relation with a different target.`,
      });
      continue;
    }

    const relationUpdateProperty = toRelationUpdateProperty(relation);
    if (!relationUpdateProperty) {
      relationResults.push({
        name: relation.name,
        targetDatabaseKey: relation.targetDatabaseKey,
        status: "failed",
        errorMessage: `Relation "${relation.name}" could not be converted into an update payload.`,
      });
      continue;
    }

    relationUpdates[relation.name] = relationUpdateProperty;
  }

  const relationNamesToCreate = Object.keys(relationUpdates);

  if (relationNamesToCreate.length > 0) {
    try {
      await notion.databases.update({
        database_id: sourceDataSourceId,
        properties: relationUpdates,
      });

      for (const relationName of relationNamesToCreate) {
        const relation = payload.relationProperties.find(
          (candidate) => candidate.name === relationName,
        );

        if (!relation) {
          continue;
        }

        relationResults.push({
          name: relation.name,
          targetDatabaseKey: relation.targetDatabaseKey,
          status: "created",
        });
      }
    } catch (error: unknown) {
      const errorMessage = toErrorMessage(error);

      for (const relationName of relationNamesToCreate) {
        const relation = payload.relationProperties.find(
          (candidate) => candidate.name === relationName,
        );

        if (!relation) {
          continue;
        }

        relationResults.push({
          name: relation.name,
          targetDatabaseKey: relation.targetDatabaseKey,
          status: "failed",
          errorMessage,
        });
      }
    }
  }

  return {
    sourceDatabaseKey: definition.key,
    sourceDataSourceId,
    relationResults,
  };
}
