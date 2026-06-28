import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints.js";

import type { RelationDefinition } from "../../schema/relation.js";

export const RELATION_DATABASE_ID_PLACEHOLDER_PREFIX =
  "UNRESOLVED_DATABASE_ID:";

export interface RelationTranslationContext {
  readonly resolveDatabaseId?: (moduleKey: string) => string | undefined;
}

export interface TranslatedRelationProperty {
  readonly name: string;
  readonly targetDatabaseKey: string;
  readonly targetDatabaseId?: string;
  readonly deferred: boolean;
  readonly property: PropertyConfigurationRequest;
}

function toRelationDatabaseId(
  relation: RelationDefinition,
  context?: RelationTranslationContext,
): { databaseId: string; deferred: boolean } {
  const resolvedDatabaseId = context?.resolveDatabaseId?.(
    relation.targetDatabaseKey,
  );

  if (resolvedDatabaseId) {
    return {
      databaseId: resolvedDatabaseId,
      deferred: false,
    };
  }

  return {
    databaseId: `${RELATION_DATABASE_ID_PLACEHOLDER_PREFIX}${relation.targetDatabaseKey}`,
    deferred: true,
  };
}

export function translateRelationProperty(
  relation: RelationDefinition,
  context?: RelationTranslationContext,
): TranslatedRelationProperty {
  const { databaseId, deferred } = toRelationDatabaseId(relation, context);

  return {
    name: relation.name,
    targetDatabaseKey: relation.targetDatabaseKey,
    ...(deferred ? {} : { targetDatabaseId: databaseId }),
    deferred,
    property: {
      relation: {
        data_source_id: databaseId,
        type: "single_property",
        single_property: {},
      },
    },
  };
}
